import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useFirstPublishedLogo } from "@/lib/use-published-logo";

const links = [
  { to: "/about", label: "من نحن" },
  { to: "/publisher", label: "منصات شفاء" },
  { to: "/privacy", label: "سياسة الخصوصية" },
  { to: "/terms", label: "الشروط والأحكام" },
  { to: "/disclaimer", label: "إخلاء المسؤولية" },
];


export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAdmin = pathname.startsWith("/admin");
  // Priority: on admin → dashboard logo first, then header. Otherwise header first, then app-default.
  const logoIds = onAdmin ? ["dashboard", "header", "app-default"] : ["header", "app-default"];
  const logoUrl = useFirstPublishedLogo(logoIds);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-black text-lg">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground">
            {logoUrl ? (
              <img src={logoUrl} alt="شفاء" className="h-full w-full object-cover" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
          </span>
          <span>شفاء</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="ms-2 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            لوحة التحكم
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden rounded-md p-2 hover:bg-muted"
          aria-label="القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground text-center"
            >
              لوحة التحكم
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
