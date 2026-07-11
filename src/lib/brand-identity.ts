import { useCallback, useEffect, useState } from "react";

/* ============================================================
 * Brand Identity — theme mode, colors, icons, fonts
 * Stored client-side (localStorage). Draft is applied only in
 * the admin preview; Published is applied globally to the site.
 * ============================================================ */

export const THEME_MODE_KEY = "shifa-theme-mode-v1"; // "light" | "dark" | "auto"
export const BRAND_DRAFT_KEY = "shifa-brand-identity-draft-v1";
export const BRAND_PUBLISHED_KEY = "shifa-brand-identity-published-v1";
export const BRAND_UPDATED_EVENT = "shifa:brand-identity-updated";

export type ThemeMode = "light" | "dark" | "auto";

/* -------- color tokens -------- */

export const COLOR_TOKENS = [
  { key: "background", label: "خلفية الموقع", cssVar: "--background" },
  { key: "foreground", label: "لون النصوص", cssVar: "--foreground" },
  { key: "card", label: "خلفية البطاقات", cssVar: "--card" },
  { key: "cardForeground", label: "نص البطاقات", cssVar: "--card-foreground" },
  { key: "primary", label: "اللون الأساسي", cssVar: "--primary" },
  { key: "primaryForeground", label: "نص الأزرار الأساسية", cssVar: "--primary-foreground" },
  { key: "secondary", label: "اللون الثانوي", cssVar: "--secondary" },
  { key: "secondaryForeground", label: "نص الثانوي", cssVar: "--secondary-foreground" },
  { key: "muted", label: "خلفية الحقول الصامتة", cssVar: "--muted" },
  { key: "mutedForeground", label: "نصوص ثانوية", cssVar: "--muted-foreground" },
  { key: "accent", label: "لون التمييز (ذهبي)", cssVar: "--accent" },
  { key: "accentForeground", label: "نص التمييز", cssVar: "--accent-foreground" },
  { key: "border", label: "لون الحدود", cssVar: "--border" },
  { key: "input", label: "لون الحقول", cssVar: "--input" },
  { key: "ring", label: "لون التركيز", cssVar: "--ring" },
  { key: "destructive", label: "لون الخطأ", cssVar: "--destructive" },
  { key: "success", label: "لون النجاح", cssVar: "--success" },
  { key: "warning", label: "لون التحذير", cssVar: "--warning" },
  { key: "link", label: "لون الروابط", cssVar: "--link" },
  { key: "shadowColor", label: "لون الظلال", cssVar: "--shadow-color" },
] as const;

export type ColorTokenKey = (typeof COLOR_TOKENS)[number]["key"];
export type ColorMap = Partial<Record<ColorTokenKey, string>>;

/* -------- fonts -------- */

export type FontFile = {
  id: string;
  name: string; // family name
  format: "woff2" | "woff" | "ttf" | "otf";
  dataUrl: string;
  weight?: number;
};

export type FontSettings = {
  files: FontFile[];
  arabic?: string; // family name
  latin?: string;
  headings?: string;
  body?: string;
  buttons?: string;
  weight?: number;
  size?: number; // base px
  lineHeight?: number;
  letterSpacing?: number; // em
};

/* -------- icons -------- */

export type IconOverride = {
  brand: string;
  color?: string; // light theme override
  colorDark?: string;
  size?: number;
  strokeWidth?: number;
  background?: string;
  customDataUrl?: string; // uploaded replacement
};

export type IconSettings = {
  overrides: Record<string, IconOverride>;
};

/* -------- root type -------- */

export type BrandIdentity = {
  light: ColorMap;
  dark: ColorMap;
  fonts: FontSettings;
  icons: IconSettings;
};

export const DEFAULT_BRAND: BrandIdentity = {
  light: {},
  dark: {},
  fonts: { files: [] },
  icons: { overrides: {} },
};

/* -------- storage helpers -------- */

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function readDraft(): BrandIdentity {
  if (typeof window === "undefined") return DEFAULT_BRAND;
  return safeParse(window.localStorage.getItem(BRAND_DRAFT_KEY), DEFAULT_BRAND);
}

export function readPublished(): BrandIdentity {
  if (typeof window === "undefined") return DEFAULT_BRAND;
  return safeParse(window.localStorage.getItem(BRAND_PUBLISHED_KEY), DEFAULT_BRAND);
}

export function writeDraft(v: BrandIdentity) {
  window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(v));
  window.dispatchEvent(new Event(BRAND_UPDATED_EVENT));
}

export function writePublished(v: BrandIdentity) {
  window.localStorage.setItem(BRAND_PUBLISHED_KEY, JSON.stringify(v));
  window.dispatchEvent(new Event(BRAND_UPDATED_EVENT));
  applyPublished();
}

/* -------- theme mode -------- */

export function readThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const raw = window.localStorage.getItem(THEME_MODE_KEY);
  if (raw === "light" || raw === "dark" || raw === "auto") return raw;
  return "light";
}

export function writeThemeMode(mode: ThemeMode) {
  window.localStorage.setItem(THEME_MODE_KEY, mode);
  applyThemeMode();
  window.dispatchEvent(new Event(BRAND_UPDATED_EVENT));
}

