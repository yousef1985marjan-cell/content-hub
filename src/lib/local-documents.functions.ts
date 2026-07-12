import { createServerFn } from "@tanstack/react-start";
import { requireLocalAuth } from "./local-auth-middleware";

export const LOCAL_DOCUMENT_KEYS = [
  "content",
  "brand-draft",
  "brand-published",
  "button-filters-draft",
  "button-filters-published",
  "button-filters-labels",
  "media",
  "publisher",
  "logos",
] as const;

export type LocalDocumentKey = (typeof LOCAL_DOCUMENT_KEYS)[number];

const keySet = new Set<string>(LOCAL_DOCUMENT_KEYS);
const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;

function validateKey(key: string): LocalDocumentKey {
  if (!keySet.has(key)) throw new Error("مفتاح مستند محلي غير مسموح");
  return key as LocalDocumentKey;
}

export const getLocalDocumentValue = createServerFn({ method: "POST" })
  .inputValidator((data: { key: string }) => ({ key: validateKey(data.key) }))
  .handler(async ({ data }) => {
    const { getLocalDocument } = await import("./local-auth.server");
    const document = getLocalDocument(data.key);
    return document
      ? { found: true as const, value: document.value, updatedAt: document.updatedAt }
      : { found: false as const, value: null, updatedAt: null };
  });

export const setLocalDocumentValue = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { key: string; value: unknown }) => {
    const key = validateKey(data.key);
    const encoded = JSON.stringify(data.value);
    if (encoded === undefined) throw new Error("قيمة المستند المحلي غير صالحة");
    if (new TextEncoder().encode(encoded).byteLength > MAX_DOCUMENT_BYTES) {
      throw new Error("حجم المستند المحلي يتجاوز الحد المسموح");
    }
    return { key, value: data.value };
  })
  .handler(async ({ data, context }) => {
    const { requireCurrentLocalUser, setLocalDocument, writeLocalSecurityEvent } = await import("./local-auth.server");
    const actor = requireCurrentLocalUser();
    const result = setLocalDocument({ key: data.key, value: data.value, updatedBy: context.userId });
    writeLocalSecurityEvent({
      actor,
      action: "local_document.updated",
      metadata: { key: data.key },
    });
    return { ok: true as const, updatedAt: result.updatedAt };
  });
