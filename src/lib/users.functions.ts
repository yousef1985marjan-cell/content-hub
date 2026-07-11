import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "super_admin" | "admin" | "editor";
const ROLES: Role[] = ["super_admin", "admin", "editor"];

async function assertAdminOrBootstrap(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("is_admin_or_bootstrap", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("غير مصرّح: تحتاج صلاحية مدير");
  return supabaseAdmin;
}

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    const { data: roles, error: rErr } = await admin.from("user_roles").select("user_id, role");
    if (rErr) throw new Error(rErr.message);
    const roleMap = new Map<string, Role[]>();
    (roles ?? []).forEach((r: { user_id: string; role: Role }) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    const { data: profiles } = await admin.from("profiles").select("id, full_name, description");
    const profileMap = new Map<string, { full_name: string; description: string }>();
    (profiles ?? []).forEach((p: { id: string; full_name: string; description: string }) => {
      profileMap.set(p.id, { full_name: p.full_name, description: p.description });
    });
    return {
      currentUserId: context.userId,
      users: data.users.map((u) => {
        const factors = (u as unknown as { factors?: Array<{ status: string; factor_type: string }> }).factors ?? [];
        const totp = factors.some((f) => f.factor_type === "totp" && f.status === "verified");
        return {
          id: u.id,
          email: u.email ?? "",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          roles: roleMap.get(u.id) ?? [],
          full_name: profileMap.get(u.id)?.full_name ?? "",
          description: profileMap.get(u.id)?.description ?? "",
          mfa_enabled: totp,
        };
      }),
    };
  });

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; password: string; role: Role; full_name?: string; description?: string }) => {
    if (!data.email || !data.email.includes("@")) throw new Error("بريد غير صالح");
    if (!data.password || data.password.length < 6) throw new Error("كلمة السر يجب 6 أحرف على الأقل");
    if (!ROLES.includes(data.role)) throw new Error("صلاحية غير صالحة");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    const { data: actor } = await admin.auth.admin.getUserById(context.userId);
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name ?? "",
        description: data.description ?? "",
      },
    });
    if (error) throw new Error(error.message);
    const uid = created.user!.id;
    const { error: rErr } = await admin.from("user_roles").insert({ user_id: uid, role: data.role });
    if (rErr) throw new Error(rErr.message);
    await admin.from("profiles").upsert({
      id: uid,
      full_name: data.full_name ?? "",
      description: data.description ?? "",
    });
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.created",
      actorId: context.userId,
      actorEmail: actor.user?.email ?? null,
      targetId: uid,
      targetEmail: data.email,
      details: { role: data.role },
    });
    return { ok: true, id: uid };
  });

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; full_name: string; description: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if ((data.full_name ?? "").length > 200) throw new Error("الاسم طويل جداً");
    if ((data.description ?? "").length > 500) throw new Error("الوصف طويل جداً");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    const { error } = await admin.from("profiles").upsert({
      id: data.userId,
      full_name: data.full_name ?? "",
      description: data.description ?? "",
    });
    if (error) throw new Error(error.message);
    const { data: actor } = await admin.auth.admin.getUserById(context.userId);
    const { data: target } = await admin.auth.admin.getUserById(data.userId);
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.profile_updated",
      actorId: context.userId,
      actorEmail: actor.user?.email ?? null,
      targetId: data.userId,
      targetEmail: target.user?.email ?? null,
      notify: false,
    });
    return { ok: true };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: Role }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if (!ROLES.includes(data.role)) throw new Error("صلاحية غير صالحة");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    await admin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await admin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    const { data: actor } = await admin.auth.admin.getUserById(context.userId);
    const { data: target } = await admin.auth.admin.getUserById(data.userId);
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.role_changed",
      actorId: context.userId,
      actorEmail: actor.user?.email ?? null,
      targetId: data.userId,
      targetEmail: target.user?.email ?? null,
      details: { new_role: data.role },
    });
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    return data;
  })
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error("لا يمكنك حذف حسابك الحالي");
    const admin = await assertAdminOrBootstrap(context.userId);
    const { data: actor } = await admin.auth.admin.getUserById(context.userId);
    const { data: target } = await admin.auth.admin.getUserById(data.userId);
    const targetEmail = target.user?.email ?? null;
    const { error } = await admin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.deleted",
      actorId: context.userId,
      actorEmail: actor.user?.email ?? null,
      targetId: data.userId,
      targetEmail,
    });
    return { ok: true };
  });

export const claimBootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "super_admin"]);
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) return { granted: false };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "super_admin" });
    if (error) throw new Error(error.message);
    return { granted: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; password: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if (!data.password || data.password.length < 6) throw new Error("كلمة السر يجب 6 أحرف على الأقل");
    if (data.password.length > 200) throw new Error("كلمة السر طويلة جداً");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    const { error } = await admin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    const { data: actor } = await admin.auth.admin.getUserById(context.userId);
    const { data: target } = await admin.auth.admin.getUserById(data.userId);
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.password_reset_admin",
      actorId: context.userId,
      actorEmail: actor.user?.email ?? null,
      targetId: data.userId,
      targetEmail: target.user?.email ?? null,
    });
    return { ok: true };
  });

export const sendPasswordResetLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; redirectTo: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if (!data.redirectTo) throw new Error("رابط الإرجاع مفقود");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    const { data: userRes, error: uErr } = await admin.auth.admin.getUserById(data.userId);
    if (uErr) throw new Error(uErr.message);
    const email = userRes.user?.email;
    if (!email) throw new Error("لا يوجد بريد لهذا المستخدم");
    const { data: linkData, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: data.redirectTo },
    });
    if (error) throw new Error(error.message);
    const { data: actor } = await admin.auth.admin.getUserById(context.userId);
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.password_reset_link_sent",
      actorId: context.userId,
      actorEmail: actor.user?.email ?? null,
      targetId: data.userId,
      targetEmail: email,
    });
    return { ok: true, actionLink: linkData.properties?.action_link ?? "", email };
  });

export const adminDisableUserMfa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    const { data: factors, error } = await admin.auth.admin.mfa.listFactors({ userId: data.userId });
    if (error) throw new Error(error.message);
    for (const f of factors.factors ?? []) {
      await admin.auth.admin.mfa.deleteFactor({ userId: data.userId, id: f.id });
    }
    const { data: actor } = await admin.auth.admin.getUserById(context.userId);
    const { data: target } = await admin.auth.admin.getUserById(data.userId);
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.mfa_disabled_admin",
      actorId: context.userId,
      actorEmail: actor.user?.email ?? null,
      targetId: data.userId,
      targetEmail: target.user?.email ?? null,
    });
    return { ok: true };
  });
