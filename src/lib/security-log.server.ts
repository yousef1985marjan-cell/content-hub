// Server-only helpers for audit logging + security email notifications.
// Never import this file from client-reachable modules at top level.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const REFERENCE_EMAIL = "gozyfgozyf5030018@gmail.com";
export const SENDER_EMAIL = "noreply@shifaa.at";
export const SENDER_NAME = "منصات شفاء - الأمان";

export type AuditEvent =
  | "user.created"
  | "user.deleted"
  | "user.role_changed"
  | "user.password_reset_admin"
  | "user.password_reset_link_sent"
  | "user.password_reset_self_requested"
  | "user.mfa_disabled_admin"
  | "user.mfa_enabled_self"
  | "user.mfa_disabled_self"
  | "user.profile_updated"
  | "user.signed_in"
  | "auth.reference_email_test";

export const EVENT_LABEL: Record<AuditEvent, string> = {
  "user.created": "إنشاء مستخدم",
  "user.deleted": "حذف مستخدم",
  "user.role_changed": "تغيير صلاحية",
  "user.password_reset_admin": "إعادة تعيين كلمة السر (مدير)",
  "user.password_reset_link_sent": "إرسال رابط استعادة كلمة السر",
  "user.password_reset_self_requested": "طلب استعادة كلمة السر (ذاتي)",
  "user.mfa_disabled_admin": "تعطيل المصادقة الثنائية (مدير)",
  "user.mfa_enabled_self": "تفعيل المصادقة الثنائية",
  "user.mfa_disabled_self": "تعطيل المصادقة الثنائية",
  "user.profile_updated": "تحديث بيانات مستخدم",
  "user.signed_in": "تسجيل دخول",
  "auth.reference_email_test": "اختبار البريد المرجعي",
};

type LogInput = {
  event: AuditEvent;
  actorId?: string | null;
  actorEmail?: string | null;
  targetId?: string | null;
  targetEmail?: string | null;
  status?: "success" | "failure";
  details?: Record<string, unknown>;
  notify?: boolean;
};

export async function logSecurityEvent(input: LogInput): Promise<void> {
  try {
    await supabaseAdmin.from("security_audit_log").insert({
      event_type: input.event,
      actor_id: input.actorId ?? null,
      actor_email: input.actorEmail ?? null,
      target_id: input.targetId ?? null,
      target_email: input.targetEmail ?? null,
      status: input.status ?? "success",
      details: input.details ?? {},
    });
  } catch (e) {
    console.error("[audit] failed to log", e);
  }
  if (input.notify !== false) {
    void sendSecurityNotification(input).catch((e) =>
      console.error("[audit] notification failed", e),
    );
  }
}

async function sendSecurityNotification(input: LogInput): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[audit] RESEND_API_KEY missing; skipping notification");
    return;
  }
  const label = EVENT_LABEL[input.event] ?? input.event;
  const when = new Date().toLocaleString("ar", { timeZone: "Asia/Damascus" });
  const rows: Array<[string, string]> = [
    ["الحدث", label],
    ["الحالة", input.status === "failure" ? "فشل" : "نجاح"],
    ["الوقت", when],
  ];
  if (input.actorEmail) rows.push(["نُفّذ بواسطة", input.actorEmail]);
  if (input.targetEmail) rows.push(["الحساب المستهدف", input.targetEmail]);
  const detailKeys = Object.keys(input.details ?? {});
  if (detailKeys.length) {
    for (const k of detailKeys) {
      rows.push([k, String((input.details as Record<string, unknown>)[k])]);
    }
  }

  const html = `
<!doctype html>
<html lang="ar" dir="rtl"><body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Tahoma,Arial,sans-serif;color:#111">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#064C32;color:#fff;padding:16px 20px;font-weight:800">إشعار أمني — منصات شفاء</div>
    <div style="padding:20px">
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7">حدث نشاط أمني على حسابك المرجعي:</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 8px;background:#f3f4f6;font-weight:700;width:40%">${escapeHtml(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${escapeHtml(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#6b7280">إذا لم تكن أنت من نفّذ هذه العملية، سارع بتغيير كلمة السر وفصل الجلسات من لوحة التحكم.</p>
    </div>
  </div>
</body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [REFERENCE_EMAIL],
      subject: `[أمان] ${label}`,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[audit] Resend failed ${res.status}: ${body}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
