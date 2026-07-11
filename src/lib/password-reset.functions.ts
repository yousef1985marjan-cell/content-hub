import { createServerFn } from "@tanstack/react-start";

export const sendPasswordResetEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; redirectTo: string }) => {
    if (!data?.email || !data.email.includes("@")) throw new Error("بريد غير صالح");
    if (!data?.redirectTo) throw new Error("redirectTo مطلوب");
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logSecurityEvent, SENDER_EMAIL, SENDER_NAME } = await import("./security-log.server");

    // Always respond generically; never reveal whether the email exists.
    let actionLink: string | null = null;
    let userId: string | null = null;
    try {
      const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: data.email,
        options: { redirectTo: data.redirectTo },
      });
      if (!error) {
        actionLink = linkData?.properties?.action_link ?? null;
        userId = linkData?.user?.id ?? null;
      }
    } catch {
      // swallow — generic response below
    }

    if (actionLink) {
      const key = process.env.RESEND_API_KEY;
      if (key) {
        const html = `<!doctype html>
<html lang="ar" dir="rtl"><body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Tahoma,Arial,sans-serif;color:#111">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#064C32;color:#fff;padding:16px 20px;font-weight:800">استرجاع كلمة السر — منصات شفاء</div>
    <div style="padding:24px">
      <p style="margin:0 0 12px;font-size:14px;line-height:1.8">استلمنا طلباً لإعادة تعيين كلمة السر لحسابك. اضغط على الزر أدناه لاختيار كلمة سر جديدة. الرابط صالح لمدة 15 دقيقة ويُستخدم مرة واحدة فقط.</p>
      <p style="margin:20px 0"><a href="${actionLink}" style="display:inline-block;background:#064C32;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:800">إعادة تعيين كلمة السر</a></p>
      <p style="margin:12px 0 0;font-size:12px;color:#6b7280">إذا لم يعمل الزر، انسخ الرابط التالي وافتحه في المتصفح:</p>
      <p style="margin:6px 0 0;font-size:11px;word-break:break-all;color:#374151">${actionLink}</p>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee" />
      <p style="margin:0;font-size:12px;color:#6b7280">إن لم تطلب أنت هذا الاسترجاع، تجاهل هذه الرسالة وستبقى كلمة السر كما هي.</p>
    </div>
  </div>
</body></html>`;
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              from: `${SENDER_NAME.replace("الأمان", "استرجاع")} <${SENDER_EMAIL}>`,
              to: [data.email],
              subject: "استرجاع كلمة السر — منصات شفاء",
              html,
            }),
          });
          if (!res.ok) {
            console.error("[reset] resend failed", res.status, await res.text());
          }
        } catch (e) {
          console.error("[reset] resend threw", e);
        }
      } else {
        console.warn("[reset] RESEND_API_KEY missing");
      }
    }

    await logSecurityEvent({
      event: "user.password_reset_link_sent",
      targetId: userId,
      targetEmail: data.email,
      status: actionLink ? "success" : "failure",
      details: { delivered_via: "resend", sender: "noreply@shifaa.at" },
      notify: true,
    });

    return { ok: true };
  });
