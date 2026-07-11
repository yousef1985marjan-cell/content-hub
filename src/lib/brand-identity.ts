import { useCallback, useEffect, useState } from "react";

/* ============================================================
 * Brand Identity — theme mode, colors, icons, fonts
 * ============================================================ */

export const THEME_MODE_KEY = "shifa-theme-mode-v1";
export const BRAND_DRAFT_KEY = "shifa-brand-identity-draft-v1";
export const BRAND_PUBLISHED_KEY = "shifa-brand-identity-published-v1";
export const BRAND_UPDATED_EVENT = "shifa:brand-identity-updated";

export type ThemeMode = "light" | "dark" | "auto";

/* -------- color tokens (extended) -------- */

export const COLOR_TOKENS = [
  { key: "background", label: "خلفية الصفحة", cssVar: "--background" },
  { key: "dashboardBg", label: "خلفية لوحة التحكم", cssVar: "--dashboard-bg" },
  { key: "card", label: "خلفية البطاقات", cssVar: "--card" },
  { key: "input", label: "خلفية الحقول", cssVar: "--input" },
  { key: "header", label: "لون الهيدر", cssVar: "--header" },
  { key: "primary", label: "الأخضر الأساسي", cssVar: "--primary" },
  { key: "primaryDark", label: "الأخضر الداكن", cssVar: "--primary-dark" },
  { key: "secondary", label: "اللون الثانوي", cssVar: "--secondary" },
  { key: "primaryForeground", label: "نص الزر الأساسي", cssVar: "--primary-foreground" },
  { key: "secondaryForeground", label: "نص الأزرار الثانوية", cssVar: "--secondary-foreground" },
  { key: "foreground", label: "لون النص الأساسي", cssVar: "--foreground" },
  { key: "mutedForeground", label: "لون النص الثانوي", cssVar: "--muted-foreground" },
  { key: "heading", label: "لون العناوين", cssVar: "--ring" },
  { key: "icon", label: "لون الأيقونات", cssVar: "--accent-foreground" },
  { key: "border", label: "لون الحدود", cssVar: "--border" },
  { key: "link", label: "لون الروابط", cssVar: "--link" },
  { key: "gold", label: "اللون الذهبي", cssVar: "--gold" },
  { key: "accent", label: "لون التمييز", cssVar: "--accent" },
  { key: "infoCard", label: "خلفية بطاقة المعلومات", cssVar: "--info-card" },
  { key: "infoIconBg", label: "خلفية أيقونة المعلومات", cssVar: "--info-icon-bg" },
  { key: "success", label: "لون النجاح", cssVar: "--success" },
  { key: "warning", label: "لون التحذير", cssVar: "--warning" },
  { key: "destructive", label: "لون الخطأ", cssVar: "--destructive" },
  { key: "muted", label: "خلفية الحقول الصامتة", cssVar: "--muted" },
  { key: "ring", label: "لون التركيز", cssVar: "--ring" },
  { key: "shadowColor", label: "لون الظلال", cssVar: "--shadow-color" },
] as const;

export type ColorTokenKey = (typeof COLOR_TOKENS)[number]["key"];
export type ColorMap = Partial<Record<ColorTokenKey, string>>;

export const DEFAULT_LIGHT: ColorMap = {
  background: "#F2F4F3",
  dashboardBg: "#F7F9F8",
  card: "#FFFFFF",
  input: "#FFFFFF",
  header: "#064C32",
  primary: "#0C4B34",
  primaryDark: "#063C2B",
  secondary: "#E8F1EE",
  primaryForeground: "#FFFFFF",
  secondaryForeground: "#24332F",
  foreground: "#24332F",
  mutedForeground: "#697773",
  heading: "#0C4B34",
  icon: "#0C4B34",
  border: "#D9E0DD",
  link: "#0C4B34",
  gold: "#D6B672",
  accent: "#D6B672",
  infoCard: "#F7FBFC",
  infoIconBg: "#E8F1EE",
  success: "#2F8F5B",
  warning: "#D6B672",
  destructive: "#C94B4B",
  muted: "#E8F1EE",
  ring: "#0C4B34",
  shadowColor: "#0000001A",
};

export const DEFAULT_DARK: ColorMap = {
  background: "#061A16",
  dashboardBg: "#071F1A",
  card: "#0A2421",
  input: "#073028",
  header: "#064C32",
  primary: "#CFB675",
  primaryDark: "#052A20",
  secondary: "#11342D",
  primaryForeground: "#123A2D",
  secondaryForeground: "#F1F4F2",
  foreground: "#F1F4F2",
  mutedForeground: "#B6C1BD",
  heading: "#FFFFFF",
  icon: "#D6B672",
  border: "#17483D",
  link: "#D6B672",
  gold: "#D6B672",
  accent: "#D6B672",
  infoCard: "#122725",
  infoIconBg: "#183C34",
  success: "#56B88A",
  warning: "#D6B672",
  destructive: "#E06A6A",
  muted: "#0D2B26",
  ring: "#D6B672",
  shadowColor: "#00000040",
};

/* -------- fonts -------- */

export type FontFile = {
  id: string;
  name: string;
  format: "woff2" | "woff" | "ttf" | "otf";
  dataUrl: string;
  weight?: number;
};

export type FontSettings = {
  files: FontFile[];
  arabic?: string;
  latin?: string;
  headings?: string;
  body?: string;
  buttons?: string;
  weight?: number;
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
};

/* -------- icons -------- */

export type IconBgShape = "circle" | "square" | "rounded";
export type IconScope = "local" | "global";

export type IconOverride = {
  iconId: string; // registry id OR brand key
  lucideName?: string; // if replaced from library
  customDataUrl?: string; // uploaded replacement
  isMonochrome?: boolean; // for SVG uploads
  color?: string; // day
  colorDark?: string;
  size?: number;
  strokeWidth?: number;
  background?: string;
  backgroundDark?: string;
  bgSize?: number;
  bgShape?: IconBgShape;
  radius?: number;
  padding?: number;
  scope?: IconScope;
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
  light: DEFAULT_LIGHT,
  dark: DEFAULT_DARK,
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

/* -------- preview (draft) -------- */

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
    writeDraft(DEFAULT_BRAND);
    writePublished(DEFAULT_BRAND);
    setDraft(DEFAULT_BRAND);
    setPublishedState(DEFAULT_BRAND);
  }, []);

  const resetLight = useCallback((current: BrandIdentity) => {
    const next = { ...current, light: DEFAULT_LIGHT };
    writeDraft(next);
    setDraft(next);
    return next;
  }, []);

  const resetDark = useCallback((current: BrandIdentity) => {
    const next = { ...current, dark: DEFAULT_DARK };
    writeDraft(next);
    setDraft(next);
    return next;
  }, []);

  return {
    draft,
    published,
    mode,
    hydrated,
    saveDraft,
    publish,
    setThemeMode,
    reset,
    resetLight,
    resetDark,
  };
}
