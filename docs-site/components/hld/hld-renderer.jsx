"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import hljs from "highlight.js";
import { marked } from "marked";

const MERMAID_SRC = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";

marked.setOptions({ gfm: true, breaks: false });

const hldTheme = {
  "--hld-bg": "#f6f8fb",
  "--hld-surface": "#ffffff",
  "--hld-surface-2": "#f8fafc",
  "--hld-heading": "#1f2937",
  "--hld-text": "#475569",
  "--hld-muted": "#64748b",
  "--hld-border": "#dbe4ef",
  "--hld-brand": "#4f46e5",
  "--hld-brand-soft": "rgba(79, 70, 229, 0.1)",
  "--hld-danger": "#dc2626",
  "--hld-code-bg": "#070b14"
};

export function HldProblemRenderer({ problem, preview = false }) {
  const [mermaidReady, setMermaidReady] = useState(false);
  const tree = useMemo(() => buildSectionTree(problem?.sections || []), [problem?.sections]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.mermaid) {
      initializeMermaid();
      setMermaidReady(true);
    }
  }, []);

  const content = (
    <>
      <Script
        src={MERMAID_SRC}
        strategy="afterInteractive"
        onLoad={() => {
          initializeMermaid();
          setMermaidReady(true);
        }}
      />
      <div className="space-y-4">
        {tree.nodes.map((node, index) => (
          <HldSectionNode key={node.id} node={node} mermaidReady={mermaidReady} index={index} />
        ))}
      </div>
    </>
  );

  if (preview) {
    return <div style={hldTheme}>{content}</div>;
  }

  return (
    <article style={hldTheme} className="min-w-0 space-y-4 text-[var(--hld-text)]">
      <header
        id="overview"
        className="scroll-mt-24 rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {(problem.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--hld-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-[var(--hld-heading)]">
              {problem.title}
            </h1>
            {problem.summary ? (
              <p className="mt-3 max-w-4xl text-base leading-7 text-[var(--hld-muted)]">{problem.summary}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/hld"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-white px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)]"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Library
            </Link>
            {problem.source !== "text" && (
              <Link
                href={`/hld/${problem.id}/edit`}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-white px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)]"
              >
                <Edit3 size={15} aria-hidden="true" />
                Edit
              </Link>
            )}
          </div>
        </div>
      </header>

      {content}
    </article>
  );
}

function HldSectionNode({ node, mermaidReady, index }) {
  const Heading = node.depth === 0 ? "h2" : `h${Math.min(6, node.depth + 2)}`;
  const isTopLevel = node.depth === 0;

  if (!isTopLevel) {
    return (
      <section className="border-l-2 border-[var(--hld-border)] pl-4" data-depth={node.depth}>
        <Heading id={node.id} className="scroll-mt-24 text-lg font-semibold tracking-normal text-[var(--hld-heading)]">
          {node.title || "Untitled"}
        </Heading>
        <div className="mt-3">
          <NodeBody node={node} mermaidReady={mermaidReady} />
        </div>
      </section>
    );
  }

  return (
    <section
      id={node.id}
      className="scroll-mt-24 rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6"
      data-depth={node.depth}
    >
      <div className="grid gap-3 md:grid-cols-[44px_minmax(0,1fr)]">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--hld-brand-soft)] font-mono text-xs font-bold text-[var(--hld-brand)]">
          {index + 1}
        </div>
        <div className="min-w-0">
          <Heading className="text-xl font-semibold tracking-normal text-[var(--hld-heading)]">
            {node.title || "Untitled"}
          </Heading>
          <div className="mt-3">
            <NodeBody node={node} mermaidReady={mermaidReady} />
          </div>
        </div>
      </div>
    </section>
  );
}

function NodeBody({ node, mermaidReady }) {
  if (node.type === "deepdive") {
    return (
      <div className="space-y-4">
        {node.children.length === 0 ? <p className="text-sm text-[var(--hld-muted)]">No deep-dive items yet.</p> : null}
        {node.children.map((child, index) => (
          <HldSectionNode key={child.id} node={child} mermaidReady={mermaidReady} index={index} />
        ))}
      </div>
    );
  }

  if (node.type === "diagram") {
    return <MermaidBlock code={node.body} caption={node.caption} ready={mermaidReady} />;
  }

  return <MarkdownBlock body={node.body} />;
}

function MarkdownBlock({ body }) {
  const ref = useRef(null);
  const html = useMemo(() => marked.parse(body || ""), [body]);

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

function MermaidBlock({ code, caption, ready }) {
  const ref = useRef(null);
  const idRef = useRef(`hld-mmd-${Math.random().toString(36).slice(2)}`);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!ref.current || !ready || !window.mermaid) return;
      setError("");
      try {
        const { svg } = await window.mermaid.render(idRef.current, code || "flowchart LR\n  A --> B");
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (err) {
        if (!cancelled) setError(err?.message || String(err));
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [code, ready]);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface-2)] p-4">
      {ready ? <div ref={ref} className="overflow-x-auto" /> : <pre className="overflow-x-auto text-sm">{code}</pre>}
      {error ? <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--hld-danger)]">Diagram error: {error}</pre> : null}
      {caption ? <div className="mt-3 text-center text-xs text-[var(--hld-muted)]">{caption}</div> : null}
    </div>
  );
}

function buildSectionTree(sections) {
  const used = new Map();
  const flat = [];

  function makeId(title, fallback) {
    const base = slugify(title) || fallback || "section";
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  }

  function visit(section, depth, indexPath) {
    const id = makeId(section.title, `section-${indexPath.join("-")}`);
    const node = {
      id,
      depth,
      type: section.type || "markdown",
      title: section.title || "Untitled",
      body: section.body || "",
      caption: section.caption || "",
      children: []
    };

    flat.push({ id, depth, title: node.title });

    if (node.type === "deepdive") {
      node.children = (section.items || []).map((child, index) => visit(child, depth + 1, [...indexPath, index]));
    }

    return node;
  }

  return { nodes: sections.map((section, index) => visit(section, 0, [index])), flat };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initializeMermaid() {
  if (!window.mermaid) return;
  window.mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      background: "#ffffff",
      primaryColor: "#eef2ff",
      primaryTextColor: "#1f2937",
      primaryBorderColor: "#4f46e5",
      lineColor: "#64748b",
      secondaryColor: "#ecfeff",
      tertiaryColor: "#f0fdf4",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px"
    },
    flowchart: { curve: "basis", htmlLabels: true, padding: 14 }
  });
}
