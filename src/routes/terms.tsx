import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent } from "@/lib/content-store";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "الشروط والأحكام — منصات شفاء" }] }),
  component: Page,
});

function Page() {
  const { state } = useContent();
  return (
    <PageShell title="الشروط والأحكام" subtitle="شروط استخدام المنصة">
      <article className="whitespace-pre-wrap leading-loose text-foreground text-lg">{state.terms}</article>
    </PageShell>
  );
}
