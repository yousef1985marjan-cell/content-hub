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
    const { logSecurityEvent } = await import("./security-log.server");

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const publishableKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

    let accepted = false;
    if (!supabaseUrl || !publishableKey) {
      console.error("[reset] Supabase public environment variables are missing");
    } else {
      try {
        const endpoint = new URL("/auth/v1/recover", supabaseUrl);
        endpoint.searchParams.set("redirect_to", data.redirectTo);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: publishableKey,
          },
          body: JSON.stringify({ email: data.email }),
        });

        accepted = response.ok;
        if (!response.ok) {
          console.error("[reset] Supabase recovery request failed", response.status);
        }
      } catch (error) {
        console.error("[reset] Supabase recovery request threw", error);
      }
    }

    await logSecurityEvent({
      event: "user.password_reset_link_sent",
      targetEmail: data.email,
      status: accepted ? "success" : "failure",
      details: { delivered_via: "supabase_auth", redirect_host: new URL(data.redirectTo).host },
      notify: true,
    });

    // Always respond generically; never reveal whether the email exists.
    return { ok: true };
  });
