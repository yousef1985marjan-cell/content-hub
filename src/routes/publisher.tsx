import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink } from "@/lib/content-store";
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

        {visible.length === 0 && (
          <p className="text-center text-muted-foreground">لم تُضف منصات بعد.</p>
        )}
      </div>
    </PageShell>
  );
}
