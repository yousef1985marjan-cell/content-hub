import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "admin" | "editor";

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
    return {
      currentUserId: context.userId,
      users: data.users.map((u) => ({
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        roles: roleMap.get(u.id) ?? [],
      })),
    };
  });

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; password: string; role: Role }) => {
    if (!data.email || !data.email.includes("@")) throw new Error("بريد غير صالح");
    if (!data.password || data.password.length < 6) throw new Error("كلمة السر يجب 6 أحرف على الأقل");
    if (data.role !== "admin" && data.role !== "editor") throw new Error("صلاحية غير صالحة");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    const uid = created.user!.id;
    const { error: rErr } = await admin.from("user_roles").insert({ user_id: uid, role: data.role });
    if (rErr) throw new Error(rErr.message);
    return { ok: true, id: uid };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: Role }) => {
    if (!data.userId) throw new Error("مستخدم غير محدد");
    if (data.role !== "admin" && data.role !== "editor") throw new Error("صلاحية غير صالحة");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdminOrBootstrap(context.userId);
    await admin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await admin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
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
    const { error } = await admin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const claimBootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) return { granted: false };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { granted: true };
  });
