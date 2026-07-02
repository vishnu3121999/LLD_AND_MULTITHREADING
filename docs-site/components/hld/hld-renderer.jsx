"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Code2,
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
  "api-design": {
    number: "3",
    label: "Interface",
    hint: "Pick the protocol, then show concrete request and response contracts.",
    icon: Code2
  },
  "high-level-design": {
    number: "4",
    label: "Architecture",
    hint: "Show components, data stores, queues, caches, and the main request flows.",
    icon: Network
  },
  "deep-dives": {
    number: "5",
    label: "Optimizations & Tradeoffs",
    hint: "Quantify bottlenecks, compare options, and close failure-mode gaps.",
    icon: SearchCheck
  }
};

const answerFlow = [
  ["1", "Functional requirements"],
  ["2", "Non-functional requirements"],
  ["3", "API design"],
  ["4", "High-level design"],
  ["5", "Deep dives"]
];

const sectionTemplates = {
  "functional-requirements": {
    title: "Functional Requirements Template",
    summary: "Write the visible capabilities the system must support. Keep them scoped and interview-sized.",
    groups: [
      {
        title: "Expected shape",
        items: [
          "Users should be able to <primary action>.",
          "Users should be able to <secondary action>.",
          "Users should be able to <read or navigation action>."
        ]
      },
      {
        title: "Out of scope",
        items: [
          "Move non-essential features under Out of Scope.",
          "Call out personalization, sharing, admin tools, analytics, or recommendations only if they matter."
        ]
      }
    ]
  },
  "out-of-scope": {
    title: "Out of Scope Template",
    summary: "Use this to protect time and make the interview boundary explicit.",
    groups: [
      {
        title: "Good candidates",
        items: [
          "Features that are useful but not central to the core system.",
          "Expensive add-ons like personalization, social sharing, advanced search, or admin workflows."
        ]
      }
    ]
  },
  "non-functional-requirements": {
    title: "Non-Functional Requirements Template",
    summary: "Convert the functional requirements into concrete quality targets and scale assumptions.",
    groups: [
      {
        title: "Reliability and consistency",
        items: [
          "No SPOF / fault tolerance.",
          "Decide consistency vs availability for each important functional requirement.",
          "If availability wins, define how much staleness the system can tolerate.",
          "If consistency wins, explain what must be immediately visible."
        ]
      },
      {
        title: "Scale and performance",
        items: [
          "System size, especially for existing systems or feature additions.",
          "DAU or active tenant count when relevant.",
          "For each functional requirement, estimate throughput and latency.",
          "Mention hot keys or celebrity users when applicable.",
          "Add traffic spikes only if time allows or the problem clearly needs it."
        ]
      }
    ]
  },
  "api-design": {
    title: "API Design Template",
    summary: "Show the external contract before the architecture. Keep APIs task-oriented, not table-shaped.",
    groups: [
      {
        title: "Protocol and shape",
        items: [
          "Explain which protocol or API style you will use.",
          "Design APIs around user actions and system flows.",
          "Use a full request body, not just a core entity name.",
          "Include fields needed by the API, even if they are not stored exactly the same way."
        ]
      },
      {
        title: "Streaming cases",
        items: [
          "For SSE, start with polling in the HLD, optimize with cursor-based polling, then propose SSE.",
          "For WebSockets, start with WebSockets in the HLD when bidirectional realtime communication is core."
        ]
      }
    ]
  },
  "high-level-design": {
    title: "High-Level Design Template",
    summary: "Draw the system around the functional requirements and make data movement obvious.",
    groups: [
      {
        title: "Diagram rules",
        items: [
          "Draw flows for each functional requirement.",
          "Use dotted arrows for reads and filled arrows for writes.",
          "Use double-headed arrows for WebSockets.",
          "If a flow reads and writes, show both directions explicitly."
        ]
      },
      {
        title: "Data details",
        items: [
          "Add primary key information for tables.",
          "Write the SQL query or access pattern for each dotted read arrow."
        ]
      }
    ]
  },
  "deep-dives": {
    title: "Deep Dives Template",
    summary: "Use deep dives to close bottlenecks, failure modes, and scale gaps.",
    groups: [
      {
        title: "Read latency",
        items: [
          "Estimate table sizes and query cost.",
          "Consider indexing, cursor instead of offset, precompute and store, materialized views, caching, TSDB, CDN, sharding locality, and OLAP."
        ]
      },
      {
        title: "Realtime and writes",
        items: [
          "For SSE/WebSockets, discuss Redis pub/sub or equivalent fanout.",
          "For write TPS, consider vertical scaling, sharding, batching, queues, load shedding, Cassandra, or TSDB."
        ]
      },
      {
        title: "Read QPS and availability",
        items: [
          "Use read replicas when writes are low or async replication is acceptable.",
          "Use caching when read volume dominates.",
          "For no SPOF, cover server replicas, autoscaling, DB sharding or replicas, R+W > RF when data loss is unacceptable, message brokers, and coordination systems."
        ]
      }
    ]
  },
  "trade-offs": {
    title: "Trade-Offs Template",
    summary: "Make the chosen design defensible by comparing real alternatives.",
    groups: [
      {
        title: "What to include",
        items: [
          "Decision or option.",
          "Why it helps.",
          "What it costs.",
          "When you would switch to the alternative."
        ]
      }
    ]
  },
  "interview-notes": {
    title: "Interview Notes Template",
    summary: "Keep short reminders for how to explain the solution under time pressure.",
    groups: [
      {
        title: "Good notes",
        items: [
          "Mention the most important bottleneck.",
          "Call out the key trade-off.",
          "State the assumption that makes the design reasonable."
        ]
      }
    ]
  }
};

