import { createServerFn } from "@tanstack/react-start";

function validEmail(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 254) throw new Error("بريد غير صالح");
  return email;
}

export const getLocalSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getCurrentLocalUser } = await import("./local-auth.server");
  return { user: getCurrentLocalUser() };
});

export const signInLocal = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => ({
    email: validEmail(data?.email),
    password: String(data?.password || ""),
  }))
  .handler(async ({ data }) => {
    const { authenticateLocalUser, writeLocalSecurityEvent } = await import("./local-auth.server");
    const user = authenticateLocalUser(data.email, data.password);
    writeLocalSecurityEvent({
      actor: user,
      action: user ? "user.sign_in" : "user.sign_in_failed",
      targetEmail: data.email,
    });
    if (!user) throw new Error("البريد الإلكتروني أو كلمة السر غير صحيحة");
    return { user };
  });

export const signOutLocal = createServerFn({ method: "POST" }).handler(async () => {
  const { destroyLocalSession, getCurrentLocalUser, writeLocalSecurityEvent } = await import("./local-auth.server");
  const actor = getCurrentLocalUser();
  if (actor) writeLocalSecurityEvent({ actor, action: "user.sign_out" });
  destroyLocalSession();
  return { ok: true };
});

export const validateLocalResetToken = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => ({ token: String(data?.token || "") }))
  .handler(async ({ data }) => {
    if (data.token.length < 20) return { valid: false };
    const { validatePasswordResetToken } = await import("./local-auth.server");
    return { valid: Boolean(validatePasswordResetToken(data.token)) };
  });

export const resetLocalPassword = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; password: string }) => {
    const token = String(data?.token || "");
    const password = String(data?.password || "");
    if (token.length < 20) throw new Error("رابط الاسترجاع غير صالح أو منتهي");
    if (password.length < 10) throw new Error("كلمة السر يجب أن تكون 10 محارف على الأقل");
    return { token, password };
  })
  .handler(async ({ data }) => {
    const { consumePasswordResetToken, writeLocalSecurityEvent } = await import("./local-auth.server");
    const success = consumePasswordResetToken(data.token, data.password);
    if (!success) throw new Error("رابط الاسترجاع غير صالح أو منتهي");
    writeLocalSecurityEvent({ action: "user.password_reset_completed" });
    return { ok: true };
  });
