import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { RotateCcw, MailCheck, ShieldCheck } from "lucide-react";
import { listSecurityEvents, sendReferenceEmailTest } from "@/lib/security-log.functions";

const REFERENCE_EMAIL = "gozyfgozyf5030018@gmail.com";

const EVENT_LABEL: Record<string, string> = {
  "user.created": "إنشاء مستخدم",
  "user.deleted": "حذف مستخدم",
  "user.role_changed": "تغيير صلاحية",
  "user.password_reset_admin": "إعادة تعيين كلمة السر (مدير)",
  "user.password_reset_link_sent": "إرسال رابط استعادة",
  "user.password_reset_self_requested": "طلب استعادة كلمة السر",
  "user.mfa_disabled_admin": "تعطيل 2FA (مدير)",
  "user.mfa_enabled_self": "تفعيل 2FA",
  "user.mfa_disabled_self": "تعطيل 2FA",
  "user.profile_updated": "تحديث بيانات",
  "user.signed_in": "تسجيل دخول",
  "auth.reference_email_test": "اختبار البريد المرجعي",
};

const EVENT_OPTIONS = Object.keys(EVENT_LABEL);

type AuditRow = {
  id: string;
  created_at: string;
  event_type: string;
  actor_email: string | null;
  target_email: string | null;
  status: string;
  details: Record<string, unknown>;
};

function maskEmail(e: string) {
  const [u, d] = e.split("@");
  if (!u || !d) return e;
  const head = u.slice(0, 1);
  return `${head}${"*".repeat(Math.max(1, u.length - 1))}@${d}`;
}

export function SecurityAuditPanel({ flash }: { flash: (m: string) => void }) {
  const doList = useServerFn(listSecurityEvents);
  const doTest = useServerFn(sendReferenceEmailTest);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEvent, setFilterEvent] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [testing, setTesting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doList({
        data: { event: filterEvent || undefined, email: filterEmail || undefined, limit: 200 },
      });
      setRows(res.events as AuditRow[]);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendTest = async () => {
    if (!confirm("إرسال رسالة اختبار إلى البريد المرجعي؟")) return;
    setTesting(true);
    try {
      await doTest();
      flash("تم إرسال رسالة الاختبار");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-400">البريد المرجعي</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground">البريد المرجعي المعتمد</div>
            <div className="mt-1 rounded-lg border border-border/60 bg-card px-3 py-2 font-mono text-sm" dir="ltr">
              {maskEmail(REFERENCE_EMAIL)}
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={sendTest}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <MailCheck className="h-4 w-4" /> {testing ? "جاري الإرسال..." : "إرسال رسالة اختبار"}
            </button>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          تُرسل جميع الإشعارات الأمنية إلى هذا البريد تلقائيًا عند حدوث أي عملية حساسة (إنشاء/حذف/تغيير صلاحية/إعادة تعيين كلمة سر/تعطيل المصادقة الثنائية).
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-black text-primary">سجل الأمان</h3>
          <button
            onClick={load}
            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> تحديث
          </button>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs"
          >
            <option value="">كل الأحداث</option>
            {EVENT_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {EVENT_LABEL[k]}
              </option>
            ))}
          </select>
          <input
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="بحث بالبريد"
            dir="ltr"
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs"
          />
          <button
            onClick={load}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
          >
            تطبيق التصفية
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد أحداث.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-right text-muted-foreground">
                  <th className="p-2 font-bold">الوقت</th>
                  <th className="p-2 font-bold">الحدث</th>
                  <th className="p-2 font-bold">المنفّذ</th>
                  <th className="p-2 font-bold">المستهدف</th>
                  <th className="p-2 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 align-top">
                    <td className="p-2 text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString("ar")}
                    </td>
                    <td className="p-2 font-bold">
                      {EVENT_LABEL[r.event_type] ?? r.event_type}
                      {r.details && Object.keys(r.details).length > 0 && (
                        <div className="mt-1 font-mono text-[10px] font-normal text-muted-foreground" dir="ltr">
                          {JSON.stringify(r.details)}
                        </div>
                      )}
                    </td>
                    <td className="p-2 font-mono text-[11px]" dir="ltr">{r.actor_email ?? "—"}</td>
                    <td className="p-2 font-mono text-[11px]" dir="ltr">{r.target_email ?? "—"}</td>
                    <td className="p-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          r.status === "failure"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {r.status === "failure" ? "فشل" : "نجاح"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