export function HldProblemRenderer({ problem, preview = false }) {
  const [mermaidReady, setMermaidReady] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [openTemplateIds, setOpenTemplateIds] = useState(() => new Set());
  const solution = useMemo(() => prepareSolution(problem?.sections || []), [problem?.sections]);

  function toggleTemplate(nodeId) {
    setOpenTemplateIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

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
        {renderSolutionSections(solution, mermaidReady, {
          openTemplateIds,
          showAllTemplates,
          onToggleTemplate: toggleTemplate
        })}
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
              <button
                type="button"
                onClick={() => setShowAllTemplates((current) => !current)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)]"
                aria-pressed={showAllTemplates}
              >
                <FileText size={15} aria-hidden="true" />
                {showAllTemplates ? "Hide templates" : "Show templates"}
              </button>
              <Link
                href="/hld"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)]"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Library
              </Link>
              {problem.source === "json" && (
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
              Overview
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

function renderSolutionSections(solution, mermaidReady, templateControls) {
  const items = [];
  const sections = solution.visibleSections;

  for (let index = 0; index < sections.length; index += 1) {
    const node = sections[index];
    const nextNode = sections[index + 1];

    if (node.slug === "functional-requirements" && nextNode?.slug === "non-functional-requirements") {
      items.push(
        <div key="requirements-pair" className="grid gap-4 xl:grid-cols-2">
          <SolutionSection
            compact
            index={index}
            mermaidReady={mermaidReady}
            node={node}
            templateControls={templateControls}
            outOfScopeNode={solution.outOfScopeNode}
          />
          <SolutionSection
            compact
            index={index + 1}
            mermaidReady={mermaidReady}
            node={nextNode}
            templateControls={templateControls}
          />
        </div>
      );
      index += 1;
      continue;
    }

    items.push(
      <SolutionSection
        key={node.id}
        index={index}
        mermaidReady={mermaidReady}
        node={node}
        templateControls={templateControls}
        outOfScopeNode={node.slug === "functional-requirements" ? solution.outOfScopeNode : null}
      />
    );
  }

  return items;
}

function SolutionSection({ node, mermaidReady, index, outOfScopeNode, templateControls, compact = false }) {
  const blueprint = sectionBlueprints[node.slug] || {
    number: String(index + 1),
    label: "Design Notes",
    hint: "Problem-specific notes.",
    icon: FileText
  };
  const Icon = blueprint.icon;
  const template = getSectionTemplate(node);
  const isTemplateOpen = Boolean(templateControls?.showAllTemplates || templateControls?.openTemplateIds?.has(node.id));

  return (
    <section
      id={node.id}
      className="scroll-mt-24 overflow-hidden rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
    >
      <div className={compact ? "grid" : "grid md:grid-cols-[76px_minmax(0,1fr)]"}>
        <div className={compact ? "border-b border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-5 py-4" : "border-b border-[var(--hld-border)] bg-[var(--hld-surface-2)] p-5 md:border-b-0 md:border-r"}>
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
              <h2 className={compact ? "mt-2 text-xl font-semibold leading-tight tracking-normal text-[var(--hld-heading)]" : "mt-2 text-2xl font-semibold tracking-normal text-[var(--hld-heading)]"}>
                {node.title || "Untitled"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => templateControls?.onToggleTemplate?.(node.id)}
              className="inline-flex h-8 shrink-0 items-center gap-2 self-start rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-2.5 text-xs font-semibold text-[var(--hld-muted)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)] hover:text-[var(--hld-heading)]"
              aria-expanded={isTemplateOpen}
            >
              <FileText size={14} aria-hidden="true" />
              {isTemplateOpen && !templateControls?.showAllTemplates ? "Hide template" : "Template"}
            </button>
          </div>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--hld-muted)]">
            {blueprint.hint}
          </p>

          {isTemplateOpen && (
            <TemplatePanel template={template} />
          )}

          {node.slug !== "high-level-design" && Array.isArray(node.images) && node.images.length > 0 && (
            <SectionImages images={node.images} />
          )}

          <div className="mt-5">
            <SectionBody node={node} mermaidReady={mermaidReady} />
          </div>

          {outOfScopeNode && (
            <div id={outOfScopeNode.id} className="mt-6 scroll-mt-24 border-l-2 border-[var(--hld-brand)] pl-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                  <Ban size={14} aria-hidden="true" />
                  Out of Scope
                </div>
                <button
                  type="button"
                  onClick={() => templateControls?.onToggleTemplate?.(outOfScopeNode.id)}
                  className="inline-flex h-8 shrink-0 items-center gap-2 self-start rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-2.5 text-xs font-semibold text-[var(--hld-muted)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)] hover:text-[var(--hld-heading)]"
                  aria-expanded={Boolean(templateControls?.showAllTemplates || templateControls?.openTemplateIds?.has(outOfScopeNode.id))}
                >
                  <FileText size={14} aria-hidden="true" />
                  {templateControls?.openTemplateIds?.has(outOfScopeNode.id) && !templateControls?.showAllTemplates ? "Hide template" : "Template"}
                </button>
              </div>
              {(templateControls?.showAllTemplates || templateControls?.openTemplateIds?.has(outOfScopeNode.id)) && (
                <TemplatePanel template={getSectionTemplate(outOfScopeNode)} />
              )}
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

function TemplatePanel({ template }) {
  return (
    <div className="mt-4 border-l-2 border-[var(--hld-brand)] pl-4">
      <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
        <FileText size={14} aria-hidden="true" />
        Template
      </div>
      <h3 className="mt-2 text-sm font-semibold tracking-normal text-[var(--hld-heading)]">
        {template.title}
      </h3>
      <p className="mt-1 max-w-4xl text-sm leading-6 text-[var(--hld-muted)]">
        {template.summary}
      </p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {template.groups.map((group) => (
          <div key={group.title}>
            <div className="text-xs font-semibold text-[var(--hld-heading)]">{group.title}</div>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-5 text-[var(--hld-muted)]">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSectionTemplate(node) {
  return sectionTemplates[node.slug] || {
    title: `${node.title || "Section"} Template`,
    summary: "Use this section for problem-specific elaboration that does not fit the standard HLD flow.",
    groups: [
      {
        title: "Suggested structure",
        items: [
          "State the problem or decision clearly.",
          "List the important assumptions.",
          "Explain the chosen approach and the trade-off."
        ]
      }
    ]
  };
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

  if (node.slug === "non-functional-requirements") {
    return <NonFunctionalRequirementsBlock body={stripEmptyBulletOnlyLines(node.body)} />;
  }

  if (node.slug === "api-design") {
    return <ApiDesignBlock body={stripEmptyBulletOnlyLines(node.body)} />;
  }

  if (node.slug === "high-level-design") {
    return <HighLevelDesignBlock body={stripEmptyBulletOnlyLines(node.body)} images={node.images} />;
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

function NonFunctionalRequirementsBlock({ body }) {
  const outline = useMemo(() => parseNfrOutline(body), [body]);
  if (outline.length === 0) return <MarkdownBlock body={body} />;

  return (
    <div className="hld-course-prose hld-nfr-prose">
      <ol className="hld-nfr-list">
        {outline.map((item, index) => (
          <NfrOutlineItem key={`${item.text}-${index}`} index={index} item={item} />
        ))}
      </ol>
    </div>
  );
}

function NfrOutlineItem({ item, index }) {
  return (
    <li className="hld-nfr-item">
      <span className="hld-nfr-index">{index + 1}.</span>
      <div className="min-w-0">
        <InlineMarkdownText className="hld-nfr-text" value={item.text} />
        {item.children.length > 0 && <NfrDetailList items={item.children} />}
      </div>
    </li>
  );
}

function NfrDetailList({ items, depth = 0 }) {
  return (
    <ul className="hld-nfr-details">
      {items.map((item, index) => (
        <li key={`${item.text}-${index}`} className="hld-nfr-detail" style={{ marginLeft: `${Math.min(depth, 1) * 0.45}rem` }}>
          <span className="hld-nfr-bullet" aria-hidden="true">{"\u2022"}</span>
          <div className="min-w-0">
            <InlineMarkdownText className="hld-nfr-detail-text" value={item.text} />
            {item.children.length > 0 && <NfrDetailList items={item.children} depth={depth + 1} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function InlineMarkdownText({ value, className }) {
  const html = useMemo(() => marked.parseInline(String(value || "")), [value]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function HighLevelDesignBlock({ body, images = [] }) {
  const parsed = useMemo(() => parseHighLevelDesign(body), [body]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(parsed.flows.length - 1, 0)));
  }, [parsed.flows.length]);

  if (parsed.flows.length === 0) {
    return <MarkdownBlock body={body} />;
  }

  const hasTabs = true;
  const activeFlow = parsed.flows[activeIndex] || parsed.flows[0];

  return (
    <div className="hld-flow-tabs">
      {parsed.intro && <MarkdownBlock body={parsed.intro} />}
      <div className="hld-flow-tablist" role="tablist" aria-label="High-level design flows">
        {parsed.flows.map((flow, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`${flow.id}-${index}`}
              type="button"
              id={`hld-flow-tab-${index}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`hld-flow-panel-${index}`}
              className={`hld-flow-tab ${isActive ? "hld-flow-tab-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              >
                <span>{flow.id}</span>
              </button>
          );
        })}
      </div>
      <div
        id={`hld-flow-panel-${activeIndex}`}
        role="tabpanel"
        aria-labelledby={`hld-flow-tab-${activeIndex}`}
        className="hld-flow-panel"
      >
        <HldFlowItem key={`${activeFlow.id}-${activeIndex}`} flow={activeFlow} index={activeIndex} images={images} showHeading={!hasTabs} />
      </div>
    </div>
  );
}

function HldFlowItem({ flow, index, images, showHeading = true }) {
  return (
    <section className="hld-flow-item">
      {showHeading && (
        <div className="hld-flow-heading">
          <span className="hld-flow-index">{index + 1}.</span>
          <span className="hld-flow-id">{flow.id}</span>
        </div>
      )}

      <HldFlowImage flowId={flow.id} images={images} />

      {flow.sql && <HldSqlBlock code={flow.sql} />}

      {flow.explanation && (
        <div className="hld-flow-explanation">
          <MarkdownBlock body={flow.explanation} />
        </div>
      )}
    </section>
  );
}

function HldFlowImage({ flowId, images = [] }) {
  const matching = images.filter((image) => image.hldFlow === flowId);
  const light = matching.find((image) => image.theme === "light");
  const dark = matching.find((image) => image.theme === "dark");
  const fallback = matching.find((image) => !image.theme) || matching[0];

  if (!light && !dark && !fallback) return null;

  return (
    <figure className="hld-flow-image-frame">
      {light && (
        <img
          src={light.src}
          alt={light.alt || `${flowId} architecture`}
          loading="lazy"
          className={`hld-flow-image ${dark ? "hld-flow-image-light" : ""}`}
        />
      )}
      {dark && (
        <img
          src={dark.src}
          alt={dark.alt || `${flowId} architecture`}
          loading="lazy"
          className={`hld-flow-image ${light ? "hld-flow-image-dark" : ""}`}
        />
      )}
      {!light && !dark && fallback && (
        <img
          src={fallback.src}
          alt={fallback.alt || `${flowId} architecture`}
          loading="lazy"
          className="hld-flow-image"
        />
      )}
    </figure>
  );
}

function HldSqlBlock({ code }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      hljs.highlightElement(ref.current);
    } catch {
      // Highlighting should never block rendering the solution.
    }
  }, [code]);

  return (
    <figure className="hld-flow-sql">
      <figcaption>SQL</figcaption>
      <pre>
        <code ref={ref} className="language-sql">{code}</code>
      </pre>
    </figure>
  );
}

function ApiDesignBlock({ body }) {
  const parsed = useMemo(() => parseApiDesign(body), [body]);

  if (parsed.endpoints.length === 0) {
    return <MarkdownBlock body={body} />;
  }

  return (
    <div className="hld-api-spec">
      <div className="hld-api-endpoints">
        {parsed.endpoints.map((endpoint, index) => (
          <ApiEndpointCard key={`${endpoint.method}-${endpoint.path}-${index}`} number={index + 1} endpoint={endpoint} />
        ))}
      </div>
    </div>
  );
}

function ApiEndpointCard({ endpoint, number }) {
  const hasContract = endpoint.requestBody || endpoint.responseBody || endpoint.extraBlocks.length > 0;
  const status = endpoint.status ? formatInlineApiStatus(endpoint.status.code) : "";

  return (
    <section className="hld-api-endpoint">
      <div className="hld-api-request-line">
        <span className="hld-api-index">{number}.</span>
        <span className="hld-api-method">
          {endpoint.method}
        </span>
        <code className="hld-api-path">
          {endpoint.path}
        </code>
        {endpoint.returns && (
          <span className="hld-api-return">returns {endpoint.returns}</span>
        )}
        {status && (
          <span className="hld-api-status-inline">
            <span>Status</span>
            <code>{status}</code>
          </span>
        )}
      </div>

      {hasContract && (
        <div className={`hld-api-contract-grid ${endpoint.requestBody ? "" : "hld-api-contract-grid-single"}`}>
          {endpoint.requestBody && (
            <ApiBodyBlock title="Request body" block={endpoint.requestBody} />
          )}

          {(endpoint.responseBody || endpoint.extraBlocks.length > 0) && (
            <div className="hld-api-response-stack">
              {endpoint.responseBody && <ApiBodyBlock title="Response body" block={endpoint.responseBody} />}
              {endpoint.extraBlocks.map((block, index) => (
                <ApiBodyBlock key={`${block.role}-${index}`} title={block.role === "requestBody" ? "Request body" : "Response body"} block={block} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ApiBodyBlock({ title, block }) {
  return (
    <figure className="hld-api-body-block">
      <figcaption className="hld-api-body-caption">
        <span>{title}</span>
      </figcaption>
      <pre>
        <code>{block.code}</code>
      </pre>
    </figure>
  );
}

function formatInlineApiStatus(value) {
  return String(value || "").replace(/\s*\n\s*/g, " ").trim();
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
  const visibleSections = nodes.filter((node) => node.slug !== "out-of-scope" && node.slug !== "core-entities");

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

function parseNfrOutline(body) {
  const root = { children: [] };
  const stack = [{ indent: -1, node: root }];
  const lines = String(body || "").replace(/\r\n/g, "\n").split("\n");

  lines.forEach((line) => {
    if (!line.trim()) return;

    const indent = line.length - line.trimStart().length;
    const text = line
      .trim()
      .replace(/^(?:\d+[.)]|[-*])\s+/, "")
      .trim();

    if (!text) return;

    const node = { text, children: [] };
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    stack[stack.length - 1].node.children.push(node);
    stack.push({ indent, node });
  });

  return root.children;
}

function stripTrailingColon(value) {
  return String(value || "").trim().replace(/\s*:\s*$/, "");
}

function parseHighLevelDesign(body) {
  const tokens = tokenizeMarkdownFences(body);
  const intro = [];
  const flows = [];
  let currentFlow = null;
  let mode = "notes";

  function startFlow(id, firstLine = "") {
    currentFlow = {
      id: id.toUpperCase(),
      notes: [],
      sql: "",
      explanation: []
    };
    flows.push(currentFlow);
    mode = "notes";
    if (firstLine.trim()) currentFlow.notes.push(firstLine.trim());
  }

  function appendText(value) {
    const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");

    lines.forEach((line) => {
      const trimmed = line.trim();
      const flowMatch = trimmed.match(/^(FR-\d+)\s*:\s*(.*)$/i);
      if (flowMatch) {
        startFlow(flowMatch[1], flowMatch[2] || "");
        return;
      }

      const explanationMatch = trimmed.match(/^EXPLANATION\s*:\s*(.*)$/i);
      if (explanationMatch && currentFlow) {
        mode = "explanation";
        if (explanationMatch[1]) currentFlow.explanation.push(explanationMatch[1]);
        return;
      }

      if (!currentFlow) {
        intro.push(line);
        return;
      }

      if (mode === "explanation") {
        currentFlow.explanation.push(line);
      } else {
        currentFlow.notes.push(line);
      }
    });
  }

  tokens.forEach((token) => {
    if (token.type === "text") {
      appendText(token.value);
      return;
    }

    if (currentFlow && String(token.lang || "").toLowerCase() === "sql" && !currentFlow.sql) {
      currentFlow.sql = token.code.trim();
      return;
    }

    const fenced = [
      `\`\`\`${token.lang || ""}`,
      token.code.trim(),
      "```"
    ].join("\n");

    if (currentFlow && mode === "explanation") {
      currentFlow.explanation.push(fenced);
    } else if (currentFlow) {
      currentFlow.notes.push(fenced);
    } else {
      intro.push(fenced);
    }
  });

  return {
    intro: intro.join("\n").trim(),
    flows: flows.map((flow) => ({
      ...flow,
      notes: flow.notes.join("\n").trim(),
      explanation: flow.explanation.join("\n").trim()
    }))
  };
}

function parseApiDesign(body) {
  const tokens = tokenizeMarkdownFences(body);
  const intro = [];
  const endpoints = [];
  let currentEndpoint = null;
  let pendingText = "";

  tokens.forEach((token) => {
    if (token.type === "text") {
      const structured = parseStructuredApiText(token.value);
      if (structured.endpoints.length > 0) {
        if (!currentEndpoint && pendingText.trim()) intro.push(pendingText.trim());
        structured.endpoints.forEach((endpoint) => {
          endpoints.push(endpoint);
          currentEndpoint = endpoint;
        });
        pendingText = "";
        return;
      }

      pendingText = joinMarkdownText(pendingText, token.value);
      return;
    }

    const signature = parseEndpointSignature(token.code);
    if (signature) {
      if (!currentEndpoint && pendingText.trim()) {
        intro.push(pendingText.trim());
      }

      currentEndpoint = {
        ...createApiEndpoint(signature)
      };
      endpoints.push(currentEndpoint);
      applyStructuredApiText(currentEndpoint, getEndpointRemainder(token.code));
      pendingText = "";
      return;
    }

    if (currentEndpoint) {
      const role = inferApiBlockRole(currentEndpoint, pendingText, token.lang, token.code);
      assignApiBlock(currentEndpoint, role, {
        lang: token.lang || "text",
        code: token.code.trim()
      });
      pendingText = "";
      return;
    }

    intro.push(
      [
        pendingText.trim(),
        `\`\`\`${token.lang || ""}`,
        token.code.trim(),
        "```"
      ].filter(Boolean).join("\n")
    );
    pendingText = "";
  });

  if (pendingText.trim()) {
    if (!currentEndpoint) intro.push(pendingText.trim());
  }

  return {
    intro: intro.filter(Boolean).join("\n\n"),
    endpoints
  };
}

function tokenizeMarkdownFences(body) {
  const lines = String(body || "").replace(/\r\n/g, "\n").split("\n");
  const tokens = [];
  let textLines = [];

  function flushText() {
    const value = textLines.join("\n").trim();
    if (value) tokens.push({ type: "text", value });
    textLines = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const fence = lines[index].match(/^```([A-Za-z0-9_-]*)\s*$/);
    if (!fence) {
      textLines.push(lines[index]);
      continue;
    }

    flushText();
    const lang = fence[1] || "";
    const codeLines = [];
    index += 1;

    while (index < lines.length && !/^```\s*$/.test(lines[index])) {
      codeLines.push(lines[index]);
      index += 1;
    }

    tokens.push({ type: "code", lang, code: codeLines.join("\n") });
  }

  flushText();
  return tokens;
}

function parseEndpointSignature(code) {
  const firstLine = String(code || "").split("\n").map((line) => line.trim()).find(Boolean) || "";
  return parseEndpointSignatureLine(firstLine);
}

function parseEndpointSignatureLine(line) {
  const match = String(line || "").trim().match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+?)(?:\s*->\s*(.+))?$/i);
  if (!match) return null;

  return {
    method: match[1].toUpperCase(),
    path: match[2].trim(),
    returns: (match[3] || "").trim()
  };
}

function createApiEndpoint(signature) {
  return {
    ...signature,
    requestBody: null,
    status: null,
    responseBody: null,
    extraBlocks: []
  };
}

function getEndpointRemainder(code) {
  const lines = String(code || "").replace(/\r\n/g, "\n").split("\n");
  const firstEndpointIndex = lines.findIndex((line) => parseEndpointSignatureLine(line.trim()));
  return firstEndpointIndex >= 0 ? lines.slice(firstEndpointIndex + 1).join("\n") : "";
}

function parseStructuredApiText(value) {
  const endpoints = [];
  let currentEndpoint = null;

  applyStructuredApiText(
    {
      get current() {
        return currentEndpoint;
      },
      set current(endpoint) {
        currentEndpoint = endpoint;
        endpoints.push(endpoint);
      }
    },
    value
  );

  return { endpoints };
}

function applyStructuredApiText(target, value) {
  const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
  let block = null;

  function getCurrentEndpoint() {
    return target.current === undefined ? target : target.current;
  }

  function setCurrentEndpoint(endpoint) {
    if (target.current === undefined) return;
    target.current = endpoint;
  }

  function flushBlock() {
    const endpoint = getCurrentEndpoint();
    if (!endpoint || !block) return;

    const code = block.lines.join("\n").trim();
    if (code) {
      assignApiBlock(endpoint, block.role, {
        lang: inferStructuredApiLang(block.role, code),
        code: block.role === "status" ? normalizeStatusText(code) : code
      });
    }

    block = null;
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    const signature = parseEndpointSignatureLine(trimmed);

    if (signature) {
      flushBlock();
      setCurrentEndpoint(createApiEndpoint(signature));
      return;
    }

    const endpoint = getCurrentEndpoint();
    if (!endpoint) return;

    const label = parseApiFieldLabel(trimmed);
    if (label) {
      flushBlock();
      block = { role: label.role, lines: label.inline ? [label.inline] : [] };
      return;
    }

    if (block) {
      block.lines.push(line);
    }
  });

  flushBlock();
}

function parseApiFieldLabel(line) {
  const match = String(line || "").match(/^(REQUEST\s+BODY|RESPONSE\s+BODY|STATUS)\s*:\s*(.*)$/i);
  if (!match) return null;

  const label = match[1].replace(/\s+/g, " ").toLowerCase();
  const role = label === "request body" ? "requestBody" : label === "response body" ? "responseBody" : "status";

  return {
    role,
    inline: (match[2] || "").trim()
  };
}

function inferStructuredApiLang(role, code) {
  if (role === "status") return "http";
  const trimmed = String(code || "").trim();
  if (/^[\[{]/.test(trimmed)) return "json";
  return "text";
}

function normalizeStatusText(value) {
  return String(value || "")
    .trim()
    .replace(/^(\d{3})\s*,\s*/, "$1 ")
    .replace(/^(\d{3})\s+,\s*/, "$1 ");
}

function inferApiBlockRole(endpoint, leadText, lang, code) {
  const text = String(leadText || "").toLowerCase();
  const firstLine = String(code || "").trim().split("\n")[0] || "";
  const language = String(lang || "").toLowerCase();

  if (/\b(status|location)\b/.test(text) || /^\d{3}\b/.test(firstLine) || /^http\/\d/i.test(firstLine)) {
    return "status";
  }

  if (/\b(response\s+body|response|returns?)\b/.test(text)) {
    return "responseBody";
  }

  if (/\b(request\s+body|request|payload|post|put|patch)\b/.test(text)) {
    return "requestBody";
  }

  if (language === "json" && /^(POST|PUT|PATCH)$/i.test(endpoint.method)) {
    return "requestBody";
  }

  return "responseBody";
}

function assignApiBlock(endpoint, role, block) {
  if (role === "requestBody" && !endpoint.requestBody) {
    endpoint.requestBody = block;
    return;
  }

  if (role === "status" && !endpoint.status) {
    endpoint.status = block;
    return;
  }

  if (role === "responseBody" && !endpoint.responseBody) {
    endpoint.responseBody = block;
    return;
  }

  endpoint.extraBlocks.push({ ...block, role });
}

function joinMarkdownText(current, next) {
  if (!current.trim()) return next;
  if (!next.trim()) return current;
  return `${current.trim()}\n\n${next.trim()}`;
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
