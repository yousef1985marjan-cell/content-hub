import { createServerFn } from "@tanstack/react-start";

const ALLOWED_REDIRECT_HOSTS = new Set(["gm.shifaa.at", "localhost", "127.0.0.1"]);

export const sendPasswordResetEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; redirectTo: string }) => {
    const email = data?.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) throw new Error("بريد غير صالح");
    if (!data?.redirectTo) throw new Error("redirectTo مطلوب");

    let redirectUrl: URL;
    try {
      redirectUrl = new URL(data.redirectTo);
    } catch {
      throw new Error("عنوان إعادة التوجيه غير صالح");
    }
    if (!ALLOWED_REDIRECT_HOSTS.has(redirectUrl.hostname)) {
      throw new Error("عنوان إعادة التوجيه غير مسموح");
    }

    return { email, redirectTo: redirectUrl.toString() };
  })
  .handler(async ({ data }) => {
    const { createPasswordResetToken, writeLocalSecurityEvent } = await import("./local-auth.server");
    const reset = createPasswordResetToken(data.email);

    // Always return a generic success response when the account does not exist.
    if (!reset) {
      writeLocalSecurityEvent({ action: "user.password_reset_requested_unknown", targetEmail: data.email });
      return { ok: true };
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      writeLocalSecurityEvent({ action: "user.password_reset_delivery_failed", targetEmail: data.email, metadata: { reason: "missing_resend_key" } });
      console.error("[reset] RESEND_API_KEY is missing");
      return { ok: true };
    }

    const resetUrl = new URL(data.redirectTo);
    resetUrl.searchParams.set("token", reset.token);
    const from = process.env.RESEND_FROM_EMAIL?.trim() || "Shifaa Content Hub <noreply@shifaa.at>";

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [reset.user.email],
          subject: "استرجاع كلمة السر — Content Hub",
          text: `طلبت استرجاع كلمة السر لحسابك. افتح الرابط التالي خلال 20 دقيقة:\n\n${resetUrl.toString()}\n\nإذا لم تطلب ذلك، تجاهل هذه الرسالة.`,
          html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8;color:#172033;max-width:600px;margin:auto"><h2>استرجاع كلمة السر</h2><p>تم طلب استرجاع كلمة السر لحسابك في Content Hub.</p><p><a href="${resetUrl.toString()}" style="display:inline-block;background:#165d66;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">تعيين كلمة سر جديدة</a></p><p>صلاحية الرابط <strong>20 دقيقة</strong> ويُستخدم مرة واحدة فقط.</p><p style="color:#667085;font-size:13px">إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p></div>`,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error("[reset] Resend rejected the message", response.status, details.slice(0, 300));
        writeLocalSecurityEvent({
          action: "user.password_reset_delivery_failed",
          targetEmail: data.email,
          metadata: { provider: "resend", status: response.status },
        });
        return { ok: true };
      }

      writeLocalSecurityEvent({
        action: "user.password_reset_link_sent",
        targetEmail: data.email,
        metadata: { provider: "resend", redirectHost: resetUrl.host },
      });
    } catch (error) {
      console.error("[reset] Resend request failed", error);
      writeLocalSecurityEvent({
        action: "user.password_reset_delivery_failed",
        targetEmail: data.email,
        metadata: { provider: "resend", reason: "request_failed" },
      });
    }

    return { ok: true };
  });
