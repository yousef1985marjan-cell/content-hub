import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Lock, Save, ArrowLeft } from "lucide-react";
import { resetLocalPassword, validateLocalResetToken } from "@/lib/local-auth.functions";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "استرجاع كلمة السر" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    if (!value) {
      setChecking(false);
      return;
    }
    validateLocalResetToken({ data: { token: value } })
      .then(({ valid }) => setReady(valid))
      .catch(() => setReady(false))
      .finally(() => setChecking(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 10) {
      setError("كلمة السر يجب أن تكون 10 محارف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا السر غير متطابقتين");
      return;
    }
    setLoading(true);
    try {
      await resetLocalPassword({ data: { token, password } });
      setNotice("تم تحديث كلمة السر. جاري التحويل إلى صفحة الدخول...");
      setTimeout(() => navigate({ to: "/auth" }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحديث كلمة السر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="استرجاع كلمة السر" subtitle="اختر كلمة سر جديدة">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-6 flex items-center justify-between gap-2">
            <h2 className="text-xl font-black text-primary">كلمة سر جديدة</h2>
            <Link to="/auth" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-3 w-3" /> تسجيل الدخول
            </Link>
          </div>

          {checking ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              جاري التحقق من رابط الاسترجاع...
            </p>
          ) : !ready ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              رابط الاسترجاع غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة تسجيل الدخول.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Lock className="h-3 w-3" /> كلمة السر الجديدة
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Lock className="h-3 w-3" /> تأكيد كلمة السر
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
              {notice && <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary">{notice}</div>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {loading ? "جاري الحفظ..." : "تحديث كلمة السر"}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
