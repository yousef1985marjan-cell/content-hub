import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/page-shell";
import {
  useContent,
  SECTION_KEYS,
  SECTION_LABELS,
  LANGS,
  LANG_LABELS,
  type SectionKey,
  type Lang,
  type SectionContent,
  type SectionLink,
} from "@/lib/content-store";
import { translateSection } from "@/lib/translate.functions";
import { useMemo, useRef, useState } from "react";
import { Save, Plus, Trash2, Languages } from "lucide-react";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { ButtonFiltersPanel } from "@/components/admin/button-filters-panel";
import { UsersPanel } from "@/components/admin/users-panel";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — منصات شفاء" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type TabKey = SectionKey | "__settings" | "__button_filters" | "__users";

const TABS: { key: TabKey; label: string }[] = [
  { key: "__button_filters", label: "إدارة فلاتر الأزرار" },
  ...SECTION_KEYS.map((k) => ({ key: k as TabKey, label: SECTION_LABELS[k] })),
  { key: "__users", label: "المستخدمون والصلاحيات" },
  { key: "__settings", label: "الإعدادات" },
];

function Admin() {
  const { state, update, hydrated } = useContent();
  const [activeTab, setActiveTab] = useState<TabKey>("__button_filters");
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const flash = (m: string) => {
    setFlashMsg(m);
    setTimeout(() => setFlashMsg(null), 1800);
  };

  if (!hydrated) {
    return (
      <PageShell title="لوحة التحكم">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="لوحة التحكم" subtitle="إدارة محتوى الصفحات بجميع اللغات">
      {flashMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg">
          {flashMsg}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "__button_filters" ? (
        <ButtonFiltersPanel flash={flash} />
      ) : activeTab === "__users" ? (
        <UsersPanel flash={flash} />
      ) : activeTab === "__settings" ? (
        <SettingsPanel flash={flash} />
      ) : (
        <SectionEditor
          key={activeTab}
          sectionKey={activeTab as SectionKey}
          value={state.sections[activeTab as SectionKey]}
          onChange={(next) =>
            update({ sections: { ...state.sections, [activeTab as SectionKey]: next } })
          }
          flash={flash}
        />
      )}
    </PageShell>
  );
}

function SectionEditor({
  sectionKey,
  value,
  onChange,
  flash,
}: {
  sectionKey: SectionKey;
  value: Record<Lang, SectionContent>;
  onChange: (v: Record<Lang, SectionContent>) => void;
  flash: (m: string) => void;
}) {
  const [activeLang, setActiveLang] = useState<Lang>("ar");
  // local draft mirrors saved value; edits are staged until "save"
  const [draft, setDraft] = useState<Record<Lang, SectionContent>>(() => structuredClone(value));
  const [translating, setTranslating] = useState(false);
  const doTranslate = useServerFn(translateSection);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(value), [draft, value]);

  const patchLang = (lang: Lang, patch: Partial<SectionContent>) => {
    setDraft((d) => ({ ...d, [lang]: { ...d[lang], ...patch } }));
  };

  const saveCurrent = () => {
    onChange({ ...value, [activeLang]: draft[activeLang] });
    flash(`تم حفظ ${LANG_LABELS[activeLang]}`);
  };

  const saveAll = () => {
    onChange(draft);
    flash("تم حفظ جميع اللغات");
  };

  const runTranslate = async () => {
    const ar = draft.ar;
    if (!ar.title.trim() && !ar.content.trim()) {
      flash("أدخل عنوانًا أو محتوى بالعربية أولاً");
      return;
    }
    setTranslating(true);
    try {
      const targets = LANGS.filter((l) => l !== "ar");
      const res = await doTranslate({
        data: {
          title: ar.title,
          content: ar.content,
          links: ar.links,
          targets: targets as unknown as string[],
        },
      });
      setDraft((d) => {
        const next = { ...d };
        for (const r of res.results) {
          const lang = r.lang as Lang;
          const existingLinks = d[lang]?.links ?? [];
          // merge: prefer translated link titles, keep url as-is from arabic
          const linksById = new Map(existingLinks.map((l) => [l.id, l]));
          const mergedLinks: SectionLink[] = ar.links.map((arL) => {
            const t = r.links.find((x) => x.id === arL.id);
            return {
              id: arL.id,
              title: t?.title || linksById.get(arL.id)?.title || arL.title,
              url: arL.url,
            };
          });
          next[lang] = {
            title: r.title || next[lang]?.title || "",
            content: r.content || next[lang]?.content || "",
            links: mergedLinks,
          };
        }
        return next;
      });
      flash("تمت الترجمة — راجع ثم احفظ");
    } catch (e) {
      flash((e as Error).message || "فشلت الترجمة");
    }
    setTranslating(false);
  };

  const current = draft[activeLang];
  const isRTL = activeLang === "ar";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 text-lg font-black text-primary">{SECTION_LABELS[sectionKey]}</h2>
        <p className="text-xs text-muted-foreground">
          العربية هي المصدر الأساسي. اضغط «ترجمة إلى جميع اللغات» لملء بقية اللغات تلقائيًا، ثم راجع كل ترجمة وعدّلها قبل الحفظ.
        </p>
      </div>

      {/* Language tabs */}
      <div className="flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setActiveLang(l)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeLang === l
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div dir={isRTL ? "rtl" : "ltr"} className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">عنوان القسم</label>
          <input
            value={current.title}
            onChange={(e) => patchLang(activeLang, { title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">محتوى القسم</label>
          <textarea
            value={current.content}
            onChange={(e) => patchLang(activeLang, { content: e.target.value })}
            rows={12}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-loose focus:outline-none focus:ring-2 focus:ring-ring"
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        <LinksEditor
          links={current.links}
          onChange={(links) => patchLang(activeLang, { links })}
          isRTL={isRTL}
        />

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {activeLang === "ar" && (
            <button
              onClick={runTranslate}
              disabled={translating}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Languages className="h-4 w-4" />
              {translating ? "جاري الترجمة..." : "ترجمة إلى جميع اللغات"}
            </button>
          )}
          <button
            onClick={saveCurrent}
            disabled={!dirty}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            حفظ اللغة الحالية
          </button>
          <button
            onClick={saveAll}
            disabled={!dirty}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            حفظ جميع اللغات
          </button>
          {dirty && <span className="self-center text-xs text-amber-600">لديك تعديلات غير محفوظة</span>}
        </div>
      </div>
    </div>
  );
}

function LinksEditor({
  links,
  onChange,
  isRTL,
}: {
  links: SectionLink[];
  onChange: (l: SectionLink[]) => void;
  isRTL: boolean;
}) {
  const add = () =>
    onChange([...links, { id: crypto.randomUUID(), title: "", url: "" }]);
  const patch = (id: string, p: Partial<SectionLink>) =>
    onChange(links.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const remove = (id: string) => onChange(links.filter((l) => l.id !== id));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-bold text-muted-foreground">الروابط (اختياري)</label>
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs font-bold hover:bg-muted"
        >
          <Plus className="h-3 w-3" /> إضافة رابط
        </button>
      </div>
      {links.length === 0 ? (
        <p className="text-xs text-muted-foreground">لا توجد روابط</p>
      ) : (
        <div className="space-y-2">
          {links.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
              <input
                value={l.title}
                onChange={(e) => patch(l.id, { title: e.target.value })}
                placeholder="العنوان"
                dir={isRTL ? "rtl" : "ltr"}
                className="min-w-[10rem] flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                value={l.url}
                onChange={(e) => patch(l.id, { url: e.target.value })}
                placeholder="https://..."
                dir="ltr"
                className="min-w-[12rem] flex-[2] rounded-md border border-input bg-background px-2 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={() => remove(l.id)}
                className="rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                aria-label="حذف"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogoManager({
  logoUrl,
  onChange,
  flash,
}: {
  logoUrl: string;
  onChange: (url: string) => void;
  flash: (m: string) => void;
}) {
  const [pending, setPending] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 2 ميغابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPending(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!pending) return;
    onChange(pending);
    setPending("");
    flash("تم حفظ الشعار");
  };

  const removeLogo = () => {
    if (!confirm("حذف الشعار الحالي؟")) return;
    onChange("");
    setPending("");
    flash("تم حذف الشعار");
  };

  const preview = pending || logoUrl;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 text-lg font-black text-primary">إدارة الشعار</h2>
        <p className="text-xs text-muted-foreground">الشعار صورة واحدة مشتركة لجميع اللغات.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <label className="mb-2 block text-xs font-bold text-muted-foreground">معاينة الشعار</label>
        <div className="mb-4 grid h-40 w-full place-items-center rounded-xl border-2 border-dashed border-border bg-muted/20">
          {preview ? (
            <img src={preview} alt="Logo" className="max-h-36 max-w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">لا يوجد شعار</span>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
            e.target.value = "";
          }}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <Upload className="h-4 w-4" />
            {logoUrl ? "استبدال الشعار الحالي" : "رفع شعار جديد"}
          </button>
          {pending && (
            <>
              <button
                onClick={save}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                حفظ التغيير
              </button>
              <button
                onClick={() => setPending("")}
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
              >
                <X className="h-4 w-4" />
                إلغاء
              </button>
            </>
          )}
          {logoUrl && !pending && (
            <button
              onClick={removeLogo}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/20"
            >
              <Trash2 className="h-4 w-4" />
              حذف الشعار الحالي
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
