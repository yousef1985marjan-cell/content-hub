import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink } from "@/lib/content-store";
import { ExternalLink, ArrowUpLeft, Sparkles } from "lucide-react";
import { BrandIcon, detectBrand, BRAND_META, type BrandKey } from "@/lib/brand-icons";

export const Route = createFileRoute("/publisher")({
  head: () => ({ meta: [{ title: "منصات شفاء — بيانات الناشر" }] }),
  component: Page,
});

function resolveBrand(p: PlatformLink): BrandKey | null {
  if (p.brand && p.brand !== "auto") return p.brand as BrandKey;
  return detectBrand(p.url);
}

function PlatformCard({ p }: { p: PlatformLink }) {
  const brand = resolveBrand(p);
  const brandColor = brand ? BRAND_META[brand].color : null;

  const extras: { key: string; label: string; url: string; brand: BrandKey }[] = [];
  if (p.webUrl) extras.push({ key: "web", label: "الويب", url: p.webUrl, brand: "web" });
  if (p.androidUrl) extras.push({ key: "and", label: "Android", url: p.androidUrl, brand: "android" });
  if (p.iosUrl) extras.push({ key: "ios", label: "iOS", url: p.iosUrl, brand: "apple" });

  const accent =
    p.accent ||
    (brandColor
      ? `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`
      : "var(--gradient-hero)");

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border bg-card transition-all duration-500 hover:-translate-y-1 ${
        p.featured ? "border-primary/50 ring-1 ring-primary/20" : "border-border/60 hover:border-primary/40"
      }`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Cover / brand banner */}
      <div
        className="relative h-24 overflow-hidden"
        style={{ background: accent }}
      >
        {p.cover && (
          <img
            src={p.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
        {brand && !p.cover && (
          <BrandIcon
            brand={brand}
            className="absolute -bottom-4 -left-4 h-32 w-32 text-white/15"
          />
        )}
        {p.featured && (
          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-foreground shadow">
            <Sparkles className="h-3 w-3 text-primary" /> مميّز
          </div>
        )}
        {p.badge && !p.featured && (
          <div className="absolute top-3 left-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-foreground shadow">
            {p.badge}
          </div>
        )}
      </div>

      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative -mt-8 flex items-start gap-4 px-6"
      >
        <div
          className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-card ring-4 ring-card transition-transform duration-500 group-hover:scale-105"
          style={{ boxShadow: "0 8px 20px -8px rgba(0,0,0,0.25)" }}
        >
          {p.icon ? (
            <img src={p.icon} alt={p.name} className="h-full w-full object-cover" />
          ) : brand ? (
            <div
              className="grid h-full w-full place-items-center text-white"
              style={{ background: brandColor ?? "var(--primary)" }}
            >
              <BrandIcon brand={brand} className="h-8 w-8" />
            </div>
          ) : (
            <div
              className="grid h-full w-full place-items-center text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              <ExternalLink className="h-7 w-7" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-8">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black tracking-tight transition-colors group-hover:text-primary">
              {p.name}
            </h3>
            <ArrowUpLeft className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
          </div>
          {p.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
          )}
          <p className="mt-1 truncate text-[11px] font-medium tracking-wide text-muted-foreground/80" dir="ltr">
            {p.url.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </a>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-border/70 px-6 py-4">
        <div className="flex flex-wrap gap-1.5">
          {extras.map((e) => (
            <a
              key={e.key}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={e.label}
              title={e.label}
              className="group/chip grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-background text-foreground/70 transition-all hover:scale-110 hover:border-transparent hover:text-white hover:shadow-md"
              style={{ ["--brand" as never]: BRAND_META[e.brand].color }}
              onMouseEnter={(ev) => {
                (ev.currentTarget as HTMLElement).style.background = BRAND_META[e.brand].color;
              }}
              onMouseLeave={(ev) => {
                (ev.currentTarget as HTMLElement).style.background = "";
              }}
            >
              <BrandIcon brand={e.brand} className="h-4 w-4" />
            </a>
          ))}
        </div>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
        >
          زيارة
          <ArrowUpLeft className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function Page() {
  const { state } = useContent();
  const visible = state.platforms.filter((p) => !p.hidden);
  return (
    <PageShell title="منصات شفاء" subtitle="اختر المنصة ليتم تحويلك إليها">
      <p className="mb-10 whitespace-pre-wrap text-lg leading-loose text-foreground">
        {state.publisherIntro}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.length === 0 && (
          <p className="text-muted-foreground">لم تُضف منصات بعد.</p>
        )}
        {visible.map((p) => (
          <PlatformCard key={p.id} p={p} />
        ))}
      </div>
    </PageShell>
  );
}
