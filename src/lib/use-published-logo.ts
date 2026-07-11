import { useEffect, useState } from "react";

export type PublishedLogo = {
  id: string;
  label: string;
  saved: string;
  published?: boolean;
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

/** Returns the published logo data-URL for the given id, or null. */
export function usePublishedLogo(id: string): string | null {
  const [url, setUrl] = useState<string | null>(() => {
    const found = readAll().find((l) => l.id === id);
    return found?.published && found.saved ? found.saved : null;
  });

  useEffect(() => {
    const refresh = () => {
      const found = readAll().find((l) => l.id === id);
      setUrl(found?.published && found.saved ? found.saved : null);
    };
    refresh();
    window.addEventListener(LOGO_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LOGO_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [id]);

  return url;
}

/** Returns the first available published logo url from `ids`, in order. */
export function useFirstPublishedLogo(ids: string[]): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const refresh = () => {
      const all = readAll();
      for (const id of ids) {
        const f = all.find((l) => l.id === id);
        if (f?.published && f.saved) {
          setUrl(f.saved);
          return;
        }
      }
      setUrl(null);
    };
    refresh();
    window.addEventListener(LOGO_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LOGO_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [ids.join(",")]);
  return url;
}
