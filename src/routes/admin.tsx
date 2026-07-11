import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink, type CustomIcon, type ExtraLink } from "@/lib/content-store";
import { useMemo, useRef, useState } from "react";
import {
  Trash2,
  Plus,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Search,
  Download,
  Upload,
  Link as LinkIcon,
  Globe,
  Smartphone,
  Apple,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Pencil,
  Save,
  Check,
} from "lucide-react";
import { BRAND_META, BrandIcon, detectBrand, isGeneric, type BrandKey } from "@/lib/brand-icons";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — منصات شفاء" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const sections: { key: "about" | "privacy" | "terms" | "disclaimer" | "publisherIntro"; label: string }[] = [
  { key: "about", label: "من نحن" },
  { key: "privacy", label: "سياسة الخصوصية" },
  { key: "terms", label: "الشروط والأحكام" },
  { key: "disclaimer", label: "إخلاء المسؤولية" },
  { key: "publisherIntro", label: "نص تعريف منصات شفاء" },
];

function Admin() {
  const { state, update, reset, hydrated } = useContent();
  const [activeTab, setActiveTab] = useState<string>("platforms");
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const flash = (msg: string) => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 1800);
  };

  if (!hydrated) {
    return (
      <PageShell title="لوحة التحكم">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="لوحة التحكم" subtitle="أدر محتوى الموقع ومنصات شفاء بصلاحيات كاملة">
      {savedFlash && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg">
          {savedFlash}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("platforms")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "platforms"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
        >
          🚀 روابط المنصات
        </button>
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeTab !== "platforms" ? (
        <TextEditor
          key={activeTab}
          label={sections.find((s) => s.key === activeTab)!.label}
          value={state[activeTab as keyof typeof state] as string}
          onChange={(v) => {
            update({ [activeTab]: v } as never);
            flash("تم الحفظ تلقائياً");
          }}
        />
      ) : (
        <PlatformsEditor
          platforms={state.platforms}
          customIcons={state.customIcons ?? []}
          onChange={(platforms) => {
            update({ platforms });
            flash("تم الحفظ");
          }}
          onChangeIcons={(customIcons) => {
            update({ customIcons });
          }}
          flash={flash}
        />
      )}

      <div className="mt-10 border-t border-border pt-6">
        <button
          onClick={() => {
            if (confirm("سيتم إعادة كل المحتوى إلى الوضع الافتراضي. متابعة؟")) {
              reset();
              flash("تمت إعادة التعيين");
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/20"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة تعيين افتراضي
        </button>
      </div>
    </PageShell>
  );
}

function TextEditor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className="w-full rounded-xl border border-input bg-background p-4 leading-loose focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <p className="mt-2 text-xs text-muted-foreground">التعديلات تُحفظ تلقائياً وتظهر مباشرة في الأقسام.</p>
    </div>
  );
}

function PlatformsEditor({
  platforms,
  customIcons,
  onChange,
  onChangeIcons,
  flash,
}: {
  platforms: PlatformLink[];
  customIcons: CustomIcon[];
  onChange: (p: PlatformLink[]) => void;
  onChangeIcons: (i: CustomIcon[]) => void;
  flash: (m: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patch = (id: string, p: Partial<PlatformLink>) =>
    onChange(platforms.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const add = () => {
    const id = crypto.randomUUID();
    onChange([
      {
        id,
        name: "منصة جديدة",
        url: "https://",
        description: "",
        icon: "",
        androidUrl: "",
        iosUrl: "",
        webUrl: "",
      },
      ...platforms,
    ]);
    setExpanded((e) => ({ ...e, [id]: true }));
  };

  const remove = (id: string) => {
    if (confirm("حذف هذه المنصة؟")) onChange(platforms.filter((it) => it.id !== id));
  };

  const duplicate = (id: string) => {
    const idx = platforms.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const copy: PlatformLink = { ...platforms[idx], id: crypto.randomUUID(), name: platforms[idx].name + " — نسخة" };
    const next = [...platforms];
    next.splice(idx + 1, 0, copy);
    onChange(next);
    flash("تم النسخ");
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = platforms.findIndex((p) => p.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= platforms.length) return;
    const next = [...platforms];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const uploadImage = (id: string, file: File, field: "icon" | "cover") => {
    const max = field === "cover" ? 1024 * 1024 : 500 * 1024;
    if (file.size > max) {
      alert(`حجم الصورة يجب أن يكون أقل من ${field === "cover" ? "1 ميغا" : "500 كيلوبايت"}`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch(id, { [field]: reader.result as string } as Partial<PlatformLink>);
    reader.readAsDataURL(file);
  };
  const uploadIcon = (id: string, file: File) => uploadImage(id, file, "icon");

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(platforms, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shifa-platforms.json";
    a.click();
    URL.revokeObjectURL(url);
    flash("تم التصدير");
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data)) throw new Error("Invalid");
        onChange(data);
        flash("تم الاستيراد");
      } catch {
        alert("ملف غير صالح");
      }
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return platforms;
    return platforms.filter((p) =>
      [p.name, p.description, p.url, p.badge].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [platforms, query]);

  const visibleCount = platforms.filter((p) => !p.hidden).length;
  const featuredCount = platforms.filter((p) => p.featured).length;

  return (
    <div>
      {/* Header stats + actions */}
      <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h3 className="font-black text-lg leading-tight">روابط منصات شفاء</h3>
            <p className="text-xs text-muted-foreground">
              {platforms.length} منصة · {visibleCount} ظاهرة · {featuredCount} مميّزة
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={add}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> منصة جديدة
          </button>
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold hover:bg-muted"
          >
            <Download className="h-4 w-4" /> تصدير
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold hover:bg-muted"
          >
            <Upload className="h-4 w-4" /> استيراد
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث في المنصات..."
          className="w-full rounded-xl border border-input bg-background py-2.5 pr-10 pl-3 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((it, idx) => {
          const realIdx = platforms.findIndex((p) => p.id === it.id);
          const isOpen = expanded[it.id] ?? false;
          return (
            <div
              key={it.id}
              className={`rounded-2xl border bg-card transition-all ${
                it.hidden ? "border-dashed border-muted-foreground/40 opacity-70" : "border-border"
              } ${it.featured ? "ring-1 ring-primary/40" : ""}`}
            >
              {/* Row header */}
              <div className="flex items-center gap-3 p-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => move(it.id, -1)}
                    disabled={realIdx === 0}
                    aria-label="أعلى"
                    className="rounded-md border border-input p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => move(it.id, 1)}
                    disabled={realIdx === platforms.length - 1}
                    aria-label="أسفل"
                    className="rounded-md border border-input p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                {(() => {
                  const brand = (it.brand as BrandKey) || detectBrand(it.url);
                  const generic = brand ? isGeneric(brand) : false;
                  const boxed = !generic || !!it.accent;
                  return (
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl ${boxed ? "ring-1 ring-border" : ""}`}
                      style={boxed ? { background: it.accent || (brand ? BRAND_META[brand].color : "var(--muted)") } : undefined}
                    >
                      {it.icon ? (
                        <img src={it.icon} alt="" className="h-full w-full object-cover" />
                      ) : brand ? (
                        <BrandIcon brand={brand} className={generic && !it.accent ? "h-7 w-7 text-foreground" : "h-6 w-6 text-white"} />
                      ) : (
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  );
                })()}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      value={it.name}
                      onChange={(e) => patch(it.id, { name: e.target.value })}
                      className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 font-bold focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {it.featured && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        مميّزة
                      </span>
                    )}
                    {it.badge && (
                      <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                        {it.badge}
                      </span>
                    )}
                    {(it.extraLinks?.length ?? 0) > 0 && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {it.extraLinks!.length} روابط
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground" dir="ltr">
                    {it.url}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1">
                  <IconBtn
                    title={it.featured ? "إزالة التميّز" : "جعلها مميّزة"}
                    onClick={() => patch(it.id, { featured: !it.featured })}
                    active={it.featured}
                  >
                    {it.featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn
                    title={it.hidden ? "إظهار" : "إخفاء"}
                    onClick={() => patch(it.id, { hidden: !it.hidden })}
                  >
                    {it.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn title="نسخ الرابط" onClick={() => {
                    navigator.clipboard.writeText(it.url);
                    flash("تم نسخ الرابط");
                  }}>
                    <LinkIcon className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn title="تكرار" onClick={() => duplicate(it.id)}>
                    <Copy className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn title="حذف" onClick={() => remove(it.id)} danger>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    title={isOpen ? "طي" : "توسيع"}
                    onClick={() => setExpanded((e) => ({ ...e, [it.id]: !isOpen }))}
                  >
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </IconBtn>
                </div>
              </div>



              {/* Labeled action bar */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-muted/30 px-3 py-2">
                <button
                  onClick={() => setExpanded((e) => ({ ...e, [it.id]: !isOpen }))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" /> {isOpen ? "إغلاق" : "تعديل"}
                </button>
                <button
                  onClick={() => {
                    onChange(platforms);
                    flash("تم الحفظ");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  <Save className="h-3.5 w-3.5" /> حفظ
                </button>
                <button
                  onClick={() => remove(it.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5" /> حذف
                </button>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="space-y-4 border-t border-border p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="shrink-0">
                      <label className="mb-1 block text-xs font-bold text-muted-foreground">الأيقونة</label>
                      {(() => {
                        const brand = (it.brand as BrandKey) || detectBrand(it.url);
                        const generic = brand ? isGeneric(brand) : false;
                        const filled = !it.icon && (it.accent || (brand && !generic));
                        return (
                          <label
                            className="grid h-24 w-24 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-background hover:border-primary cursor-pointer transition-colors"
                            style={filled ? { background: it.accent || BRAND_META[brand!].color, borderStyle: "solid" } : undefined}
                          >
                            {it.icon ? (
                              <img src={it.icon} alt="" className="h-full w-full object-cover" />
                            ) : brand ? (
                              <BrandIcon brand={brand} className={filled ? "h-10 w-10 text-white" : "h-12 w-12 text-foreground"} />
                            ) : (
                              <span className="px-1 text-center text-xs text-muted-foreground">تحميل أيقونة</span>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadIcon(it.id, f);
                              }}
                            />
                          </label>
                        );
                      })()}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {it.icon ? "صورة مخصّصة" : "الأيقونة الافتراضية — ارفع صورة لاستبدالها"}
                      </p>
                      {it.icon && (
                        <div className="mt-2 flex gap-1">
                          <button
                            onClick={() => patch(it.id, { icon: "" })}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 className="h-3 w-3" /> حذف الأيقونة
                          </button>
                        </div>
                      )}
                      {it.brand && !it.icon && (
                        <button
                          onClick={() => patch(it.id, { brand: "" })}
                          className="mt-2 w-full text-center text-xs text-destructive hover:underline"
                        >
                          إزالة أيقونة المنصة
                        </button>
                      )}
                    </div>

                    <div className="shrink-0">
                      <label className="mb-1 block text-xs font-bold text-muted-foreground">صورة الغلاف</label>
                      <label className="grid h-24 w-40 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-background hover:border-primary cursor-pointer transition-colors">
                        {it.cover ? (
                          <img src={it.cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex flex-col items-center gap-1 px-1 text-center text-xs text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            تحميل صورة التطبيق
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadImage(it.id, f, "cover");
                          }}
                        />
                      </label>
                      {it.cover && (
                        <button
                          onClick={() => patch(it.id, { cover: "" })}
                          className="mt-1 w-full text-center text-xs text-destructive hover:underline"
                        >
                          إزالة
                        </button>
                      )}
                    </div>

                    <div className="grid min-w-[240px] flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                      <Field label="الوصف">
                        <input
                          value={it.description ?? ""}
                          onChange={(e) => patch(it.id, { description: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </Field>
                      <Field label="شارة (مثل: جديد)">
                        <input
                          value={it.badge ?? ""}
                          onChange={(e) => patch(it.id, { badge: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </Field>
                      <Field label="الرابط الرئيسي">
                        <input
                          dir="ltr"
                          value={it.url}
                          onChange={(e) => patch(it.id, { url: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </Field>
                      <Field label="نوع المنصة / الأيقونة">
                        <BrandPicker
                          value={(it.brand as BrandKey) || ""}
                          detected={detectBrand(it.url)}
                          currentIcon={it.icon}
                          customIcons={customIcons}
                          onChange={(b) => patch(it.id, { brand: b })}
                          onPickCustomIcon={(dataUrl) => patch(it.id, { icon: dataUrl, brand: "" })}
                          onClearIcon={() => patch(it.id, { icon: "" })}
                          onChangeIcons={onChangeIcons}
                          flash={flash}
                        />
                      </Field>
                      <Field label="لون الخلفية (اختياري)">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                typeof it.accent === "string" && it.accent.startsWith("#")
                                  ? it.accent
                                  : "#14B8A6"
                              }
                              onChange={(e) => patch(it.id, { accent: e.target.value })}
                              className="h-10 w-14 cursor-pointer rounded-md border border-input"
                            />
                            <input
                              dir="ltr"
                              value={it.accent ?? ""}
                              onChange={(e) => patch(it.id, { accent: e.target.value })}
                              placeholder="#14B8A6"
                              className="w-28 rounded-lg border border-input bg-background px-2 py-1.5 text-left text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {it.accent && (
                              <button
                                onClick={() => patch(it.id, { accent: "" })}
                                className="text-xs text-destructive hover:underline"
                              >
                                إعادة
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {COLOR_PRESETS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                aria-label={c}
                                onClick={() => patch(it.id, { accent: c })}
                                className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
                                  it.accent === c ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "border-input"
                                }`}
                                style={{ background: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </Field>
                    </div>
                  </div>


                  <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 md:grid-cols-3">
                    <Field label={<><Globe className="inline h-3.5 w-3.5" /> موقع الويب</>}>
                      <input
                        dir="ltr"
                        placeholder="https://..."
                        value={it.webUrl ?? ""}
                        onChange={(e) => patch(it.id, { webUrl: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </Field>
                    <Field label={<><Smartphone className="inline h-3.5 w-3.5" /> أندرويد</>}>
                      <input
                        dir="ltr"
                        placeholder="https://play.google.com/..."
                        value={it.androidUrl ?? ""}
                        onChange={(e) => patch(it.id, { androidUrl: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </Field>
                    <Field label={<><Apple className="inline h-3.5 w-3.5" /> آيفون</>}>
                      <input
                        dir="ltr"
                        placeholder="https://apps.apple.com/..."
                        value={it.iosUrl ?? ""}
                        onChange={(e) => patch(it.id, { iosUrl: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </Field>
                  </div>

                  <ExtraLinksEditor
                    platform={it}
                    onChange={(extraLinks) => patch(it.id, { extraLinks })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            {platforms.length === 0 ? "لا توجد منصات — ابدأ بإضافة واحدة." : "لا نتائج مطابقة."}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        جميع التعديلات تُحفظ تلقائياً وتظهر مباشرة في صفحة "منصات شفاء".
      </p>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
        danger
          ? "border-destructive/30 text-destructive hover:bg-destructive/10"
          : active
            ? "border-primary bg-primary/10 text-primary"
            : "border-input text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function autoThumb(url: string): string {
  if (!url || !/^https?:\/\//i.test(url)) return "";
  return `https://image.thum.io/get/width/600/crop/400/${url}`;
}

function ExtraLinksEditor({
  platform,
  onChange,
}: {
  platform: PlatformLink;
  onChange: (links: ExtraLink[]) => void;
}) {
  const links = platform.extraLinks ?? [];

  const add = () => {
    onChange([
      ...links,
      { id: crypto.randomUUID(), title: "رابط جديد", url: "https://", thumbnail: "" },
    ]);
  };
  const patch = (id: string, p: Partial<ExtraLink>) =>
    onChange(links.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const remove = (id: string) => onChange(links.filter((l) => l.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const idx = links.findIndex((l) => l.id === id);
    const t = idx + dir;
    if (idx < 0 || t < 0 || t >= links.length) return;
    const next = [...links];
    [next[idx], next[t]] = [next[t], next[idx]];
    onChange(next);
  };
  const upload = (id: string, file: File) => {
    if (file.size > 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 1 ميغا");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch(id, { thumbnail: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="flex items-center gap-2 text-base font-black text-primary">
            <LinkIcon className="h-4 w-4" />
            روابط متعددة داخل «{platform.name}»
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
              {links.length}
            </span>
          </h4>
          <p className="mt-1 text-[11px] text-muted-foreground">
            أضِف عدة روابط لهذه المنصة — كل رابط له اسم وصورة مصغّرة تظهر تلقائياً من واجهة الموقع.
          </p>
        </div>
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> إضافة رابط
        </button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
          لا روابط إضافية بعد.
        </p>
      ) : (
        <div className="space-y-3">
          {links.map((l, idx) => {
            const thumb = l.thumbnail || autoThumb(l.url);
            return (
              <div key={l.id} className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-background p-3">
                <label className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-input bg-muted/40 hover:border-primary cursor-pointer">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                    />
                  ) : (
                    <span className="px-1 text-center text-[10px] text-muted-foreground">صورة مصغّرة</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) upload(l.id, f);
                    }}
                  />
                </label>
                <div className="min-w-[200px] flex-1 space-y-2">
                  <input
                    value={l.title}
                    onChange={(e) => patch(l.id, { title: e.target.value })}
                    placeholder="اسم الرابط"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    dir="ltr"
                    value={l.url}
                    onChange={(e) => patch(l.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-left text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    الصورة المصغّرة تُلتقط تلقائياً من صفحة الرابط، أو يمكنك رفع صورة مخصّصة.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => move(l.id, -1)}
                    disabled={idx === 0}
                    aria-label="أعلى"
                    className="rounded-md border border-input p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => move(l.id, 1)}
                    disabled={idx === links.length - 1}
                    aria-label="أسفل"
                    className="rounded-md border border-input p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  {l.thumbnail && (
                    <button
                      onClick={() => patch(l.id, { thumbnail: "" })}
                      title="إعادة الصورة التلقائية"
                      className="rounded-md border border-input p-1 text-[10px] hover:bg-muted"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(l.id)}
                    aria-label="حذف"
                    className="rounded-md border border-destructive/30 p-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BRAND_OPTIONS: { key: BrandKey | ""; label: string }[] = [
  { key: "", label: "تلقائي" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "X / Twitter" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "telegram", label: "Telegram" },
  { key: "snapchat", label: "Snapchat" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "android", label: "Android" },
  { key: "apple", label: "iOS" },
  { key: "web", label: "موقع ويب" },
  { key: "link", label: "رابط" },
  { key: "mail", label: "بريد" },
  { key: "phone", label: "هاتف" },
  { key: "chat", label: "محادثة" },
  { key: "shop", label: "متجر" },
  { key: "music", label: "موسيقى" },
  { key: "video", label: "فيديو" },
  { key: "star", label: "نجمة" },
  { key: "heart", label: "قلب" },
  { key: "news", label: "أخبار" },
  { key: "map", label: "خريطة" },
  { key: "camera", label: "كاميرا" },
  { key: "download", label: "تحميل" },
  { key: "share", label: "مشاركة" },
  { key: "home", label: "الرئيسية" },
  { key: "user", label: "مستخدم" },
  { key: "users", label: "مستخدمون" },
  { key: "settings", label: "إعدادات" },
  { key: "bell", label: "تنبيه" },
  { key: "calendar", label: "تقويم" },
  { key: "clock", label: "ساعة" },
  { key: "search", label: "بحث" },
  { key: "edit", label: "تعديل" },
  { key: "trash", label: "حذف" },
  { key: "plus", label: "إضافة" },
  { key: "check", label: "تم" },
  { key: "cloud", label: "سحابة" },
  { key: "folder", label: "مجلد" },
  { key: "file", label: "ملف" },
  { key: "image", label: "صورة" },
  { key: "book", label: "كتاب" },
  { key: "gift", label: "هدية" },
  { key: "flag", label: "علم" },
  { key: "tag", label: "وسم" },
  { key: "sun", label: "شمس" },
  { key: "moon", label: "قمر" },
  { key: "lock", label: "قفل" },
  { key: "bookmark", label: "علامة" },
  { key: "rocket", label: "صاروخ" },
  { key: "coffee", label: "قهوة" },
  { key: "wifi", label: "واي فاي" },
  { key: "mic", label: "ميكروفون" },
  { key: "zap", label: "طاقة" },
  { key: "trophy", label: "كأس" },
  { key: "target", label: "هدف" },
  { key: "compass", label: "بوصلة" },
  { key: "wallet", label: "محفظة" },
  { key: "chart", label: "رسم بياني" },
  // social media (generic)
  { key: "facebookAlt", label: "فيسبوك" },
  { key: "youtubeAlt", label: "يوتيوب" },
  { key: "tiktokAlt", label: "تيك توك" },
  { key: "instagramAlt", label: "إنستغرام" },
  { key: "twitterAlt", label: "تويتر / إكس" },
  { key: "whatsappAlt", label: "واتساب" },
  { key: "telegramAlt", label: "تلغرام" },
  { key: "snapchatAlt", label: "سناب شات" },
  { key: "linkedinAlt", label: "لينكد إن" },
  { key: "messenger", label: "ماسنجر" },
  { key: "pinterest", label: "بينتيرست" },
  { key: "reddit", label: "ريديت" },
  { key: "discord", label: "ديسكورد" },
  { key: "twitch", label: "تويتش" },
  { key: "spotify", label: "سبوتيفاي" },
  { key: "soundcloud", label: "ساوند كلاود" },
  { key: "vimeo", label: "فيميو" },
  { key: "tumblr", label: "تمبلر" },
  { key: "github", label: "جيت هاب" },
  { key: "medium", label: "ميديوم" },
  // متاجر التطبيقات ومنصات التحميل
  { key: "playstore", label: "Google Play" },
  { key: "appstore", label: "App Store" },
  { key: "appgallery", label: "AppGallery (هواوي)" },
  { key: "galaxystore", label: "Galaxy Store (سامسونج)" },
  { key: "amazonAppstore", label: "Amazon Appstore" },
  { key: "microsoftStore", label: "Microsoft Store" },
  { key: "macAppstore", label: "Mac App Store" },
  { key: "steam", label: "Steam" },
  { key: "epicgames", label: "Epic Games" },
  { key: "windows", label: "Windows" },
  { key: "macos", label: "macOS" },
  { key: "linux", label: "Linux" },
  { key: "huawei", label: "Huawei" },
  { key: "xbox", label: "Xbox" },
  { key: "playstation", label: "PlayStation" },
  // مراسلة واتصال
  { key: "threads", label: "Threads" },
  { key: "wechat", label: "WeChat" },
  { key: "line", label: "LINE" },
  { key: "kakao", label: "KakaoTalk" },
  { key: "viber", label: "Viber" },
  { key: "signal", label: "Signal" },
  { key: "skype", label: "Skype" },
  { key: "zoom", label: "Zoom" },
  { key: "teams", label: "Microsoft Teams" },
  { key: "slack", label: "Slack" },
  { key: "gmail", label: "Gmail" },
  { key: "outlook", label: "Outlook" },
  { key: "threema", label: "Threema" },
  // إنتاجية وسحابة
  { key: "drive", label: "Google Drive" },
  { key: "dropbox", label: "Dropbox" },
  { key: "onedrive", label: "OneDrive" },
  { key: "icloud", label: "iCloud" },
  { key: "notion", label: "Notion" },
  { key: "figma", label: "Figma" },
  { key: "behance", label: "Behance" },
  { key: "dribbble", label: "Dribbble" },
  // بث ووسائط
  { key: "netflix", label: "Netflix" },
  { key: "shahid", label: "Shahid" },
  { key: "anghami", label: "Anghami" },
  { key: "applemusic", label: "Apple Music" },
  { key: "spotifyBrand", label: "Spotify" },
  { key: "primevideo", label: "Prime Video" },
  { key: "disneyplus", label: "Disney+" },
  // سوشيال إضافية
  { key: "quora", label: "Quora" },
  { key: "mastodon", label: "Mastodon" },
  { key: "bluesky", label: "Bluesky" },
];

const COLOR_PRESETS = [
  "#14B8A6", "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444",
  "#F97316", "#EAB308", "#22C55E", "#0EA5E9", "#0F172A",
];

function BrandPicker({
  value,
  detected,
  onChange,
  currentIcon,
  customIcons,
  onPickCustomIcon,
  onClearIcon,
  onChangeIcons,
  flash,
}: {
  value: BrandKey | "";
  detected: BrandKey | null;
  onChange: (b: string) => void;
  currentIcon?: string;
  customIcons: CustomIcon[];
  onPickCustomIcon: (dataUrl: string) => void;
  onClearIcon: () => void;
  onChangeIcons: (i: CustomIcon[]) => void;
  flash: (m: string) => void;
}) {
  const addIcons = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, 20);
    Promise.all(
      list.map(
        (f) =>
          new Promise<CustomIcon | null>((resolve) => {
            if (f.size > 500 * 1024) {
              alert(`${f.name}: يجب أن يكون أقل من 500 كيلوبايت`);
              resolve(null);
              return;
            }
            const r = new FileReader();
            r.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                name: f.name.replace(/\.[^.]+$/, ""),
                dataUrl: r.result as string,
              });
            r.onerror = () => resolve(null);
            r.readAsDataURL(f);
          })
      )
    ).then((results) => {
      const ok = results.filter((r): r is CustomIcon => r !== null);
      if (ok.length) {
        onChangeIcons([...ok, ...customIcons]);
        flash(`تمت إضافة ${ok.length} أيقونة`);
      }
    });
  };
  const removeIcon = (id: string) => {
    if (confirm("حذف هذه الأيقونة من المكتبة؟")) {
      onChangeIcons(customIcons.filter((i) => i.id !== id));
    }
  };
  const effective = (value || detected) as BrandKey | null;
  const brands = BRAND_OPTIONS.filter((o) => o.key !== "") as { key: BrandKey; label: string }[];
  const brandBrands = brands.filter((b) => !isGeneric(b.key));
  const genericBrands = brands.filter((b) => isGeneric(b.key));
  const effGeneric = effective ? isGeneric(effective) : false;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background/60 p-2">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={effGeneric ? undefined : { background: effective ? BRAND_META[effective].color : "var(--muted)" }}
        >
          {effective ? (
            <BrandIcon brand={effective} className={effGeneric ? "h-6 w-6 text-foreground" : "h-5 w-5 text-white"} />
          ) : (
            <span className="text-xs text-muted-foreground">؟</span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <div className="font-bold">
            {effective ? BRAND_META[effective].label : "بدون أيقونة"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {value ? "أيقونة مختارة يدوياً" : detected ? `تلقائي: ${BRAND_META[detected].label}` : "اختر أيقونة من الأسفل"}
          </div>
        </div>
        {value && (
          <button
            onClick={() => onChange("")}
            className="rounded-md border border-input px-2 py-1 text-[10px] font-bold hover:bg-muted"
          >
            تلقائي
          </button>
        )}
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-bold text-muted-foreground">أيقونات المنصات</div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {brandBrands.map((b) => {
            const selected = value === b.key;
            return (
              <button
                key={b.key}
                type="button"
                title={b.label}
                aria-label={b.label}
                onClick={() => onChange(b.key)}
                className={`grid aspect-square place-items-center rounded-lg border text-white transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "border-input"
                }`}
                style={{ background: BRAND_META[b.key].color }}
              >
                <BrandIcon brand={b.key} className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-bold text-muted-foreground">أيقونات عامة ({genericBrands.length})</div>
        <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
          {genericBrands.map((b) => {
            const selected = value === b.key;
            return (
              <button
                key={b.key}
                type="button"
                title={b.label}
                aria-label={b.label}
                onClick={() => onChange(b.key)}
                className={`grid aspect-square place-items-center rounded-lg border border-input bg-background text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary ${
                  selected ? "border-primary text-primary ring-2 ring-primary/40" : ""
                }`}
              >
                <BrandIcon brand={b.key} className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <div className="text-[10px] font-bold text-muted-foreground">
            مكتبة أيقوناتي ({customIcons.length})
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[10px] font-bold hover:bg-muted">
            <Upload className="h-3 w-3" /> رفع أيقونات
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addIcons(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {customIcons.length === 0 ? (
          <label className="grid cursor-pointer place-items-center rounded-lg border-2 border-dashed border-input bg-background/50 px-3 py-4 text-center text-[11px] text-muted-foreground hover:border-primary hover:text-primary">
            اسحب أو ارفع صور PNG/SVG (حتى 500KB لكل واحدة)
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addIcons(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {customIcons.map((ic) => {
              const selected = currentIcon === ic.dataUrl;
              return (
                <div key={ic.id} className="group relative flex flex-col gap-1">
                  <button
                    type="button"
                    title={ic.name}
                    aria-label={ic.name}
                    onClick={() => onPickCustomIcon(ic.dataUrl)}
                    className={`grid aspect-square w-full place-items-center overflow-hidden rounded-lg border bg-background p-1 transition-all hover:-translate-y-0.5 hover:border-primary ${
                      selected ? "border-primary ring-2 ring-primary/40" : "border-input"
                    }`}
                  >
                    <img src={ic.dataUrl} alt={ic.name} className="h-full w-full object-contain" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeIcon(ic.id)}
                    title="حذف من المكتبة"
                    aria-label="حذف من المكتبة"
                    className="inline-flex items-center justify-center gap-0.5 rounded-md bg-destructive/10 py-1 text-[10px] font-bold text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3 w-3" /> حذف
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {currentIcon && (
          <button
            type="button"
            onClick={onClearIcon}
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-destructive hover:underline"
          >
            <Trash2 className="h-3 w-3" /> إزالة الأيقونة المخصّصة من هذه المنصة
          </button>
        )}
      </div>
    </div>
  );
}
