import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { useContent } from "@/lib/content-store";
import { usePublisherManager, type PubItem, type PubGroupKey } from "@/lib/publisher-manager";
import { BrandIcon, detectBrand, BRAND_META, type BrandKey } from "@/lib/brand-icons";
import { ExternalLink, Download, Play, ArrowLeft, Smartphone, Apple, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/publisher")({
  head: () => ({
    meta: [
      { title: "منصات شفاء — تابع شفاء، حمّل التطبيق، اكتشف المزيد" },
      { name: "description", content: "تابع منصات شفاء على وسائل التواصل، حمّل تطبيق شفاء، وشاهد فيديوهات وتطبيقات مختارة." },
    ],
  }),
  component: Page,
});

/* ---------------- helpers ---------------- */

function pickText(t?: Partial<Record<string, string>>): string {
  if (!t) return "";
  return (t.ar || t.en || Object.values(t).find((v) => v && v.trim()) || "").trim();
}

function itemName(i: PubItem) {
  return pickText(i.name);
}
function itemDesc(i: PubItem) {
  return pickText(i.description);
}

function resolveBrand(i: PubItem): BrandKey | null {
  if (i.brand) return i.brand;
  return detectBrand(i.url);
}

function ytId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{6,})/);
  return m ? m[1] : null;
}

function autoThumb(i: PubItem): string {
  if (i.thumbnailDataUrl) return i.thumbnailDataUrl;
  if (i.imageDataUrl) return i.imageDataUrl;
  const yt = ytId(i.url);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  if (i.url && /^https?:\/\//i.test(i.url)) {
    return `https://image.thum.io/get/width/600/crop/400/${i.url}`;
  }
  return "";
}

function platformLabel(i: PubItem): string {
  const b = resolveBrand(i);
  if (!b) return "";
  const meta = BRAND_META[b];
  return meta?.label ?? "";
}

/* ---------------- primitives ---------------- */

