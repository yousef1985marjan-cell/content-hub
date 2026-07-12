import { createMiddleware } from "@tanstack/react-start";

export const requireLocalAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { requireCurrentLocalUser } = await import("./local-auth.server");
  const user = requireCurrentLocalUser();
  return next({
    context: {
      userId: user.id,
      user,
      claims: {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
    },
  });
});
