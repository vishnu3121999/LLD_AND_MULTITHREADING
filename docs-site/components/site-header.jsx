"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { navItems } from "../lib/site-data";
import { cn } from "../lib/utils";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname?.startsWith("/lld-template") || pathname?.startsWith("/hld")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="site-container flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950" aria-label="01 Interview home">
          <img
            src="/logo.png"
            alt="01 Interview"
            className="h-12 w-auto rounded-sm object-contain"
          />
          <span className="sr-only">LLD Playbook</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  isActive && "bg-slate-100 text-slate-950"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/search">
              <Search size={16} aria-hidden="true" />
              Search
            </Link>
          </Button>
          <HeaderAuthButton pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

function HeaderAuthButton({ pathname }) {
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSessionChecked(true);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setSessionChecked(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setSessionChecked(true);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const next = pathname && pathname !== "/auth" ? `?next=${encodeURIComponent(pathname)}` : "";
  if (user?.email) {
    return (
      <Link
        href={`/auth${next}`}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        aria-label={`Account for ${user.email}`}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
          {getInitials(user.email)}
        </span>
        <span className="hidden max-w-24 truncate sm:inline">Account</span>
      </Link>
    );
  }

  return (
    <Button asChild size="sm" className="rounded-full px-4">
      <Link href={`/auth${next}`}>
        <UserRound size={16} aria-hidden="true" />
        {sessionChecked ? "Sign in" : "Account"}
      </Link>
    </Button>
  );
}

function getInitials(email) {
  const localPart = String(email || "U").split("@")[0];
  const chunks = localPart.split(/[._-]+/).filter(Boolean);
  const initials = chunks.length > 1 ? `${chunks[0][0]}${chunks[1][0]}` : localPart.slice(0, 2);
  return initials.toUpperCase();
}
