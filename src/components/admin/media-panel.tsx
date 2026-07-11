import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  Save,
  X,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  MEDIA_TYPES,
  MEDIA_TYPE_LABELS,
  computeStatus,
  createMedia,
  deleteMedia,
  emptyMedia,
  isOffline,
  listMedia,
  updateMedia,
  uploadMediaImage,
  type MediaItem,
  type MediaType,
} from "@/lib/media-api";
import { LANGS, LANG_LABELS, type Lang } from "@/lib/content-store";

const STATUS_LABEL: Record<string, string> = {
  active: "مفعّل",
  inactive: "موقوف",
  expired: "منتهي",
  scheduled: "لاحقاً",
};
const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-300",
  inactive: "bg-muted text-muted-foreground border-border",
  expired: "bg-destructive/10 text-destructive border-destructive/30",
  scheduled: "bg-amber-100 text-amber-800 border-amber-300",
};

export function MediaPanel({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const offline = isOffline();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMedia();
      setItems(list);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((i) => (typeFilter ? i.type === typeFilter : true))
      .filter((i) => (statusFilter ? computeStatus(i) === statusFilter : true))
      .filter((i) =>
        search ? (i.title.ar || "").toLowerCase().includes(search.toLowerCase()) : true,
      )
      .sort((a, b) => a.priority - b.priority);
  }, [items, search, typeFilter, statusFilter]);

  const toggle = async (item: MediaItem) => {
    try {
      const next = { ...item, is_active: !item.is_active };
      const saved = await updateMedia(next);
      setItems((xs) => xs.map((x) => (x.id === saved.id ? saved : x)));
    } catch (e) {
      flash((e as Error).message);
    }
  };

  const remove = async (item: MediaItem) => {
    if (!confirm("حذف العنصر؟")) return;
    try {
      await deleteMedia(item.id);
      setItems((xs) => xs.filter((x) => x.id !== item.id));
      flash("تم الحذف");
    } catch (e) {
      flash((e as Error).message);
    }
  };

  const onSaved = (item: MediaItem, isNew: boolean) => {
    setItems((xs) => (isNew ? [...xs, item] : xs.map((x) => (x.id === item.id ? item : x))));
    setEditing(null);
    flash("تم الحفظ");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 text-lg font-black text-primary">الإعلام / الإعلانات</h2>
        <p className="text-xs text-muted-foreground">
          إدارة الإعلانات والتنبيهات والأخبار التي تظهر داخل تطبيق الجوال.
        </p>
      </div>

      {offline && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          غير متصل بالخادم — البيانات تجريبية محفوظة في المتصفح.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالعنوان..."
            className="min-w-[10rem] flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MediaType | "")}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">كل الأنواع</option>
            {MEDIA_TYPES.map((t) => (
              <option key={t} value={t}>
                {MEDIA_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">كل الحالات</option>
            <option value="active">مفعّل</option>
            <option value="inactive">موقوف</option>
            <option value="scheduled">مجدول</option>
            <option value="expired">منتهي</option>
          </select>
          <button
            onClick={() => setEditing(emptyMedia())}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            جديد
          </button>
        </div>

        {loading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد عناصر</p>
        )}

        {filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-2 font-bold">العنوان</th>
                  <th className="py-2 font-bold">النوع</th>
                  <th className="py-2 font-bold">الحالة</th>
                  <th className="py-2 font-bold">الفترة</th>
                  <th className="py-2 font-bold">الأولوية</th>
                  <th className="py-2 pl-2 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const st = computeStatus(item);
                  return (
                    <tr key={item.id} className="border-b border-border/40">
                      <td className="py-2 pr-2 font-bold">{item.title.ar || "—"}</td>
                      <td className="py-2 text-muted-foreground">
                        {MEDIA_TYPE_LABELS[item.type]}
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[st]}`}
                        >
                          {STATUS_LABEL[st]}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground" dir="ltr">
                        {(item.starts_at || "").slice(0, 10) || "—"} →{" "}
                        {(item.ends_at || "").slice(0, 10) || "—"}
                      </td>
                      <td className="py-2 font-mono" dir="ltr">
                        {item.priority}
                      </td>
                      <td className="py-2 pl-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggle(item)}
                            className={`rounded-md border px-2 py-1 text-[11px] font-bold ${
                              item.is_active
                                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                : "border-border bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.is_active ? "مفعّل" : "موقوف"}
                          </button>
                          <button
                            onClick={() => setEditing(item)}
                            className="rounded-md border border-input bg-background p-1.5 hover:bg-muted"
                            aria-label="تعديل"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => remove(item)}
                            className="rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                            aria-label="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <MediaEditor
          initial={editing}
          isNew={!items.find((x) => x.id === editing.id)}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
          flash={flash}
        />
      )}
    </div>
  );
}

function MediaEditor({
  initial,
  isNew,
  onClose,
  onSaved,
  flash,
}: {
  initial: MediaItem;
  isNew: boolean;
  onClose: () => void;
  onSaved: (item: MediaItem, isNew: boolean) => void;
  flash: (m: string) => void;
}) {
  const [draft, setDraft] = useState<MediaItem>(() => structuredClone(initial));
  const [lang, setLang] = useState<Lang>("ar");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<MediaItem>) => setDraft((d) => ({ ...d, ...p }));
  const patchLang = (field: "title" | "body", v: string) =>
    setDraft((d) => ({ ...d, [field]: { ...d[field], [lang]: v } }));

  const copyFromAr = () => {
    setDraft((d) => ({
      ...d,
      title: { ...d.title, [lang]: d.title.ar },
      body: { ...d.body, [lang]: d.body.ar },
    }));
  };

  const onPickImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadMediaImage(file);
      patch({ image_url: url });
    } catch (e) {
      flash((e as Error).message);
    }
    setUploading(false);
  };

  const save = async () => {
    if (!draft.title.ar.trim()) {
      flash("العنوان بالعربية مطلوب");
      return;
    }
    setSaving(true);
    try {
      const saved = isNew ? await createMedia(draft) : await updateMedia(draft);
      onSaved(saved, isNew);
    } catch (e) {
      flash((e as Error).message);
    }
    setSaving(false);
  };

  const isRTL = lang === "ar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-black text-primary">
            {isNew ? "إضافة عنصر إعلامي" : "تعديل عنصر إعلامي"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md border border-input bg-background p-1.5 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-5 md:grid-cols-[1fr_320px]">
          {/* Form */}
          <div className="space-y-4">
            {/* Meta */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">النوع</label>
                <select
                  value={draft.type}
                  onChange={(e) => patch({ type: e.target.value as MediaType })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {MEDIA_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {MEDIA_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">
                  الأولوية (الأصغر أولاً)
                </label>
                <input
                  type="number"
                  value={draft.priority}
                  onChange={(e) => patch({ priority: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">
                  يبدأ في
                </label>
                <input
                  type="datetime-local"
                  value={draft.starts_at ? draft.starts_at.slice(0, 16) : ""}
                  onChange={(e) =>
                    patch({ starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">
                  ينتهي في
                </label>
                <input
                  type="datetime-local"
                  value={draft.ends_at ? draft.ends_at.slice(0, 16) : ""}
                  onChange={(e) =>
                    patch({ ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold text-muted-foreground">
                  رابط خارجي (اختياري)
                </label>
                <input
                  value={draft.link_url || ""}
                  onChange={(e) => patch({ link_url: e.target.value })}
                  dir="ltr"
                  placeholder="https://..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="is-active"
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => patch({ is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is-active" className="text-sm font-bold">
                  مفعّل
                </label>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">الصورة</label>
              <div className="flex flex-wrap items-center gap-3">
                {draft.image_url ? (
                  <img
                    src={draft.image_url}
                    alt=""
                    className="h-20 w-32 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-32 place-items-center rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground">
                    لا صورة
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPickImage(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold hover:bg-muted"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {draft.image_url ? "استبدال" : "رفع صورة"}
                </button>
                {draft.image_url && (
                  <button
                    onClick={() => patch({ image_url: "" })}
                    className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Language tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    lang === l
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
              {lang !== "ar" && (
                <button
                  onClick={copyFromAr}
                  className="ms-auto inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs font-bold hover:bg-muted"
                >
                  <Copy className="h-3 w-3" />
                  نسخ من العربية
                </button>
              )}
            </div>

            <div dir={isRTL ? "rtl" : "ltr"} className="space-y-3 rounded-lg border border-border p-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">العنوان</label>
                <input
                  value={draft.title[lang]}
                  onChange={(e) => patchLang("title", e.target.value)}
                  dir={isRTL ? "rtl" : "ltr"}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">النص</label>
                <textarea
                  value={draft.body[lang]}
                  onChange={(e) => patchLang("body", e.target.value)}
                  dir={isRTL ? "rtl" : "ltr"}
                  rows={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-loose"
                />
              </div>
            </div>
          </div>

          {/* Mobile preview */}
          <div>
            <label className="mb-2 block text-xs font-bold text-muted-foreground">
              معاينة الجوال ({LANG_LABELS[lang]})
            </label>
            <div className="rounded-3xl border-8 border-neutral-800 bg-neutral-900 p-2 shadow-xl">
              <div
                dir={isRTL ? "rtl" : "ltr"}
                className="overflow-hidden rounded-2xl bg-background p-3"
              >
                <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                  {draft.image_url && (
                    <img
                      src={draft.image_url}
                      alt=""
                      className="mb-2 h-32 w-full rounded-lg object-cover"
                    />
                  )}
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {MEDIA_TYPE_LABELS[draft.type]}
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm font-black leading-tight">
                    {draft.title[lang] || draft.title.ar || "العنوان"}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {(draft.body[lang] || draft.body.ar || "النص").slice(0, 200)}
                  </p>
                  {draft.link_url && (
                    <a
                      href={draft.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary"
                    >
                      فتح الرابط
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
          >
            إلغاء
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
