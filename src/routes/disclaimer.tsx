import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent } from "@/lib/content-store";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [{ title: "إخلاء المسؤولية — منصات شفاء" }] }),
  component: Page,
});

function Page() {
  const { state } = useContent();
  return (
    <PageShell title="إخلاء المسؤولية" subtitle="حدود المسؤولية والاستخدام">
      <article className="whitespace-pre-wrap leading-loose text-foreground text-lg">{state.disclaimer}</article>
    </PageShell>
  );
}
