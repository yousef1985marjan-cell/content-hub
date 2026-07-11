import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("is_admin_or_bootstrap", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("غير مصرّح: تحتاج صلاحية مدير");
  return supabaseAdmin;
}

function mask(v: string): string {
  if (!v) return "";
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 4)}${"•".repeat(Math.max(4, v.length - 8))}${v.slice(-4)}`;
}

export const getAppSecretStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string }) => {
    if (!data.name) throw new Error("اسم المفتاح مفقود");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId);
    const { data: row } = await admin
      .from("app_secrets")
      .select("value, updated_at")
      .eq("name", data.name)
      .maybeSingle();
    const dbValue = row?.value ?? "";
    const envValue = data.name === "OPENAI_API_KEY" ? process.env.OPENAI_API_KEY ?? "" : "";
    const effective = dbValue || envValue;
    return {
      configured: !!effective,
      source: dbValue ? "database" : envValue ? "environment" : "none",
      masked: mask(effective),
      updatedAt: row?.updated_at ?? null,
    };
  });

export const setAppSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string; value: string }) => {
    if (!data.name) throw new Error("اسم المفتاح مفقود");
    if (!data.value || data.value.length < 8) throw new Error("قيمة المفتاح قصيرة جداً");
    if (data.value.length > 4096) throw new Error("قيمة المفتاح طويلة جداً");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId);
    const { error } = await admin.from("app_secrets").upsert({
      name: data.name,
      value: data.value,
      updated_by: context.userId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAppSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string }) => {
    if (!data.name) throw new Error("اسم المفتاح مفقود");
    return data;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId);
    const { error } = await admin.from("app_secrets").delete().eq("name", data.name);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