function SectionCard({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-3xl border border-border/60 bg-card p-4 sm:p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-primary sm:text-2xl">{title}</h2>
          <div className="mt-1.5 h-1 w-10 rounded-full bg-accent" />
        </div>
        {typeof count === "number" && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function ShowMore({ shown, total, onClick }: { shown: number; total: number; onClick: () => void }) {
  if (shown >= total) return null;
  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-bold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/10"
      >
        <ChevronDown className="h-4 w-4" />
        عرض المزيد ({total - shown})
      </button>
    </div>
  );
}

/* ---------------- social ---------------- */

function SocialTile({ item }: { item: PubItem }) {
  const brand = resolveBrand(item);
  const color = brand ? BRAND_META[brand]?.color : null;
  const isInstagram = brand === "instagram";
  const bg =
    item.iconBg ||
    (isInstagram
      ? "radial-gradient(circle at 30% 110%, #FFD776 0%, #F58529 20%, #DD2A7B 45%, #8134AF 70%, #515BD4 100%)"
      : color
      ? `linear-gradient(135deg, ${color}, ${color})`
      : "var(--header)");
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={itemName(item)}
      className="group flex flex-col items-center gap-2 focus:outline-none"
    >
      <div
        className="relative grid h-14 w-14 place-items-center rounded-2xl text-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-focus-visible:ring-4 group-focus-visible:ring-primary/40 sm:h-16 sm:w-16"
        style={{ background: bg }}
      >
        {item.imageDataUrl ? (
          <img src={item.imageDataUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
        ) : brand ? (
          <BrandIcon brand={brand} className="h-7 w-7 drop-shadow-sm sm:h-8 sm:w-8" />
        ) : (
          <ExternalLink className="h-6 w-6" />
        )}
      </div>
      <div className="line-clamp-1 text-center text-xs font-bold text-foreground sm:text-sm">
        {itemName(item)}
      </div>
    </a>
  );
}

/* ---------------- download store ---------------- */

function StoreCard({ item }: { item: PubItem }) {
  const brand = resolveBrand(item);
  const name = itemName(item) || (brand ? BRAND_META[brand].label : "تحميل");
  const desc = itemDesc(item) || (brand === "apple" ? "لأجهزة آيفون" : brand === "android" ? "لأجهزة أندرويد" : "متجر التطبيقات");
  const color = brand ? BRAND_META[brand]?.color : "var(--primary)";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      <div
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white"
        style={{ background: item.iconBg || color as string }}
      >
        {item.imageDataUrl ? (
          <img src={item.imageDataUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
        ) : brand ? (
          <BrandIcon brand={brand} className="h-7 w-7" />
        ) : brand === "apple" ? (
          <Apple className="h-7 w-7" />
        ) : (
          <Smartphone className="h-7 w-7" />
        )}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <div className="truncate text-base font-black text-foreground">{name}</div>
        <div className="line-clamp-1 text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:-translate-x-0.5">
        <Download className="h-4 w-4" />
      </div>
    </a>
  );
}

/* ---------------- video card ---------------- */

function VideoCard({ item }: { item: PubItem }) {
  const thumb = autoThumb(item);
  const yt = ytId(item.url);
  const brand = resolveBrand(item);
  const platform = platformLabel(item);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {thumb ? (
          <img
            src={thumb}
            alt={itemName(item)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Play className="h-8 w-8" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 via-transparent">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
        {platform && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
            {brand && <BrandIcon brand={brand} className="h-3 w-3" />}
            {platform}
          </div>
        )}
      </div>
      <div className="flex items-start gap-3 p-3">
        <div className="min-w-0 flex-1 text-right">
          <div className="line-clamp-2 text-sm font-black text-foreground">{itemName(item)}</div>
          {itemDesc(item) && (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
              {itemDesc(item)}
            </p>
          )}
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowLeft className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}

/* ---------------- app card ---------------- */

function AppCard({ item }: { item: PubItem }) {
  const brand = resolveBrand(item);
  const logo = item.imageDataUrl || item.thumbnailDataUrl;
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl text-white"
          style={{ background: item.iconBg || (brand ? BRAND_META[brand]?.color : "var(--header)") }}
        >
          {logo ? (
            <img src={logo} alt="" className="h-full w-full object-cover" />
          ) : brand ? (
            <BrandIcon brand={brand} className="h-7 w-7" />
          ) : (
            <Smartphone className="h-7 w-7" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="line-clamp-1 text-base font-black text-foreground">{itemName(item)}</div>
          {itemDesc(item) && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {itemDesc(item)}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          <Download className="h-3.5 w-3.5" />
          تحميل
        </a>
      </div>
    </div>
  );
}

/* ---------------- discover more ---------------- */

function DiscoverTile({ item }: { item: PubItem }) {
  const img = item.imageDataUrl || item.thumbnailDataUrl;
  const brand = resolveBrand(item);
  return (
    <a
      href={item.url || "#"}
      target={item.url ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div
        className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl text-white"
        style={{ background: item.iconBg || (brand ? BRAND_META[brand]?.color : "var(--header)") }}
      >
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : brand ? (
          <BrandIcon brand={brand} className="h-6 w-6" />
        ) : (
          <ExternalLink className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <div className="line-clamp-1 text-sm font-black text-foreground">{itemName(item)}</div>
        {itemDesc(item) && (
          <p className="line-clamp-1 text-[11px] text-muted-foreground">{itemDesc(item)}</p>
        )}
      </div>
    </a>
  );
}

/* ---------------- page ---------------- */

const LIMITS: Record<PubGroupKey, number> = {
  social: 12,
  download: 6,
  videos: 6,
  apps: 6,
  media: 8,
};

function useVisibleItems(key: PubGroupKey, state: ReturnType<typeof usePublisherManager>["state"]) {
  return useMemo(() => {
    const g = state[key];
    if (!g || !g.active) return [];
    return g.items.filter((i) => i.published && !i.hidden);
  }, [state, key]);
}

function Page() {
  const { state: pubState, hydrated } = usePublisherManager();
  const { state: contentState } = useContent();

  const social = useVisibleItems("social", pubState);
  const download = useVisibleItems("download", pubState);
  const videos = useVisibleItems("videos", pubState);
  const apps = useVisibleItems("apps", pubState);
  const media = useVisibleItems("media", pubState);

  // Fallback: use legacy content-store social platforms if publisher manager empty
  const legacySocial = useMemo(() => {
    if (social.length > 0) return [];
    return (contentState.platforms || [])
      .filter((p) => !p.hidden)
      .map<PubItem>((p) => ({
        id: p.id,
        name: { ar: p.name },
        description: { ar: p.description || "" },
        url: p.url,
        brand: (p.brand as BrandKey) || undefined,
        imageDataUrl: p.icon || "",
        thumbnailDataUrl: p.cover || "",
        iconColor: "",
        iconSize: 48,
        iconBg: p.accent || "",
        published: true,
        hidden: false,
        createdAt: 0,
      }));
  }, [social.length, contentState.platforms]);

  const socialFinal = social.length > 0 ? social : legacySocial;

  const [showSocial, setShowSocial] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  const socialShown = showSocial ? socialFinal.length : Math.min(socialFinal.length, LIMITS.social);
  const videosShown = showVideos ? videos.length : Math.min(videos.length, LIMITS.videos);
  const appsShown = showApps ? apps.length : Math.min(apps.length, LIMITS.apps);
  const mediaShown = showMedia ? media.length : Math.min(media.length, LIMITS.media);

  const anything =
    socialFinal.length + download.length + videos.length + apps.length + media.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />
      <main className="flex-1">
        {/* Compact header */}
        <section className="border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
              <div>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">منصات شفاء</h1>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  تابع شفاء، حمّل التطبيق، واكتشف محتوى وتطبيقات قد تهمك
                </p>
              </div>
            </div>
            {contentState.publisherIntro && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {contentState.publisherIntro}
              </p>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-6 space-y-5 sm:space-y-6">
          {/* تابع شفاء */}
          {socialFinal.length > 0 && (
            <SectionCard title="تابع شفاء" count={socialFinal.length}>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {socialFinal.slice(0, socialShown).map((i) => (
                  <SocialTile key={i.id} item={i} />
                ))}
              </div>
              <ShowMore
                shown={socialShown}
                total={socialFinal.length}
                onClick={() => setShowSocial(true)}
              />
            </SectionCard>
          )}

          {/* حمّل تطبيق شفاء */}
          {download.length > 0 && (
            <SectionCard title="حمّل تطبيق شفاء" count={download.length}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {download.map((i) => (
                  <StoreCard key={i.id} item={i} />
                ))}
              </div>
            </SectionCard>
          )}

          {/* فيديوهات */}
          {videos.length > 0 && (
            <SectionCard title="فيديوهات قد تعجبك" count={videos.length}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.slice(0, videosShown).map((i) => (
                  <VideoCard key={i.id} item={i} />
                ))}
              </div>
              <ShowMore shown={videosShown} total={videos.length} onClick={() => setShowVideos(true)} />
            </SectionCard>
          )}

          {/* تطبيقات */}
          {apps.length > 0 && (
            <SectionCard title="تطبيقات قد تعجبك" count={apps.length}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {apps.slice(0, appsShown).map((i) => (
                  <AppCard key={i.id} item={i} />
                ))}
              </div>
              <ShowMore shown={appsShown} total={apps.length} onClick={() => setShowApps(true)} />
            </SectionCard>
          )}

          {/* اكتشف المزيد */}
          {media.length > 0 && (
            <SectionCard title="اكتشف المزيد" count={media.length}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {media.slice(0, mediaShown).map((i) => (
                  <DiscoverTile key={i.id} item={i} />
                ))}
              </div>
              <ShowMore shown={mediaShown} total={media.length} onClick={() => setShowMedia(true)} />
            </SectionCard>
          )}

          {hydrated && !anything && (
            <div className="rounded-3xl border border-dashed border-border py-16 text-center text-muted-foreground">
              لم تُضف عناصر بعد. أضِف منصاتك من لوحة التحكم لتظهر هنا.
            </div>
          )}
        </div>
      </main>
      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} منصات شفاء — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
