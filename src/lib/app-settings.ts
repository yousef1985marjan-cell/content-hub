import { useCallback, useEffect, useState } from "react";

export type AppSettings = {
  apiBaseUrl: string;
  adminApiBaseUrl: string;
  adminApiKey: string;
};

const STORAGE_KEY = "shifa-app-settings-v1";

export const DEFAULT_SETTINGS: AppSettings = {
  apiBaseUrl: "",
  adminApiBaseUrl: "",
  adminApiKey: "",
};

function read(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const p = JSON.parse(raw) as Partial<AppSettings>;
    return {
      apiBaseUrl: (p.apiBaseUrl || "").replace(/\/+$/, ""),
      adminApiBaseUrl: (p.adminApiBaseUrl || "").replace(/\/+$/, ""),
      adminApiKey: p.adminApiKey || "",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const listeners = new Set<() => void>();

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(read());
    setHydrated(true);
    const l = () => setSettings(read());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    const next = { ...read(), ...patch };
    next.apiBaseUrl = next.apiBaseUrl.replace(/\/+$/, "");
    next.adminApiBaseUrl = next.adminApiBaseUrl.replace(/\/+$/, "");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettings(next);
    listeners.forEach((l) => l());
  }, []);

  return { settings, update, hydrated };
}

export function getSettings(): AppSettings {
  return read();
}

/** fetch with 15s timeout */
export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}
