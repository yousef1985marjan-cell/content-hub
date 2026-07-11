import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2, RotateCcw, Copy, Pencil, Mail, ShieldCheck, ShieldOff } from "lucide-react";
import {
  listUsers,
  createUser,
  updateUserRole,
  updateUserProfile,
  deleteUser,
  claimBootstrapAdmin,
  resetUserPassword,
  sendPasswordResetLink,
  adminDisableUserMfa,
} from "@/lib/users.functions";
import { MfaSelfEnroll } from "./mfa-self-enroll";

type UserRole = "super_admin" | "admin" | "editor";

const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: "مدير عام",
  admin: "مدير",
  editor: "محرّر",
};

const ROLE_COLOR: Record<UserRole, string> = {
  super_admin: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  admin: "bg-primary/20 text-primary",
  editor: "bg-muted text-muted-foreground",
};

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: UserRole[];
  full_name: string;
  description: string;
  mfa_enabled: boolean;
};

function KeyRoundIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="m10.85 12.15 7.4-7.4" />
      <path d="m18 5 3 3" />
      <path d="m15 8 3 3" />
    </svg>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return "لم يسجّل الدخول بعد";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 30) return `منذ ${d} يوم`;
  return new Date(iso).toLocaleDateString("ar");
}

export function UsersPanel({ flash }: { flash: (m: string) => void }) {
  const fetchList = useServerFn(listUsers);
  const doCreate = useServerFn(createUser);
  const doUpdateRole = useServerFn(updateUserRole);
  const doUpdateProfile = useServerFn(updateUserProfile);
  const doDelete = useServerFn(deleteUser);
  const doClaim = useServerFn(claimBootstrapAdmin);
  const doReset = useServerFn(resetUserPassword);
  const doSendLink = useServerFn(sendPasswordResetLink);
  const doDisableMfa = useServerFn(adminDisableUserMfa);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetPass, setResetPass] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState<{ email: string; password: string } | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [sentLink, setSentLink] = useState<{ email: string; link: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchList();
      setUsers(res.users as AdminUser[]);
      setCurrentUserId(res.currentUserId);
    } catch (e) {
      const msg = (e as Error).message || "تعذّر تحميل المستخدمين";
      if (msg.includes("مدير")) {
        try {
          const claim = await doClaim();
          if (claim.granted) {
            const res2 = await fetchList();
            setUsers(res2.users as AdminUser[]);
            setCurrentUserId(res2.currentUserId);
            flash("تم منحك صلاحية المدير العام");
            setLoading(false);
            return;
          }
        } catch (ce) {
          setError((ce as Error).message);
          setLoading(false);
          return;
        }
      }
      setError(msg);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await doCreate({ data: { email, password, role, full_name: fullName, description } });
      const newEmail = email;
      const newPassword = password;
      setEmail("");
      setPassword("");
      setRole("editor");
      setFullName("");
      setDescription("");
      flash("تمت إضافة المستخدم");
      setResetDone({ email: newEmail, password: newPassword });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
    setCreating(false);
  };

  const onChangeRole = async (userId: string, newRole: UserRole) => {
    setError(null);
    try {
      await doUpdateRole({ data: { userId, role: newRole } });
      flash("تم تحديث الصلاحية");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`حذف المستخدم ${userEmail}؟ لا يمكن التراجع.`)) return;
    setError(null);
    try {
      await doDelete({ data: { userId } });
      flash("تم حذف المستخدم");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onSendResetLink = async (u: AdminUser) => {
    if (!confirm(`إرسال رابط إعادة تعيين كلمة السر إلى ${u.email}؟`)) return;
    try {
      const res = await doSendLink({
        data: { userId: u.id, redirectTo: `${window.location.origin}/reset-password` },
      });
      flash("تم توليد رابط الاستعادة");
      setSentLink({ email: res.email, link: res.actionLink });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onDisableMfa = async (u: AdminUser) => {
    if (!confirm(`تعطيل المصادقة الثنائية للمستخدم ${u.email}؟`)) return;
    try {
      await doDisableMfa({ data: { userId: u.id } });
      flash("تم تعطيل المصادقة الثنائية");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setEditName(u.full_name);
    setEditDesc(u.description);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      await doUpdateProfile({
        data: { userId: editTarget.id, full_name: editName, description: editDesc },
      });
      flash("تم حفظ البيانات");
      setEditTarget(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
    setSavingEdit(false);
  };

  const openReset = (u: AdminUser) => {
    setResetTarget(u);
    setResetPass("");
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetting(true);
    setError(null);
    try {
      await doReset({ data: { userId: resetTarget.id, password: resetPass } });
      setResetDone({ email: resetTarget.email, password: resetPass });
      setResetTarget(null);
      setResetPass("");
      flash("تم تعيين كلمة السر");
    } catch (err) {
      setError((err as Error).message);
    }
    setResetting(false);
  };

  const genPass = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let s = "";
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) s += chars[arr[i] % chars.length];
    return s;
  };

  return (
    <div className="space-y-6">
      <MfaSelfEnroll flash={flash} />

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-relaxed">
        <b className="text-amber-700 dark:text-amber-400">ملاحظة أمنية:</b> كلمات السر مُشفّرة في القاعدة ولا يمكن استعراضها. عند إنشاء مستخدم أو إعادة تعيين كلمة سره ستُعرض لك مرة واحدة فقط لتسليمها له. لاستعادة ذاتية بواسطة المستخدم، استخدم زر «إرسال رابط الاستعادة».
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-1 text-lg font-black text-primary">إضافة مستخدم جديد</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          الصلاحيات: <b>مدير عام</b> (كل شيء) — <b>مدير</b> (إدارة المستخدمين والمحتوى) — <b>محرّر</b> (تعديل المحتوى فقط).
        </p>
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">الاسم الكامل</label>
            <input
              type="text"
              maxLength={200}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="مثال: أحمد محمد"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">المسمى الوظيفي / الوصف</label>
            <input
              type="text"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="مثال: مدير المحتوى"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-muted-foreground">البريد الإلكتروني</label>
            <input
              type="email"
              dir="ltr"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">كلمة السر</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                minLength={6}
                maxLength={200}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="6 أحرف على الأقل"
              />
              <button
                type="button"
                onClick={() => setPassword(genPass())}
                className="rounded-lg border border-input bg-background px-3 text-xs font-bold hover:bg-muted"
              >
                توليد
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">الصلاحية</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="editor">محرّر</option>
              <option value="admin">مدير</option>
              <option value="super_admin">مدير عام</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> {creating ? "جاري الإضافة..." : "إضافة المستخدم"}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black text-primary">المستخدمون ({users.length})</h3>
          <button
            onClick={load}
            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> تحديث
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا يوجد مستخدمون بعد.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => {
              const isMe = u.id === currentUserId;
              const currentRole: UserRole = u.roles.includes("super_admin")
                ? "super_admin"
                : u.roles.includes("admin")
                  ? "admin"
                  : "editor";
              return (
                <div
                  key={u.id}
                  className="rounded-lg border border-border/60 bg-muted/20 p-3"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm">
                          {u.full_name || <span className="text-muted-foreground font-normal">(بدون اسم)</span>}
                        </span>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${ROLE_COLOR[currentRole]}`}>
                          {ROLE_LABEL[currentRole]}
                        </span>
                        {u.mfa_enabled && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="h-3 w-3" /> 2FA
                          </span>
                        )}
                        {isMe && <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] text-primary">أنت</span>}
                      </div>
                      {u.description && (
                        <div className="mt-1 text-xs text-muted-foreground">{u.description}</div>
                      )}
                      <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground" dir="ltr">{u.email}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        أُنشئ: {new Date(u.created_at).toLocaleDateString("ar")} • آخر استخدام: {timeAgo(u.last_sign_in_at)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={currentRole}
                        onChange={(e) => onChangeRole(u.id, e.target.value as UserRole)}
                        disabled={isMe}
                        className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="editor">محرّر</option>
                        <option value="admin">مدير</option>
                        <option value="super_admin">مدير عام</option>
                      </select>
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
                      >
                        <Pencil className="h-3 w-3" /> تعديل
                      </button>
                      <button
                        onClick={() => onSendResetLink(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
                      >
                        <Mail className="h-3 w-3" /> رابط استعادة
                      </button>
                      <button
                        onClick={() => openReset(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
                      >
                        <KeyRoundIcon /> تعيين كلمة سر
                      </button>
                      {u.mfa_enabled && (
                        <button
                          onClick={() => onDisableMfa(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
                          title="تعطيل المصادقة الثنائية"
                        >
                          <ShieldOff className="h-3 w-3" /> تعطيل 2FA
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(u.id, u.email)}
                        disabled={isMe}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-30"
                      >
                        <Trash2 className="h-3 w-3" /> حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditTarget(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-black text-primary">تعديل بيانات المستخدم</h3>
            <p className="mb-4 text-xs text-muted-foreground" dir="ltr">{editTarget.email}</p>
            <form onSubmit={submitEdit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">الاسم الكامل</label>
                <input
                  type="text"
                  maxLength={200}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">المسمى الوظيفي / الوصف</label>
                <textarea
                  maxLength={500}
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {savingEdit ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setResetTarget(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-black text-primary">إعادة تعيين كلمة السر</h3>
            <p className="mb-4 text-xs text-muted-foreground" dir="ltr">{resetTarget.email}</p>
            <form onSubmit={submitReset} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  minLength={6}
                  maxLength={200}
                  value={resetPass}
                  onChange={(e) => setResetPass(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="كلمة السر الجديدة"
                />
                <button
                  type="button"
                  onClick={() => setResetPass(genPass())}
                  className="rounded-lg border border-input bg-background px-3 text-xs font-bold hover:bg-muted"
                >
                  توليد
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={resetting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {resetting ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sentLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSentLink(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-black text-primary">رابط إعادة تعيين كلمة السر</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              أرسل هذا الرابط إلى المستخدم <b dir="ltr">{sentLink.email}</b>. الرابط صالح لمدة محدودة ويسمح له بتعيين كلمة سر جديدة بنفسه.
            </p>
            <div className="flex items-start gap-2">
              <textarea
                readOnly
                value={sentLink.link}
                rows={3}
                className="flex-1 rounded-lg border border-input bg-muted/40 px-3 py-2 font-mono text-[11px]"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(sentLink.link)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSentLink(null)}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {resetDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setResetDone(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-black text-primary">بيانات الدخول</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              انسخها الآن وسلّمها للمستخدم — لن تُعرض مرة أخرى.
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground">البريد</label>
                <div className="rounded-lg border border-input bg-muted/40 px-3 py-2 font-mono text-sm" dir="ltr">{resetDone.email}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground">كلمة السر</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-input bg-muted/40 px-3 py-2 font-mono text-sm" dir="ltr">{resetDone.password}</div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(`${resetDone.email} / ${resetDone.password}`)}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setResetDone(null)}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              تم النسخ، إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
