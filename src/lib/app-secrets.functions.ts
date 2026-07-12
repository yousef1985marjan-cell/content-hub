import { createServerFn } from "@tanstack/react-start";
import { requireLocalAuth } from "./local-auth-middleware";

function mask(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "•".repeat(value.length);
  return `${value.slice(0, 4)}${"•".repeat(Math.max(4, value.length - 8))}${value.slice(-4)}`;
}

export const getAppSecretStatus = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { name: string }) => {
    if (!data.name) throw new Error("اسم المفتاح مفقود");
    return data;
  })
  .handler(async ({ data }) => {
    const { getLocalAppSecret, requireLocalAdmin } = await import("./local-auth.server");
    requireLocalAdmin();
    const row = getLocalAppSecret(data.name);
    const databaseValue = row?.value ?? "";
    const environmentValue = data.name === "OPENAI_API_KEY" ? process.env.OPENAI_API_KEY ?? "" : "";
    const effective = databaseValue || environmentValue;
    return {
      configured: Boolean(effective),
      source: databaseValue ? "database" : environmentValue ? "environment" : "none",
      masked: mask(effective),
      updatedAt: row?.updatedAt ?? null,
    };
  });

export const setAppSecret = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { name: string; value: string }) => {
    if (!data.name) throw new Error("اسم المفتاح مفقود");
    if (!data.value || data.value.length < 8) throw new Error("قيمة المفتاح قصيرة جداً");
    if (data.value.length > 4096) throw new Error("قيمة المفتاح طويلة جداً");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { requireLocalAdmin, setLocalAppSecret, writeLocalSecurityEvent } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    setLocalAppSecret({ name: data.name, value: data.value, updatedBy: context.userId });
    writeLocalSecurityEvent({
      actor,
      action: "app_secret.updated",
      metadata: { name: data.name },
    });
    return { ok: true };
  });

export const deleteAppSecret = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { name: string }) => {
    if (!data.name) throw new Error("اسم المفتاح مفقود");
    return data;
  })
  .handler(async ({ data }) => {
    const { deleteLocalAppSecret, requireLocalAdmin, writeLocalSecurityEvent } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    deleteLocalAppSecret(data.name);
    writeLocalSecurityEvent({
      actor,
      action: "app_secret.deleted",
      metadata: { name: data.name },
    });
    return { ok: true };
  });
