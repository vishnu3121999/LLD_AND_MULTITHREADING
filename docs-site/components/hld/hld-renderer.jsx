"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Code2,
  Database,
  Edit3,
  FileText,
  ListChecks,
  Network,
  SearchCheck,
  ShieldCheck
} from "lucide-react";
import hljs from "highlight.js";
import { marked } from "marked";

const MERMAID_SRC = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";

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
  "--hld-good": "var(--site-good)",
  "--hld-danger": "var(--site-danger)",
  "--hld-code-bg": "var(--site-code-bg)"
};

const sectionBlueprints = {
  "functional-requirements": {
    number: "1",
    label: "Requirements",
    hint: "List the user-visible capabilities first. Keep scope tight and explicit.",
    icon: ListChecks
  },
  "out-of-scope": {
    number: "1.f",
    label: "Scope Boundary",
    hint: "Call out what the answer will not cover.",
    icon: Ban
  },
  "non-functional-requirements": {
    number: "2",
    label: "System Qualities",
    hint: "Cover fault tolerance, CAP choices, scale, throughput, latency, hot keys, and spikes.",
    icon: ShieldCheck
  },
  "core-entities": {
    number: "3",
    label: "Data Model",
    hint: "Start with the core entities; evolve the detailed model during the HLD and deep dives.",
    icon: Database
  },
  "api-design": {
    number: "4",
    label: "Interface",
    hint: "Pick the protocol, then show concrete request and response contracts.",
    icon: Code2
  },
  "high-level-design": {
    number: "5",
    label: "Architecture",
    hint: "Show components, data stores, queues, caches, and the main request flows.",
    icon: Network
  },
  "deep-dives": {
    number: "6",
    label: "Tradeoffs",
    hint: "Quantify bottlenecks, compare options, and close failure-mode gaps.",
    icon: SearchCheck
  }
};

const answerFlow = [
  ["0", "Problem brief"],
  ["1", "Functional requirements"],
  ["2", "Non-functional requirements"],
  ["3", "Core entities"],
  ["4", "API design"],
  ["5", "High-level design"],
  ["6", "Deep dives"]
];

