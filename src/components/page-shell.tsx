import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 text-primary-foreground">
            <h1 className="text-3xl md:text-4xl font-black">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl opacity-90">{subtitle}</p>}
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</div>
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} منصات شفاء — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
