import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Share2, Shield, FileText, AlertCircle, Building2, Settings } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/")({
  component: Index,
});

const items = [
  { to: "/about", title: "من نحن", icon: Users },
  { to: "/publisher", title: "منصات شفاء", icon: Share2 },
  { to: "/privacy", title: "سياسة الخصوصية", icon: Shield },
  { to: "/terms", title: "الشروط والأحكام", icon: FileText },
  { to: "/disclaimer", title: "إخلاء المسؤولية", icon: AlertCircle },
  { to: "/publisher", title: "بيانات الناشر", icon: Building2 },
] as const;

function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        <div className="flex flex-col gap-4">
          {items.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-all hover:border-primary/40 hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <c.icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} />
              <span className="font-bold text-lg text-foreground">{c.title}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Settings className="h-4 w-4" /> لوحة التحكم
          </Link>
        </div>
      </main>
      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} منصات شفاء
      </footer>
    </div>
  );
}