export function applyThemeMode() {
  if (typeof document === "undefined") return;
  const mode = readThemeMode();
  const html = document.documentElement;
  const isDark =
    mode === "dark" ||
    (mode === "auto" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  html.classList.toggle("dark", isDark);
}

/* -------- css generation -------- */

const STYLE_ID = "brand-identity-runtime";
const FONT_STYLE_ID = "brand-identity-fonts";

function colorRule(map: ColorMap): string {
  const lines: string[] = [];
  for (const t of COLOR_TOKENS) {
    const v = map[t.key];
    if (v && v.trim()) lines.push(`  ${t.cssVar}: ${v};`);
    if (t.key === "primary" && v) {
      lines.push(`  --color-primary: ${v};`);
    }
  }
  return lines.join("\n");
}

function fontRule(f: FontSettings): string {
  const lines: string[] = [];
  const family = (name?: string) => (name ? `"${name}"` : null);
  if (f.arabic || f.body) {
    const stack = [family(f.arabic), family(f.body), "Tajawal", "system-ui", "sans-serif"]
      .filter(Boolean)
      .join(", ");
    lines.push(`  --font-sans: ${stack};`);
  }
  if (f.headings) lines.push(`  --font-heading: "${f.headings}", var(--font-sans);`);
  if (f.buttons) lines.push(`  --font-button: "${f.buttons}", var(--font-sans);`);
  if (f.size) lines.push(`  font-size: ${f.size}px;`);
  if (f.lineHeight) lines.push(`  line-height: ${f.lineHeight};`);
  if (f.letterSpacing != null) lines.push(`  letter-spacing: ${f.letterSpacing}em;`);
  if (f.weight) lines.push(`  font-weight: ${f.weight};`);
  return lines.join("\n");
}

function fontFaces(files: FontFile[]): string {
  return files
    .map(
      (f) => `@font-face {
  font-family: "${f.name}";
  src: url("${f.dataUrl}") format("${f.format === "ttf" ? "truetype" : f.format === "otf" ? "opentype" : f.format}");
  font-display: swap;
  ${f.weight ? `font-weight: ${f.weight};` : ""}
}`,
    )
    .join("\n");
}

export function applyPublished() {
  if (typeof document === "undefined") return;
  const b = readPublished();

  // fonts first (needs to be present before rules reference the family)
  let fontStyle = document.getElementById(FONT_STYLE_ID) as HTMLStyleElement | null;
  if (!fontStyle) {
    fontStyle = document.createElement("style");
    fontStyle.id = FONT_STYLE_ID;
    document.head.appendChild(fontStyle);
  }
  fontStyle.textContent = fontFaces(b.fonts.files);

  const light = colorRule(b.light);
  const dark = colorRule(b.dark);
  const font = fontRule(b.fonts);

  const css = `
:root {
${light}
}
.dark {
${dark}
}
html, body, #root {
${font}
}
`.trim();

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
  applyThemeMode();
}

/* -------- preview (draft) apply — scoped to admin only -------- */

const PREVIEW_STYLE_ID = "brand-identity-preview";

export function applyPreview(b: BrandIdentity) {
  if (typeof document === "undefined") return;
  const scope = "[data-brand-preview-root]";
  const css = `
${scope} {
${colorRule(b.light)}
${fontRule(b.fonts)}
}
${scope}.dark, .dark ${scope} {
${colorRule(b.dark)}
}
`.trim();
  let style = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = PREVIEW_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
}

export function clearPreview() {
  const style = document.getElementById(PREVIEW_STYLE_ID);
  if (style) style.remove();
}

/* -------- hook -------- */

export function useBrandIdentity() {
  const [draft, setDraft] = useState<BrandIdentity>(DEFAULT_BRAND);
  const [published, setPublishedState] = useState<BrandIdentity>(DEFAULT_BRAND);
  const [mode, setMode] = useState<ThemeMode>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(readDraft());
    setPublishedState(readPublished());
    setMode(readThemeMode());
    setHydrated(true);
    const refresh = () => {
      setDraft(readDraft());
      setPublishedState(readPublished());
      setMode(readThemeMode());
    };
    window.addEventListener(BRAND_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(BRAND_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const saveDraft = useCallback((next: BrandIdentity) => {
    writeDraft(next);
    setDraft(next);
  }, []);

  const publish = useCallback((next: BrandIdentity) => {
    writeDraft(next);
    writePublished(next);
    setDraft(next);
    setPublishedState(next);
  }, []);

  const setThemeMode = useCallback((m: ThemeMode) => {
    writeThemeMode(m);
    setMode(m);
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(BRAND_DRAFT_KEY);
    window.localStorage.removeItem(BRAND_PUBLISHED_KEY);
    setDraft(DEFAULT_BRAND);
    setPublishedState(DEFAULT_BRAND);
    applyPublished();
    window.dispatchEvent(new Event(BRAND_UPDATED_EVENT));
  }, []);

  return { draft, published, mode, hydrated, saveDraft, publish, setThemeMode, reset };
}
