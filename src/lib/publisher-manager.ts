import { useCallback, useEffect, useState } from "react";
import { LANGS, type Lang } from "./content-store";
import type { BrandKey } from "./brand-icons";

export const PUB_GROUP_KEYS = ["social", "download", "videos", "apps", "media"] as const;
export type PubGroupKey = (typeof PUB_GROUP_KEYS)[number];

export const PUB_GROUP_LABELS: Record<PubGroupKey, string> = {
  social: "منصات التواصل الاجتماعي",
  download: "تحميل تطبيق شفاء",
  videos: "فيديوهات قد تعجبك",
  apps: "تطبيقات قد تعجبك",
  media: "مكتبة الأيقونات والصور",
};

export const PUB_GROUP_ADD_LABEL: Record<PubGroupKey, string> = {
  social: "إضافة منصة",
  download: "إضافة رابط تحميل",
  videos: "إضافة فيديو",
  apps: "إضافة تطبيق",
  media: "رفع صورة أو أيقونة",
};

export type LocalizedText = Partial<Record<Lang, string>>;

export type PubItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  url: string;
  brand?: BrandKey;
  imageDataUrl?: string;
  thumbnailDataUrl?: string;
  iconColor?: string;
  iconSize?: number;
  iconBg?: string;
  published: boolean;
  hidden: boolean;
  createdAt: number;
};

export type PubGroup = {
  active: boolean;
  items: PubItem[];
};

export type PubStore = Record<PubGroupKey, PubGroup>;

const STORAGE_KEY = "shifa-publisher-manager-v1";

export function emptyLocalized(): LocalizedText {
  return LANGS.reduce((a, l) => {
    a[l] = "";
    return a;
  }, {} as LocalizedText);
}

export function emptyItem(): PubItem {
  return {
    id: crypto.randomUUID(),
    name: emptyLocalized(),
    description: emptyLocalized(),
    url: "",
    brand: undefined,
    imageDataUrl: "",
    thumbnailDataUrl: "",
    iconColor: "",
    iconSize: 48,
    iconBg: "",
    published: false,
    hidden: false,
    createdAt: Date.now(),
  };
}

const DEFAULTS: PubStore = PUB_GROUP_KEYS.reduce((a, k) => {
  a[k] = { active: true, items: [] };
  return a;
}, {} as PubStore);

function read(): PubStore {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<PubStore>;
    const merged = { ...DEFAULTS } as PubStore;
    for (const k of PUB_GROUP_KEYS) {
      const g = parsed[k];
      if (g && Array.isArray(g.items)) merged[k] = { active: g.active !== false, items: g.items };
    }
    return merged;
  } catch {
    return DEFAULTS;
  }
}

const listeners = new Set<() => void>();

export function usePublisherManager() {
  const [state, setState] = useState<PubStore>(DEFAULTS);
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

  const write = useCallback((next: PubStore) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    listeners.forEach((l) => l());
  }, []);

  const updateGroup = useCallback(
    (key: PubGroupKey, patch: Partial<PubGroup>) => {
      const cur = read();
      const next = { ...cur, [key]: { ...cur[key], ...patch } };
      write(next);
    },
    [write],
  );

  const upsertItem = useCallback(
    (key: PubGroupKey, item: PubItem) => {
      const cur = read();
      const items = cur[key].items;
      const idx = items.findIndex((i) => i.id === item.id);
      const next = idx >= 0
        ? items.map((i) => (i.id === item.id ? item : i))
        : [...items, item];
      write({ ...cur, [key]: { ...cur[key], items: next } });
    },
    [write],
  );

  const removeItem = useCallback(
    (key: PubGroupKey, id: string) => {
      const cur = read();
      write({ ...cur, [key]: { ...cur[key], items: cur[key].items.filter((i) => i.id !== id) } });
    },
    [write],
  );

  const reorderItems = useCallback(
    (key: PubGroupKey, ids: string[]) => {
      const cur = read();
      const byId = new Map(cur[key].items.map((i) => [i.id, i]));
      const next = ids.map((id) => byId.get(id)!).filter(Boolean);
      write({ ...cur, [key]: { ...cur[key], items: next } });
    },
    [write],
  );

  return { state, hydrated, updateGroup, upsertItem, removeItem, reorderItems };
}
