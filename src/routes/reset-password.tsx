import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Save, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "استرجاع كلمة السر" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Supabase places the recovery token in the URL hash and creates a session
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 6) {
      setError("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا السر غير متطابقتين");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice("تم تحديث كلمة السر. جاري التحويل...");
    setTimeout(() => navigate({ to: "/admin" }), 1200);
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

          {!ready ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              يرجى فتح هذه الصفحة من الرابط المُرسل إلى بريدك الإلكتروني.
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
                  minLength={6}
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
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}
              {notice && (
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
                  {notice}
                </div>
              )}
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
