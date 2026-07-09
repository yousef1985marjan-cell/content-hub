import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useContent, type PlatformLink } from "@/lib/content-store";
import { useState } from "react";
import { Trash2, Plus, RotateCcw } from "lucide-react";

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
      { id: crypto.randomUUID(), name: "منصة جديدة", url: "https://", description: "", icon: "", androidUrl: "", iosUrl: "", webUrl: "" },
    ]);

  const remove = (id: string) => onChange(platforms.filter((it) => it.id !== id));

  const uploadIcon = (id: string, file: File) => {
    if (file.size > 500 * 1024) {
      alert("حجم الأيقونة يجب أن يكون أقل من 500 كيلوبايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch(id, { icon: reader.result as string });
    reader.readAsDataURL(file);
  };

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
          <div key={it.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <label className="text-xs font-bold text-muted-foreground block mb-1">الأيقونة</label>
                <label className="grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-input bg-background cursor-pointer overflow-hidden hover:border-primary transition-colors">
                  {it.icon ? (
                    <img src={it.icon} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center px-1">اضغط للتحميل</span>
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
                {it.icon && (
                  <button
                    onClick={() => patch(it.id, { icon: "" })}
                    className="mt-1 text-xs text-destructive hover:underline w-full text-center"
                  >
                    إزالة
                  </button>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">اسم المنصة</label>
                  <input
                    value={it.name}
                    onChange={(e) => patch(it.id, { name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">الوصف (اختياري)</label>
                  <input
                    value={it.description ?? ""}
                    onChange={(e) => patch(it.id, { description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground">الرابط الرئيسي للمنصة</label>
                  <input
                    dir="ltr"
                    value={it.url}
                    onChange={(e) => patch(it.id, { url: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border">
              <div>
                <label className="text-xs font-bold text-muted-foreground">🌐 موقع الويب</label>
                <input
                  dir="ltr"
                  placeholder="https://..."
                  value={it.webUrl ?? ""}
                  onChange={(e) => patch(it.id, { webUrl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">🤖 تطبيق أندرويد</label>
                <input
                  dir="ltr"
                  placeholder="https://play.google.com/..."
                  value={it.androidUrl ?? ""}
                  onChange={(e) => patch(it.id, { androidUrl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground"> تطبيق آيفون</label>
                <input
                  dir="ltr"
                  placeholder="https://apps.apple.com/..."
                  value={it.iosUrl ?? ""}
                  onChange={(e) => patch(it.id, { iosUrl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => remove(it.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" /> حذف المنصة
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

