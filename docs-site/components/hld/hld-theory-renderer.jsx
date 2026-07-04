"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, BookOpenText, FileText } from "lucide-react";
import hljs from "highlight.js";
import { marked } from "marked";
import { extractMarkdownHeadings } from "../../lib/markdown-headings.js";

marked.setOptions({ gfm: true, breaks: false });

const hldTheme = {
  "--hld-bg": "var(--site-bg)",
  "--hld-surface": "var(--site-surface)",
  "--hld-surface-2": "var(--site-surface-2)",
  "--hld-heading": "var(--site-heading)",
  "--hld-text": "var(--site-text)",
  "--hld-muted": "var(--site-muted)",
  "--hld-border": "var(--site-border)",
  "--hld-brand": "var(--site-brand)",
  "--hld-brand-soft": "var(--site-brand-soft)",
  "--hld-code-bg": "var(--site-code-bg)"
};

export function HldTheoryRenderer({ doc, label = "Theory" }) {
  return (
    <article style={hldTheme} className="min-w-0 space-y-4 text-[var(--hld-text)]">
      <header
        id="overview"
        className="scroll-mt-24 rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                <BookOpenText size={14} aria-hidden="true" />
                {label}
              </div>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-[var(--hld-heading)]">
                {doc.title}
              </h1>
            </div>
            <Link
              href="/hld"
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)]"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              HLD
            </Link>
          </div>

          {doc.summary && (
            <div className="mt-5 border-t border-[var(--hld-border)] pt-5">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                <FileText size={14} aria-hidden="true" />
                Overview
              </div>
              <p className="mt-2 max-w-4xl text-base leading-7 text-[var(--hld-muted)]">
                {doc.summary}
              </p>
            </div>
          )}
        </div>
      </header>

      <section className="rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6">
        {doc.body ? (
          <TheoryMarkdown body={doc.body} />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--hld-border)] bg-[var(--hld-surface-2)] p-8 text-center text-sm font-medium text-[var(--hld-muted)]">
            No content added yet.
          </div>
        )}
      </section>
    </article>
  );
}

function TheoryMarkdown({ body }) {
  const ref = useRef(null);
  const html = useMemo(() => marked.parse(addHeadingAnchors(body || "")), [body]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll("pre code").forEach((block) => {
      try {
        hljs.highlightElement(block);
      } catch {
        // Invalid language hints should not break reading.
      }
    });
  }, [html]);

  return <div ref={ref} className="hld-course-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

function addHeadingAnchors(markdown) {
  const headings = extractMarkdownHeadings(markdown);
  let headingIndex = 0;
  let inFence = false;

  return String(markdown || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      if (/^\s*(`{3,}|~{3,})/.test(line)) {
        inFence = !inFence;
        return line;
      }

      if (inFence) return line;

      const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (!match) return line;

      const heading = headings[headingIndex];
      headingIndex += 1;
      if (!heading) return line;

      const depth = match[1].length;
      const inner = marked.parseInline(heading.rawTitle);
      return `<h${depth} id="${escapeAttribute(heading.id)}" class="scroll-mt-24">${inner}</h${depth}>`;
    })
    .join("\n");
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
