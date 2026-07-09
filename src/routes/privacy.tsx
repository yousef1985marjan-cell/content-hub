import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent } from "@/lib/content-store";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "سياسة الخصوصية — منصات شفاء" }] }),
  component: Page,
});

function Page() {
  const { state } = useContent();
  return (
    <PageShell title="سياسة الخصوصية" subtitle="التزامنا تجاه بياناتك">
      <article className="whitespace-pre-wrap leading-loose text-foreground text-lg">{state.privacy}</article>
    </PageShell>
  );
}
