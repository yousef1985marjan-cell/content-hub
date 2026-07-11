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


function headerIdsForPath(pathname: string): string[] {
  if (pathname.startsWith("/admin")) return ["header-admin", "dashboard", "header", "app-default"];
  if (pathname.startsWith("/about")) return ["header-about", "header", "app-default"];
  if (pathname.startsWith("/publisher")) return ["header-publisher", "header", "app-default"];
  if (pathname.startsWith("/privacy")) return ["header-privacy", "header", "app-default"];
  if (pathname.startsWith("/terms")) return ["header-terms", "header", "app-default"];
  if (pathname.startsWith("/disclaimer")) return ["header-disclaimer", "header", "app-default"];
  return ["header-home", "header", "app-default"];
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logo = useFirstPublishedLogo(headerIdsForPath(pathname));
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-black text-lg">
          {logo ? (
            <img
              src={logo.url}
              alt="شفاء"
              style={{ width: `${logo.width}px`, height: `${logo.height}px` }}
              className="shrink-0 rounded-xl object-contain"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Heart className="h-5 w-5" />
            </span>
          )}
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
