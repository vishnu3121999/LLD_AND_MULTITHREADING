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

  if (pathname?.startsWith("/lld-template")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--site-border)] bg-[var(--site-surface)] backdrop-blur">
      <div className="flex min-h-12 w-full items-center justify-between gap-3 px-3 py-1 sm:px-4 lg:px-6">
        <Link
          href="/"
          className="flex h-11 shrink-0 items-center rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-brand)]"
          aria-label="01 Interview home"
        >
          <img
            src="/logo.svg"
            alt="01 Interview"
            className="h-9 w-auto max-w-[128px] object-contain sm:h-10 sm:max-w-[150px]"
          />
          <span className="sr-only">LLD Playbook</span>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-8 items-center rounded-md px-2.5 text-[13px] font-semibold text-[var(--site-muted)] transition hover:bg-[var(--site-surface-2)] hover:text-[var(--site-heading)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-brand)] sm:px-3",
                    isActive && "bg-[var(--site-surface-2)] text-[var(--site-heading)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Button asChild variant="outline" size="sm" className="hidden h-8 px-2.5 text-[13px] sm:inline-flex">
              <Link href="/search">
                <Search size={16} aria-hidden="true" />
                Search
              </Link>
            </Button>
            <HeaderAuthButton pathname={pathname} />
          </div>
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
        className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] py-1 pl-1 pr-3 text-[13px] font-semibold text-[var(--site-text)] shadow-sm transition hover:border-[var(--site-brand)] hover:bg-[var(--site-surface-2)] hover:text-[var(--site-heading)]"
        aria-label={`Account for ${user.email}`}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--site-heading)] text-[11px] font-semibold text-[var(--site-bg)]">
          {getInitials(user.email)}
        </span>
        <span className="hidden max-w-24 truncate sm:inline">Account</span>
      </Link>
    );
  }

  return (
    <Button asChild size="sm" className="h-8 rounded-full px-3 text-[13px] sm:px-4">
      <Link href={`/auth${next}`} aria-label={sessionChecked ? "Sign in" : "Account"}>
        <UserRound size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{sessionChecked ? "Sign in" : "Account"}</span>
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
