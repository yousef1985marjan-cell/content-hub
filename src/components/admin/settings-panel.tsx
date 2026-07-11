import { useEffect, useMemo, useState } from "react";
import { Save, Eye, EyeOff, Settings as SettingsIcon, KeyRound, Trash2, RefreshCw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useAppSettings } from "@/lib/app-settings";
import { getAppSecretStatus, setAppSecret, deleteAppSecret } from "@/lib/app-secrets.functions";

export function SettingsPanel({ flash }: { flash: (m: string) => void }) {
  const { settings, update, hydrated } = useAppSettings();
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [adminApiBaseUrl, setAdminApiBaseUrl] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (hydrated) {
      setApiBaseUrl(settings.apiBaseUrl);
      setAdminApiBaseUrl(settings.adminApiBaseUrl);
      setAdminApiKey(settings.adminApiKey);
    }
  }, [hydrated, settings]);

  const dirty = useMemo(
    () =>
      apiBaseUrl !== settings.apiBaseUrl ||
      adminApiBaseUrl !== settings.adminApiBaseUrl ||
      adminApiKey !== settings.adminApiKey,
    [apiBaseUrl, adminApiBaseUrl, adminApiKey, settings],
  );

  const save = () => {
    update({ apiBaseUrl, adminApiBaseUrl, adminApiKey });
    flash("تم حفظ الإعدادات");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-black text-primary">
          <SettingsIcon className="h-5 w-5" />
          الإعدادات العامة
        </h2>
        <p className="text-xs text-muted-foreground">
          تُحفظ هذه الإعدادات محلياً في متصفحك وتُستخدم لبناء جميع طلبات الشبكة.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <Field
          label="API_BASE_URL — خادم بيانات الصيدليات"
          value={apiBaseUrl}
          onChange={setApiBaseUrl}
          placeholder="https://api.example.com"
          hint="مثال: https://pharmacies.example.at (بدون / في النهاية)"
        />
        <Field
          label="ADMIN_API_BASE_URL — خادم المحتوى الإعلامي"
          value={adminApiBaseUrl}
          onChange={setAdminApiBaseUrl}
          placeholder="https://admin.example.com"
          hint="إذا تُرك فارغاً يعمل قسم الإعلام بوضع تجريبي محلي."
        />
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            ADMIN_API_KEY — مفتاح سري
          </label>
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              placeholder="sk_..."
              dir="ltr"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="rounded-lg border border-input bg-background p-2 hover:bg-muted"
              aria-label="إظهار/إخفاء"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            يُرسل في ترويسة Authorization: Bearer &lt;key&gt; مع طلبات الكتابة.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={save}
            disabled={!dirty}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            حفظ الإعدادات
          </button>
          {dirty && <span className="text-xs text-amber-600">تعديلات غير محفوظة</span>}
        </div>
      </div>

      <OpenAiKeyPanel />
    </div>
  );
}

function OpenAiKeyPanel() {
  const getStatus = useServerFn(getAppSecretStatus);
  const setKey = useServerFn(setAppSecret);
  const delKey = useServerFn(deleteAppSecret);
  const [status, setStatus] = useState<{
    configured: boolean;
    source: string;
    masked: string;
    updatedAt: string | null;
  } | null>(null);
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      const s = await getStatus({ data: { name: "OPENAI_API_KEY" } });
      setStatus(s);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!value.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await setKey({ data: { name: "OPENAI_API_KEY", value: value.trim() } });
      setValue("");
      setMsg("تم حفظ المفتاح بأمان");
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  };

  const remove = async () => {
    if (!confirm("حذف المفتاح المخزّن؟")) return;
    setBusy(true);
    setMsg(null);
    try {
      await delKey({ data: { name: "OPENAI_API_KEY" } });
      setMsg("تم حذف المفتاح");
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  };

  const sourceLabel =
    status?.source === "database"
      ? "مخزّن في قاعدة البيانات"
      : status?.source === "environment"
        ? "قادم من متغير بيئي"
        : "غير مُعدّ";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h3 className="text-base font-black text-primary">مفتاح OpenAI للترجمة</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        يُستخدم لترجمة صفحات «من نحن، سياسة الخصوصية، الشروط، إخلاء المسؤولية، بيانات الناشر، منصات شفاء».
        يُخزّن المفتاح مشفّراً في قاعدة البيانات ولا يظهر أبداً في الواجهة.
      </p>

      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs flex items-center justify-between gap-2">
        <div>
          <div className="font-bold">
            الحالة:{" "}
            <span className={status?.configured ? "text-emerald-600" : "text-amber-600"}>
              {status?.configured ? "مُعدّ" : "غير مُعدّ"}
            </span>
          </div>
          <div className="text-muted-foreground">
            المصدر: {sourceLabel}
            {status?.masked && <span className="ml-2 font-mono" dir="ltr">({status.masked})</span>}
          </div>
        </div>
        <button
          onClick={load}
          className="rounded-md border border-input bg-background p-1.5 hover:bg-muted"
          aria-label="تحديث"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-muted-foreground">
          إدخال / تحديث المفتاح
        </label>
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-..."
            dir="ltr"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => setShow((v) => !v)}
            className="rounded-lg border border-input bg-background p-2 hover:bg-muted"
            aria-label="إظهار/إخفاء"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={save}
          disabled={busy || !value.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          حفظ المفتاح
        </button>
        {status?.source === "database" && (
          <button
            onClick={remove}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            حذف المفتاح
          </button>
        )}
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir="ltr"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
