"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export function SearchPanel({ compact = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const payload = await response.json();
      setResults(payload.results || []);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [query]);

  return (
    <div className="w-full">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Strategy, BookMyShow, concurrency..."
          className="pl-10"
          aria-label="Search content"
        />
      </label>

      {results.length > 0 && (
        <div className={compact ? "mt-3 space-y-2" : "mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white"}>
          {results.map((result) => (
            <Link key={result.href} href={result.href} className="block p-4 hover:bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm text-slate-950">{result.title}</strong>
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{result.type}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{result.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
