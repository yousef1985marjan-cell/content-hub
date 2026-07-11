import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Send,
  GripVertical,
  Save,
  X,
  Upload,
} from "lucide-react";
import { LANGS, LANG_LABELS, type Lang } from "@/lib/content-store";
import {
  PUB_GROUP_KEYS,
  PUB_GROUP_LABELS,
  PUB_GROUP_ADD_LABEL,
  emptyItem,
  usePublisherManager,
  type PubGroupKey,
  type PubItem,
} from "@/lib/publisher-manager";
import { BRAND_META, BrandIcon, type BrandKey } from "@/lib/brand-icons";

type Flash = (m: string) => void;

const ALL_BRANDS = Object.keys(BRAND_META) as BrandKey[];

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("فشل قراءة الملف"));
    r.readAsDataURL(file);
  });
}

export function PublisherManagerPanel({ flash }: { flash: Flash }) {
  const { state, hydrated, updateGroup, upsertItem, removeItem, reorderItems } =
    usePublisherManager();
  const [open, setOpen] = useState<PubGroupKey | null>(null);
  const [editing, setEditing] = useState<{ group: PubGroupKey; item: PubItem } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ group: PubGroupKey; id: string; name: string } | null>(null);

  if (!hydrated) return <p className="text-muted-foreground">جاري التحميل...</p>;

  const toggleOpen = (k: PubGroupKey) => {
    setOpen((cur) => (cur === k ? null : k));
    setEditing(null);
  };

  const startAdd = (group: PubGroupKey) => {
    setEditing({ group, item: emptyItem() });
  };
  const startEdit = (group: PubGroupKey, item: PubItem) => {
    setEditing({ group, item: JSON.parse(JSON.stringify(item)) });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 text-lg font-black text-primary">منصات شفاء</h2>
        <p className="text-xs text-muted-foreground">
          إدارة جميع محتويات صفحة منصات شفاء ضمن أقسام قابلة للطي.
        </p>
      </div>

      {PUB_GROUP_KEYS.map((key) => {
        const group = state[key];
        const isOpen = open === key;
        const visibleCount = group.items.filter((i) => !i.hidden).length;
        return (
          <div key={key} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 p-3">
              <button
                onClick={() => toggleOpen(key)}
                className="flex flex-1 items-center gap-2 text-right"
                aria-expanded={isOpen}
              >
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
                <span className="font-bold">{PUB_GROUP_LABELS[key]}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                  {group.items.length}
                </span>
                {group.items.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    ({visibleCount} ظاهر)
                  </span>
                )}
              </button>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <span className="text-muted-foreground">{group.active ? "مفعل" : "مخفي"}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    updateGroup(key, { active: !group.active });
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    group.active ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      group.active ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </label>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border p-3 space-y-3">
                  <button
                    onClick={() => startAdd(key)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    {PUB_GROUP_ADD_LABEL[key]}
                  </button>

                  <ItemsList
                    group={key}
                    items={group.items}
                    onEdit={(it) => startEdit(key, it)}
                    onDelete={(it) =>
                      setConfirmDelete({ group: key, id: it.id, name: it.name.ar || "بدون اسم" })
                    }
                    onToggleHidden={(it) => {
                      upsertItem(key, { ...it, hidden: !it.hidden });
                      flash(it.hidden ? "تم الإظهار" : "تم الإخفاء");
                    }}
                    onPublish={(it) => {
                      upsertItem(key, { ...it, published: true, hidden: false });
                      flash("تم النشر");
                    }}
                    onReorder={(ids) => reorderItems(key, ids)}
                  />

                  {editing?.group === key && (
                    <ItemEditor
                      groupKey={key}
                      value={editing.item}
                      onChange={(it) => setEditing({ group: key, item: it })}
                      onCancel={() => setEditing(null)}
                      onSave={(mode) => {
                        const it = { ...editing.item };
                        if (mode === "draft") it.published = false;
                        if (mode === "publish") it.published = true;
                        upsertItem(key, it);
                        setEditing(null);
                        flash(
                          mode === "publish"
                            ? "تم الحفظ والنشر"
                            : mode === "draft"
                              ? "تم الحفظ كمسودة"
                              : "تم حفظ التغييرات",
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <h3 className="mb-2 text-base font-black">تأكيد الحذف</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              هل تريد فعلاً حذف «{confirmDelete.name}»؟ لا يمكن التراجع.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-bold hover:bg-muted"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  removeItem(confirmDelete.group, confirmDelete.id);
                  setConfirmDelete(null);
                  flash("تم الحذف");
                }}
                className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-bold text-destructive-foreground hover:opacity-90"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemsList({
  group,
  items,
  onEdit,
  onDelete,
  onToggleHidden,
  onPublish,
  onReorder,
}: {
  group: PubGroupKey;
  items: PubItem[];
  onEdit: (i: PubItem) => void;
  onDelete: (i: PubItem) => void;
  onToggleHidden: (i: PubItem) => void;
  onPublish: (i: PubItem) => void;
  onReorder: (ids: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">لا توجد عناصر بعد.</p>;
  }

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex).map((i) => i.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((it) => (
            <SortableItemCard
              key={it.id}
              item={it}
              group={group}
              onEdit={() => onEdit(it)}
              onDelete={() => onDelete(it)}
              onToggleHidden={() => onToggleHidden(it)}
              onPublish={() => onPublish(it)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItemCard({
  item,
  group,
  onEdit,
  onDelete,
  onToggleHidden,
  onPublish,
}: {
  item: PubItem;
  group: PubGroupKey;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
  onPublish: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const thumb = item.thumbnailDataUrl || item.imageDataUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted"
        aria-label="ترتيب"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <ItemPreview item={item} size={40} />

      <div className="min-w-[8rem] flex-1">
        <div className="text-sm font-bold">{item.name.ar || "(بدون اسم)"}</div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="line-clamp-1 text-xs text-primary hover:underline"
            dir="ltr"
          >
            {item.url}
          </a>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] font-bold">
          <span
            className={`rounded-full px-2 py-0.5 ${
              item.published
                ? "bg-emerald-500/15 text-emerald-600"
                : "bg-amber-500/15 text-amber-600"
            }`}
          >
            {item.published ? "منشور" : "مسودة"}
          </span>
          {item.hidden && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">مخفي</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconBtn onClick={onEdit} label="تعديل">
          <Pencil className="h-4 w-4" />
        </IconBtn>
        <IconBtn onClick={onToggleHidden} label={item.hidden ? "إظهار" : "إخفاء"}>
          {item.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </IconBtn>
        {!item.published && (
          <IconBtn onClick={onPublish} label="نشر" tone="primary">
            <Send className="h-4 w-4" />
          </IconBtn>
        )}
        <IconBtn onClick={onDelete} label="حذف" tone="danger">
          <Trash2 className="h-4 w-4" />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  tone,
  children,
}: {
  onClick: () => void;
  label: string;
  tone?: "primary" | "danger";
  children: React.ReactNode;
}) {
  const cls =
    tone === "danger"
      ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
      : tone === "primary"
        ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
        : "border-input bg-background text-foreground hover:bg-muted";
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-md border p-1.5 ${cls}`}
    >
      {children}
    </button>
  );
}

function ItemPreview({ item, size = 48 }: { item: PubItem; size?: number }) {
  const s = item.iconSize || size;
  const bg = item.iconBg || "transparent";
  const color = item.iconColor || undefined;

  if (item.thumbnailDataUrl) {
    return (
      <img
        src={item.thumbnailDataUrl}
        alt=""
        style={{ width: s, height: s }}
        className="rounded-lg object-cover"
      />
    );
  }
  if (item.imageDataUrl) {
    return (
      <div
        style={{ width: s, height: s, background: bg }}
        className="flex items-center justify-center overflow-hidden rounded-lg"
      >
        <img src={item.imageDataUrl} alt="" className="max-h-full max-w-full object-contain" />
      </div>
    );
  }
  if (item.brand) {
    return (
      <div
        style={{ width: s, height: s, background: bg, color: color || BRAND_META[item.brand].color }}
        className="flex items-center justify-center rounded-lg"
      >
        <BrandIcon brand={item.brand} width={s * 0.65} height={s * 0.65} />
      </div>
    );
  }
  return (
    <div
      style={{ width: s, height: s }}
      className="flex items-center justify-center rounded-lg bg-muted text-muted-foreground text-[10px]"
    >
      ؟
    </div>
  );
}

function ItemEditor({
  groupKey,
  value,
  onChange,
  onCancel,
  onSave,
}: {
  groupKey: PubGroupKey;
  value: PubItem;
  onChange: (v: PubItem) => void;
  onCancel: () => void;
  onSave: (mode: "changes" | "draft" | "publish") => void;
}) {
  const [lang, setLang] = useState<Lang>("ar");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const isRTL = lang === "ar";
  const patch = (p: Partial<PubItem>) => onChange({ ...value, ...p });
  const patchName = (v: string) => patch({ name: { ...value.name, [lang]: v } });
  const patchDesc = (v: string) => patch({ description: { ...value.description, [lang]: v } });

  const filteredBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return ALL_BRANDS;
    return ALL_BRANDS.filter(
      (b) => b.toLowerCase().includes(q) || BRAND_META[b].label.toLowerCase().includes(q),
    );
  }, [brandQuery]);

  const showThumbnail = groupKey === "videos" || groupKey === "apps";

  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-primary">
          {value.id && value.name.ar ? "تعديل العنصر" : "عنصر جديد"}
        </h4>
        <button
          onClick={onCancel}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="إلغاء"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* language tabs */}
      <div className="flex flex-wrap gap-1">
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-md px-2 py-1 text-[11px] font-bold ${
              lang === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      <div dir={isRTL ? "rtl" : "ltr"} className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3">
          <Field label="الاسم / العنوان">
            <input
              value={value.name[lang] || ""}
              onChange={(e) => patchName(e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field label="الوصف">
            <textarea
              value={value.description[lang] || ""}
              onChange={(e) => patchDesc(e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field label="الرابط">
            <input
              value={value.url}
              onChange={(e) => patch({ url: e.target.value })}
              dir="ltr"
              placeholder="https://..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
            />
          </Field>

          <div className="grid grid-cols-3 gap-2">
            <Field label="لون الأيقونة">
              <input
                type="color"
                value={value.iconColor || "#000000"}
                onChange={(e) => patch({ iconColor: e.target.value })}
                className="h-9 w-full rounded-lg border border-input bg-background"
              />
            </Field>
            <Field label="الخلفية">
              <input
                type="color"
                value={value.iconBg || "#ffffff"}
                onChange={(e) => patch({ iconBg: e.target.value })}
                className="h-9 w-full rounded-lg border border-input bg-background"
              />
            </Field>
            <Field label="الحجم">
              <input
                type="number"
                min={16}
                max={200}
                value={value.iconSize || 48}
                onChange={(e) => patch({ iconSize: Number(e.target.value) || 48 })}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="من مكتبة الأيقونات">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIconPickerOpen((v) => !v)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted"
              >
                {value.brand ? BRAND_META[value.brand].label : "اختيار أيقونة"}
              </button>
              {value.brand && (
                <button
                  onClick={() => patch({ brand: undefined })}
                  className="text-[11px] text-muted-foreground hover:underline"
                >
                  إزالة
                </button>
              )}
            </div>
            {iconPickerOpen && (
              <div className="mt-2 rounded-lg border border-border bg-background p-2">
                <input
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="ابحث..."
                  className="mb-2 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                />
                <div className="grid max-h-40 grid-cols-6 gap-1 overflow-y-auto">
                  {filteredBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        patch({ brand: b });
                        setIconPickerOpen(false);
                      }}
                      title={BRAND_META[b].label}
                      className={`flex aspect-square items-center justify-center rounded-md border p-1 hover:bg-muted ${
                        value.brand === b ? "border-primary bg-primary/10" : "border-border"
                      }`}
                      style={{ color: BRAND_META[b].color }}
                    >
                      <BrandIcon brand={b} width={18} height={18} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Field>

          <Field label="رفع صورة أو أيقونة">
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                patch({ imageDataUrl: await fileToDataUrl(f) });
              }}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => imgRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted"
              >
                <Upload className="h-3 w-3" /> رفع
              </button>
              {value.imageDataUrl && (
                <button
                  onClick={() => patch({ imageDataUrl: "" })}
                  className="text-[11px] text-muted-foreground hover:underline"
                >
                  إزالة
                </button>
              )}
            </div>
          </Field>

          {showThumbnail && (
            <Field label="صورة مصغرة">
              <input
                ref={thumbRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  patch({ thumbnailDataUrl: await fileToDataUrl(f) });
                }}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => thumbRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold hover:bg-muted"
                >
                  <Upload className="h-3 w-3" /> رفع الصورة المصغرة
                </button>
                {value.thumbnailDataUrl && (
                  <button
                    onClick={() => patch({ thumbnailDataUrl: "" })}
                    className="text-[11px] text-muted-foreground hover:underline"
                  >
                    إزالة
                  </button>
                )}
              </div>
            </Field>
          )}

          <div className="rounded-lg border border-dashed border-border bg-background p-3">
            <div className="mb-2 text-[11px] font-bold text-muted-foreground">معاينة</div>
            <div className="flex items-center gap-3">
              <ItemPreview item={value} size={64} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">
                  {value.name[lang] || value.name.ar || "(بدون اسم)"}
                </div>
                {value.description[lang] && (
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {value.description[lang]}
                  </div>
                )}
                {value.url && (
                  <div className="truncate text-[10px] text-primary" dir="ltr">
                    {value.url}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
        <button
          onClick={onCancel}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-bold hover:bg-muted"
        >
          إلغاء
        </button>
        <button
          onClick={() => onSave("draft")}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-700 hover:bg-amber-500/20"
        >
          <Save className="h-4 w-4" /> حفظ كمسودة
        </button>
        <button
          onClick={() => onSave("changes")}
          className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground hover:opacity-90"
        >
          <Save className="h-4 w-4" /> حفظ التغييرات
        </button>
        <button
          onClick={() => onSave("publish")}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Send className="h-4 w-4" /> حفظ ونشر
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
