import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent } from "@/lib/content-store";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "من نحن — منصات شفاء" }] }),
  component: About,
});

function About() {
  const { state } = useContent();
  return (
    <PageShell title="من نحن" subtitle="تعرّف علينا عن قرب">
      <article className="prose prose-lg max-w-none whitespace-pre-wrap leading-loose text-foreground">
        {state.about}
      </article>
    </PageShell>
  );
}
