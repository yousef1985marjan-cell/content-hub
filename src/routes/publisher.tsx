import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink } from "@/lib/content-store";
import { ExternalLink, Globe, Smartphone, Apple, ArrowUpLeft } from "lucide-react";

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
    <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Decorative gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
        style={{ background: "var(--gradient-hero)" }}
      />

      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-start gap-4"
      >
        <div
          className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl ring-1 ring-border/70 transition-transform duration-500 group-hover:scale-105 group-hover:ring-primary/40"
          style={{ background: p.icon ? "var(--card)" : "var(--gradient-hero)" }}
        >
          {p.icon ? (
            <img src={p.icon} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <ExternalLink className="h-7 w-7 text-primary-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black tracking-tight transition-colors group-hover:text-primary">
              {p.name}
            </h3>
            <ArrowUpLeft className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
          </div>
          {p.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
          )}
          <p className="mt-2 truncate text-[11px] font-medium tracking-wide text-muted-foreground/80" dir="ltr">
            {p.url.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </a>

      {extras.length > 0 && (
        <div className="relative mt-5 flex flex-wrap gap-2 border-t border-dashed border-border/70 pt-4">
          {extras.map((e) => (
            <a
              key={e.key}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/chip inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-bold text-foreground/80 backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md"
            >
              <span className="transition-transform group-hover/chip:-rotate-6">{e.icon}</span>
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
      <p className="mb-10 whitespace-pre-wrap text-lg leading-loose text-foreground">
        {state.publisherIntro}
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
