"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Code2, Search, UserRound } from "lucide-react";
import { navItems } from "../lib/site-data";
import { cn } from "../lib/utils";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="site-container flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white">
            <Code2 size={20} aria-hidden="true" />
          </span>
          <span>LLD Playbook</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                pathname === item.href && "bg-slate-100 text-slate-950"
              )}
            >
              {item.label}
            </Link>
          ))}
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

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const next = pathname && pathname !== "/auth" ? `?next=${encodeURIComponent(pathname)}` : "";
  return (
    <Button asChild size="sm">
      <Link href={`/auth${next}`}>
        <UserRound size={16} aria-hidden="true" />
        {user?.email ? "Account" : "Sign in"}
      </Link>
    </Button>
  );
}
