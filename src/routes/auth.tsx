import { createFileRoute, redirect } from "@tanstack/react-router";

// تسجيل الدخول ملغى: أي زيارة لهذه الصفحة تُحوَّل مباشرة إلى لوحة التحكم.
export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
  component: () => null,
});
