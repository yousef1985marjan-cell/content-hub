import { Sun, Moon, Monitor } from "lucide-react";
import { useBrandIdentity } from "@/lib/brand-identity";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setThemeMode, hydrated } = useBrandIdentity();
  if (!hydrated) return null;

  const next = mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
  const Icon = mode === "dark" ? Moon : mode === "auto" ? Monitor : Sun;
  const label =
    mode === "light" ? "المظهر النهاري" : mode === "dark" ? "المظهر الليلي" : "تلقائي";

  return (
    <button
      onClick={() => setThemeMode(next)}
      title={`المظهر الحالي: ${label} — اضغط للتبديل`}
      aria-label="تبديل المظهر"
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-sm transition-all duration-300 hover:bg-muted ${compact ? "" : ""}`}
    >
      <Icon className="h-4 w-4 transition-transform duration-300" />
      {!compact && <span>{label}</span>}
    </button>
  );
}
