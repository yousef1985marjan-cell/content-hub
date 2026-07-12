import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getLocalSession } from "@/lib/local-auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { user } = await getLocalSession();
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});
