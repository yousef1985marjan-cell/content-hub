import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent } from "@/lib/content-store";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/publisher")({
  head: () => ({ meta: [{ title: "منصات شفاء — بيانات الناشر" }] }),
  component: Page,
});

function Page() {
  const { state } = useContent();
  return (
    <PageShell title="منصات شفاء" subtitle="اختر المنصة ليتم تحويلك إليها">
      <p className="text-lg leading-loose text-foreground whitespace-pre-wrap mb-8">{state.publisherIntro}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.platforms.length === 0 && (
          <p className="text-muted-foreground">لم تُضف منصات بعد.</p>
        )}
        {state.platforms.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="min-w-0">
              <h3 className="font-black text-lg truncate">{p.name}</h3>
              {p.description && <p className="mt-1 text-sm text-muted-foreground truncate">{p.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground truncate ltr:text-left" dir="ltr">{p.url}</p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ExternalLink className="h-5 w-5" />
            </span>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
