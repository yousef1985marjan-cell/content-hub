import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Save, Eraser, Plus, Pencil, ImageIcon, Radio, RadioTower } from "lucide-react";
import { LOGO_STORAGE_KEY, LOGO_UPDATED_EVENT } from "@/lib/use-published-logo";

type LogoCard = {
  id: string;
  label: string;
  /** currently persisted image (data URL) */
  saved: string;
  /** in-memory draft not yet saved */
  draft: string;
  /** if true, this logo is broadcast to the site section matching `id` */
  published: boolean;
  /** display width in px */
  width: number;
  /** display height in px */
  height: number;
};

type StoredCard = Omit<LogoCard, "draft">;

const DEFAULT_SIZES: Record<string, { width: number; height: number }> = {
  "app-default": { width: 96, height: 96 },
  welcome: { width: 80, height: 80 },
  header: { width: 36, height: 36 },
  menu: { width: 40, height: 40 },
  dashboard: { width: 50, height: 50 },
};

const DEFAULT_CARDS: StoredCard[] = [
  { id: "app-default", label: "الصورة الافتراضية للتطبيق", saved: "", published: false, ...DEFAULT_SIZES["app-default"] },
  { id: "welcome", label: "لوكو بطاقة الترحيب", saved: "", published: false, ...DEFAULT_SIZES.welcome },
  { id: "header", label: "لوكو الهيدر", saved: "", published: false, ...DEFAULT_SIZES.header },
  { id: "menu", label: "لوكو القائمة", saved: "", published: false, ...DEFAULT_SIZES.menu },
  { id: "dashboard", label: "لوكو لوحة التحكم", saved: "", published: false, ...DEFAULT_SIZES.dashboard },
];

function readStore(): StoredCard[] {
  if (typeof window === "undefined") return DEFAULT_CARDS;
  try {
    const raw = window.localStorage.getItem(LOGO_STORAGE_KEY);
    if (!raw) return DEFAULT_CARDS;
    const parsed = JSON.parse(raw) as Partial<StoredCard>[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CARDS;
    return parsed.map((c) => {
      const id = String(c.id ?? crypto.randomUUID());
      const def = DEFAULT_SIZES[id] ?? { width: 40, height: 40 };
      return {
        id,
        label: String(c.label ?? ""),
        saved: String(c.saved ?? ""),
        published: Boolean(c.published),
        width: Number(c.width) > 0 ? Number(c.width) : def.width,
        height: Number(c.height) > 0 ? Number(c.height) : def.height,
      };
    });
  } catch {
    return DEFAULT_CARDS;
  }
}

function writeStore(cards: StoredCard[]) {
  try {
    window.localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(cards));
    window.dispatchEvent(new Event(LOGO_UPDATED_EVENT));
  } catch {
    /* quota */
  }
}

export function LogoManagerPanel({ flash }: { flash: (m: string) => void }) {
  const [cards, setCards] = useState<LogoCard[]>(() =>
    readStore().map((c) => ({ ...c, draft: c.saved })),
  );

  useEffect(() => {
    writeStore(
      cards.map(({ id, label, saved, published, width, height }) => ({
        id,
        label,
        saved,
        published,
        width,
        height,
      })),
    );
  }, [cards]);

  const patch = (id: string, p: Partial<LogoCard>) =>
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));

  const addCard = () => {
    const label = window.prompt("اسم بطاقة اللوكو الجديدة:", "لوكو جديد");
    if (!label) return;
    setCards((cs) => [
      ...cs,
      { id: crypto.randomUUID(), label: label.trim(), saved: "", draft: "", published: false, width: 40, height: 40 },
    ]);
    flash("تمت إضافة بطاقة جديدة");
  };


  const renameCard = (id: string, current: string) => {
    const next = window.prompt("اسم البطاقة:", current);
    if (!next || next.trim() === current) return;
    patch(id, { label: next.trim() });
    flash("تم تعديل الاسم");
  };

  const removeCard = (id: string) => {
    if (!window.confirm("حذف هذه البطاقة نهائياً؟")) return;
    setCards((cs) => cs.filter((c) => c.id !== id));
    flash("تم حذف البطاقة");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-primary">إدارة اللوكو</h2>
          <p className="text-xs text-muted-foreground mt-1">
            كل بطاقة تحوي رفع صورة، حفظ، حذف، ومسح. يمكنك إضافة بطاقة لوكو جديدة وتسميتها.
          </p>
        </div>
        <button
          onClick={addCard}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> إضافة لوكو
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <LogoCardView
            key={c.id}
            card={c}
            onChange={(p) => patch(c.id, p)}
            onRename={() => renameCard(c.id, c.label)}
            onRemove={() => removeCard(c.id)}
            flash={flash}
          />
        ))}
      </div>
    </div>
  );
}

