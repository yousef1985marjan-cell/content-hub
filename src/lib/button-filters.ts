import { fetchWithTimeout, getSettings } from "./app-settings";

export type FilterId =
  | "filter_time_auto"
  | "filter_on_duty"
  | "filter_on_duty_by_state"
  | "filter_open_now"
  | "filter_open_now_by_state"
  | "filter_nearby_radius"
  | "filter_sort_nearest"
  | "filter_gps_state_detect"
  | "filter_result_limit"
  | "filter_wheelchair"
  | "filter_open_weekend"
  | "filter_open_late";

/** Built-in button ids kept for sticky/conflict rules; custom buttons use uuid strings. */
export type BuiltinButtonId = "nearby" | "on_duty" | "open_now" | "all";
export type ButtonId = BuiltinButtonId | string;

export type WeeklyHours = {
  mon: { start: string; end: string } | null;
  tue: { start: string; end: string } | null;
  wed: { start: string; end: string } | null;
  thu: { start: string; end: string } | null;
  fri: { start: string; end: string } | null;
  sat: { start: string; end: string } | null;
  sun: { start: string; end: string } | null;
};

export type FilterSettingsMap = {
  filter_time_auto: { hours: WeeklyHours };
  filter_nearby_radius: { radiusKm: number };
  filter_result_limit: { limit: number };
};

export type AppliedFilter = {
  id: FilterId;
  settings?: FilterSettingsMap[keyof FilterSettingsMap];
};

export type ButtonConfig = {
  id: ButtonId;
  label: string;
  icon: string;
  builtin: boolean;
  enabled: boolean;
  filters: AppliedFilter[];
};

export type FilterPreset = {
  id: string;
  name: string;
  description?: string;
  filters: AppliedFilter[];
  created_at: string;
};

export type ButtonFiltersState = {
  buttons: Record<ButtonId, ButtonConfig>;
  /** display order — includes both built-in and custom button ids */
  order: ButtonId[];
  presets: FilterPreset[];
  updated_at: string;
};

export const BUTTON_META: Record<BuiltinButtonId, { label: string; icon: string }> = {
  nearby: { label: "بالقرب مني", icon: "📍" },
  on_duty: { label: "الصيدليات المناوبة", icon: "🌙" },
  open_now: { label: "مفتوحة الآن", icon: "🟢" },
  all: { label: "جميع الصيدليات", icon: "📋" },
};

export const BUILTIN_BUTTON_IDS: BuiltinButtonId[] = ["nearby", "on_duty", "open_now", "all"];
/** @deprecated use state.order — kept for compatibility */
export const BUTTON_IDS: BuiltinButtonId[] = BUILTIN_BUTTON_IDS;

export function buttonLabel(cfg: ButtonConfig): string {
  return cfg.label || (cfg.builtin ? BUTTON_META[cfg.id as BuiltinButtonId]?.label : cfg.id) || cfg.id;
}
export function buttonIcon(cfg: ButtonConfig): string {
  return cfg.icon || (cfg.builtin ? BUTTON_META[cfg.id as BuiltinButtonId]?.icon : "🔘") || "🔘";
}

