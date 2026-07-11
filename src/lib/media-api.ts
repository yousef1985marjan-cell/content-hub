import { fetchWithTimeout, getSettings } from "./app-settings";
import { LANGS, type Lang } from "./content-store";

export type MediaType = "announcement" | "alert" | "news";

export type MediaI18n = Record<Lang, string>;

export type MediaItem = {
  id: string;
  type: MediaType;
  title: MediaI18n;
  body: MediaI18n;
  image_url?: string;
  link_url?: string;
  priority: number;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
  updated_at: string;
};

export const MEDIA_TYPES: MediaType[] = ["announcement", "alert", "news"];
export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  announcement: "إعلان",
  alert: "تنبيه",
  news: "خبر",
};

export function emptyI18n(): MediaI18n {
  return LANGS.reduce((a, l) => {
    a[l] = "";
    return a;
  }, {} as MediaI18n);
}

export function emptyMedia(): MediaItem {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type: "announcement",
    title: emptyI18n(),
    body: emptyI18n(),
    image_url: "",
    link_url: "",
    priority: 100,
    is_active: true,
    starts_at: null,
    ends_at: null,
    created_at: now,
    updated_at: now,
  };
}

const LOCAL_KEY = "shifa-media-local-v1";

function readLocal(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as MediaItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: MediaItem[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function isOffline(): boolean {
  return !getSettings().adminApiBaseUrl;
}

function authHeaders(): HeadersInit {
  const { adminApiKey } = getSettings();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (adminApiKey) h["Authorization"] = `Bearer ${adminApiKey}`;
  return h;
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `فشل الطلب (${res.status})`);
  }
  return (json?.data ?? json) as T;
}

export async function listMedia(): Promise<MediaItem[]> {
  if (isOffline()) return readLocal();
  const { adminApiBaseUrl } = getSettings();
  const res = await fetchWithTimeout(`${adminApiBaseUrl}/media`, {
    headers: authHeaders(),
  });
  return unwrap<MediaItem[]>(res);
}

export async function createMedia(item: MediaItem): Promise<MediaItem> {
  if (isOffline()) {
    const list = readLocal();
    list.push(item);
    writeLocal(list);
    return item;
  }
  const { adminApiBaseUrl } = getSettings();
  const res = await fetchWithTimeout(`${adminApiBaseUrl}/media`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });
  return unwrap<MediaItem>(res);
}

export async function updateMedia(item: MediaItem): Promise<MediaItem> {
  item.updated_at = new Date().toISOString();
  if (isOffline()) {
    const list = readLocal().map((x) => (x.id === item.id ? item : x));
    writeLocal(list);
    return item;
  }
  const { adminApiBaseUrl } = getSettings();
  const res = await fetchWithTimeout(`${adminApiBaseUrl}/media/${item.id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });
  return unwrap<MediaItem>(res);
}

export async function deleteMedia(id: string): Promise<void> {
  if (isOffline()) {
    writeLocal(readLocal().filter((x) => x.id !== id));
    return;
  }
  const { adminApiBaseUrl } = getSettings();
  const res = await fetchWithTimeout(`${adminApiBaseUrl}/media/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await unwrap(res);
}

export async function uploadMediaImage(file: File): Promise<string> {
  if (isOffline()) {
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("فشل قراءة الصورة"));
      r.readAsDataURL(file);
    });
  }
  const { adminApiBaseUrl, adminApiKey } = getSettings();
  const fd = new FormData();
  fd.append("file", file);
  const headers: Record<string, string> = {};
  if (adminApiKey) headers["Authorization"] = `Bearer ${adminApiKey}`;
  const res = await fetchWithTimeout(`${adminApiBaseUrl}/media/upload`, {
    method: "POST",
    headers,
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `فشل رفع الصورة (${res.status})`);
  }
  return json?.data?.url || json?.url;
}

export function computeStatus(item: MediaItem): "active" | "inactive" | "expired" | "scheduled" {
  if (!item.is_active) return "inactive";
  const now = Date.now();
  if (item.starts_at && new Date(item.starts_at).getTime() > now) return "scheduled";
  if (item.ends_at && new Date(item.ends_at).getTime() < now) return "expired";
  return "active";
}
