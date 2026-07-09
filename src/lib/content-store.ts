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

const STORAGE_KEY = "shifa-content-v1";

const DEFAULTS: ContentState = {
  about:
    "نحن منصات شفاء، نسعى لتقديم محتوى موثوق ومفيد لخدمة مستخدمينا. رسالتنا هي توفير معلومات دقيقة وتجربة سلسة عبر جميع منصاتنا.",
  privacy:
    "نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لا نقوم بجمع أي بيانات دون إذنك الصريح، ولا نشاركها مع أطراف ثالثة إلا وفق ما يقتضيه القانون.",
  terms:
    "باستخدامك لخدماتنا فإنك توافق على الالتزام بالشروط والأحكام المعمول بها. يحق لنا تعديل هذه الشروط في أي وقت مع إشعار المستخدمين بذلك.",
  disclaimer:
    "المحتوى المقدم في هذه المنصة لأغراض معلوماتية فقط، ولا يُعد بديلاً عن الاستشارة المتخصصة. لا نتحمل أي مسؤولية عن نتائج استخدام المعلومات.",
  publisherIntro:
    "منصات شفاء هي مجموعة من المنصات المتكاملة التي تهدف إلى خدمة المستخدم. اضغط على أي منصة أدناه ليتم تحويلك إليها مباشرة.",
  platforms: [
    { id: "1", name: "المنصة الرئيسية", url: "https://example.com", description: "الموقع الرسمي" },
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
