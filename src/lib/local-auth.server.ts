import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const SESSION_COOKIE = "content_hub_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const RESET_TTL_SECONDS = 20 * 60;

export type LocalRole = "admin" | "editor";
export type LocalUserStatus = "active" | "pending" | "disabled";

export type LocalUser = {
  id: string;
  email: string;
  role: LocalRole;
  status: LocalUserStatus;
  createdAt: string;
  lastSignInAt: string | null;
  fullName: string;
  description: string;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: LocalRole;
  status: LocalUserStatus;
  created_at: string;
  last_sign_in_at: string | null;
  full_name?: string | null;
  description?: string | null;
};

let database: DatabaseSync | null = null;

function databasePath() {
  const configured = process.env.LOCAL_DB_PATH?.trim();
  return configured || resolve(process.cwd(), ".data/content-hub.sqlite");
}

export function getLocalDatabase() {
  if (database) return database;
  const path = databasePath();
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  database = new DatabaseSync(path);
  database.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS local_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','editor')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending','disabled')),
      created_by TEXT,
      created_at TEXT NOT NULL,
      last_sign_in_at TEXT
    );
    CREATE TABLE IF NOT EXISTS local_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES local_users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_local_sessions_user_id ON local_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_local_sessions_expires_at ON local_sessions(expires_at);
    CREATE TABLE IF NOT EXISTS local_password_resets (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES local_users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_local_password_resets_user_id ON local_password_resets(user_id);
    CREATE TABLE IF NOT EXISTS local_security_audit (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      actor_email TEXT,
      action TEXT NOT NULL,
      target_email TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_local_security_audit_created_at ON local_security_audit(created_at DESC);
    CREATE TABLE IF NOT EXISTS local_app_secrets (
      key TEXT PRIMARY KEY,
      value_encrypted TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    );
    CREATE TABLE IF NOT EXISTS local_documents (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_local_documents_updated_at ON local_documents(updated_at DESC);
  `);
  const userColumns = database.prepare("PRAGMA table_info(local_users)").all() as unknown as Array<{ name: string }>;
  const userColumnNames = new Set(userColumns.map((column) => column.name));
  if (!userColumnNames.has("full_name")) database.exec("ALTER TABLE local_users ADD COLUMN full_name TEXT NOT NULL DEFAULT ''");
  if (!userColumnNames.has("description")) database.exec("ALTER TABLE local_users ADD COLUMN description TEXT NOT NULL DEFAULT ''");
  cleanupExpiredTokens(database);
  return database;
}

function cleanupExpiredTokens(db = getLocalDatabase()) {
  const now = Math.floor(Date.now() / 1000);
  db.prepare("DELETE FROM local_sessions WHERE expires_at <= ?").run(now);
  db.prepare("DELETE FROM local_password_resets WHERE expires_at <= ? OR used_at IS NOT NULL").run(now);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  if (password.length < 10) throw new Error("يجب أن تتكون كلمة السر من 10 محارف على الأقل");
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("base64")}$${derived.toString("base64")}`;
}

function verifyPassword(password: string, encoded: string) {
  const [algorithm, n, r, p, saltB64, digestB64] = encoded.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !saltB64 || !digestB64) return false;
  try {
    const expected = Buffer.from(digestB64, "base64");
    const actual = scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function toPublicUser(row: UserRow): LocalUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
    fullName: row.full_name || "",
    description: row.description || "",
  };
}

export function findLocalUserByEmail(email: string) {
  const row = getLocalDatabase()
    .prepare("SELECT * FROM local_users WHERE email = ? COLLATE NOCASE")
    .get(normalizeEmail(email)) as UserRow | undefined;
  return row ? toPublicUser(row) : null;
}

function findUserRowByEmail(email: string) {
  return getLocalDatabase()
    .prepare("SELECT * FROM local_users WHERE email = ? COLLATE NOCASE")
    .get(normalizeEmail(email)) as UserRow | undefined;
}

export function listLocalUsers() {
  const rows = getLocalDatabase()
    .prepare("SELECT * FROM local_users ORDER BY created_at ASC")
    .all() as unknown as UserRow[];
  return rows.map(toPublicUser);
}

export function createLocalUser(input: {
  email: string;
  password: string;
  role?: LocalRole;
  status?: LocalUserStatus;
  createdBy?: string | null;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  getLocalDatabase()
    .prepare(`INSERT INTO local_users
      (id, email, password_hash, role, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(
      id,
      normalizeEmail(input.email),
      hashPassword(input.password),
      input.role || "editor",
      input.status || "active",
      input.createdBy || null,
      now,
    );
  return findLocalUserByEmail(input.email)!;
}

export function ensureBootstrapAdmin(email: string, password: string) {
  const existing = findLocalUserByEmail(email);
  if (existing) return existing;
  return createLocalUser({ email, password, role: "admin", status: "active" });
}

export function updateLocalUser(input: {
  id: string;
  role?: LocalRole;
  status?: LocalUserStatus;
  password?: string;
}) {
  const db = getLocalDatabase();
  if (input.role) db.prepare("UPDATE local_users SET role = ? WHERE id = ?").run(input.role, input.id);
  if (input.status) db.prepare("UPDATE local_users SET status = ? WHERE id = ?").run(input.status, input.id);
  if (input.password) {
    db.prepare("UPDATE local_users SET password_hash = ? WHERE id = ?").run(hashPassword(input.password), input.id);
    db.prepare("DELETE FROM local_sessions WHERE user_id = ?").run(input.id);
  }
  return getLocalUserById(input.id);
}

export function updateLocalUserProfile(input: { id: string; fullName: string; description: string }) {
  getLocalDatabase()
    .prepare("UPDATE local_users SET full_name = ?, description = ? WHERE id = ?")
    .run(input.fullName, input.description, input.id);
  return getLocalUserById(input.id);
}

export function deleteLocalUser(id: string) {
  getLocalDatabase().prepare("DELETE FROM local_users WHERE id = ?").run(id);
}

export function getLocalUserById(id: string) {
  const row = getLocalDatabase().prepare("SELECT * FROM local_users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toPublicUser(row) : null;
}

function setSessionCookie(token: string) {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function authenticateLocalUser(email: string, password: string) {
  const row = findUserRowByEmail(email);
  if (!row || row.status !== "active" || !verifyPassword(password, row.password_hash)) return null;
  const db = getLocalDatabase();
  const token = randomBytes(32).toString("base64url");
  const now = new Date().toISOString();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  db.prepare("INSERT INTO local_sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(tokenHash(token), row.id, expiresAt, now);
  db.prepare("UPDATE local_users SET last_sign_in_at = ? WHERE id = ?").run(now, row.id);
  setSessionCookie(token);
  return { ...toPublicUser(row), lastSignInAt: now };
}

export function getCurrentLocalUser() {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const row = getLocalDatabase().prepare(`
    SELECT u.* FROM local_sessions s
    JOIN local_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.status = 'active'
  `).get(tokenHash(token), Math.floor(Date.now() / 1000)) as UserRow | undefined;
  return row ? toPublicUser(row) : null;
}

export function requireCurrentLocalUser() {
  const user = getCurrentLocalUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export function requireLocalAdmin() {
  const user = requireCurrentLocalUser();
  if (user.role !== "admin") throw new Error("Admin role required");
  return user;
}

export function destroyLocalSession() {
  const token = getCookie(SESSION_COOKIE);
  if (token) getLocalDatabase().prepare("DELETE FROM local_sessions WHERE token_hash = ?").run(tokenHash(token));
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export function createPasswordResetToken(email: string) {
  const user = findLocalUserByEmail(email);
  if (!user || user.status !== "active") return null;
  const db = getLocalDatabase();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Math.floor(Date.now() / 1000) + RESET_TTL_SECONDS;
  const now = new Date().toISOString();
  db.prepare("DELETE FROM local_password_resets WHERE user_id = ?").run(user.id);
  db.prepare(`INSERT INTO local_password_resets(token_hash, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)`)
    .run(tokenHash(token), user.id, expiresAt, now);
  return { token, user, expiresAt };
}

export function validatePasswordResetToken(token: string) {
  const row = getLocalDatabase().prepare(`
    SELECT u.id, u.email, u.role, u.status, u.created_at, u.last_sign_in_at
    FROM local_password_resets r
    JOIN local_users u ON u.id = r.user_id
    WHERE r.token_hash = ? AND r.used_at IS NULL AND r.expires_at > ? AND u.status = 'active'
  `).get(tokenHash(token), Math.floor(Date.now() / 1000)) as Omit<UserRow, "password_hash"> | undefined;
  return row ? toPublicUser({ ...row, password_hash: "" }) : null;
}

export function consumePasswordResetToken(token: string, newPassword: string) {
  const db = getLocalDatabase();
  const tokenDigest = tokenHash(token);
  const row = db.prepare(`SELECT user_id FROM local_password_resets
    WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`)
    .get(tokenDigest, Math.floor(Date.now() / 1000)) as { user_id: string } | undefined;
  if (!row) return false;
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE local_users SET password_hash = ? WHERE id = ?")
      .run(hashPassword(newPassword), row.user_id);
    db.prepare("UPDATE local_password_resets SET used_at = ? WHERE token_hash = ?").run(now, tokenDigest);
    db.prepare("DELETE FROM local_sessions WHERE user_id = ?").run(row.user_id);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function writeLocalSecurityEvent(input: {
  actor?: LocalUser | null;
  action: string;
  targetEmail?: string | null;
  metadata?: Record<string, unknown>;
}) {
  getLocalDatabase().prepare(`INSERT INTO local_security_audit
    (id, actor_user_id, actor_email, action, target_email, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(
      crypto.randomUUID(),
      input.actor?.id || null,
      input.actor?.email || null,
      input.action,
      input.targetEmail ? normalizeEmail(input.targetEmail) : null,
      JSON.stringify(input.metadata || {}),
      new Date().toISOString(),
    );
}

export function listLocalSecurityEvents(limit = 200) {
  return getLocalDatabase().prepare(`SELECT id, actor_user_id, actor_email, action, target_email, metadata_json, created_at
    FROM local_security_audit ORDER BY created_at DESC LIMIT ?`).all(Math.min(Math.max(limit, 1), 500));
}

function appSecretsEncryptionKey() {
  const secret = process.env.APP_SECRETS_KEY?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (!secret) throw new Error("APP_SECRETS_KEY غير مضبوط على الخادم");
  return createHash("sha256").update(secret).digest();
}

function encryptAppSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", appSecretsEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptAppSecret(value: string) {
  const [version, ivValue, tagValue, encryptedValue] = value.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !encryptedValue) {
    throw new Error("صيغة سر التطبيق المحلي غير صالحة");
  }
  const decipher = createDecipheriv("aes-256-gcm", appSecretsEncryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function getLocalAppSecret(name: string) {
  const row = getLocalDatabase()
    .prepare("SELECT value_encrypted, updated_at, updated_by FROM local_app_secrets WHERE key = ?")
    .get(name) as { value_encrypted: string; updated_at: string; updated_by: string | null } | undefined;
  if (!row) return null;
  return {
    value: decryptAppSecret(row.value_encrypted),
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export function setLocalAppSecret(input: { name: string; value: string; updatedBy?: string | null }) {
  const updatedAt = new Date().toISOString();
  getLocalDatabase().prepare(`INSERT INTO local_app_secrets(key, value_encrypted, updated_at, updated_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value_encrypted = excluded.value_encrypted,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by`)
    .run(input.name, encryptAppSecret(input.value), updatedAt, input.updatedBy || null);
  return { updatedAt };
}

export function deleteLocalAppSecret(name: string) {
  getLocalDatabase().prepare("DELETE FROM local_app_secrets WHERE key = ?").run(name);
}

export function getLocalDocument<T = unknown>(key: string): { value: T; updatedAt: string; updatedBy: string | null } | null {
  const row = getLocalDatabase()
    .prepare("SELECT value_json, updated_at, updated_by FROM local_documents WHERE key = ?")
    .get(key) as { value_json: string; updated_at: string; updated_by: string | null } | undefined;
  if (!row) return null;
  try {
    return {
      value: JSON.parse(row.value_json) as T,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
    };
  } catch {
    return null;
  }
}

export function setLocalDocument(input: { key: string; value: unknown; updatedBy?: string | null }) {
  const updatedAt = new Date().toISOString();
  getLocalDatabase().prepare(`INSERT INTO local_documents(key, value_json, updated_at, updated_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by`)
    .run(input.key, JSON.stringify(input.value), updatedAt, input.updatedBy || null);
  return { updatedAt };
}

export function deleteLocalDocument(key: string) {
  getLocalDatabase().prepare("DELETE FROM local_documents WHERE key = ?").run(key);
}

export function ensureLocalBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const existingUsers = listLocalUsers();

  if (existingUsers.length > 0) return existingUsers.find((user) => user.role === "admin") || existingUsers[0];
  if (!email || !password) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_EMAIL وADMIN_PASSWORD مطلوبان لإنشاء المدير المحلي الأول");
    }
    return ensureBootstrapAdmin("admin@localhost", "ChangeThisLocalPassword!2026");
  }
  return ensureBootstrapAdmin(email, password);
}
