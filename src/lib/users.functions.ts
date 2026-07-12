import { createServerFn } from "@tanstack/react-start";
import { requireLocalAuth } from "./local-auth-middleware";

type Role = "super_admin" | "admin" | "editor";
const ROLES: Role[] = ["super_admin", "admin", "editor"];

function toLocalRole(role: Role): "admin" | "editor" {
  return role === "editor" ? "editor" : "admin";
}

async function audit(input: {
  event:
    | "user.created"
    | "user.deleted"
    | "user.role_changed"
    | "user.password_reset_admin"
    | "user.password_reset_link_sent"
    | "user.mfa_disabled_admin"
    | "user.profile_updated";
  actor: { id: string; email: string };
  target?: { id: string; email: string } | null;
  details?: Record<string, unknown>;
  notify?: boolean;
}) {
  const { logSecurityEvent } = await import("./security-log.server");
  await logSecurityEvent({
    event: input.event,
    actorId: input.actor.id,
    actorEmail: input.actor.email,
    targetId: input.target?.id ?? null,
    targetEmail: input.target?.email ?? null,
    details: input.details,
    notify: input.notify,
  });
}

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .handler(async ({ context }) => {
    const { listLocalUsers, requireLocalAdmin } = await import("./local-auth.server");
    requireLocalAdmin();
    return {
      currentUserId: context.userId,
      users: listLocalUsers().map((user) => ({
        id: user.id,
        email: user.email,
        created_at: user.createdAt,
        last_sign_in_at: user.lastSignInAt,
        roles: [user.role] as Role[],
        full_name: user.fullName,
        description: user.description,
        mfa_enabled: false,
      })),
    };
  });

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { email: string; password: string; role: Role; full_name?: string; description?: string }) => {
    if (!data.email || !data.email.includes("@")) throw new Error("بريد غير صالح");
    if (!data.password || data.password.length < 10) throw new Error("كلمة السر يجب 10 أحرف على الأقل");
    if (!ROLES.includes(data.role)) throw new Error("صلاحية غير صالحة");
    return data;
  })
  .handler(async ({ data }) => {
    const { createLocalUser, requireLocalAdmin, updateLocalUserProfile } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const created = createLocalUser({
      email: data.email,
      password: data.password,
      role: toLocalRole(data.role),
      status: "active",
      createdBy: actor.id,
    });
    updateLocalUserProfile({
      id: created.id,
      fullName: data.full_name ?? "",
      description: data.description ?? "",
    });
    await audit({ event: "user.created", actor, target: created, details: { role: data.role } });
    return { ok: true, id: created.id };
  });

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { userId: string; full_name: string; description: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if ((data.full_name ?? "").length > 200) throw new Error("الاسم طويل جداً");
    if ((data.description ?? "").length > 500) throw new Error("الوصف طويل جداً");
    return data;
  })
  .handler(async ({ data }) => {
    const { getLocalUserById, requireLocalAdmin, updateLocalUserProfile } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const target = updateLocalUserProfile({
      id: data.userId,
      fullName: data.full_name ?? "",
      description: data.description ?? "",
    });
    if (!target) throw new Error("المستخدم غير موجود");
    await audit({ event: "user.profile_updated", actor, target: getLocalUserById(data.userId), notify: false });
    return { ok: true };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { userId: string; role: Role }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if (!ROLES.includes(data.role)) throw new Error("صلاحية غير صالحة");
    return data;
  })
  .handler(async ({ data }) => {
    const { getLocalUserById, requireLocalAdmin, updateLocalUser } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const target = updateLocalUser({ id: data.userId, role: toLocalRole(data.role) });
    if (!target) throw new Error("المستخدم غير موجود");
    await audit({ event: "user.role_changed", actor, target, details: { new_role: data.role } });
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { userId: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    return data;
  })
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error("لا يمكنك حذف حسابك الحالي");
    const { deleteLocalUser, getLocalUserById, requireLocalAdmin } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const target = getLocalUserById(data.userId);
    if (!target) throw new Error("المستخدم غير موجود");
    deleteLocalUser(data.userId);
    await audit({ event: "user.deleted", actor, target });
    return { ok: true };
  });

export const claimBootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .handler(async ({ context }) => {
    const { listLocalUsers, updateLocalUser } = await import("./local-auth.server");
    if (listLocalUsers().some((user) => user.role === "admin")) return { granted: false };
    updateLocalUser({ id: context.userId, role: "admin", status: "active" });
    return { granted: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { userId: string; password: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if (!data.password || data.password.length < 10) throw new Error("كلمة السر يجب 10 أحرف على الأقل");
    if (data.password.length > 200) throw new Error("كلمة السر طويلة جداً");
    return data;
  })
  .handler(async ({ data }) => {
    const { getLocalUserById, requireLocalAdmin, updateLocalUser } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const target = getLocalUserById(data.userId);
    if (!target) throw new Error("المستخدم غير موجود");
    updateLocalUser({ id: data.userId, password: data.password });
    await audit({ event: "user.password_reset_admin", actor, target });
    return { ok: true };
  });

export const sendPasswordResetLink = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { userId: string; redirectTo: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if (!data.redirectTo) throw new Error("رابط الإرجاع مفقود");
    const url = new URL(data.redirectTo);
    if (!["gm.shifaa.at", "localhost", "127.0.0.1"].includes(url.hostname)) {
      throw new Error("عنوان إعادة التوجيه غير مسموح");
    }
    return { ...data, redirectTo: url.toString() };
  })
  .handler(async ({ data }) => {
    const { createPasswordResetToken, getLocalUserById, requireLocalAdmin } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const target = getLocalUserById(data.userId);
    if (!target) throw new Error("المستخدم غير موجود");
    const reset = createPasswordResetToken(target.email);
    if (!reset) throw new Error("تعذر إنشاء رابط الاستعادة");
    const resetUrl = new URL(data.redirectTo);
    resetUrl.searchParams.set("token", reset.token);
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) throw new Error("RESEND_API_KEY غير مضبوط على الخادم");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL?.trim() || "Shifaa Content Hub <noreply@shifaa.at>",
        to: [target.email],
        subject: "استرجاع كلمة السر — Content Hub",
        text: `افتح الرابط التالي خلال 20 دقيقة لتعيين كلمة سر جديدة:\n\n${resetUrl.toString()}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>استرجاع كلمة السر</h2><p><a href="${resetUrl.toString()}">تعيين كلمة سر جديدة</a></p><p>صلاحية الرابط 20 دقيقة.</p></div>`,
      }),
    });
    if (!response.ok) throw new Error(`فشل إرسال البريد (${response.status})`);
    await audit({ event: "user.password_reset_link_sent", actor, target });
    return { ok: true, actionLink: resetUrl.toString(), email: target.email };
  });

export const adminDisableUserMfa = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { userId: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    return data;
  })
  .handler(async ({ data }) => {
    const { getLocalUserById, requireLocalAdmin } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const target = getLocalUserById(data.userId);
    if (!target) throw new Error("المستخدم غير موجود");
    await audit({ event: "user.mfa_disabled_admin", actor, target, notify: false });
    return { ok: true };
  });
