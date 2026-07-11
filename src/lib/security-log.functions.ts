import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("is_admin_or_bootstrap", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("غير مصرّح: تحتاج صلاحية مدير");
  return supabaseAdmin;
}

export const listSecurityEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { event?: string; email?: string; limit?: number }) => data ?? {},
  )
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId);
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 500);
    let q = admin
      .from("security_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data.event) q = q.eq("event_type", data.event);
    if (data.email) {
      const e = `%${data.email}%`;
      q = q.or(`actor_email.ilike.${e},target_email.ilike.${e}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { events: rows ?? [] };
  });

export const sendReferenceEmailTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId);
    const { data: userRes } = await admin.auth.admin.getUserById(context.userId);
    const actorEmail = userRes.user?.email ?? null;
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "auth.reference_email_test",
      actorId: context.userId,
      actorEmail,
      details: { source: "admin_panel" },
    });
    return { ok: true };
  });