function LogoCardView({
  card,
  onChange,
  onRename,
  onRemove,
  flash,
}: {
  card: LogoCard;
  onChange: (p: Partial<LogoCard>) => void;
  onRename: () => void;
  onRemove: () => void;
  flash: (m: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = card.draft !== card.saved;

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      flash("الرجاء اختيار ملف صورة");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ draft: String(reader.result || "") });
    reader.onerror = () => flash("فشل قراءة الصورة");
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2">
          <span className="font-bold truncate">{card.label}</span>
          <button
            onClick={onRename}
            className="shrink-0 rounded-md border border-input bg-background p-1 text-muted-foreground hover:bg-muted"
            aria-label="تعديل الاسم"
            title="تعديل الاسم"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
          aria-label="حذف البطاقة"
          title="حذف البطاقة"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
        {card.draft ? (
          <img
            src={card.draft}
            alt={card.label}
            style={{ width: `${card.width}px`, height: `${card.height}px` }}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
            <ImageIcon className="h-6 w-6" />
            لا توجد صورة
          </div>
        )}
        {dirty && (
          <span className="absolute top-2 end-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            غير محفوظ
          </span>
        )}
        {card.published && !dirty && card.saved && (
          <span className="absolute top-2 start-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
            منشور
          </span>
        )}
        <span className="absolute bottom-2 end-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white">
          {card.width}×{card.height}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-muted-foreground shrink-0">الحجم (px)</label>
        <input
          type="number"
          inputMode="numeric"
          value={card.width || ""}
          onChange={(e) => {
            const raw = e.target.value;
            onChange({ width: raw === "" ? 0 : Number(raw) });
          }}
          onBlur={(e) => {
            const n = Number(e.target.value) || 0;
            onChange({ width: Math.max(1, Math.min(2048, n || 40)) });
          }}
          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="العرض"
        />
        <span className="text-muted-foreground">×</span>
        <input
          type="number"
          inputMode="numeric"
          value={card.height || ""}
          onChange={(e) => {
            const raw = e.target.value;
            onChange({ height: raw === "" ? 0 : Number(raw) });
          }}
          onBlur={(e) => {
            const n = Number(e.target.value) || 0;
            onChange({ height: Math.max(1, Math.min(2048, n || 40)) });
          }}
          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="الارتفاع"
        />
        <button
          type="button"
          onClick={() => onChange({ height: card.width })}
          className="ms-auto rounded-md border border-input bg-background px-2 py-1 text-[10px] font-bold hover:bg-muted"
          title="مربّع"
        >
          مربّع
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onUpload(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90"
        >
          <Upload className="h-3 w-3" /> رفع
        </button>
        <button
          onClick={() => {
            onChange({ saved: card.draft });
            flash("تم حفظ اللوكو");
          }}
          disabled={!dirty}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          <Save className="h-3 w-3" /> حفظ
        </button>
        <button
          onClick={() => {
            onChange({ draft: "" });
          }}
          disabled={!card.draft}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-bold hover:bg-muted disabled:opacity-40"
        >
          <Eraser className="h-3 w-3" /> مسح
        </button>
        <button
          onClick={() => {
            const next = !card.published;
            onChange({ published: next });
            flash(next ? "تم نشر اللوكو" : "تم إلغاء النشر");
          }}
          disabled={!card.saved}
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold disabled:opacity-40 ${
            card.published
              ? "bg-emerald-500 text-white hover:opacity-90"
              : "border border-input bg-background hover:bg-muted"
          }`}
          title={card.published ? "إلغاء النشر" : "نشر اللوكو"}
        >
          {card.published ? <RadioTower className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
          {card.published ? "إلغاء النشر" : "نشر"}
        </button>
        <button
          onClick={() => {
            if (!window.confirm("حذف اللوكو المحفوظ؟")) return;
            onChange({ draft: "", saved: "", published: false });
            flash("تم حذف اللوكو");
          }}
          disabled={!card.saved && !card.draft}
          className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" /> حذف
        </button>
      </div>
    </div>
  );
}
