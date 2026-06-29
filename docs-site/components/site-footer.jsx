"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/lld-template") || pathname?.startsWith("/hld")) return null;

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="site-container flex flex-col gap-3 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>01 Interview organizes LLD and HLD sections from the home dashboard.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="hover:text-slate-950">Sections</Link>
          <Link href="/pricing" className="hover:text-slate-950">Pricing</Link>
          <Link href="/search" className="hover:text-slate-950">Search</Link>
        </div>
      </div>
    </footer>
  );
}
