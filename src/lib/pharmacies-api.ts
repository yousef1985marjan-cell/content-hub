import { fetchWithTimeout, getSettings } from "./app-settings";

export type PharmacyStatus = "open" | "closed" | "on_duty";

export type PharmacyHours = {
  day?: string;
  open?: string;
  close?: string;
  is_closed?: boolean;
};

export type Pharmacy = {
  id: string | number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: number | string;
  phone?: string;
  email?: string;
  status?: PharmacyStatus;
  lat?: number;
  lon?: number;
  hours?: PharmacyHours[];
};

export type PharmacyFilters = {
  state?: string;
  city?: string;
  postal_code?: string;
  name?: string;
};

export type QuickFilter = "all" | "open" | "duty";

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function requireBase(): string {
  const base = getSettings().apiBaseUrl;
  if (!base) throw new Error("لم يتم ضبط API_BASE_URL — افتح صفحة الإعدادات");
  return base;
}

export async function fetchStates(): Promise<string[]> {
  const base = requireBase();
  const res = await fetchWithTimeout(`${base}/states`);
  if (!res.ok) throw new Error(`فشل تحميل المقاطعات (${res.status})`);
  const data = await res.json();
  if (Array.isArray(data)) return data.map(String);
  if (Array.isArray(data?.states)) return data.states.map(String);
  if (Array.isArray(data?.data)) return data.data.map(String);
  return [];
}

export async function fetchCities(state?: string): Promise<string[]> {
  const base = requireBase();
  const res = await fetchWithTimeout(`${base}/cities${qs({ state })}`);
  if (!res.ok) throw new Error(`فشل تحميل المدن (${res.status})`);
  const data = await res.json();
  if (Array.isArray(data)) return data.map(String);
  if (Array.isArray(data?.cities)) return data.cities.map(String);
  if (Array.isArray(data?.data)) return data.data.map(String);
  return [];
}

export type PharmacyQuery = PharmacyFilters & { quick: QuickFilter };

export async function fetchPharmacies(q: PharmacyQuery): Promise<Pharmacy[]> {
  const base = requireBase();
  const params = {
    state: q.state,
    city: q.city,
    postal_code: q.postal_code,
    name: q.name,
    limit: 200,
  };

  const url =
    q.quick === "duty"
      ? `${base}/pharmacies/duty${qs(params)}`
      : `${base}/pharmacies${qs(params)}`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`فشل الاستعلام (${res.status})`);
  const data = await res.json();
  const list: Pharmacy[] =
    (q.quick === "duty" ? data?.duty_pharmacies : data?.pharmacies) ||
    data?.data ||
    [];
  if (q.quick === "open") {
    return list.filter((p) => p.status === "open");
  }
  return list;
}