export function HldProblemRenderer({ problem, preview = false }) {
  const [mermaidReady, setMermaidReady] = useState(false);
  const solution = useMemo(() => prepareSolution(problem?.sections || []), [problem?.sections]);

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
        {solution.visibleSections.map((node, index) => (
          <SolutionSection
            key={node.id}
            index={index}
            mermaidReady={mermaidReady}
            node={node}
            outOfScopeNode={node.slug === "functional-requirements" ? solution.outOfScopeNode : null}
          />
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
        className="scroll-mt-24 rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
      >
        <div className="p-5 sm:p-6">
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
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/hld"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)]"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Library
              </Link>
              {problem.source !== "text" && (
                <Link
                  href={`/hld/${problem.id}/edit`}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)]"
                >
                  <Edit3 size={15} aria-hidden="true" />
                  Edit
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--hld-border)] pt-5">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
              <FileText size={14} aria-hidden="true" />
              0 · What is this system?
            </div>
            <p className="mt-2 max-w-4xl text-base leading-7 text-[var(--hld-muted)]">
              {problem.summary || "Problem summary is not available in the source notes."}
            </p>

            <div className="mt-5 border-t border-[var(--hld-border)] pt-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                Answer Flow
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {answerFlow.map(([number, label]) => (
                  <div
                    key={number}
                    className="flex min-h-8 min-w-0 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-2.5 text-xs font-medium text-[var(--hld-muted)]"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-[var(--hld-brand-soft)] font-mono text-[10px] font-bold text-[var(--hld-brand)]">
                      {number}
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {content}
    </article>
  );
}

function SolutionSection({ node, mermaidReady, index, outOfScopeNode }) {
  const blueprint = sectionBlueprints[node.slug] || {
    number: String(index + 1),
    label: "Design Notes",
    hint: "Problem-specific notes.",
    icon: FileText
  };
  const Icon = blueprint.icon;

  return (
    <section
      id={node.id}
      className="scroll-mt-24 overflow-hidden rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
    >
      <div className="grid md:grid-cols-[76px_minmax(0,1fr)]">
        <div className="border-b border-[var(--hld-border)] bg-[var(--hld-surface-2)] p-5 md:border-b-0 md:border-r">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-[var(--hld-brand-soft)] font-mono text-sm font-bold text-[var(--hld-brand)]">
            {blueprint.number}
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                <Icon size={14} aria-hidden="true" />
                {blueprint.label}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-[var(--hld-heading)]">
                {node.title || "Untitled"}
              </h2>
            </div>
          </div>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--hld-muted)]">
            {blueprint.hint}
          </p>

          {Array.isArray(node.images) && node.images.length > 0 && (
            <SectionImages images={node.images} />
          )}

          <div className="mt-5">
            <SectionBody node={node} mermaidReady={mermaidReady} />
          </div>

          {outOfScopeNode && (
            <div id={outOfScopeNode.id} className="mt-6 scroll-mt-24 border-l-2 border-[var(--hld-brand)] pl-4">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                <Ban size={14} aria-hidden="true" />
                Out of Scope
              </div>
              <div className="mt-3">
                <SectionBody node={outOfScopeNode} mermaidReady={mermaidReady} compact />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionBody({ node, mermaidReady }) {
  if (isEmptyBody(node.body) && node.type !== "deepdive") {
    if (hasImages(node)) return null;

    return (
      <p className="border-l-2 border-[var(--hld-border)] pl-4 text-sm leading-6 text-[var(--hld-muted)]">
        Notes for this step are not filled in the source file yet.
      </p>
    );
  }

  if (node.type === "deepdive") {
    return (
      <div className="space-y-4">
        {node.children.length === 0 ? <p className="text-sm text-[var(--hld-muted)]">No deep-dive items yet.</p> : null}
        {node.children.map((child, index) => (
          <SolutionSection key={child.id} node={child} mermaidReady={mermaidReady} index={index} />
        ))}
      </div>
    );
  }

  if (node.type === "diagram") {
    return <MermaidBlock code={node.body} caption={node.caption} ready={mermaidReady} />;
  }

  if (node.slug === "core-entities") {
    return <CoreEntitiesBlock body={node.body} />;
  }

  return <MarkdownBlock body={stripEmptyBulletOnlyLines(node.body)} />;
}

function SectionImages({ images }) {
  return (
    <div className="mt-6 grid gap-4">
      {images.map((image) => (
        <figure
          key={image.src}
          className="overflow-hidden rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface-2)]"
        >
          <div className="overflow-auto bg-[var(--hld-surface)] p-3">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="mx-auto h-auto max-w-full rounded-md"
            />
          </div>
          <figcaption className="border-t border-[var(--hld-border)] px-3 py-2 text-xs font-medium text-[var(--hld-muted)]">
            {image.alt}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function CoreEntitiesBlock({ body }) {
  const items = extractPlainItems(body);
  if (items.length < 2 || items.length > 12) {
    return <MarkdownBlock body={stripEmptyBulletOnlyLines(body)} />;
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex min-h-10 items-center rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-3 text-sm font-semibold text-[var(--hld-heading)]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
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

function prepareSolution(sections) {
  const used = new Map();
  const nodes = sections.map((section, index) => buildNode(section, 0, [index], used));
  const outOfScopeNode = nodes.find((node) => node.slug === "out-of-scope") || null;
  const visibleSections = nodes.filter((node) => node.slug !== "out-of-scope");

  return { visibleSections, outOfScopeNode };
}

function buildNode(section, depth, indexPath, used) {
  const slug = slugify(section.title) || `section-${indexPath.join("-")}`;
  const id = makeId(section.title, `section-${indexPath.join("-")}`, used);
  const node = {
    id,
    slug,
    depth,
    type: section.type || "markdown",
    title: section.title || "Untitled",
    body: section.body || "",
    caption: section.caption || "",
    images: Array.isArray(section.images) ? section.images : [],
    children: []
  };

  if (node.type === "deepdive") {
    node.children = (section.items || []).map((child, index) => buildNode(child, depth + 1, [...indexPath, index], used));
  }

  return node;
}

function makeId(title, fallback, used) {
  const base = slugify(title) || fallback || "section";
  const count = used.get(base) || 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function isEmptyBody(body) {
  return stripEmptyBulletOnlyLines(body).trim().length === 0;
}

function hasImages(node) {
  return Array.isArray(node.images) && node.images.length > 0;
}

function stripEmptyBulletOnlyLines(body) {
  return String(body || "")
    .split("\n")
    .filter((line) => !/^\s*(?:[-*•○◦▪▫□◊§®]+)\s*$/.test(line))
    .join("\n")
    .trim();
}

function extractPlainItems(body) {
  return stripEmptyBulletOnlyLines(body)
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/^(?:[-*•○◦▪▫□◊§®]|\d+[.)]|[a-z][.)]|[ivxlcdm]+[.)])\s+/i, "")
        .trim()
    )
    .filter(Boolean);
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
  const colors = getMermaidThemeColors();
  window.mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      background: colors.surface,
      primaryColor: colors.brandSoft,
      primaryTextColor: colors.heading,
      primaryBorderColor: colors.brand,
      lineColor: colors.muted,
      secondaryColor: colors.surface2,
      tertiaryColor: colors.surface2,
      fontFamily: "Inter, sans-serif",
      fontSize: "14px"
    },
    flowchart: { curve: "basis", htmlLabels: true, padding: 14 }
  });
}

function getMermaidThemeColors() {
  if (typeof window === "undefined") {
    return {
      surface: "#ffffff",
      surface2: "#f8fafc",
      heading: "#1f2937",
      muted: "#64748b",
      brand: "#4f46e5",
      brandSoft: "#eef2ff"
    };
  }

  const styles = window.getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    surface: read("--site-surface", "#ffffff"),
    surface2: read("--site-surface-2", "#f8fafc"),
    heading: read("--site-heading", "#1f2937"),
    muted: read("--site-muted", "#64748b"),
    brand: read("--site-brand", "#4f46e5"),
    brandSoft: read("--site-brand-soft", "#eef2ff")
  };
}
