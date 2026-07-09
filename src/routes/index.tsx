import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Shield, ScrollText, AlertTriangle, Users, Settings } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/")({
  component: Index,
});

const cards = [
  { to: "/about", title: "من نحن", desc: "تعرّف على منصات شفاء", icon: FileText },
  { to: "/publisher", title: "منصات شفاء", desc: "روابط منصاتنا للتحويل", icon: Users },
  { to: "/privacy", title: "سياسة الخصوصية", desc: "كيف نحمي بياناتك", icon: Shield },
  { to: "/terms", title: "الشروط والأحكام", desc: "شروط الاستخدام", icon: ScrollText },
  { to: "/disclaimer", title: "إخلاء المسؤولية", desc: "حدود المسؤولية", icon: AlertTriangle },
  { to: "/admin", title: "لوحة التحكم", desc: "إدارة محتوى الأقسام", icon: Settings },
] as const;

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 text-primary-foreground text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">منصات شفاء</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg opacity-90">
            بوابتك الموحّدة لاستكشاف منصاتنا والاطلاع على الأقسام الرسمية.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/publisher" className="rounded-lg bg-background text-foreground px-5 py-3 font-bold hover:opacity-90">
              استكشف المنصات
            </Link>
            <Link to="/about" className="rounded-lg border border-white/40 px-5 py-3 font-bold hover:bg-white/10">
              من نحن
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl w-full px-4 py-12 md:py-16">
        <h2 className="text-2xl font-black mb-6">الأقسام</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="font-black text-lg">{c.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} منصات شفاء
      </footer>
    </div>
  );
}
