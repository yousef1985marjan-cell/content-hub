import { useEffect, useState } from "react";

export type PublishedLogo = {
  id: string;
  label: string;
  saved: string;
  published?: boolean;
  width?: number;
  height?: number;
};

export type PublishedLogoResult = {
  url: string;
  width: number;
  height: number;
};

export const LOGO_STORAGE_KEY = "shifa-logo-manager-v1";
export const LOGO_UPDATED_EVENT = "shifa:logos-updated";

function readAll(): PublishedLogo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOGO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PublishedLogo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toResult(l: PublishedLogo | undefined): PublishedLogoResult | null {
  if (!l || !l.published || !l.saved) return null;
  return {
    url: l.saved,
    width: Number(l.width) > 0 ? Number(l.width) : 40,
    height: Number(l.height) > 0 ? Number(l.height) : 40,
  };
}

/** Returns the published logo for the given id, or null. */
export function usePublishedLogo(id: string): PublishedLogoResult | null {
  const [val, setVal] = useState<PublishedLogoResult | null>(() =>
    toResult(readAll().find((l) => l.id === id)),
  );
  useEffect(() => {
    const refresh = () => setVal(toResult(readAll().find((l) => l.id === id)));
    refresh();
    window.addEventListener(LOGO_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LOGO_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [id]);
  return val;
}

/** Returns the first available published logo from `ids`, in order. */
export function useFirstPublishedLogo(ids: string[]): PublishedLogoResult | null {
  const [val, setVal] = useState<PublishedLogoResult | null>(null);
  const key = ids.join(",");
  useEffect(() => {
    const refresh = () => {
      const all = readAll();
      for (const id of ids) {
        const r = toResult(all.find((l) => l.id === id));
        if (r) {
          setVal(r);
          return;
        }
      }
      setVal(null);
    };
    refresh();
    window.addEventListener(LOGO_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LOGO_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return val;
}
