import { useEffect, useMemo, useState } from "react";
import {
  Save,
  Trash2,
  Plus,
  Settings as SettingsIcon,
  Eye,
  RotateCcw,
  Bookmark,
  AlertTriangle,
  Wifi,
  WifiOff,
  ChevronUp,
  ChevronDown,
  Pencil,
} from "lucide-react";
import {
  BUILTIN_BUTTON_IDS,
  BUTTON_META,
  DEFAULT_BUTTONS,
  FILTER_LIBRARY,
  applyPresetToButton,
  buttonIcon,
  buttonLabel,
  conflictsIn,
  createCustomButton,
  defaultSettingsFor,
  defaultState,
  getFilterMeta,
  isOffline,
  loadButtonFilters,
  makeApplied,
  previewButton,
  saveButtonFilters,
  type AppliedFilter,
  type ButtonConfig,
  type ButtonFiltersState,
  type ButtonId,
  type BuiltinButtonId,
  type FilterId,
  type FilterPreset,
  type FilterSettingsMap,
  type WeeklyHours,
} from "@/lib/button-filters";

type Tab = "buttons" | "presets";

export function ButtonFiltersPanel({ flash }: { flash: (m: string) => void }) {
  const [state, setState] = useState<ButtonFiltersState>(() => defaultState());
  const [saved, setSaved] = useState<ButtonFiltersState>(() => defaultState());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("buttons");
  const [previewOpen, setPreviewOpen] = useState(false);
  const offline = isOffline();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await loadButtonFilters();
        setState(s);
        setSaved(s);
      } catch (e) {
        flash((e as Error).message || "فشل تحميل الإعدادات");
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedIds = state.order;

  const dirtyButtons = useMemo(() => {
    const out: Record<ButtonId, boolean> = {};
    for (const id of orderedIds) {
      out[id] = JSON.stringify(state.buttons[id]) !== JSON.stringify(saved.buttons[id]);
    }
    return out;
  }, [state, saved, orderedIds]);

  const anyDirty = useMemo(
    () =>
      Object.values(dirtyButtons).some(Boolean) ||
      JSON.stringify(state.order) !== JSON.stringify(saved.order) ||
      JSON.stringify(state.presets) !== JSON.stringify(saved.presets),
    [dirtyButtons, state.order, saved.order, state.presets, saved.presets],
  );

  const patchButton = (id: ButtonId, next: ButtonConfig) => {
    setState((s) => ({ ...s, buttons: { ...s.buttons, [id]: next } }));
  };

  const persist = async (next: ButtonFiltersState, msg: string) => {
    try {
      const saved = await saveButtonFilters(next);
      setSaved(saved);
      setState(saved);
      flash(msg);
    } catch (e) {
      flash((e as Error).message || "فشل الحفظ");
    }
  };

  const saveButton = async (id: ButtonId) => {
    const cfg = state.buttons[id];
    if (!cfg) return;
    if (cfg.filters.length === 0) {
      flash(`لا يمكن حفظ زر "${buttonLabel(cfg)}" بلا فلاتر`);
      return;
    }
    const next: ButtonFiltersState = {
      ...saved,
      buttons: { ...saved.buttons, [id]: cfg },
      order: state.order,
      presets: state.presets,
    };
    await persist(next, `تم حفظ زر "${buttonLabel(cfg)}"`);
  };

  const saveAll = async () => {
    for (const id of orderedIds) {
      const cfg = state.buttons[id];
      if (!cfg) continue;
      if (cfg.filters.length === 0) {
        flash(`لا يمكن الحفظ: زر "${buttonLabel(cfg)}" بلا فلاتر`);
        return;
      }
    }
    await persist(state, "تم حفظ جميع الأزرار");
  };

  const resetButton = (id: ButtonId) => {
    const cfg = state.buttons[id];
    if (!cfg) return;
    if (!confirm(`استعادة الإعداد الافتراضي لزر "${buttonLabel(cfg)}"؟`)) return;
    if (cfg.builtin && BUILTIN_BUTTON_IDS.includes(id as BuiltinButtonId)) {
      patchButton(id, structuredClone(DEFAULT_BUTTONS[id as BuiltinButtonId]));
    } else {
      patchButton(id, { ...cfg, filters: [makeApplied("filter_result_limit")] });
    }
  };

  const addCustomButton = () => {
    const label = prompt("اسم الزر الجديد:", "زر مخصص");
    if (!label) return;
    const icon = prompt("رمز (إيموجي) للزر:", "🔘") || "🔘";
    const btn = createCustomButton(label, icon);
    const next: ButtonFiltersState = {
      ...state,
      buttons: { ...state.buttons, [btn.id]: btn },
      order: [...state.order, btn.id],
    };
    setState(next);
    flash(`تمت إضافة زر "${btn.label}" — لا تنسَ الحفظ`);
  };

  const renameButton = (id: ButtonId) => {
    const cfg = state.buttons[id];
    if (!cfg) return;
    const label = prompt("اسم الزر:", cfg.label);
    if (!label) return;
    const icon = prompt("رمز (إيموجي):", cfg.icon) || cfg.icon;
    patchButton(id, { ...cfg, label, icon });
  };

  const deleteButton = (id: ButtonId) => {
    const cfg = state.buttons[id];
    if (!cfg) return;
    if (cfg.builtin) {
      alert("لا يمكن حذف زر أساسي — يمكنك إخفاؤه بدلاً من ذلك.");
      return;
    }
    if (!confirm(`حذف زر "${cfg.label}" نهائياً؟`)) return;
    const { [id]: _removed, ...rest } = state.buttons;
    void _removed;
    const next: ButtonFiltersState = {
      ...state,
      buttons: rest,
      order: state.order.filter((x) => x !== id),
    };
    void persist(next, "تم حذف الزر");
  };

  const moveButton = (id: ButtonId, dir: -1 | 1) => {
    const idx = state.order.indexOf(id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= state.order.length) return;
    const nextOrder = [...state.order];
    [nextOrder[idx], nextOrder[j]] = [nextOrder[j], nextOrder[idx]];
    setState((s) => ({ ...s, order: nextOrder }));
  };

  const saveAsPreset = (buttonId: ButtonId) => {
    const nextNum = state.presets.length + 1;
    const defaultName = `فلتر ${nextNum}`;
    const name = prompt("اسم المجموعة:", defaultName);
    if (!name) return;
    const description = prompt("وصف اختياري:", "") || "";
    const cfg = state.buttons[buttonId];
    const preset: FilterPreset = {
      id: crypto.randomUUID(),
      name,
      description,
      filters: structuredClone(cfg.filters),
      created_at: new Date().toISOString(),
    };
    const next = { ...state, presets: [...state.presets, preset] };
    setState(next);
    void persist(next, `تم حفظ المجموعة "${name}"`);
  };

  const applyPreset = (preset: FilterPreset, target: ButtonId | "__all") => {
    const targets = target === "__all" ? orderedIds : [target];
    let diffMsg = "";
    const nextButtons = { ...state.buttons };
    for (const id of targets) {
      const btn = nextButtons[id];
      if (!btn) continue;
      const { next, added, removed } = applyPresetToButton(btn, preset);
      nextButtons[id] = next;
      diffMsg += `\n• ${buttonLabel(btn)}: +${added.length}/-${removed.length}`;
    }
    if (!confirm(`تطبيق "${preset.name}"؟${diffMsg}`)) return;
    setState((s) => ({ ...s, buttons: nextButtons }));
    flash("تم التطبيق — راجع ثم احفظ");
  };

  const renamePreset = (p: FilterPreset) => {
    const name = prompt("اسم جديد:", p.name);
    if (!name) return;
    const next = {
      ...state,
      presets: state.presets.map((x) => (x.id === p.id ? { ...x, name } : x)),
    };
    void persist(next, "تمت إعادة التسمية");
  };

  const deletePreset = (p: FilterPreset) => {
    if (!confirm(`حذف المجموعة "${p.name}"؟`)) return;
    const next = { ...state, presets: state.presets.filter((x) => x.id !== p.id) };
    void persist(next, "تم الحذف");
  };

  const editPreset = (p: FilterPreset) => {
    const desc = prompt("الوصف:", p.description || "");
    if (desc === null) return;
    const next = {
      ...state,
      presets: state.presets.map((x) => (x.id === p.id ? { ...x, description: desc } : x)),
    };
    void persist(next, "تم التعديل");
  };

  if (loading) {
    return <p className="text-muted-foreground">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-primary">إدارة فلاتر الأزرار</h2>
            <p className="text-xs text-muted-foreground">
              تحكم عن بُعد بسلوك أزرار البحث في تطبيق الجوال دون تحديث من المتاجر.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                offline
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {offline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {offline ? "وضع تجريبي محلي" : "متصل بالخادم"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <button
            onClick={saveAll}
            disabled={!anyDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            حفظ الكل
          </button>
          <button
            onClick={() => setPreviewOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
            معاينة
          </button>
          <span className="text-xs text-muted-foreground">
            آخر حفظ: {new Date(saved.updated_at).toLocaleString("ar")}
          </span>
          {anyDirty && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              تغييرات غير محفوظة
            </span>
          )}
        </div>

        {previewOpen && (
          <div className="mt-3 space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
            {BUTTON_IDS.map((id) => (
              <p key={id}>
                <span className="font-bold">{BUTTON_META[id].icon}</span>{" "}
                {previewButton(state.buttons[id])}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("buttons")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            tab === "buttons"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
        >
          الأزرار الأربعة
        </button>
        <button
          onClick={() => setTab("presets")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            tab === "presets"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
        >
          المجموعات المحفوظة ({state.presets.length})
        </button>
      </div>

      {tab === "buttons" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {BUTTON_IDS.map((id) => (
            <ButtonCard
              key={id}
              cfg={state.buttons[id]}
              dirty={dirtyButtons[id]}
              onChange={(c) => patchButton(id, c)}
              onSave={() => saveButton(id)}
              onReset={() => resetButton(id)}
              onSaveAsPreset={() => saveAsPreset(id)}
            />
          ))}
        </div>
      ) : (
        <PresetsList
          presets={state.presets}
          onApply={applyPreset}
          onRename={renamePreset}
          onEdit={editPreset}
          onDelete={deletePreset}
        />
      )}
    </div>
  );
}

// ---------- Button Card ----------

function ButtonCard({
  cfg,
  dirty,
  onChange,
  onSave,
  onReset,
  onSaveAsPreset,
}: {
  cfg: ButtonConfig;
  dirty: boolean;
  onChange: (c: ButtonConfig) => void;
  onSave: () => void;
  onReset: () => void;
  onSaveAsPreset: () => void;
}) {
  const [addFid, setAddFid] = useState<FilterId | "">("");
  const [openSettings, setOpenSettings] = useState<string | null>(null);

  const used = new Set(cfg.filters.map((f) => f.id));
  const available = FILTER_LIBRARY.filter((f) => !used.has(f.id));

  const meta = BUTTON_META[cfg.id];

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= cfg.filters.length) return;
    const next = [...cfg.filters];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange({ ...cfg, filters: next });
  };

  const remove = (fid: FilterId) => {
    const fm = getFilterMeta(fid);
    if (fm.stickyOn?.includes(cfg.id)) {
      alert(`الفلتر "${fm.label}" مثبت لهذا الزر ولا يمكن إزالته.`);
      return;
    }
    onChange({ ...cfg, filters: cfg.filters.filter((f) => f.id !== fid) });
  };

  const add = () => {
    if (!addFid) return;
    const conflicts = conflictsIn(cfg.filters, addFid);
    if (conflicts.length > 0) {
      const names = conflicts.map((c) => getFilterMeta(c).label).join("، ");
      if (
        !confirm(
          `"${getFilterMeta(addFid).label}" يتعارض مع: ${names}.\nإزالة المتعارضين وإضافة الجديد؟`,
        )
      )
        return;
      const filtered = cfg.filters.filter((f) => !conflicts.includes(f.id));
      onChange({ ...cfg, filters: [...filtered, makeApplied(addFid)] });
    } else {
      onChange({ ...cfg, filters: [...cfg.filters, makeApplied(addFid)] });
    }
    setAddFid("");
  };

  const patchFilter = (idx: number, patch: Partial<AppliedFilter>) => {
    const next = [...cfg.filters];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...cfg, filters: next });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <h3 className="flex items-center gap-2 text-base font-black text-primary">
          <span className="text-xl">{meta.icon}</span>
          {meta.label}
          {dirty && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              غير محفوظ
            </span>
          )}
        </h3>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => onChange({ ...cfg, enabled: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          {cfg.enabled ? "ظاهر" : "مخفي"}
        </label>
      </div>

      {cfg.filters.length === 0 ? (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          لا توجد فلاتر — أضف فلتراً واحداً على الأقل قبل الحفظ.
        </div>
      ) : (
        <ul className="mb-3 space-y-2">
          {cfg.filters.map((f, i) => {
            const fm = getFilterMeta(f.id);
            const sticky = fm.stickyOn?.includes(cfg.id);
            const settingsOpen = openSettings === f.id;
            return (
              <li
                key={f.id}
                className="rounded-lg border border-border/60 bg-muted/20 p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="أعلى"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === cfg.filters.length - 1}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="أسفل"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{fm.label}</span>
                      {sticky && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          مثبت
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{fm.description}</p>
                  </div>
                  {fm.hasSettings && (
                    <button
                      onClick={() => setOpenSettings(settingsOpen ? null : f.id)}
                      className="rounded-md border border-input bg-background p-1.5 hover:bg-muted"
                      aria-label="إعدادات"
                    >
                      <SettingsIcon className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(f.id)}
                    disabled={sticky}
                    className="rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 disabled:opacity-40"
                    aria-label="إزالة"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {settingsOpen && fm.hasSettings && (
                  <FilterSettingsEditor
                    filter={f}
                    onChange={(settings) => patchFilter(i, { settings })}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {available.length > 0 && (
        <div className="mb-3 flex gap-2">
          <select
            value={addFid}
            onChange={(e) => setAddFid(e.target.value as FilterId | "")}
            className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
          >
            <option value="">إضافة فلتر...</option>
            {available.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            onClick={add}
            disabled={!addFid}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> إضافة
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        <button
          onClick={onSave}
          disabled={!dirty}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          حفظ
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" />
          استعادة الافتراضي
        </button>
        <button
          onClick={onSaveAsPreset}
          className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
        >
          <Bookmark className="h-3 w-3" />
          حفظ كمجموعة
        </button>
      </div>
    </div>
  );
}

// ---------- Filter Settings ----------

function FilterSettingsEditor({
  filter,
  onChange,
}: {
  filter: AppliedFilter;
  onChange: (s: AppliedFilter["settings"]) => void;
}) {
  if (filter.id === "filter_nearby_radius") {
    const s = (filter.settings as FilterSettingsMap["filter_nearby_radius"]) ||
      (defaultSettingsFor("filter_nearby_radius") as FilterSettingsMap["filter_nearby_radius"]);
    return (
      <div className="mt-2 rounded-md border border-border bg-background p-2">
        <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
          نصف القطر (كم)
        </label>
        <input
          type="number"
          min={1}
          max={500}
          value={s.radiusKm}
          onChange={(e) => onChange({ radiusKm: Number(e.target.value) })}
          className="w-24 rounded border border-input bg-background px-2 py-1 text-xs"
        />
      </div>
    );
  }
  if (filter.id === "filter_result_limit") {
    const s = (filter.settings as FilterSettingsMap["filter_result_limit"]) ||
      (defaultSettingsFor("filter_result_limit") as FilterSettingsMap["filter_result_limit"]);
    return (
      <div className="mt-2 rounded-md border border-border bg-background p-2">
        <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
          حد النتائج
        </label>
        <input
          type="number"
          min={1}
          max={5000}
          value={s.limit}
          onChange={(e) => onChange({ limit: Number(e.target.value) })}
          className="w-24 rounded border border-input bg-background px-2 py-1 text-xs"
        />
      </div>
    );
  }
  if (filter.id === "filter_time_auto") {
    const s = (filter.settings as FilterSettingsMap["filter_time_auto"]) ||
      (defaultSettingsFor("filter_time_auto") as FilterSettingsMap["filter_time_auto"]);
    return <HoursEditor hours={s.hours} onChange={(hours) => onChange({ hours })} />;
  }
  return null;
}

const DAY_LABELS: Record<keyof WeeklyHours, string> = {
  mon: "الاثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
  fri: "الجمعة",
  sat: "السبت",
  sun: "الأحد",
};

function HoursEditor({
  hours,
  onChange,
}: {
  hours: WeeklyHours;
  onChange: (h: WeeklyHours) => void;
}) {
  const days = Object.keys(DAY_LABELS) as (keyof WeeklyHours)[];
  return (
    <div className="mt-2 space-y-1 rounded-md border border-border bg-background p-2">
      <p className="mb-1 text-[11px] font-bold text-muted-foreground">
        أوقات الدوام الرسمي (توقيت فيينا)
      </p>
      {days.map((d) => {
        const h = hours[d];
        return (
          <div key={d} className="flex items-center gap-2 text-xs">
            <label className="inline-flex w-20 items-center gap-1">
              <input
                type="checkbox"
                checked={!!h}
                onChange={(e) =>
                  onChange({
                    ...hours,
                    [d]: e.target.checked ? { start: "08:00", end: "18:00" } : null,
                  })
                }
                className="h-3 w-3 accent-primary"
              />
              {DAY_LABELS[d]}
            </label>
            {h ? (
              <>
                <input
                  type="time"
                  value={h.start}
                  onChange={(e) =>
                    onChange({ ...hours, [d]: { ...h, start: e.target.value } })
                  }
                  className="rounded border border-input bg-background px-1 py-0.5 text-xs"
                  dir="ltr"
                />
                <span>-</span>
                <input
                  type="time"
                  value={h.end}
                  onChange={(e) =>
                    onChange({ ...hours, [d]: { ...h, end: e.target.value } })
                  }
                  className="rounded border border-input bg-background px-1 py-0.5 text-xs"
                  dir="ltr"
                />
              </>
            ) : (
              <span className="text-muted-foreground">مغلق</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Presets ----------

function PresetsList({
  presets,
  onApply,
  onRename,
  onEdit,
  onDelete,
}: {
  presets: FilterPreset[];
  onApply: (p: FilterPreset, target: ButtonId | "__all") => void;
  onRename: (p: FilterPreset) => void;
  onEdit: (p: FilterPreset) => void;
  onDelete: (p: FilterPreset) => void;
}) {
  if (presets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-8 text-center text-sm text-muted-foreground">
        لا توجد مجموعات محفوظة بعد. استخدم زر "حفظ كمجموعة" داخل أي بطاقة زر لإنشاء مجموعة.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {presets.map((p) => (
        <PresetCard
          key={p.id}
          preset={p}
          onApply={onApply}
          onRename={onRename}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function PresetCard({
  preset,
  onApply,
  onRename,
  onEdit,
  onDelete,
}: {
  preset: FilterPreset;
  onApply: (p: FilterPreset, target: ButtonId | "__all") => void;
  onRename: (p: FilterPreset) => void;
  onEdit: (p: FilterPreset) => void;
  onDelete: (p: FilterPreset) => void;
}) {
  const [target, setTarget] = useState<ButtonId | "">("");

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-black text-primary">{preset.name}</h4>
          {preset.description && (
            <p className="text-xs text-muted-foreground">{preset.description}</p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {preset.filters.length} فلتر · أُنشئت{" "}
            {new Date(preset.created_at).toLocaleDateString("ar")}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(preset)}
            className="rounded-md border border-input bg-background p-1.5 hover:bg-muted"
            aria-label="تعديل"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => onRename(preset)}
            className="rounded-md border border-input bg-background px-2 py-1 text-[11px] font-bold hover:bg-muted"
          >
            إعادة تسمية
          </button>
          <button
            onClick={() => onDelete(preset)}
            className="rounded-md border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
            aria-label="حذف"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        {preset.filters.map((f) => (
          <span
            key={f.id}
            className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground"
          >
            {getFilterMeta(f.id).label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as ButtonId | "")}
          className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="">تطبيق على زر...</option>
          {BUTTON_IDS.map((id) => (
            <option key={id} value={id}>
              {BUTTON_META[id].label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (target) onApply(preset, target);
          }}
          disabled={!target}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          تطبيق
        </button>
        <button
          onClick={() => onApply(preset, "__all")}
          className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
        >
          تطبيق على جميع الأزرار
        </button>
      </div>
    </div>
  );
}
