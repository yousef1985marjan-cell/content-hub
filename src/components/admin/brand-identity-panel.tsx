import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ImageIcon,
  Sun,
  Moon,
  Monitor,
  Palette,
  Type,
  Sparkles,
  Save,
  Upload,
  Trash2,
  RotateCcw,
  Send,
  Eye,
  Smartphone,
  Tablet,
  Laptop,
  Library,
  Wand2,
} from "lucide-react";
import { LogoManagerPanel } from "./logo-manager-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  COLOR_TOKENS,
  DEFAULT_LIGHT,
  DEFAULT_DARK,
  useBrandIdentity,
  applyPreview,
  clearPreview,
  type BrandIdentity,
  type ColorMap,
  type FontFile,
  type IconOverride,
  type ThemeMode,
} from "@/lib/brand-identity";
import {
  ICON_CATEGORIES,
  iconsByCategory,
  type IconCategoryKey,
  type IconRegistryEntry,
} from "@/lib/icon-registry";
import { IconLibraryModal, LucideRender } from "./icon-library-modal";

type Flash = (m: string) => void;

/* ================= Section wrapper ================= */

function Section({
  title,
  icon: Icon,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      className="rounded-2xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-right transition-colors hover:bg-muted/50"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-foreground">{title}</h3>
          {count && <p className="text-xs text-muted-foreground">{count}</p>}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-border p-4 sm:p-5">{children}</div>}
    </section>
  );
}

/* ================= Save/Publish bar ================= */

