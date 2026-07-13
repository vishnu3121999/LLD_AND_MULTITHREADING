"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/lld-template") || pathname?.startsWith("/hld")) return null;

  return (
    <footer className="border-t border-[var(--site-border)] bg-[var(--site-surface)]">
      <div className="site-container flex flex-col gap-3 py-8 text-sm text-[var(--site-muted)] md:flex-row md:items-center md:justify-between">
        <p>01 Interview organizes LLD and HLD sections from the home dashboard.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="hover:text-[var(--site-heading)]">Sections</Link>
          <Link href="/pricing" className="hover:text-[var(--site-heading)]">Pricing</Link>
          <Link href="/search" className="hover:text-[var(--site-heading)]">Search</Link>
        </div>
      </div>
    </footer>
  );
}