export function createCustomButton(label: string, icon: string): ButtonConfig {
  return {
    id: (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `btn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    label: label.trim() || "زر جديد",
    icon: icon.trim() || "🔘",
    builtin: false,
    enabled: true,
    filters: [makeApplied("filter_result_limit")],
  };
}

export type FilterMeta = {
  id: FilterId;
  label: string;
  description: string;
  hasSettings: boolean;
  /** filters that cannot coexist with this one on the same button */
  conflicts?: FilterId[];
  /** filters that should always stick to this button and can't be removed */
  stickyOn?: ButtonId[];
};

export const FILTER_LIBRARY: FilterMeta[] = [
  {
    id: "filter_time_auto",
    label: "الوقت التلقائي",
    description:
      "يحدد الاستعلام بتوقيت فيينا: ضمن ساعات الدوام يعرض المفتوحة، وخارجها المناوبة.",
    hasSettings: true,
  },
  {
    id: "filter_on_duty",
    label: "الصيدليات المناوبة",
    description: "يعرض الصيدليات المناوبة فقط.",
    hasSettings: false,
    conflicts: ["filter_open_now", "filter_open_now_by_state"],
    stickyOn: ["on_duty"],
  },
  {
    id: "filter_on_duty_by_state",
    label: "المناوبة بحسب المقاطعة",
    description: "يستخدم مقاطعة GPS إذا كان الحقل فارغاً ثم يعرض المناوبة فيها.",
    hasSettings: false,
    conflicts: ["filter_open_now", "filter_open_now_by_state"],
  },
  {
    id: "filter_open_now",
    label: "المفتوحة الآن",
    description: "يعرض الصيدليات التي حالتها مفتوحة فقط.",
    hasSettings: false,
    conflicts: ["filter_on_duty", "filter_on_duty_by_state"],
  },
  {
    id: "filter_open_now_by_state",
    label: "المفتوحة بحسب المقاطعة",
    description: "المفتوحة الآن ضمن مقاطعة GPS عند غياب الاختيار.",
    hasSettings: false,
    conflicts: ["filter_on_duty", "filter_on_duty_by_state"],
  },
  {
    id: "filter_nearby_radius",
    label: "نصف القطر",
    description: "يعرض الصيدليات ضمن مسافة من موقع المستخدم.",
    hasSettings: true,
  },
  {
    id: "filter_sort_nearest",
    label: "الترتيب بالأقرب",
    description: "يرتب النتائج من الأقرب إلى الأبعد عند توفر الموقع.",
    hasSettings: false,
  },
  {
    id: "filter_gps_state_detect",
    label: "تحديد المقاطعة من GPS",
    description: "يملأ حقل المقاطعة تلقائياً من GPS عند فراغه.",
    hasSettings: false,
  },
  {
    id: "filter_result_limit",
    label: "حد النتائج",
    description: "أقصى عدد نتائج يعرضها الزر.",
    hasSettings: true,
  },
  {
    id: "filter_wheelchair",
    label: "إمكانية الوصول",
    description: "الصيدليات المهيأة لذوي الاحتياجات (Barrierefreiheit).",
    hasSettings: false,
  },
  {
    id: "filter_open_weekend",
    label: "عطلة نهاية الأسبوع",
    description: "الصيدليات التي تفتح السبت أو الأحد.",
    hasSettings: false,
  },
  {
    id: "filter_open_late",
    label: "الدوام المسائي",
    description: "الصيدليات التي تبقى مفتوحة بعد 18:00.",
    hasSettings: false,
  },
];

export function getFilterMeta(id: FilterId): FilterMeta {
  return FILTER_LIBRARY.find((f) => f.id === id)!;
}

export const DEFAULT_HOURS: WeeklyHours = {
  mon: { start: "08:00", end: "18:00" },
  tue: { start: "08:00", end: "18:00" },
  wed: { start: "08:00", end: "18:00" },
  thu: { start: "08:00", end: "18:00" },
  fri: { start: "08:00", end: "18:00" },
  sat: { start: "08:00", end: "12:00" },
  sun: null,
};

export function defaultSettingsFor(id: FilterId): AppliedFilter["settings"] {
  if (id === "filter_time_auto") return { hours: DEFAULT_HOURS };
  if (id === "filter_nearby_radius") return { radiusKm: 10 };
  if (id === "filter_result_limit") return { limit: 200 };
  return undefined;
}

export function makeApplied(id: FilterId): AppliedFilter {
  const s = defaultSettingsFor(id);
  return s ? { id, settings: s } : { id };
}

export const DEFAULT_BUTTONS: Record<BuiltinButtonId, ButtonConfig> = {
  nearby: {
    id: "nearby",
    label: BUTTON_META.nearby.label,
    icon: BUTTON_META.nearby.icon,
    builtin: true,
    enabled: true,
    filters: [
      makeApplied("filter_time_auto"),
      makeApplied("filter_nearby_radius"),
      makeApplied("filter_sort_nearest"),
      makeApplied("filter_result_limit"),
    ],
  },
  on_duty: {
    id: "on_duty",
    label: BUTTON_META.on_duty.label,
    icon: BUTTON_META.on_duty.icon,
    builtin: true,
    enabled: true,
    filters: [
      makeApplied("filter_on_duty"),
      makeApplied("filter_on_duty_by_state"),
      makeApplied("filter_gps_state_detect"),
      makeApplied("filter_result_limit"),
    ],
  },
  open_now: {
    id: "open_now",
    label: BUTTON_META.open_now.label,
    icon: BUTTON_META.open_now.icon,
    builtin: true,
    enabled: true,
    filters: [
      makeApplied("filter_open_now"),
      makeApplied("filter_sort_nearest"),
      makeApplied("filter_result_limit"),
    ],
  },
  all: {
    id: "all",
    label: BUTTON_META.all.label,
    icon: BUTTON_META.all.icon,
    builtin: true,
    enabled: true,
    filters: [makeApplied("filter_sort_nearest"), makeApplied("filter_result_limit")],
  },
};

export function defaultState(): ButtonFiltersState {
  return {
    buttons: structuredClone(DEFAULT_BUTTONS) as Record<ButtonId, ButtonConfig>,
    order: [...BUILTIN_BUTTON_IDS],
    presets: [],
    updated_at: new Date().toISOString(),
  };
}

/** Return filter ids in this list that conflict with the given id. */
export function conflictsIn(filters: AppliedFilter[], id: FilterId): FilterId[] {
  const meta = getFilterMeta(id);
  const set = new Set(filters.map((f) => f.id));
  const out: FilterId[] = [];
  for (const other of filters) {
    if (other.id === id) continue;
    const om = getFilterMeta(other.id);
    if (meta.conflicts?.includes(other.id) || om.conflicts?.includes(id)) {
      out.push(other.id);
    }
  }
  set.delete(id);
  return out;
}

/** Apply a preset to a button, resolving conflicts and preserving sticky filters. */
export function applyPresetToButton(
  button: ButtonConfig,
  preset: FilterPreset,
): { next: ButtonConfig; added: FilterId[]; removed: FilterId[] } {
  // Start with sticky filters from current button
  const sticky = button.filters.filter((f) =>
    getFilterMeta(f.id).stickyOn?.includes(button.id),
  );
  const stickyIds = new Set(sticky.map((s) => s.id));

  const result: AppliedFilter[] = [...sticky];
  for (const f of preset.filters) {
    if (stickyIds.has(f.id)) continue;
    // skip if conflicts with anything already in result
    if (conflictsIn(result, f.id).length > 0) continue;
    result.push(structuredClone(f));
  }

  const before = new Set(button.filters.map((f) => f.id));
  const after = new Set(result.map((f) => f.id));
  const added = [...after].filter((x) => !before.has(x)) as FilterId[];
  const removed = [...before].filter((x) => !after.has(x)) as FilterId[];
  return { next: { ...button, filters: result }, added, removed };
}

// ---------- persistence ----------

const LOCAL_KEY = "shifa-button-filters-v1";

function readLocal(): ButtonFiltersState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return defaultState();
    const p = JSON.parse(raw) as ButtonFiltersState;
    // ensure all buttons exist
    for (const id of BUTTON_IDS) {
      if (!p.buttons[id]) p.buttons[id] = structuredClone(DEFAULT_BUTTONS[id]);
    }
    if (!Array.isArray(p.presets)) p.presets = [];
    return p;
  } catch {
    return defaultState();
  }
}

function writeLocal(s: ButtonFiltersState) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
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

export async function loadButtonFilters(): Promise<ButtonFiltersState> {
  if (isOffline()) return readLocal();
  const { adminApiBaseUrl } = getSettings();
  const res = await fetchWithTimeout(`${adminApiBaseUrl}/button-filters`, {
    headers: authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `فشل الطلب (${res.status})`);
  const data = (json?.data ?? json) as Partial<ButtonFiltersState>;
  // merge with defaults
  const base = defaultState();
  return {
    buttons: { ...base.buttons, ...(data.buttons || {}) },
    presets: data.presets || [],
    updated_at: data.updated_at || base.updated_at,
  };
}

export async function saveButtonFilters(
  state: ButtonFiltersState,
): Promise<ButtonFiltersState> {
  const next = { ...state, updated_at: new Date().toISOString() };
  if (isOffline()) {
    writeLocal(next);
    return next;
  }
  const { adminApiBaseUrl } = getSettings();
  const res = await fetchWithTimeout(`${adminApiBaseUrl}/button-filters`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(next),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `فشل الحفظ (${res.status})`);
  return (json?.data ?? next) as ButtonFiltersState;
}

/** Textual preview of what the button will do. */
export function previewButton(cfg: ButtonConfig): string {
  if (!cfg.enabled) return "الزر مخفي في التطبيق.";
  if (cfg.filters.length === 0) return "لا توجد فلاتر — الزر لن يعمل.";
  const parts = cfg.filters.map((f) => {
    const meta = getFilterMeta(f.id);
    if (f.id === "filter_nearby_radius") {
      const s = f.settings as FilterSettingsMap["filter_nearby_radius"] | undefined;
      return `ضمن ${s?.radiusKm ?? 10} كم`;
    }
    if (f.id === "filter_result_limit") {
      const s = f.settings as FilterSettingsMap["filter_result_limit"] | undefined;
      return `حد ${s?.limit ?? 200} نتيجة`;
    }
    if (f.id === "filter_time_auto") return "تحديد الوقت تلقائياً (مناوبة/مفتوحة)";
    if (f.id === "filter_sort_nearest") return "ترتيب بالأقرب";
    return meta.label;
  });
  return `عند ضغط "${BUTTON_META[cfg.id].label}": ${parts.join(" ← ")}`;
}
