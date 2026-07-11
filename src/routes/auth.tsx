import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, LogIn, KeyRound, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — لوحة التحكم" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/admin" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice("تم إنشاء الحساب. يمكنك تسجيل الدخول الآن.");
    setMode("signin");
  };

  const forgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice("تم إرسال رابط استرجاع كلمة السر إلى بريدك.");
  };

  return (
    <PageShell title="لوحة التحكم" subtitle="تسجيل دخول المدير">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-6 flex items-center justify-between gap-2">
            <h2 className="text-xl font-black text-primary">
              {mode === "signin" ? "تسجيل الدخول" : "استرجاع كلمة السر"}
            </h2>
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-3 w-3" /> الرئيسية
            </Link>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); setNotice(null); }}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); setNotice(null); }}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              إنشاء حساب
            </button>
          </div>

          <h2 className="mb-4 text-center text-lg font-black text-primary">
            {mode === "signin" ? "دخول المدير" : mode === "signup" ? "إنشاء حساب مدير" : "استرجاع كلمة السر"}
          </h2>

          <form onSubmit={mode === "signin" ? signIn : mode === "signup" ? signUp : forgot} className="space-y-4">
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

            {mode !== "forgot" && (
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
                setMode(mode === "signin" ? "forgot" : "signin");
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-primary"
            >
              {mode === "signin" ? "نسيت كلمة السر؟" : "العودة لتسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
