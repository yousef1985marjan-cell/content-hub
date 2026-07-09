import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink } from "@/lib/content-store";
import { ExternalLink, Sparkles } from "lucide-react";
import { BrandIcon, detectBrand, BRAND_META, type BrandKey } from "@/lib/brand-icons";

export const Route = createFileRoute("/publisher")({
  head: () => ({ meta: [{ title: "منصات شفاء — بيانات الناشر" }] }),
  component: Page,
});

function resolveBrand(p: PlatformLink): BrandKey | null {
  if (p.brand && p.brand !== "auto") return p.brand as BrandKey;
  return detectBrand(p.url);
}

function PlatformTile({ p }: { p: PlatformLink }) {
  const brand = resolveBrand(p);
  const brandColor = brand ? BRAND_META[brand].color : null;
  const bg =
    p.accent ||
    (brandColor
      ? `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`
      : "var(--gradient-hero)");

  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={p.name}
      className="group relative flex flex-col items-center gap-3 focus:outline-none"
    >
      <div
        className={`relative grid h-24 w-24 place-items-center overflow-hidden rounded-3xl text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-primary/40 sm:h-28 sm:w-28 ${
          p.featured ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
        }`}
        style={{ background: bg, boxShadow: "var(--shadow-card)" }}
      >
        {p.icon ? (
          <img src={p.icon} alt="" className="h-full w-full object-cover" />
        ) : brand ? (
          <BrandIcon brand={brand} className="h-12 w-12 drop-shadow" />
        ) : (
          <ExternalLink className="h-10 w-10" />
        )}

        {/* subtle shine */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {p.featured && (
          <span className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
        )}
        {p.badge && !p.featured && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground shadow">
            {p.badge}
          </span>
        )}
      </div>

      <div className="text-center">
        <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
          {p.name}
        </div>
        {p.description && (
          <div className="mt-0.5 line-clamp-1 max-w-[10rem] text-[11px] text-muted-foreground">
            {p.description}
          </div>
        )}
      </div>
    </a>
  );
}

function ExtraLinksRow({ platforms }: { platforms: PlatformLink[] }) {
  const extras: { key: string; url: string; brand: BrandKey; label: string }[] = [];
  platforms.forEach((p) => {
    if (p.webUrl) extras.push({ key: p.id + "-w", url: p.webUrl, brand: "web", label: `${p.name} — الويب` });
    if (p.androidUrl) extras.push({ key: p.id + "-a", url: p.androidUrl, brand: "android", label: `${p.name} — Android` });
    if (p.iosUrl) extras.push({ key: p.id + "-i", url: p.iosUrl, brand: "apple", label: `${p.name} — iOS` });
  });
  if (extras.length === 0) return null;
  return (
    <div className="mt-12 rounded-3xl border border-border/60 bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <h2 className="mb-4 text-lg font-black">روابط إضافية</h2>
      <div className="flex flex-wrap gap-2">
        {extras.map((e) => (
          <a
            key={e.key}
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={e.label}
            title={e.label}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-xs font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-md"
            onMouseEnter={(ev) => {
              (ev.currentTarget as HTMLElement).style.background = BRAND_META[e.brand].color;
            }}
            onMouseLeave={(ev) => {
              (ev.currentTarget as HTMLElement).style.background = "";
            }}
          >
            <BrandIcon brand={e.brand} className="h-4 w-4" />
            {e.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function Page() {
  const { state } = useContent();
  const visible = state.platforms.filter((p) => !p.hidden);
  return (
    <PageShell title="منصات شفاء" subtitle="اضغط على أي أيقونة للانتقال مباشرة إلى المنصة">
      {state.publisherIntro && (
        <p className="mb-10 whitespace-pre-wrap text-center text-base leading-loose text-muted-foreground md:text-lg">
          {state.publisherIntro}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-center text-muted-foreground">لم تُضف منصات بعد.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {visible.map((p) => (
            <PlatformTile key={p.id} p={p} />
          ))}
        </div>
      )}

      <ExtraLinksRow platforms={visible} />
    </PageShell>
  );
}
