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
} from "lucide-react";
import { LogoManagerPanel } from "./logo-manager-panel";
import {
  COLOR_TOKENS,
  useBrandIdentity,
  applyPreview,
  clearPreview,
  type BrandIdentity,
  type ColorTokenKey,
  type ColorMap,
  type FontFile,
  type IconOverride,
  type ThemeMode,
} from "@/lib/brand-identity";
import { BRAND_META, BrandIcon, type BrandKey } from "@/lib/brand-icons";

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
}: {
  dirty: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onReset: () => void;
  flash: Flash;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
      <button
        onClick={() => {
          onSaveDraft();
          flash("تم حفظ التغييرات كمسودة");
        }}
        disabled={!dirty}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" />
        حفظ كمسودة
      </button>
      <button
        onClick={() => {
          onPublish();
          flash("تم الحفظ والنشر على الموقع");
        }}
        disabled={!dirty}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        حفظ ونشر
      </button>
      <button
        onClick={() => {
          if (confirm("استعادة الإعدادات الافتراضية؟")) {
            onReset();
            flash("تمت استعادة الإعدادات الافتراضية");
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        استعادة الافتراضي
      </button>
      {dirty && <span className="text-xs text-amber-600">لديك تعديلات غير محفوظة</span>}
    </div>
  );
}

/* ================= Color editor ================= */

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const shown = value || "";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(shown) ? shown : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background"
      />
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-xs font-bold text-foreground">{label}</div>
        <input
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          placeholder="افتراضي"
          dir="ltr"
          className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      {shown && (
        <button
          onClick={() => onChange("")}
          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="استعادة"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ColorEditor({
  value,
  onChange,
}: {
  value: ColorMap;
  onChange: (v: ColorMap) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {COLOR_TOKENS.map((t) => (
        <ColorRow
          key={t.key}
          label={t.label}
          value={value[t.key] || ""}
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
          <button
            onClick={() => setDevice("desktop")}
            className={`grid h-8 w-8 place-items-center rounded-md ${device === "desktop" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
            aria-label="كمبيوتر"
          >
            <Laptop className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`grid h-8 w-8 place-items-center rounded-md ${device === "tablet" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
            aria-label="تابلت"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`grid h-8 w-8 place-items-center rounded-md ${device === "mobile" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
            aria-label="جوال"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex justify-center overflow-hidden rounded-xl border border-border bg-background">
        <iframe
          src="/"
          title="معاينة"
          style={{ width, height: 520 }}
          className="border-0"
        />
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
        اختر المظهر الافتراضي للموقع ولوحة التحكم. يتم تطبيقه فورًا.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {opts.map((o) => (
          <button
            key={o.key}
            onClick={() => {
              onChange(o.key);
              flash(`المظهر: ${o.label}`);
            }}
            className={`flex items-center gap-3 rounded-xl border p-3 text-right transition-all ${
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

/* ================= Icons section ================= */

const ICON_BRANDS: BrandKey[] = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "twitter",
  "whatsapp",
  "telegram",
  "snapchat",
  "linkedin",
  "android",
  "apple",
  "web",
  "mail",
  "phone",
];

function IconRow({
  brand,
  value,
  onChange,
  onRemove,
}: {
  brand: BrandKey;
  value: IconOverride | undefined;
  onChange: (v: IconOverride) => void;
  onRemove: () => void;
}) {
  const meta = BRAND_META[brand];
  const fileRef = useRef<HTMLInputElement>(null);
  const cur: IconOverride = value ?? { brand };
  const readFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange({ ...cur, customDataUrl: String(reader.result) });
    reader.readAsDataURL(f);
  };
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
      <div className="flex items-center gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: cur.background || meta.color }}
        >
          {cur.customDataUrl ? (
            <img src={cur.customDataUrl} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <BrandIcon brand={brand} className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-foreground">{meta.label}</div>
          <div className="text-[11px] text-muted-foreground">{brand}</div>
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
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[11px] font-bold hover:bg-muted"
        >
          <Upload className="h-3 w-3" />
          استبدال
        </button>
        {(cur.customDataUrl || cur.color || cur.colorDark || cur.background) && (
          <button
            onClick={() => {
              if (confirm(`استعادة أيقونة ${meta.label} الافتراضية؟`)) onRemove();
            }}
            className="rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ColorRow label="لون نهاري" value={cur.color || ""} onChange={(v) => onChange({ ...cur, color: v })} />
        <ColorRow label="لون ليلي" value={cur.colorDark || ""} onChange={(v) => onChange({ ...cur, colorDark: v })} />
        <ColorRow label="خلفية" value={cur.background || ""} onChange={(v) => onChange({ ...cur, background: v })} />
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-foreground">الحجم (px)</div>
            <input
              type="number"
              min={12}
              max={128}
              value={cur.size ?? 24}
              onChange={(e) => onChange({ ...cur, size: Number(e.target.value) || 24 })}
              className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-foreground">السماكة</div>
            <input
              type="number"
              min={1}
              max={4}
              step={0.5}
              value={cur.strokeWidth ?? 2}
              onChange={(e) => onChange({ ...cur, strokeWidth: Number(e.target.value) || 2 })}
              className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
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
      // Register live so preview works
      try {
        const face = new FontFace(name, `url(${nf.dataUrl})`);
        face.load().then((loaded) => (document as unknown as { fonts: FontFaceSet }).fonts.add(loaded));
      } catch {
        /* no-op */
      }
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

  // Auto register uploaded fonts on mount for previewing
  useEffect(() => {
    for (const f of draft.fonts.files) {
      try {
        const face = new FontFace(f.name, `url(${f.dataUrl})`);
        face.load().then((loaded) => (document as unknown as { fonts: FontFaceSet }).fonts.add(loaded));
      } catch {
        /* no-op */
      }
    }
  }, [draft.fonts.files]);

  const familyOptions = draft.fonts.files.map((f) => f.name);

  const familyPicker = (key: keyof BrandIdentity["fonts"], label: string) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <select
        value={(draft.fonts[key] as string) || ""}
        onChange={(e) => onChange({ [key]: e.target.value || undefined } as Partial<BrandIdentity["fonts"]>)}
        className="rounded-md border border-input bg-background px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">افتراضي (Tajawal)</option>
        {familyOptions.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadFont(f);
          e.currentTarget.value = "";
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          ارفع خطوطًا بصيغة WOFF2 / WOFF / TTF / OTF. تُحفظ محليًا للمعاينة والنشر.
        </p>
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
                <div className="text-sm font-bold text-foreground" style={{ fontFamily: `"${f.name}"` }}>
                  {f.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{f.format.toUpperCase()}</div>
                <p
                  className="mt-1 line-clamp-1 text-xs text-muted-foreground"
                  style={{ fontFamily: `"${f.name}"` }}
                >
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground">الوزن</label>
          <input
            type="number"
            min={100}
            max={900}
            step={100}
            value={draft.fonts.weight ?? 400}
            onChange={(e) => onChange({ weight: Number(e.target.value) || 400 })}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground">الحجم (px)</label>
          <input
            type="number"
            min={12}
            max={24}
            value={draft.fonts.size ?? 16}
            onChange={(e) => onChange({ size: Number(e.target.value) || 16 })}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground">ارتفاع السطر</label>
          <input
            type="number"
            min={1}
            max={2.5}
            step={0.05}
            value={draft.fonts.lineHeight ?? 1.6}
            onChange={(e) => onChange({ lineHeight: Number(e.target.value) || 1.6 })}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground">تباعد الحروف (em)</label>
          <input
            type="number"
            min={-0.05}
            max={0.2}
            step={0.005}
            value={draft.fonts.letterSpacing ?? 0}
            onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          />
        </div>
      </div>
    </div>
  );
}

/* ================= Root panel ================= */

export function BrandIdentityPanel({ flash }: { flash: Flash }) {
  const { draft, published, mode, hydrated, saveDraft, publish, setThemeMode, reset } = useBrandIdentity();
  const [local, setLocal] = useState<BrandIdentity>(draft);

  // sync when hydrated / external update
  useEffect(() => {
    if (hydrated) setLocal(draft);
  }, [hydrated, draft]);

  // Apply preview whenever local changes
  useEffect(() => {
    applyPreview(local);
    return () => clearPreview();
  }, [local]);

  const dirty = useMemo(
    () => JSON.stringify(local) !== JSON.stringify(published),
    [local, published],
  );

  const patch = (p: Partial<BrandIdentity>) => setLocal((l) => ({ ...l, ...p }));
  const patchColors = (which: "light" | "dark") => (v: ColorMap) =>
    setLocal((l) => ({ ...l, [which]: v }));
  const patchFonts = (fp: Partial<BrandIdentity["fonts"]>) =>
    setLocal((l) => ({ ...l, fonts: { ...l.fonts, ...fp } }));
  const patchIcon = (brand: BrandKey, o: IconOverride) =>
    setLocal((l) => ({
      ...l,
      icons: { overrides: { ...l.icons.overrides, [brand]: o } },
    }));
  const removeIcon = (brand: BrandKey) =>
    setLocal((l) => {
      const rest = { ...l.icons.overrides };
      delete rest[brand];
      return { ...l, icons: { overrides: rest } };
    });

  if (!hydrated) {
    return <p className="text-muted-foreground">جاري التحميل...</p>;
  }

  const lightCount = Object.values(local.light).filter(Boolean).length;
  const darkCount = Object.values(local.dark).filter(Boolean).length;
  const iconsCount = Object.keys(local.icons.overrides).length;
  const fontsCount = local.fonts.files.length;

  const actionBar = (
    <ActionBar
      dirty={dirty}
      onSaveDraft={() => saveDraft(local)}
      onPublish={() => publish(local)}
      onReset={() => {
        reset();
        flash("");
      }}
      flash={flash}
    />
  );

  return (
    <div data-brand-preview-root className="space-y-4">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-primary">البصمة البصرية</h2>
            <p className="text-xs text-muted-foreground">
              اللوكو، المظهر النهاري والليلي، الألوان، الأيقونات، والخطوط — في مكان واحد.
            </p>
          </div>
        </div>
      </div>

      <Section title="إدارة اللوكو" icon={ImageIcon}>
        <LogoManagerPanel flash={flash} />
      </Section>

      <Section title="إعدادات المظهر" icon={mode === "dark" ? Moon : Sun}>
        <ThemeModeSection mode={mode} onChange={setThemeMode} flash={flash} />
      </Section>

      <Section
        title="ألوان المظهر النهاري"
        icon={Sun}
        count={lightCount ? `${lightCount} لون مخصص` : "افتراضي"}
      >
        <ColorEditor value={local.light} onChange={patchColors("light")} />
        {actionBar}
        <LivePreview />
      </Section>

      <Section
        title="ألوان المظهر الليلي"
        icon={Moon}
        count={darkCount ? `${darkCount} لون مخصص` : "افتراضي"}
      >
        <div className="mb-3 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
          يُطبَّق تحت الوضع الليلي فقط (بدون نسخ من النهاري).
        </div>
        <ColorEditor value={local.dark} onChange={patchColors("dark")} />
        {actionBar}
      </Section>

      <Section
        title="إدارة الأيقونات"
        icon={Palette}
        count={iconsCount ? `${iconsCount} أيقونة مخصصة` : "افتراضي"}
      >
        <p className="mb-3 text-xs text-muted-foreground">
          استبدال الأيقونة، تخصيص لونها ليلًا/نهارًا، أو رفع أيقونة SVG/PNG.
        </p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {ICON_BRANDS.map((b) => (
            <IconRow
              key={b}
              brand={b}
              value={local.icons.overrides[b]}
              onChange={(v) => patchIcon(b, v)}
              onRemove={() => removeIcon(b)}
            />
          ))}
        </div>
        {actionBar}
      </Section>

      <Section title="إدارة الخطوط" icon={Type} count={fontsCount ? `${fontsCount} خط` : "افتراضي"}>
        <FontsEditor draft={local} onChange={patchFonts} />
        {actionBar}
      </Section>

      {/* Sticky footer summary */}
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
              onClick={() => {
                saveDraft(local);
                flash("تم حفظ المسودة");
              }}
              disabled={!dirty}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              حفظ كمسودة
            </button>
            <button
              onClick={() => {
                publish(local);
                flash("تم النشر على الموقع");
              }}
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