function ActionBar({
  dirty,
  onSaveDraft,
  onPublish,
  onReset,
  flash,
  resetLabel = "استعادة الإعدادات الافتراضية",
}: {
  dirty: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onReset: () => void;
  flash: Flash;
  resetLabel?: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
      <button
        onClick={() => { onSaveDraft(); flash("تم حفظ التغييرات"); }}
        disabled={!dirty}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" />
        حفظ التغييرات
      </button>
      <button
        onClick={() => { onSaveDraft(); flash("تم حفظ كمسودة"); }}
        disabled={!dirty}
        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" />
        حفظ كمسودة
      </button>
      <button
        onClick={() => { onPublish(); flash("تم الحفظ والنشر"); }}
        disabled={!dirty}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        حفظ ونشر
      </button>
      <button
        onClick={() => {
          if (confirm(`${resetLabel}؟`)) { onReset(); flash("تمت الاستعادة"); }
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {resetLabel}
      </button>
      {dirty && <span className="text-xs text-amber-600">تعديلات غير محفوظة</span>}
    </div>
  );
}

/* ================= Color editor ================= */

function ColorRow({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback?: string;
  onChange: (v: string) => void;
}) {
  const shown = value || fallback || "";
  const isHex = /^#[0-9a-f]{6}$/i.test(shown);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
      <input
        type="color"
        value={isHex ? shown : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background"
      />
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-xs font-bold text-foreground">{label}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback || "افتراضي"}
          dir="ltr"
          className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}

function ColorEditor({
  value,
  defaults,
  onChange,
}: {
  value: ColorMap;
  defaults: ColorMap;
  onChange: (v: ColorMap) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {COLOR_TOKENS.map((t) => (
        <ColorRow
          key={t.key}
          label={t.label}
          value={value[t.key] || ""}
          fallback={defaults[t.key]}
          onChange={(v) => onChange({ ...value, [t.key]: v })}
        />
      ))}
    </div>
  );
}

/* ================= Live preview iframe ================= */

function LivePreview() {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const width = device === "desktop" ? "100%" : device === "tablet" ? 768 : 375;
  return (
    <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-bold text-muted-foreground">معاينة الموقع</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setDevice("desktop")} className={`grid h-8 w-8 place-items-center rounded-md ${device === "desktop" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`} aria-label="كمبيوتر">
            <Laptop className="h-4 w-4" />
          </button>
          <button onClick={() => setDevice("tablet")} className={`grid h-8 w-8 place-items-center rounded-md ${device === "tablet" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`} aria-label="تابلت">
            <Tablet className="h-4 w-4" />
          </button>
          <button onClick={() => setDevice("mobile")} className={`grid h-8 w-8 place-items-center rounded-md ${device === "mobile" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`} aria-label="جوال">
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex justify-center overflow-hidden rounded-xl border border-border bg-background">
        <iframe src="/" title="معاينة" style={{ width, height: 520 }} className="border-0" />
      </div>
    </div>
  );
}

/* ================= Theme mode section ================= */

function ThemeModeSection({
  mode,
  onChange,
  flash,
}: {
  mode: ThemeMode;
  onChange: (m: ThemeMode) => void;
  flash: Flash;
}) {
  const opts: { key: ThemeMode; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "light", label: "نهاري", Icon: Sun },
    { key: "dark", label: "ليلي", Icon: Moon },
    { key: "auto", label: "تلقائي (حسب الجهاز)", Icon: Monitor },
  ];
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        اختر المظهر الافتراضي للموقع ولوحة التحكم. يُطبَّق فورًا ويُحفظ للجلسات القادمة.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {opts.map((o) => (
          <button
            key={o.key}
            onClick={() => { onChange(o.key); flash(`المظهر: ${o.label}`); }}
            className={`flex items-center gap-3 rounded-xl border p-3 text-right transition-all duration-300 ${
              mode === o.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <o.Icon className="h-5 w-5" />
            <span className="text-sm font-bold">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= Icon row ================= */

function IconRow({
  entry,
  value,
  onChange,
  onRemove,
  onOpenLibrary,
}: {
  entry: IconRegistryEntry;
  value: IconOverride | undefined;
  onChange: (v: IconOverride) => void;
  onRemove: () => void;
  onOpenLibrary: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cur: IconOverride = value ?? { iconId: entry.id };
  const displayName = cur.lucideName || entry.lucideName;

  const readFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const isSvg = f.type === "image/svg+xml";
      onChange({ ...cur, customDataUrl: dataUrl, isMonochrome: isSvg, lucideName: undefined });
    };
    reader.readAsDataURL(f);
  };

  const bgShape = cur.bgShape ?? "rounded";
  const shapeRadius = bgShape === "circle" ? "9999px" : bgShape === "square" ? "0" : `${cur.radius ?? 12}px`;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
      <div className="flex flex-wrap items-start gap-3">
        <div
          className="grid shrink-0 place-items-center text-white"
          style={{
            width: cur.bgSize ?? 44,
            height: cur.bgSize ?? 44,
            background: cur.background || "var(--primary)",
            borderRadius: shapeRadius,
            padding: cur.padding ?? 8,
          }}
        >
          {cur.customDataUrl ? (
            <img src={cur.customDataUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <LucideRender
              name={displayName}
              className="h-full w-full"
              strokeWidth={cur.strokeWidth ?? 2}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-foreground">{entry.arName}</div>
          <div className="text-[11px] text-muted-foreground">{displayName}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            الاستخدام: {entry.usedIn.join("، ")}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/svg+xml,image/png,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readFile(f);
            e.currentTarget.value = "";
          }}
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={onOpenLibrary}
            title="اختيار من مكتبة الأيقونات"
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[11px] font-bold hover:bg-muted"
          >
            <Library className="h-3 w-3" />
            المكتبة
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            title="رفع من الجهاز"
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[11px] font-bold hover:bg-muted"
          >
            <Upload className="h-3 w-3" />
            رفع
          </button>
          <button
            onClick={() => {
              if (confirm(`استعادة أيقونة "${entry.arName}" الافتراضية؟\nمستخدمة في: ${entry.usedIn.join("، ")}`)) onRemove();
            }}
            title="استعادة الافتراضي"
            className="rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ColorRow label="لون نهاري" value={cur.color || ""} onChange={(v) => onChange({ ...cur, color: v })} />
        <ColorRow label="لون ليلي" value={cur.colorDark || ""} onChange={(v) => onChange({ ...cur, colorDark: v })} />
        <ColorRow label="خلفية نهاري" value={cur.background || ""} onChange={(v) => onChange({ ...cur, background: v })} />
        <ColorRow label="خلفية ليلي" value={cur.backgroundDark || ""} onChange={(v) => onChange({ ...cur, backgroundDark: v })} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NumberField label="الحجم (px)" value={cur.size ?? 24} min={12} max={128} onChange={(n) => onChange({ ...cur, size: n })} />
        <NumberField label="السماكة" value={cur.strokeWidth ?? 2} min={1} max={4} step={0.5} onChange={(n) => onChange({ ...cur, strokeWidth: n })} />
        <NumberField label="حجم الخلفية" value={cur.bgSize ?? 44} min={20} max={128} onChange={(n) => onChange({ ...cur, bgSize: n })} />
        <NumberField label="نصف قطر الحواف" value={cur.radius ?? 12} min={0} max={64} onChange={(n) => onChange({ ...cur, radius: n })} />
        <NumberField label="المسافة الداخلية" value={cur.padding ?? 8} min={0} max={32} onChange={(n) => onChange({ ...cur, padding: n })} />
        <div>
          <label className="text-[11px] font-bold text-muted-foreground">شكل الخلفية</label>
          <select
            value={bgShape}
            onChange={(e) => onChange({ ...cur, bgShape: e.target.value as IconOverride["bgShape"] })}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            <option value="rounded">مستطيل بحواف</option>
            <option value="circle">دائري</option>
            <option value="square">مربع</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted-foreground">نطاق التطبيق</label>
          <select
            value={cur.scope ?? "global"}
            onChange={(e) => onChange({ ...cur, scope: e.target.value as IconOverride["scope"] })}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            <option value="global">جميع الأماكن</option>
            <option value="local">هنا فقط</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

/* ================= Icons manager ================= */

function IconsManager({
  overrides,
  onChange,
}: {
  overrides: Record<string, IconOverride>;
  onChange: (o: Record<string, IconOverride>) => void;
}) {
  const [libraryFor, setLibraryFor] = useState<string | null>(null);
  const [openCats, setOpenCats] = useState<Set<IconCategoryKey>>(new Set());

  const toggleCat = (k: IconCategoryKey) => {
    setOpenCats((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        جميع الأيقونات مصنّفة حسب مكان استخدامها. اضغط على القسم لفتحه.
      </p>

      {ICON_CATEGORIES.map((c) => {
        const items = iconsByCategory(c.key);
        if (!items.length) return null;
        const open = openCats.has(c.key);
        const customCount = items.filter((i) => overrides[i.id]).length;
        return (
          <section key={c.key} className="rounded-xl border border-border/60 bg-background overflow-hidden">
            <button
              onClick={() => toggleCat(c.key)}
              className="flex w-full items-center gap-3 p-3 text-right hover:bg-muted/40"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{c.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {items.length} أيقونة{customCount ? ` — ${customCount} مخصصة` : ""}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="grid grid-cols-1 gap-2 border-t border-border p-3 lg:grid-cols-2">
                {items.map((entry) => (
                  <IconRow
                    key={entry.id}
                    entry={entry}
                    value={overrides[entry.id]}
                    onChange={(v) => onChange({ ...overrides, [entry.id]: v })}
                    onRemove={() => {
                      const rest = { ...overrides };
                      delete rest[entry.id];
                      onChange(rest);
                    }}
                    onOpenLibrary={() => setLibraryFor(entry.id)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <IconLibraryModal
        open={libraryFor !== null}
        onClose={() => setLibraryFor(null)}
        onSelect={(name) => {
          if (!libraryFor) return;
          const prev = overrides[libraryFor] ?? { iconId: libraryFor };
          onChange({
            ...overrides,
            [libraryFor]: { ...prev, lucideName: name, customDataUrl: undefined },
          });
        }}
      />
    </div>
  );
}

/* ================= Fonts section ================= */

function FontsEditor({
  draft,
  onChange,
}: {
  draft: BrandIdentity;
  onChange: (patch: Partial<BrandIdentity["fonts"]>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadFont = (file: File) => {
    if (file.size > 500 * 1024) {
      if (!confirm(`الملف كبير (${(file.size / 1024).toFixed(0)} KB). المتابعة؟`)) return;
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["woff2", "woff", "ttf", "otf"].includes(ext)) {
      alert("صيغة غير مدعومة. المدعوم: WOFF2, WOFF, TTF, OTF");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const name = prompt("اسم عائلة الخط:", file.name.replace(/\.[^.]+$/, ""));
      if (!name) return;
      const nf: FontFile = {
        id: crypto.randomUUID(),
        name,
        format: ext as FontFile["format"],
        dataUrl: String(reader.result),
      };
      try {
        const face = new FontFace(name, `url(${nf.dataUrl})`);
        face.load().then((loaded) => (document as unknown as { fonts: FontFaceSet }).fonts.add(loaded));
      } catch { /* no-op */ }
      onChange({ files: [...draft.fonts.files, nf] });
    };
    reader.readAsDataURL(file);
  };

  const removeFont = (id: string) => {
    const f = draft.fonts.files.find((x) => x.id === id);
    if (!f) return;
    const uses: string[] = [];
    (["arabic", "latin", "headings", "body", "buttons"] as const).forEach((k) => {
      if (draft.fonts[k] === f.name) uses.push(k);
    });
    const msg = uses.length
      ? `الخط "${f.name}" مستخدم في: ${uses.join("، ")}. حذفه؟`
      : `حذف الخط "${f.name}"؟`;
    if (!confirm(msg)) return;
    const patch: Partial<BrandIdentity["fonts"]> = {
      files: draft.fonts.files.filter((x) => x.id !== id),
    };
    for (const k of uses) (patch as Record<string, unknown>)[k] = undefined;
    onChange(patch);
  };

  useEffect(() => {
    for (const f of draft.fonts.files) {
      try {
        const face = new FontFace(f.name, `url(${f.dataUrl})`);
        face.load().then((loaded) => (document as unknown as { fonts: FontFaceSet }).fonts.add(loaded));
      } catch { /* no-op */ }
    }
  }, [draft.fonts.files]);

  const familyOptions = draft.fonts.files.map((f) => f.name);

  const familyPicker = (key: keyof BrandIdentity["fonts"], label: string) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <select
        value={(draft.fonts[key] as string) || ""}
        onChange={(e) => onChange({ [key]: e.target.value || undefined } as Partial<BrandIdentity["fonts"]>)}
        className="rounded-md border border-input bg-background px-2 py-2 text-xs"
      >
        <option value="">افتراضي (Tajawal)</option>
        {familyOptions.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept=".woff2,.woff,.ttf,.otf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadFont(f);
          e.currentTarget.value = "";
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">ارفع خطوطًا بصيغة WOFF2 / WOFF / TTF / OTF.</p>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          <Upload className="h-3.5 w-3.5" />
          رفع خط
        </button>
      </div>
      {draft.fonts.files.length > 0 && (
        <div className="space-y-2">
          {draft.fonts.files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-foreground" style={{ fontFamily: `"${f.name}"` }}>{f.name}</div>
                <div className="text-[11px] text-muted-foreground">{f.format.toUpperCase()}</div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground" style={{ fontFamily: `"${f.name}"` }}>
                  معاينة: أبجد هوز — The quick brown fox jumps
                </p>
              </div>
              <button
                onClick={() => removeFont(f.id)}
                className="rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {familyPicker("arabic", "خط عربي")}
        {familyPicker("latin", "خط لاتيني")}
        {familyPicker("headings", "خط العناوين")}
        {familyPicker("body", "خط النصوص")}
        {familyPicker("buttons", "خط الأزرار")}
      </div>
    </div>
  );
}

/* ================= Root panel ================= */

export function BrandIdentityPanel({ flash }: { flash: Flash }) {
  const { draft, published, mode, hydrated, saveDraft, publish, setThemeMode } = useBrandIdentity();
  const [local, setLocal] = useState<BrandIdentity>(draft);

  useEffect(() => { if (hydrated) setLocal(draft); }, [hydrated, draft]);

  useEffect(() => {
    applyPreview(local);
    return () => clearPreview();
  }, [local]);

  const dirty = useMemo(
    () => JSON.stringify(local) !== JSON.stringify(published),
    [local, published],
  );

  const patchColors = (which: "light" | "dark") => (v: ColorMap) =>
    setLocal((l) => ({ ...l, [which]: v }));
  const patchFonts = (fp: Partial<BrandIdentity["fonts"]>) =>
    setLocal((l) => ({ ...l, fonts: { ...l.fonts, ...fp } }));
  const patchIcons = (o: Record<string, IconOverride>) =>
    setLocal((l) => ({ ...l, icons: { overrides: o } }));

  if (!hydrated) return <p className="text-muted-foreground">جاري التحميل...</p>;

  const lightCount = Object.values(local.light).filter(Boolean).length;
  const darkCount = Object.values(local.dark).filter(Boolean).length;
  const iconsCount = Object.keys(local.icons.overrides).length;
  const fontsCount = local.fonts.files.length;

  const commit = (next: BrandIdentity, mode: "draft" | "publish") => {
    if (mode === "publish") publish(next);
    else saveDraft(next);
  };

  return (
    <div data-brand-preview-root className="space-y-4">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-primary">البصمة البصرية</h2>
            <p className="text-xs text-muted-foreground">
              اللوكو، المظهر، الألوان، الأيقونات، والخطوط — في مكان واحد.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <Section title="إدارة اللوكو" icon={ImageIcon}>
        <LogoManagerPanel flash={flash} />
      </Section>

      <Section title="إعدادات المظهر" icon={mode === "dark" ? Moon : mode === "auto" ? Monitor : Sun}>
        <ThemeModeSection mode={mode} onChange={setThemeMode} flash={flash} />
      </Section>

      <Section title="ألوان المظهر النهاري" icon={Sun} count={lightCount ? `${lightCount} لون` : "افتراضي"}>
        <ColorEditor value={local.light} defaults={DEFAULT_LIGHT} onChange={patchColors("light")} />
        <ActionBar
          dirty={dirty}
          onSaveDraft={() => commit(local, "draft")}
          onPublish={() => commit(local, "publish")}
          onReset={() => setLocal((l) => ({ ...l, light: DEFAULT_LIGHT }))}
          resetLabel="استعادة ألوان النهاري"
          flash={flash}
        />
        <LivePreview />
      </Section>

      <Section title="ألوان المظهر الليلي" icon={Moon} count={darkCount ? `${darkCount} لون` : "افتراضي"}>
        <div className="mb-3 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
          يُطبَّق تحت الوضع الليلي فقط، مستقل تمامًا عن ألوان النهاري.
        </div>
        <ColorEditor value={local.dark} defaults={DEFAULT_DARK} onChange={patchColors("dark")} />
        <ActionBar
          dirty={dirty}
          onSaveDraft={() => commit(local, "draft")}
          onPublish={() => commit(local, "publish")}
          onReset={() => setLocal((l) => ({ ...l, dark: DEFAULT_DARK }))}
          resetLabel="استعادة ألوان الليلي"
          flash={flash}
        />
      </Section>

      <Section title="إدارة الأيقونات" icon={Palette} count={iconsCount ? `${iconsCount} أيقونة مخصصة` : "افتراضي"}>
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
          <Wand2 className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            اضغط <b>المكتبة</b> لاختيار أيقونة جاهزة من مكتبة موحّدة، أو <b>رفع</b> ملف SVG/PNG/WebP من الجهاز، أو <b>استعادة</b> الافتراضية.
            لكل أيقونة لون نهاري ولون ليلي مستقل ونطاق تطبيق.
          </p>
        </div>
        <IconsManager overrides={local.icons.overrides} onChange={patchIcons} />
        <ActionBar
          dirty={dirty}
          onSaveDraft={() => commit(local, "draft")}
          onPublish={() => commit(local, "publish")}
          onReset={() => setLocal((l) => ({ ...l, icons: { overrides: {} } }))}
          resetLabel="استعادة جميع الأيقونات"
          flash={flash}
        />
      </Section>

      <Section title="إدارة الخطوط" icon={Type} count={fontsCount ? `${fontsCount} خط` : "افتراضي"}>
        <FontsEditor draft={local} onChange={patchFonts} />
        <ActionBar
          dirty={dirty}
          onSaveDraft={() => commit(local, "draft")}
          onPublish={() => commit(local, "publish")}
          onReset={() => setLocal((l) => ({ ...l, fonts: { files: [] } }))}
          resetLabel="استعادة الخطوط"
          flash={flash}
        />
      </Section>

      <div className="sticky bottom-2 z-10 rounded-2xl border border-border bg-card/95 p-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">
            {dirty ? "تعديلات غير محفوظة" : "لا تعديلات معلقة"}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              onClick={() => setLocal(published)}
              disabled={!dirty}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              تراجع
            </button>
            <button
              onClick={() => { saveDraft(local); flash("تم حفظ المسودة"); }}
              disabled={!dirty}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              حفظ كمسودة
            </button>
            <button
              onClick={() => { publish(local); flash("تم النشر على الموقع"); }}
              disabled={!dirty}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              حفظ ونشر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
