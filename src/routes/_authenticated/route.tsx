import { createFileRoute, Outlet } from "@tanstack/react-router";

// تسجيل الدخول ملغى: لوحة التحكم تُفتح مباشرة بدون حماية.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => <Outlet />,
});
