import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchCities,
  fetchPharmacies,
  fetchStates,
  type Pharmacy,
  type QuickFilter,
} from "@/lib/pharmacies-api";
import { getSettings } from "@/lib/app-settings";

type Filters = {
  state: string;
  city: string;
  postal_code: string;
  name: string;
};

const emptyFilters: Filters = { state: "", city: "", postal_code: "", name: "" };
const PAGE_SIZE = 50;

const STATUS_LABEL: Record<string, string> = {
  open: "مفتوحة",
  closed: "مغلقة",
  on_duty: "مناوبة",
};
const STATUS_STYLE: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-800 border-emerald-300",
  closed: "bg-muted text-muted-foreground border-border",
  on_duty: "bg-amber-100 text-amber-800 border-amber-300",
};

export function PharmaciesPanel() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  const cityTimer = useRef<number | undefined>(undefined);

  const configured = !!getSettings().apiBaseUrl;

  useEffect(() => {
    if (!configured) return;
    fetchStates()
      .then(setStates)
      .catch((e) => setError((e as Error).message));
  }, [configured]);

  const onCityInput = (v: string) => {
    setFilters((f) => ({ ...f, city: v }));
    window.clearTimeout(cityTimer.current);
    if (!v.trim()) {
      setCities([]);
      return;
    }
    cityTimer.current = window.setTimeout(async () => {
      try {
        const list = await fetchCities(filters.state || undefined);
        setCities(
          list
            .filter((c) => c.toLowerCase().includes(v.toLowerCase()))
            .slice(0, 8),
        );
      } catch {
        setCities([]);
      }
    }, 250);
  };

  const pickCity = async (city: string) => {
    setCities([]);
    // fill state automatically if empty by looking up one call
    if (!filters.state) {
      try {
        const list = await fetchCities();
        // best-effort: no state info returned, keep as-is
        void list;
      } catch {
        /* ignore */
      }
    }
    setFilters((f) => ({ ...f, city }));
  };

  const runSearch = async () => {
    if (!configured) {
      setError("لم يتم ضبط API_BASE_URL — افتح صفحة الإعدادات");
      return;
    }
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const list = await fetchPharmacies({
        state: filters.state || undefined,
        city: filters.city || undefined,
        postal_code: filters.postal_code || undefined,
        name: filters.name || undefined,
        quick,
      });
      setResults(list);
    } catch (e) {
      setError((e as Error).message);
      setResults([]);
    }
    setLoading(false);
  };

  const clearAll = () => {
    setFilters(emptyFilters);
    setQuick("all");
    setResults([]);
    setError(null);
    setPage(1);
  };

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 text-lg font-black text-primary">استعلام الصيدليات</h2>
        <p className="text-xs text-muted-foreground">
          فلاتر مطابقة لتطبيق الجوال: مقاطعة، مدينة، رمز بريدي، اسم، وحالة سريعة.
        </p>
      </div>

      {!configured && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          لم يتم ضبط API_BASE_URL. افتح تبويب «الإعدادات» أولاً.
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">المقاطعة</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">كل المقاطعات</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="mb-1 block text-xs font-bold text-muted-foreground">المدينة</label>
            <input
              value={filters.city}
              onChange={(e) => onCityInput(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="اكتب اسم المدينة..."
            />
            {cities.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover shadow-lg">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => pickCity(c)}
                    className="block w-full px-3 py-2 text-right text-sm hover:bg-muted"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              الرمز البريدي (PLZ)
            </label>
            <input
              value={filters.postal_code}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  postal_code: e.target.value.replace(/\D/g, "").slice(0, 4),
                }))
              }
              inputMode="numeric"
              maxLength={4}
              dir="ltr"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="1010"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              اسم الصيدلية
            </label>
            <input
              value={filters.name}
              onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="بحث نصي..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "open", "duty"] as QuickFilter[]).map((k) => (
            <button
              key={k}
              onClick={() => setQuick(k)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                quick === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {k === "all" ? "الكل" : k === "open" ? "مفتوحة الآن" : "الصيدليات المناوبة"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            onClick={runSearch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            بحث
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
          >
            <X className="h-4 w-4" />
            مسح
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold">
            النتائج: <span className="text-primary">{results.length}</span>
          </p>
          {loading && (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> جاري التحميل...
            </span>
          )}
        </div>

        {error && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            <button
              onClick={runSearch}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2 py-1 text-xs font-bold hover:bg-muted"
            >
              <RefreshCw className="h-3 w-3" />
              إعادة محاولة
            </button>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد نتائج</p>
        )}

        {results.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-2 font-bold">الاسم</th>
                    <th className="py-2 font-bold">الحالة</th>
                    <th className="py-2 font-bold">العنوان</th>
                    <th className="py-2 font-bold">المدينة</th>
                    <th className="py-2 font-bold">PLZ</th>
                    <th className="py-2 pl-2 font-bold">الهاتف</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="cursor-pointer border-b border-border/40 hover:bg-muted/40"
                    >
                      <td className="py-2 pr-2 font-bold">{p.name}</td>
                      <td className="py-2">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                            STATUS_STYLE[p.status || "closed"] ?? STATUS_STYLE.closed
                          }`}
                        >
                          {STATUS_LABEL[p.status || "closed"] ?? "—"}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">{p.address || "—"}</td>
                      <td className="py-2">{p.city || "—"}</td>
                      <td className="py-2 font-mono" dir="ltr">
                        {p.postal_code ?? "—"}
                      </td>
                      <td className="py-2 pl-2 font-mono" dir="ltr">
                        {p.phone || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-input bg-background p-1.5 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-xs">
                  صفحة {page} من {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border border-input bg-background p-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setSelected(null)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-primary">{selected.name}</h3>
                <span
                  className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                    STATUS_STYLE[selected.status || "closed"] ?? STATUS_STYLE.closed
                  }`}
                >
                  {STATUS_LABEL[selected.status || "closed"] ?? "—"}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-input bg-background p-1.5 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="space-y-2 text-sm">
              {selected.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span>
                    {selected.address}
                    {selected.city ? `، ${selected.city}` : ""}{" "}
                    {selected.postal_code ? `(${selected.postal_code})` : ""}
                  </span>
                </div>
              )}
              {selected.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${selected.phone}`} dir="ltr" className="font-mono text-primary">
                    {selected.phone}
                  </a>
                </div>
              )}
              {selected.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selected.email}`} dir="ltr" className="text-primary">
                    {selected.email}
                  </a>
                </div>
              )}
            </dl>

            {selected.hours && selected.hours.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Clock className="h-4 w-4" />
                  ساعات العمل
                </h4>
                <ul className="space-y-1 text-sm">
                  {selected.hours.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between border-b border-border/40 py-1"
                    >
                      <span className="font-bold">{h.day || `يوم ${i + 1}`}</span>
                      <span className="font-mono" dir="ltr">
                        {h.is_closed ? "مغلقة" : `${h.open || "--"} - ${h.close || "--"}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
