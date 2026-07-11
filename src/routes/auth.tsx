import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, LogIn, KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";
import { logSelfSignIn, logSelfPasswordResetRequest } from "@/lib/security-log.functions";
import { sendPasswordResetEmail } from "@/lib/password-reset.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — لوحة التحكم" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot" | "mfa">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        const { data: fList } = await supabase.auth.mfa.listFactors();
        const factor = fList?.totp?.[0];
        if (factor) {
          setMfaFactorId(factor.id);
          setMode("mfa");
          return;
        }
      }
      navigate({ to: "/admin" });
    })();
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      const { data: fList } = await supabase.auth.mfa.listFactors();
      const factor = fList?.totp?.[0];
      if (factor) {
        setMfaFactorId(factor.id);
        setLoading(false);
        setMode("mfa");
        return;
      }
    }
    setLoading(false);
    try { await logSelfSignIn(); } catch { /* ignore */ }
    navigate({ to: "/admin" });
  };

  const verifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: chall, error: cErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
    if (cErr || !chall) {
      setLoading(false);
      setError(cErr?.message || "تعذّر بدء التحقق");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: chall.id,
      code: otp,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    try { await logSelfSignIn(); } catch { /* ignore */ }
    navigate({ to: "/admin" });
  };

  const forgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail({
        data: {
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });
      try { await logSelfPasswordResetRequest({ data: { email } }); } catch { /* ignore */ }
      setNotice("إن كان البريد مسجّلاً، ستصلك رسالة تحتوي على رابط استرجاع كلمة السر.");
    } catch (err) {
      // Still show generic message to avoid leaking existence of the email
      setNotice("إن كان البريد مسجّلاً، ستصلك رسالة تحتوي على رابط استرجاع كلمة السر.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelMfa = async () => {
    await supabase.auth.signOut();
    setMode("signin");
    setOtp("");
    setPassword("");
    setError(null);
  };

  const title =
    mode === "signin" ? "تسجيل الدخول" : mode === "forgot" ? "استرجاع كلمة السر" : "التحقق بخطوتين";

  return (
    <PageShell title="لوحة التحكم" subtitle="تسجيل دخول المدير">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-6 flex items-center justify-between gap-2">
            <h2 className="text-xl font-black text-primary">{title}</h2>
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-3 w-3" /> الرئيسية
            </Link>
          </div>

          {mode !== "mfa" && (
            <p className="mb-4 rounded-lg border border-border/40 bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              الحسابات تُنشأ من قبل المدير فقط من داخل لوحة التحكم. إذا لم يكن لديك حساب، تواصل مع المدير.
            </p>
          )}

          {mode === "mfa" ? (
            <form onSubmit={verifyMfa} className="space-y-4">
              <p className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-primary/90">
                افتح تطبيق المصادقة (Google Authenticator / Authy) وأدخل الرمز المكوّن من 6 أرقام.
              </p>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" /> رمز التحقق
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  autoFocus
                  dir="ltr"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-3 text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••"
                />
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" /> {loading ? "جاري التحقق..." : "تحقّق"}
              </button>
              <button
                type="button"
                onClick={cancelMfa}
                className="w-full text-center text-xs text-muted-foreground hover:text-primary"
              >
                إلغاء وتسجيل الخروج
              </button>
            </form>
          ) : (
            <form onSubmit={mode === "signin" ? signIn : forgot} className="space-y-4">
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Mail className="h-3 w-3" /> البريد الإلكتروني
                </label>
                <input
                  type="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {mode === "signin" && (
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Lock className="h-3 w-3" /> كلمة السر
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
              )}

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
                {mode === "signin" ? (
                  <>
                    <LogIn className="h-4 w-4" /> {loading ? "جاري الدخول..." : "دخول"}
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" /> {loading ? "جاري الإرسال..." : "إرسال رابط الاسترجاع"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setMode(mode === "forgot" ? "signin" : "forgot");
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-primary"
              >
                {mode === "forgot" ? "العودة لتسجيل الدخول" : "نسيت كلمة السر؟"}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
