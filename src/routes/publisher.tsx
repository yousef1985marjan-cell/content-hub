import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink } from "@/lib/content-store";
import { ExternalLink, Globe, Smartphone, Apple } from "lucide-react";

export const Route = createFileRoute("/publisher")({
  head: () => ({ meta: [{ title: "منصات شفاء — بيانات الناشر" }] }),
  component: Page,
});

function PlatformCard({ p }: { p: PlatformLink }) {
  const extras: { key: string; label: string; url: string; icon: React.ReactNode }[] = [];
  if (p.webUrl) extras.push({ key: "web", label: "موقع الويب", url: p.webUrl, icon: <Globe className="h-4 w-4" /> });
  if (p.androidUrl)
    extras.push({ key: "and", label: "أندرويد", url: p.androidUrl, icon: <Smartphone className="h-4 w-4" /> });
  if (p.iosUrl) extras.push({ key: "ios", label: "آيفون", url: p.iosUrl, icon: <Apple className="h-4 w-4" /> });

  return (
    <div
      className="rounded-2xl border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 overflow-hidden">
          {p.icon ? (
            <img src={p.icon} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <ExternalLink className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-lg truncate group-hover:text-primary transition-colors">{p.name}</h3>
          {p.description && <p className="mt-1 text-sm text-muted-foreground truncate">{p.description}</p>}
          <p className="mt-1 text-xs text-muted-foreground truncate" dir="ltr">{p.url}</p>
        </div>
      </a>

      {extras.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
          {extras.map((e) => (
            <a
              key={e.key}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {e.icon}
              {e.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <PlatformCard key={p.id} p={p} />
        ))}
      </div>
    </PageShell>
  );
}
