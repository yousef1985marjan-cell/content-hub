import { useMemo, useState } from "react";
import { icons as LucideIcons, X, Search } from "lucide-react";
import { ICON_CATEGORIES, ICON_REGISTRY, type IconCategoryKey } from "@/lib/icon-registry";

/* Extra curated names not in the registry, so the library is browsable. */
const EXTRA: Record<IconCategoryKey, string[]> = {
  navigation: ["Menu", "X", "ChevronDown", "ChevronUp", "ChevronRight", "ChevronLeft", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "ExternalLink", "MoveRight", "MoveLeft"],
  header: ["Heart", "Image", "Building2", "Landmark"],
  dashboard: ["LayoutDashboard", "LayoutGrid", "Sparkles", "Palette", "Type", "Brush", "PaintBucket"],
  pages: ["FileText", "BookOpen", "Shield", "Scale", "AlertTriangle", "Newspaper", "FileCheck"],
  search: ["Search", "Filter", "SlidersHorizontal", "Funnel"],
  location: ["MapPin", "Map", "Navigation", "Compass", "Globe", "Route"],
  time: ["Clock", "Calendar", "CalendarDays", "Timer", "History"],
  pharmacy: ["Pill", "Cross", "Stethoscope", "Syringe", "HeartPulse", "Activity", "Thermometer"],
  forms: ["TextCursorInput", "CheckSquare", "List", "ListChecks", "Square", "Circle", "ToggleLeft"],
  actions: ["Check", "Send", "Download", "Upload", "RotateCcw", "RefreshCw", "Play", "Pause"],
  crud: ["Plus", "Save", "Pencil", "Trash2", "Eye", "EyeOff", "PlusCircle", "MinusCircle", "Edit3"],
  share: ["Copy", "Share2", "Link", "Link2", "ClipboardCopy", "Send"],
  users: ["User", "Users", "UserCog", "UserPlus", "LogIn", "LogOut", "Lock", "Unlock", "KeyRound"],
  settings: ["Settings", "Settings2", "Wrench", "Database", "Cog", "SlidersHorizontal"],
  alerts: ["Info", "AlertCircle", "AlertTriangle", "CheckCircle2", "XCircle", "Bell", "BellRing"],
  theme: ["Sun", "Moon", "Monitor", "MonitorSmartphone", "SunMoon"],
  social: ["Facebook", "Instagram", "Youtube", "Twitter", "Linkedin", "Mail", "Phone", "MessageCircle", "MessagesSquare", "Globe"],
  appstore: ["Apple", "Smartphone", "Tablet", "Laptop"],
  media: ["Video", "Play", "Image", "Camera", "Film", "Music", "Mic"],
  info: ["HelpCircle", "CircleHelp", "Book", "BookOpen", "Lightbulb"],
};

/* Arabic aliases used to boost search matches. */
const AR_ALIASES: Record<string, string[]> = {
  Menu: ["قائمة"], X: ["إغلاق", "إلغاء"], Search: ["بحث"], Filter: ["فلتر", "تصفية"],
  Home: ["الرئيسية", "منزل"], User: ["مستخدم"], Users: ["مستخدمين"], Settings: ["إعدادات"],
  Sun: ["نهاري", "شمس"], Moon: ["ليلي", "قمر"], Monitor: ["تلقائي", "شاشة"],
  MapPin: ["موقع"], Map: ["خريطة"], Clock: ["ساعة", "وقت"], Calendar: ["تقويم"],
  Pill: ["دواء"], Cross: ["صيدلية"], Save: ["حفظ"], Plus: ["إضافة"],
  Trash2: ["حذف", "سلة"], Pencil: ["تعديل", "قلم"], Share2: ["مشاركة"],
  Copy: ["نسخ"], Download: ["تنزيل"], Upload: ["رفع"], Send: ["إرسال", "نشر"],
  Info: ["معلومة"], Bell: ["إشعار", "جرس"],
  Facebook: ["فيسبوك"], Instagram: ["إنستجرام"], Youtube: ["يوتيوب"],
  Twitter: ["تويتر", "إكس"], Linkedin: ["لينكدإن"], Mail: ["بريد"], Phone: ["هاتف"],
  Apple: ["آبل", "آب ستور"], Smartphone: ["أندرويد", "جوال"],
  Video: ["فيديو"], Image: ["صورة"], Camera: ["كاميرا"], Play: ["تشغيل"],
};

function nameToKey(name: string) {
  // Lucide's icons map is keyed by kebab-case
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();
}

export function IconLibraryModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (lucideName: string) => void;
}) {
  const [cat, setCat] = useState<IconCategoryKey | "all">("all");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const list = useMemo(() => {
    const bag = new Set<string>();
    const push = (n: string) => bag.add(n);
    if (cat === "all") {
      Object.values(EXTRA).forEach((arr) => arr.forEach(push));
      ICON_REGISTRY.forEach((r) => push(r.lucideName));
    } else {
      EXTRA[cat].forEach(push);
      ICON_REGISTRY.filter((r) => r.category === cat).forEach((r) => push(r.lucideName));
    }
    let all = Array.from(bag);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      all = all.filter((n) => {
        if (n.toLowerCase().includes(s)) return true;
        const ar = AR_ALIASES[n] || [];
        return ar.some((a) => a.includes(q.trim()));
      });
    }
    return all.sort();
  }, [cat, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border p-4">
          <h3 className="flex-1 text-lg font-black text-foreground">مكتبة الأيقونات</h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border p-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالعربية أو الإنجليزية..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCat("all")}
              className={`rounded-full px-3 py-1 text-xs font-bold ${cat === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}
            >
              الكل
            </button>
            {ICON_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${cat === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {list.map((name) => {
            const Comp = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[nameToKey(name)];
            if (!Comp) return null;
            const active = picked === name;
            return (
              <button
                key={name}
                onClick={() => setPicked(name)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${active ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}
              >
                <Comp className="h-6 w-6 text-foreground" />
                <span className="line-clamp-1 text-[10px] text-muted-foreground">{name}</span>
              </button>
            );
          })}
          {list.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">لا نتائج</p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <span className="flex-1 text-xs text-muted-foreground">
            {picked ? `المحددة: ${picked}` : "اختر أيقونة"}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-input bg-background px-4 py-2 text-xs font-bold hover:bg-muted"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              if (picked) {
                onSelect(picked);
                onClose();
              }
            }}
            disabled={!picked}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            استخدام هذه الأيقونة
          </button>
        </div>
      </div>
    </div>
  );
}

export function LucideRender({ name, className, strokeWidth }: { name?: string; className?: string; strokeWidth?: number }) {
  if (!name) return null;
  const Comp = (LucideIcons as Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>>)[nameToKey(name)];
  if (!Comp) return null;
  return <Comp className={className} strokeWidth={strokeWidth} />;
}
