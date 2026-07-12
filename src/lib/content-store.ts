import { useEffect, useState, useCallback } from "react";
import { getLocalDocumentValue, setLocalDocumentValue } from "./local-documents.functions";

export type ExtraLink = {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  icon?: string;
  description?: string;
  youtubeUrl?: string;
};

export type PlatformLink = {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  cover?: string;
  brand?: string;
  androidUrl?: string;
  iosUrl?: string;
  webUrl?: string;
  hidden?: boolean;
  featured?: boolean;
  badge?: string;
  accent?: string;
  extraLinks?: ExtraLink[];
};

export type CustomIcon = {
  id: string;
  name: string;
  dataUrl: string;
};

export const LANGS = ["ar", "de", "en", "tr", "uk", "fr", "ce"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  ar: "العربية",
  de: "الألمانية",
  en: "الإنجليزية",
  tr: "التركية",
  uk: "الأوكرانية",
  fr: "الفرنسية",
  ce: "الشيشانية",
};

export const LANG_NAME_EN: Record<Lang, string> = {
  ar: "Arabic",
  de: "German",
  en: "English",
  tr: "Turkish",
  uk: "Ukrainian",
  fr: "French",
  ce: "Chechen",
};

export type SectionLink = { id: string; title: string; url: string };

export type SectionContent = {
  title: string;
  content: string;
  links: SectionLink[];
};

export const SECTION_KEYS = [
  "about",
  "publisher",
  "privacy",
  "terms",
  "disclaimer",
  "publisherInfo",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  about: "من نحن",
  publisher: "منصات شفاء",
  privacy: "سياسة الخصوصية",
  terms: "الشروط والأحكام",
  disclaimer: "إخلاء المسؤولية",
  publisherInfo: "بيانات الناشر",
};

export type SectionI18n = Record<Lang, SectionContent>;

export type ContentState = {
  // legacy fields (kept so nothing outside admin needs rewriting)
  about: string;
  privacy: string;
  terms: string;
  disclaimer: string;
  publisherIntro: string;
  platforms: PlatformLink[];
  customIcons: CustomIcon[];
  // new multilingual content
  sections: Record<SectionKey, SectionI18n>;
  logoUrl: string;
};

const STORAGE_KEY = "shifa-content-v2";

const emptySection = (): SectionContent => ({ title: "", content: "", links: [] });
const emptyI18n = (): SectionI18n =>
  LANGS.reduce((acc, l) => {
    acc[l] = emptySection();
    return acc;
  }, {} as SectionI18n);

const defaultSections = (about: string, privacy: string, terms: string, disclaimer: string, publisherIntro: string): Record<SectionKey, SectionI18n> => {
  const base: Record<SectionKey, SectionI18n> = {
    about: emptyI18n(),
    publisher: emptyI18n(),
    privacy: emptyI18n(),
    terms: emptyI18n(),
    disclaimer: emptyI18n(),
    publisherInfo: emptyI18n(),
  };
  base.about.ar = { title: "من نحن", content: about, links: [] };
  base.privacy.ar = { title: "سياسة الخصوصية", content: privacy, links: [] };
  base.terms.ar = { title: "الشروط والأحكام", content: terms, links: [] };
  base.disclaimer.ar = { title: "إخلاء المسؤولية", content: disclaimer, links: [] };
  base.publisher.ar = { title: "منصات شفاء", content: "", links: [] };
  base.publisherInfo.ar = { title: "بيانات الناشر", content: publisherIntro, links: [] };
  return base;
};

const DEFAULT_ABOUT = "نحن منصات شفاء، نسعى لتقديم محتوى موثوق ومفيد لخدمة مستخدمينا. رسالتنا هي توفير معلومات دقيقة وتجربة سلسة عبر جميع منصاتنا.";
const DEFAULT_PRIVACY = "نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لا نقوم بجمع أي بيانات دون إذنك الصريح، ولا نشاركها مع أطراف ثالثة إلا وفق ما يقتضيه القانون.";
const DEFAULT_TERMS = "باستخدامك لخدماتنا فإنك توافق على الالتزام بالشروط والأحكام المعمول بها. يحق لنا تعديل هذه الشروط في أي وقت مع إشعار المستخدمين بذلك.";
const DEFAULT_DISCLAIMER = "المحتوى المقدم في هذه المنصة لأغراض معلوماتية فقط، ولا يُعد بديلاً عن الاستشارة المتخصصة. لا نتحمل أي مسؤولية عن نتائج استخدام المعلومات.";

