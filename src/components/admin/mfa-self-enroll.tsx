import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, ShieldOff, RotateCcw } from "lucide-react";

export function MfaSelfEnroll({ flash }: { flash: (m: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [factorId, setFactorId] = useState<string>("");
  const [qr, setQr] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEnroll, setShowEnroll] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase.auth.mfa.listFactors();
    if (e) setError(e.message);
    const totp = data?.totp?.[0];
    if (totp && totp.status === "verified") {
      setEnrolled(true);
      setFactorId(totp.id);
    } else {
      setEnrolled(false);
      setFactorId("");
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const startEnroll = async () => {
    setError(null);
    setBusy(true);
    // Clean up any unverified factors
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.status !== "verified") {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error || !data) {
      setError(error?.message || "تعذّر بدء التسجيل");
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setOtp("");
    setShowEnroll(true);
  };

  const verifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { data: chall, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr || !chall) {
      setBusy(false);
      setError(cErr?.message || "تعذّر التحقق");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: chall.id,
      code: otp,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowEnroll(false);
    setQr("");
    setSecret("");
    setOtp("");
    flash("تم تفعيل المصادقة الثنائية");
    await refresh();
  };

  const disable = async () => {
    if (!confirm("تعطيل المصادقة الثنائية على حسابك؟")) return;
    setError(null);
    setBusy(true);
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    setBusy(false);
    flash("تم تعطيل المصادقة الثنائية");
    await refresh();
  };

  const cancelEnroll = async () => {
    if (factorId) await supabase.auth.mfa.unenroll({ factorId });
    setShowEnroll(false);
    setQr("");
    setSecret("");
    setOtp("");
    setFactorId("");
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">جاري التحميل...</p>;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-black text-primary">المصادقة الثنائية (2FA)</h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        استخدم تطبيق مصادقة مثل <b>Google Authenticator</b> أو <b>Authy</b> أو <b>Microsoft Authenticator</b>. عند تفعيلها ستحتاج إلى رمز مكوّن من 6 أرقام يتغيّر كل 30 ثانية عند كل تسجيل دخول.
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {enrolled ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" /> مُفعّلة على حسابك
          </span>
          <button
            onClick={disable}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            <ShieldOff className="h-3 w-3" /> تعطيل
          </button>
        </div>
      ) : showEnroll ? (
        <form onSubmit={verifyEnroll} className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-3 text-xs font-bold">1) امسح رمز QR بتطبيق المصادقة:</p>
            {qr && (
              <div className="flex justify-center rounded-lg bg-white p-3">
                <img src={qr} alt="QR" className="h-44 w-44" />
              </div>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              أو أدخل هذا المفتاح يدويًا:
            </p>
            <div className="mt-1 select-all rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-xs" dir="ltr">
              {secret}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">2) أدخل الرمز الظاهر في التطبيق:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              dir="ltr"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-input bg-background px-3 py-3 text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || otp.length !== 6}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" /> {busy ? "جاري التحقق..." : "تأكيد التفعيل"}
            </button>
            <button
              type="button"
              onClick={cancelEnroll}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={startEnroll}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" /> تفعيل المصادقة الثنائية
        </button>
      )}

      <button
        onClick={refresh}
        className="ms-2 mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
      >
        <RotateCcw className="h-3 w-3" /> تحديث الحالة
      </button>
    </section>
  );
}
