import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, resolveSection } from "@/lib/content-store";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [{ title: "إخلاء المسؤولية — منصات شفاء" }] }),
  component: Page,
});

function Page() {
  const { state } = useContent();
  const s = resolveSection(state, "disclaimer", "ar");
  return (
    <PageShell title={s.title || "إخلاء المسؤولية"} subtitle="حدود المسؤولية والاستخدام">
      <article className="whitespace-pre-wrap leading-loose text-foreground text-lg">{s.content}</article>
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