const DEFAULTS: ContentState = {
  about: DEFAULT_ABOUT,
  privacy: DEFAULT_PRIVACY,
  terms: DEFAULT_TERMS,
  disclaimer: DEFAULT_DISCLAIMER,
  publisherIntro: "",
  customIcons: [],
  logoUrl: "",
  sections: defaultSections(DEFAULT_ABOUT, DEFAULT_PRIVACY, DEFAULT_TERMS, DEFAULT_DISCLAIMER, ""),
  platforms: [
    { id: "tg", name: "تلغرام", url: "https://t.me/", brand: "telegram" },
    { id: "wa", name: "واتساب", url: "https://wa.me/", brand: "whatsapp" },
    { id: "yt", name: "يوتيوب", url: "https://youtube.com/", brand: "youtube" },
    { id: "tt", name: "تيك توك", url: "https://tiktok.com/", brand: "tiktok" },
    { id: "ig", name: "إنستغرام", url: "https://instagram.com/", brand: "instagram" },
    { id: "fb", name: "فيسبوك", url: "https://facebook.com/", brand: "facebook" },
    { id: "android", name: "Google Play", url: "https://play.google.com/", brand: "android", androidUrl: "https://play.google.com/" },
    { id: "ios", name: "App Store", url: "https://apps.apple.com/", brand: "apple", iosUrl: "https://apps.apple.com/" },
  ],
};

function normalize(raw: unknown): ContentState {
  const parsed = (raw && typeof raw === "object") ? (raw as Partial<ContentState>) : {};
  const merged: ContentState = { ...DEFAULTS, ...parsed } as ContentState;
  // ensure sections shape
  const sections: Record<SectionKey, SectionI18n> = {} as Record<SectionKey, SectionI18n>;
  for (const k of SECTION_KEYS) {
    const src = (parsed.sections && (parsed.sections as Record<string, SectionI18n>)[k]) || {} as Partial<SectionI18n>;
    const i18n = emptyI18n();
    for (const lang of LANGS) {
      const s = (src as Record<string, Partial<SectionContent>>)[lang];
      if (s) {
        i18n[lang] = {
          title: typeof s.title === "string" ? s.title : "",
          content: typeof s.content === "string" ? s.content : "",
          links: Array.isArray(s.links) ? s.links.map((l) => ({ id: l.id || crypto.randomUUID(), title: l.title || "", url: l.url || "" })) : [],
        };
      }
    }
    sections[k] = i18n;
  }
  // migrate legacy fields to ar if empty
  const legacyMap: Record<SectionKey, string> = {
    about: merged.about,
    privacy: merged.privacy,
    terms: merged.terms,
    disclaimer: merged.disclaimer,
    publisherInfo: merged.publisherIntro,
    publisher: "",
  };
  for (const k of SECTION_KEYS) {
    if (!sections[k].ar.content && legacyMap[k]) {
      sections[k].ar = { title: SECTION_LABELS[k], content: legacyMap[k], links: sections[k].ar.links };
    }
    if (!sections[k].ar.title) sections[k].ar.title = SECTION_LABELS[k];
  }
  merged.sections = sections;
  merged.logoUrl = typeof parsed.logoUrl === "string" ? parsed.logoUrl : "";
  return merged;
}

function readCache(): ContentState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return normalize(JSON.parse(raw));
  } catch {
    return DEFAULTS;
  }
}

const listeners = new Set<() => void>();

export function useContent() {
  const [state, setState] = useState<ContentState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const cached = readCache();
    setState(cached);
    setHydrated(true);
    void getLocalDocumentValue({ data: { key: "content" } })
      .then((result) => {
        if (!active) return;
        if (!result.found) {
          void setLocalDocumentValue({ data: { key: "content", value: cached } }).catch(() => undefined);
          return;
        }
        const next = normalize(result.value);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setState(next);
        listeners.forEach((listener) => listener());
      })
      .catch(() => undefined);
    const l = () => setState(readCache());
    listeners.add(l);
    return () => {
      active = false;
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((patch: Partial<ContentState>) => {
    const next = normalize({ ...readCache(), ...patch });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    listeners.forEach((l) => l());
    void setLocalDocumentValue({ data: { key: "content", value: next } }).catch(() => undefined);
  }, []);

  const reset = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    setState(DEFAULTS);
    listeners.forEach((l) => l());
    void setLocalDocumentValue({ data: { key: "content", value: DEFAULTS } }).catch(() => undefined);
  }, []);

  return { state, update, reset, hydrated };
}

/** Resolve section content for a language with Arabic fallback. */
export function resolveSection(state: ContentState, key: SectionKey, lang: Lang = "ar"): SectionContent {
  const s = state.sections?.[key];
  if (!s) return { title: SECTION_LABELS[key], content: "", links: [] };
  const pref = s[lang];
  const ar = s.ar;
  return {
    title: (pref?.title || ar?.title || SECTION_LABELS[key]) ?? "",
    content: (pref?.content || ar?.content || "") ?? "",
    links: (pref?.links && pref.links.length > 0 ? pref.links : ar?.links) || [],
  };
}
