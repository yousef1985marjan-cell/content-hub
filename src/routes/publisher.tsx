import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink, type ExtraLink } from "@/lib/content-store";
import { ExternalLink } from "lucide-react";
import { BrandIcon, detectBrand, BRAND_META, isGeneric, type BrandKey } from "@/lib/brand-icons";

export const Route = createFileRoute("/publisher")({
  head: () => ({ meta: [{ title: "منصات شفاء — تابع شفاء وحمّل التطبيق" }] }),
  component: Page,
});

const SOCIAL_BRANDS: BrandKey[] = [
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "whatsapp",
  "telegram",
  "twitter",
  "snapchat",
  "linkedin",
];

function resolveBrand(p: PlatformLink): BrandKey | null {
  if (p.brand && p.brand !== "auto") return p.brand as BrandKey;
  return detectBrand(p.url);
}

function SocialCircle({ p }: { p: PlatformLink }) {
  const brand = resolveBrand(p);
  const generic = brand ? isGeneric(brand) : false;
  // Generic icons: no background box, single-color line icon
  const boxed = !generic || !!p.accent || !!p.icon;
  const color = brand ? BRAND_META[brand].color : null;
  const isInstagram = brand === "instagram";
  const background = !boxed
    ? "transparent"
    : p.accent ||
      (isInstagram
        ? "radial-gradient(circle at 30% 110%, #FFD776 0%, #F58529 20%, #DD2A7B 45%, #8134AF 70%, #515BD4 100%)"
        : color
        ? `linear-gradient(135deg, ${color}, ${color})`
        : "var(--gradient-hero)");

  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={p.name}
      className="group flex flex-col items-center gap-2 focus:outline-none"
    >
      <div
        className={`relative grid h-16 w-16 place-items-center rounded-full transition-all duration-300 group-hover:-translate-y-1 group-focus-visible:ring-4 group-focus-visible:ring-primary/40 sm:h-[72px] sm:w-[72px] ${
          boxed ? "text-white shadow-md group-hover:shadow-lg" : "text-foreground group-hover:text-primary"
        }`}
        style={{ background }}
      >
        {p.icon ? (
          <img src={p.icon} alt="" className="h-full w-full rounded-full object-cover" />
        ) : brand ? (
          <BrandIcon brand={brand} className={boxed ? "h-8 w-8 drop-shadow-sm" : "h-10 w-10"} />
        ) : (
          <ExternalLink className="h-7 w-7" />
        )}
      </div>
      <div className="text-xs font-bold text-foreground sm:text-sm">{p.name}</div>
    </a>
  );
}

function StoreButton({
  href,
  brand,
  title,
  subtitle,
}: {
  href: string;
  brand: BrandKey;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} — ${subtitle}`}
      className="group flex flex-1 items-center gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
        style={{ background: BRAND_META[brand].color }}
      >
        <BrandIcon brand={brand} className="h-6 w-6" />
      </div>
      <div className="min-w-0 text-right">
        <div className="text-base font-black text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </a>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="mb-6 text-right text-2xl font-black text-primary">{title}</h2>
      {children}
    </section>
  );
}

function Page() {
  const { state } = useContent();
  const visible = state.platforms.filter((p) => !p.hidden);

  // Social platforms: brand is a known social brand
  const socials = visible.filter((p) => {
    const b = resolveBrand(p);
    return b && SOCIAL_BRANDS.includes(b);
  });

  // Aggregate app download links across all platforms
  const androidHref =
    visible.find((p) => p.androidUrl)?.androidUrl ||
    visible.find((p) => resolveBrand(p) === "android")?.url;
  const iosHref =
    visible.find((p) => p.iosUrl)?.iosUrl ||
    visible.find((p) => resolveBrand(p) === "apple")?.url;

  // Anything else (custom platforms not fitting the two cards)
  const others = visible.filter((p) => !socials.includes(p) && resolveBrand(p) !== "android" && resolveBrand(p) !== "apple");

  return (
    <PageShell title="منصات شفاء" subtitle="تابعنا على منصاتنا أو حمّل التطبيق">
      {state.publisherIntro && (
        <p className="mb-8 whitespace-pre-wrap text-center text-sm leading-loose text-muted-foreground md:text-base">
          {state.publisherIntro}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {socials.length > 0 && (
          <Card title="تابع شفاء">
            <div className="flex flex-wrap justify-center gap-5 sm:justify-start sm:gap-7">
              {socials.map((p) => (
                <SocialCircle key={p.id} p={p} />
              ))}
            </div>
          </Card>
        )}

        {(androidHref || iosHref) && (
          <Card title="حمّل التطبيق">
            <div className="flex flex-col gap-3 sm:flex-row">
              {androidHref && (
                <StoreButton
                  href={androidHref}
                  brand="android"
                  title="Google Play"
                  subtitle="لأجهزة أندرويد"
                />
              )}
              {iosHref && (
                <StoreButton
                  href={iosHref}
                  brand="apple"
                  title="App Store"
                  subtitle="لأجهزة آيفون"
                />
              )}
            </div>
          </Card>
        )}

        {others.length > 0 && (
          <Card title="روابط أخرى">
            <div className="flex flex-wrap justify-center gap-5 sm:justify-start sm:gap-7">
              {others.map((p) => (
                <SocialCircle key={p.id} p={p} />
              ))}
            </div>
          </Card>
        )}

        {visible
          .filter((p) => (p.extraLinks?.length ?? 0) > 0)
          .map((p) => (
            <ExtraLinksCard key={`extra-${p.id}`} platform={p} />
          ))}

        {visible.length === 0 && (
          <p className="text-center text-muted-foreground">لم تُضف منصات بعد.</p>
        )}
      </div>
    </PageShell>
  );
}

function autoThumb(url: string): string {
  if (!url || !/^https?:\/\//i.test(url)) return "";
  return `https://image.thum.io/get/width/600/crop/400/${url}`;
}

function ExtraLinkTile({ link }: { link: ExtraLink }) {
  const thumb = link.thumbnail || autoThumb(link.url);
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {thumb ? (
          <img
            src={thumb}
            alt={link.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ExternalLink className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0 text-right">
          <div className="truncate text-sm font-black text-foreground">{link.title}</div>
          <div className="truncate text-[11px] text-muted-foreground" dir="ltr">
            {link.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
    </a>
  );
}

function ExtraLinksCard({ platform }: { platform: PlatformLink }) {
  const brand = (platform.brand as BrandKey) || detectBrand(platform.url);
  return (
    <section
      className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-right text-2xl font-black text-primary">{platform.name}</h2>
        {brand && (
          <div
            className="grid h-10 w-10 place-items-center rounded-xl text-white"
            style={{ background: platform.accent || BRAND_META[brand].color }}
          >
            <BrandIcon brand={brand} className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(platform.extraLinks ?? []).map((l) => (
          <ExtraLinkTile key={l.id} link={l} />
        ))}
      </div>
    </section>
  );
}
