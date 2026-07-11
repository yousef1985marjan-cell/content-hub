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
