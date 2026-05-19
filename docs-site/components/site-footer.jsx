"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/lld-template")) return null;

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="site-container flex flex-col gap-3 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>LLD Playbook uses a reusable template for requirements, entities, services, patterns, concurrency, and code.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/pricing" className="hover:text-slate-950">Pricing</Link>
          <Link href="/roadmaps" className="hover:text-slate-950">Roadmaps</Link>
          <Link href="/cheatsheets" className="hover:text-slate-950">Cheatsheets</Link>
          <Link href="/workspace" className="hover:text-slate-950">Java Workspace</Link>
        </div>
      </div>
    </footer>
  );
}
