import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, resolveSection } from "@/lib/content-store";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "من نحن — منصات شفاء" }] }),
  component: About,
});

function About() {
  const { state } = useContent();
  const s = resolveSection(state, "about", "ar");
  return (
    <PageShell title={s.title || "من نحن"} subtitle="تعرّف علينا عن قرب">
      <article className="prose prose-lg max-w-none whitespace-pre-wrap leading-loose text-foreground">
        {s.content}
      </article>
      {s.links.length > 0 && (
        <ul className="mt-6 space-y-2">
          {s.links.map((l) => (
            <li key={l.id}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {l.title || l.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
