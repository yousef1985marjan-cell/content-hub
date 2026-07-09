import { useEffect, useState, useCallback } from "react";

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
};


export type ContentState = {
  about: string;
  privacy: string;
  terms: string;
  disclaimer: string;
  publisherIntro: string;
  platforms: PlatformLink[];
};

const STORAGE_KEY = "shifa-content-v2";

const DEFAULTS: ContentState = {
  about:
    "نحن منصات شفاء، نسعى لتقديم محتوى موثوق ومفيد لخدمة مستخدمينا. رسالتنا هي توفير معلومات دقيقة وتجربة سلسة عبر جميع منصاتنا.",
  privacy:
    "نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لا نقوم بجمع أي بيانات دون إذنك الصريح، ولا نشاركها مع أطراف ثالثة إلا وفق ما يقتضيه القانون.",
  terms:
    "باستخدامك لخدماتنا فإنك توافق على الالتزام بالشروط والأحكام المعمول بها. يحق لنا تعديل هذه الشروط في أي وقت مع إشعار المستخدمين بذلك.",
  disclaimer:
    "المحتوى المقدم في هذه المنصة لأغراض معلوماتية فقط، ولا يُعد بديلاً عن الاستشارة المتخصصة. لا نتحمل أي مسؤولية عن نتائج استخدام المعلومات.",
  publisherIntro: "",
  platforms: [
    { id: "tg", name: "تلغرام", url: "https://t.me/", brand: "telegram" },
    { id: "wa", name: "واتساب", url: "https://wa.me/", brand: "whatsapp" },
    { id: "yt", name: "يوتيوب", url: "https://youtube.com/", brand: "youtube" },
    { id: "tt", name: "تيك توك", url: "https://tiktok.com/", brand: "tiktok" },
    { id: "ig", name: "إنستغرام", url: "https://instagram.com/", brand: "instagram" },
    { id: "fb", name: "فيسبوك", url: "https://facebook.com/", brand: "facebook" },
    {
      id: "android",
      name: "Google Play",
      url: "https://play.google.com/",
      brand: "android",
      androidUrl: "https://play.google.com/",
    },
    {
      id: "ios",
      name: "App Store",
      url: "https://apps.apple.com/",
      brand: "apple",
      iosUrl: "https://apps.apple.com/",
    },
  ],
};

function read(): ContentState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

const listeners = new Set<() => void>();

export function useContent() {
  const [state, setState] = useState<ContentState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
    const l = () => setState(read());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((patch: Partial<ContentState>) => {
    const next = { ...read(), ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    listeners.forEach((l) => l());
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULTS);
    listeners.forEach((l) => l());
  }, []);

  return { state, update, reset, hydrated };
}
