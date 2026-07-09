import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink } from "@/lib/content-store";
import { useState } from "react";
import { Trash2, Plus, Save, RotateCcw } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<string>("about");
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
    <PageShell title="لوحة التحكم" subtitle="أدر محتوى الأقسام — يُحفظ محلياً في متصفحك">
      {savedFlash && (
        <div className="mb-4 rounded-lg bg-accent/20 border border-accent px-4 py-2 text-sm font-medium">
          {savedFlash}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-3">
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
        <button
          onClick={() => setActiveTab("platforms")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "platforms"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
        >
          روابط المنصات
        </button>
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
          onChange={(platforms) => {
            update({ platforms });
            flash("تم الحفظ تلقائياً");
          }}
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

function PlatformsEditor({ platforms, onChange }: { platforms: PlatformLink[]; onChange: (p: PlatformLink[]) => void }) {
  const patch = (id: string, p: Partial<PlatformLink>) =>
    onChange(platforms.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const add = () =>
    onChange([
      ...platforms,
      { id: crypto.randomUUID(), name: "منصة جديدة", url: "https://", description: "" },
    ]);

  const remove = (id: string) => onChange(platforms.filter((it) => it.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">روابط منصات شفاء</h3>
        <button
          onClick={add}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> إضافة منصة
        </button>
      </div>

      <div className="space-y-4">
        {platforms.map((it) => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground">الاسم</label>
              <input
                value={it.name}
                onChange={(e) => patch(it.id, { name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <label className="text-xs font-bold text-muted-foreground mt-2 block">الوصف (اختياري)</label>
              <input
                value={it.description ?? ""}
                onChange={(e) => patch(it.id, { description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">الرابط</label>
              <input
                dir="ltr"
                value={it.url}
                onChange={(e) => patch(it.id, { url: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex md:flex-col items-center justify-end gap-2">
              <button
                onClick={() => remove(it.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" /> حذف
              </button>
            </div>
          </div>
        ))}
        {platforms.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">لا توجد منصات — أضف واحدة للبدء.</p>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">جميع التعديلات تُحفظ تلقائياً وتظهر مباشرة في صفحة "منصات شفاء".</p>
    </div>
  );
}
