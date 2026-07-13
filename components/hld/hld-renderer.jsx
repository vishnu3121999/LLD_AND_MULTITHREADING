"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Ban,
  ChevronLeft,
  ChevronRight,
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
import { useLiveDocument } from "./use-live-document";

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

export function HldProblemRenderer({ problem, preview = false, isAdmin = false }) {
  const renderedProblem = useLiveDocument(problem, {
    enabled: !preview,
    url: !preview && problem?.id ? `/api/hld/problems/${problem.id}` : ""
  });
  const [mermaidReady, setMermaidReady] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [openTemplateIds, setOpenTemplateIds] = useState(() => new Set());
  const solution = useMemo(
    () => prepareSolution(renderedProblem?.sections || [], renderedProblem?.images || []),
    [renderedProblem?.sections, renderedProblem?.images]
  );

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
          requirementsLayout: normalizeRequirementsLayout(renderedProblem?.requirementsLayout),
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
                {(renderedProblem.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--hld-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-[var(--hld-heading)]">
                {renderedProblem.title}
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
              {isAdmin && (
                <Link
                  href={`/hld/${renderedProblem.id}/edit`}
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
            <OverviewBody problem={renderedProblem} overviewNode={solution.overviewNode} />
          </div>
        </div>
      </header>

      {content}
    </article>
  );
}

function OverviewBody({ problem, overviewNode }) {
  const body = stripEmptyBulletOnlyLines(overviewNode?.body || "");

  if (body) {
    return (
      <div className="mt-2 hld-overview-body">
        <HldStructuredMarkdown body={body} images={getNodeImages(overviewNode)} />
      </div>
    );
  }

  return (
    <p className="mt-2 max-w-4xl text-base leading-7 text-[var(--hld-muted)]">
      {problem.summary || "Problem summary is not available in the source notes."}
    </p>
  );
}

function normalizeRequirementsLayout(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  if (["stacked", "vertical", "up-down", "up/down", "top-bottom", "rows"].includes(normalized)) {
    return "stacked";
  }

  return "side-by-side";
}

function renderSolutionSections(solution, mermaidReady, templateControls) {
  const items = [];
  const sections = solution.visibleSections;

  for (let index = 0; index < sections.length; index += 1) {
    const node = sections[index];
    const nextNode = sections[index + 1];

    if (node.slug === "functional-requirements" && nextNode?.slug === "non-functional-requirements") {
      const stackedRequirements = templateControls?.requirementsLayout === "stacked";
      const layoutClass = templateControls?.requirementsLayout === "stacked"
        ? "grid gap-4"
        : "grid gap-4 xl:grid-cols-2";

      items.push(
        <div key="requirements-pair" className={layoutClass}>
          <SolutionSection
            compact={!stackedRequirements}
            index={index}
            mermaidReady={mermaidReady}
            node={node}
            templateControls={templateControls}
            outOfScopeNode={solution.outOfScopeNode}
          />
          <SolutionSection
            compact={!stackedRequirements}
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

          {node.slug !== "high-level-design" && node.slug !== "deep-dives" && Array.isArray(node.images) && node.images.length > 0 && (
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

  return (
    <HldStructuredMarkdown
      body={stripEmptyBulletOnlyLines(node.body)}
      images={getNodeImages(node)}
    />
  );
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

function OverflowTabList({ className, ariaLabel, children }) {
  const ref = useRef(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    hasOverflow: false
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    function updateScrollState() {
      const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
      setScrollState({
        canScrollLeft: element.scrollLeft > 2,
        canScrollRight: element.scrollLeft < maxScrollLeft - 2,
        hasOverflow: maxScrollLeft > 2
      });
    }

    updateScrollState();
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children]);

  function scrollTabs(direction) {
    const element = ref.current;
    if (!element) return;

    element.scrollBy({
      left: direction * Math.max(180, Math.floor(element.clientWidth * 0.75)),
      behavior: "smooth"
    });
  }

  return (
    <div className="hld-tab-strip" data-overflow={scrollState.hasOverflow ? "true" : "false"}>
      <button
        type="button"
        className="hld-tab-scroll"
        onClick={() => scrollTabs(-1)}
        disabled={!scrollState.canScrollLeft}
        aria-label="Scroll tabs left"
      >
        <ChevronLeft size={15} aria-hidden="true" />
      </button>

      <div ref={ref} className={className} role="tablist" aria-label={ariaLabel}>
        {children}
      </div>

      <button
        type="button"
        className="hld-tab-scroll"
        onClick={() => scrollTabs(1)}
        disabled={!scrollState.canScrollRight}
        aria-label="Scroll tabs right"
      >
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function HldStructuredMarkdown({ body, images = [] }) {
  const parsed = useMemo(() => parseHldStructuredBlocks(body), [body]);

  if (!parsed.hasStructuredBlocks) {
    return <MarkdownBlock body={body} />;
  }

  return (
    <div className="grid gap-4">
      {parsed.blocks.map((block, index) => (
        <HldStructuredBlock
          key={`${block.type}-${index}`}
          block={block}
          blockKey={`hld-block-${index}`}
          images={images}
        />
      ))}
    </div>
  );
}

function HldStructuredBlock({ block, blockKey, images }) {
  if (block.type === "tabbed") {
    return <HldTabbedBlock tabs={block.tabs} blockKey={blockKey} images={images} />;
  }

  if (block.type === "sideBySide") {
    return <HldSideBySideBlock left={block.left} right={block.right} images={images} />;
  }

  if (block.type === "separator") {
    return <div className="hld-content-separator" aria-hidden="true" />;
  }

  if (!String(block.body || "").trim()) return null;
  return <MarkdownBlock body={block.body} />;
}

function HldTabbedBlock({ tabs, blockKey, images }) {
  const visibleTabs = tabs.filter((tab) => hasTabContent(tab));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(visibleTabs.length - 1, 0)));
  }, [visibleTabs.length]);

  if (visibleTabs.length === 0) return null;

  const activeTab = visibleTabs[activeIndex] || visibleTabs[0];

  return (
    <div className="hld-flow-tabs">
      <OverflowTabList className="hld-flow-tablist" ariaLabel="Tabbed HLD content">
        {visibleTabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`${tab.title}-${index}`}
              type="button"
              id={`${blockKey}-tab-${index}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${blockKey}-panel-${index}`}
              className={`hld-flow-tab ${isActive ? "hld-flow-tab-active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              <span>{tab.title || `Tab ${index + 1}`}</span>
            </button>
          );
        })}
      </OverflowTabList>
      <div
        id={`${blockKey}-panel-${activeIndex}`}
        role="tabpanel"
        aria-labelledby={`${blockKey}-tab-${activeIndex}`}
        className="hld-flow-panel"
      >
        <HldTabContent tab={activeTab} images={images} />
      </div>
    </div>
  );
}

function HldTabContent({ tab, images }) {
  const imageRefs = splitImageRefs(tab.fields.image);
  const explanation = joinMarkdownBlocks(tab.fields.explanation, tab.body);
  const sql = parseSqlField(tab.fields.sql);
  const hasExplanation = Boolean(explanation);
  const hasSql = Boolean(sql.code);

  return (
    <section className="hld-flow-item">
      {imageRefs.map((imageRef, index) => (
        <HldStructuredImage key={`${imageRef}-${index}`} imageRef={imageRef} images={images} />
      ))}

      {hasExplanation ? (
        <HldStructuredMarkdown body={explanation} images={images} />
      ) : null}

      {hasSql ? (
        <HldSqlBlock code={sql.code} lang={sql.lang} />
      ) : null}
    </section>
  );
}

function HldSideBySideBlock({ left, right, images }) {
  return (
    <div className="hld-side-by-side grid min-w-0 gap-4 xl:grid-cols-2">
      <div className="min-w-0">
        {left ? <HldStructuredPane body={left} images={images} /> : null}
      </div>
      <div className="min-w-0">
        {right ? <HldStructuredPane body={right} images={images} /> : null}
      </div>
    </div>
  );
}

function HldStructuredPane({ body, images }) {
  const pane = useMemo(() => parseLabeledPane(body), [body]);
  if (pane?.type === "sql") return <HldSqlBlock code={pane.code} lang={pane.lang} />;
  if (pane?.type === "markdown") return <HldStructuredMarkdown body={pane.body} images={images} />;
  return <HldStructuredMarkdown body={body} images={images} />;
}

function HldStructuredImage({ imageRef, images = [] }) {
  const imageSet = resolveStructuredImageSet(imageRef, images);
  const light = imageSet.light;
  const dark = imageSet.dark;
  const fallback = imageSet.fallback;

  if (!light && !dark && !fallback) return null;

  return (
    <figure className="hld-flow-image-frame">
      {light && (
        <img
          src={light.src}
          alt={light.alt || titleFromImagePath(imageRef)}
          loading="lazy"
          className={`hld-flow-image ${dark ? "hld-flow-image-light" : ""}`}
        />
      )}
      {dark && (
        <img
          src={dark.src}
          alt={dark.alt || titleFromImagePath(imageRef)}
          loading="lazy"
          className={`hld-flow-image ${light ? "hld-flow-image-dark" : ""}`}
        />
      )}
      {!light && !dark && fallback && (
        <img
          src={fallback.src}
          alt={fallback.alt || titleFromImagePath(imageRef)}
          loading="lazy"
          className="hld-flow-image"
        />
      )}
    </figure>
  );
}

function HldSqlBlock({ code, lang = "sql", title = "SQL" }) {
  return (
    <figure className="hld-flow-sql">
      <figcaption>{title}</figcaption>
      <pre>
        <code>{code}</code>
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
      {parsed.intro ? <MarkdownBlock body={parsed.intro} /> : null}
      <div className="hld-api-endpoints">
        {parsed.endpoints.map((endpoint, index) => (
          <ApiEndpointCard key={`${endpoint.method}-${endpoint.path}-${index}`} number={index + 1} endpoint={endpoint} />
        ))}
      </div>
    </div>
  );
}

function ApiEndpointCard({ endpoint, number }) {
  const extraContractBlocks = endpoint.extraBlocks.filter((block) => block.role !== "status");
  const requestBlocks = [
    endpoint.requestBody,
    ...extraContractBlocks.filter((block) => block.role === "requestBody")
  ].filter(Boolean);
  const responseBlocks = [
    endpoint.responseHeader ? { ...endpoint.responseHeader, role: "responseHeader" } : null,
    endpoint.responseBody ? { ...endpoint.responseBody, role: "responseBody" } : null,
    ...extraContractBlocks.filter((block) => block.role !== "requestBody")
  ].filter(Boolean);
  const hasRequestInfo = requestBlocks.length > 0;
  const hasResponseInfo = responseBlocks.length > 0;
  const hasContract = hasRequestInfo || hasResponseInfo;
  const status = endpoint.status ? formatInlineApiStatus(endpoint.status.code) : "";
  const hasMeta = hasApiEndpointMeta(endpoint);

  return (
    <section className="hld-api-endpoint">
      {hasMeta ? <ApiEndpointMeta endpoint={endpoint} /> : null}
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
        <div className="hld-api-contract-grid">
          <div className={`hld-api-contract-slot ${hasRequestInfo ? "" : "hld-api-contract-slot-empty"}`}>
            {requestBlocks.map((block, index) => (
              <ApiBodyBlock key={`${block.role || "requestBody"}-${index}`} title={getApiBlockTitle(block.role || "requestBody")} block={block} />
            ))}
          </div>

          <div className={`hld-api-contract-slot hld-api-response-stack ${hasResponseInfo ? "" : "hld-api-contract-slot-empty"}`}>
            {responseBlocks.map((block, index) => (
              <ApiBodyBlock key={`${block.role || "responseBody"}-${index}`} title={getApiBlockTitle(block.role || "responseBody")} block={block} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ApiEndpointMeta({ endpoint }) {
  return (
    <div className="hld-api-meta-line">
      {endpoint.requirement ? <span>{endpoint.requirement}</span> : null}
      {endpoint.title ? <span>{endpoint.title}</span> : null}
      {endpoint.protocol ? <span>Protocol: <code>{endpoint.protocol}</code></span> : null}
    </div>
  );
}

function hasApiEndpointMeta(endpoint) {
  return Boolean(endpoint?.requirement || endpoint?.title || endpoint?.protocol);
}

function getApiBlockTitle(role) {
  if (role === "requestBody") return "Request body";
  if (role === "responseHeader") return "Response header";
  return "Response body";
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
  const html = useMemo(() => marked.parse(formatHldNotes(body || "")), [body]);

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

function formatHldNotes(body) {
  const lines = splitLines(body);
  const output = [];
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (isFenceLine(line)) {
      output.push(line);
      inFence = !inFence;
      continue;
    }

    if (!inFence) {
      const quoteNote = parseQuotedNoteLine(line);
      if (quoteNote) {
        const noteLines = quoteNote.inline ? [quoteNote.inline] : [];

        while (index + 1 < lines.length) {
          const next = lines[index + 1];
          const quoted = next.match(/^\s*>\s?(.*)$/);
          if (!quoted) break;

          noteLines.push(quoted[1]);
          index += 1;
        }

        output.push(renderHldNoteHtml(noteLines.join("\n").trim()));
        continue;
      }

      const note = parseNoteLine(line);
      if (note) {
        const noteLines = note.inline ? [note.inline] : [];

        if (!note.inline) {
          while (index + 1 < lines.length) {
            const next = lines[index + 1];
            if (!next.trim() || isFenceLine(next)) break;

            noteLines.push(next);
            index += 1;
          }
        }

        output.push(renderHldNoteHtml(noteLines.join("\n").trim()));
        continue;
      }
    }

    output.push(line);
  }

  return output.join("\n");
}

function parseQuotedNoteLine(line) {
  const quoted = String(line || "").match(/^\s*>\s?(.*)$/);
  if (!quoted) return null;
  return parseNoteLine(quoted[1]);
}

function parseNoteLine(line) {
  const cleaned = String(line || "")
    .trim()
    .replace(/^[-*]\s+/, "");

  if (!cleaned) return null;

  const callout = cleaned.match(/^\[!NOTE\]\s*(.*)$/i);
  if (callout) return { inline: callout[1].trim() };

  const boldColon = cleaned.match(/^\*\*NOTE\s*[:\-]\s*\*\*\s*(.*)$/i);
  if (boldColon) return { inline: boldColon[1].trim() };

  const boldThenColon = cleaned.match(/^\*\*NOTE\*\*\s*[:\-]\s*(.*)$/i);
  if (boldThenColon) return { inline: boldThenColon[1].trim() };

  const plain = cleaned.match(/^NOTE\s*[:\-]\s*(.*)$/i);
  if (plain) return { inline: plain[1].trim() };

  if (/^(?:\*\*)?NOTE(?:\*\*)?$/i.test(cleaned)) return { inline: "" };

  return null;
}

function renderHldNoteHtml(body) {
  const noteBody = body || "Note";
  return [
    '<aside class="hld-note-callout">',
    '<div class="hld-note-label">NOTE</div>',
    `<div class="hld-note-content">${marked.parse(noteBody)}</div>`,
    "</aside>"
  ].join("");
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

function prepareSolution(sections, problemImages = []) {
  const used = new Map();
  const nodes = sections.map((section, index) => buildNode(section, 0, [index], used, problemImages));
  const overviewNode = nodes.find((node) => node.slug === "overview") || null;
  const outOfScopeNode = nodes.find((node) => node.slug === "out-of-scope") || null;
  const visibleSections = nodes.filter((node) => !["overview", "out-of-scope", "core-entities"].includes(node.slug));

  return { visibleSections, overviewNode, outOfScopeNode };
}

function buildNode(section, depth, indexPath, used, problemImages = []) {
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
    problemImages: Array.isArray(problemImages) ? problemImages : [],
    children: []
  };

  if (node.type === "deepdive") {
    node.children = (section.items || []).map((child, index) => buildNode(child, depth + 1, [...indexPath, index], used, problemImages));
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

function getNodeImages(node) {
  const images = [
    ...(Array.isArray(node.problemImages) ? node.problemImages : []),
    ...(Array.isArray(node.images) ? node.images : [])
  ];
  const seen = new Set();
  return images.filter((image) => {
    const key = image?.src || image?.fileName;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function parseHldStructuredBlocks(body) {
  const lines = splitLines(body);
  const blocks = [];
  const markdownLines = [];
  let hasStructuredBlocks = false;
  let inFence = false;

  function flushMarkdown() {
    const markdown = markdownLines.join("\n").trim();
    if (markdown) blocks.push({ type: "markdown", body: markdown });
    markdownLines.length = 0;
  }

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const marker = !inFence ? getStructuredMarker(line) : "";

    if (marker === "TABBED") {
      flushMarkdown();
      const collected = collectUntilMarker(lines, index + 1, "END-TABBED");
      const tabs = parseTabbedContent(collected.body);
      if (tabs.length > 0) {
        blocks.push({ type: "tabbed", tabs });
        hasStructuredBlocks = true;
      }
      index = collected.nextIndex;
      continue;
    }

    if (marker === "SIDEBYSIDE") {
      flushMarkdown();
      const collected = collectUntilMarker(lines, index + 1, "END-SIDEBYSIDE");
      blocks.push({ type: "sideBySide", ...parseSideBySideContent(collected.body) });
      hasStructuredBlocks = true;
      index = collected.nextIndex;
      continue;
    }

    if (marker === "LEFT") {
      flushMarkdown();
      const collected = collectImplicitSideBySide(lines, index);
      blocks.push({ type: "sideBySide", ...parseSideBySideContent(collected.body) });
      hasStructuredBlocks = true;
      index = collected.nextIndex;
      continue;
    }

    if (marker === "SEPERATOR") {
      flushMarkdown();
      blocks.push({ type: "separator" });
      hasStructuredBlocks = true;
      index += 1;
      continue;
    }

    markdownLines.push(line);
    if (isFenceLine(line)) inFence = !inFence;
    index += 1;
  }

  flushMarkdown();
  return { blocks, hasStructuredBlocks };
}

function parseTabbedContent(body) {
  const lines = splitLines(body);
  const tabs = [];
  let inFence = false;

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const marker = !inFence ? getStructuredMarker(line) : "";

    if (marker === "TAB") {
      const collected = collectUntilMarker(lines, index + 1, "END-TAB");
      tabs.push(parseTabContent(collected.body));
      index = collected.nextIndex;
      continue;
    }

    if (isFenceLine(line)) inFence = !inFence;
    index += 1;
  }

  return tabs;
}

function parseTabContent(body) {
  const lines = splitLines(body);
  const fields = {
    title: "",
    image: "",
    explanation: "",
    sql: ""
  };
  const fieldLines = {
    title: [],
    image: [],
    explanation: [],
    sql: []
  };
  const bodyLines = [];
  let currentField = "";
  let inFence = false;
  let structuredDepth = 0;

  lines.forEach((line) => {
    const marker = !inFence ? getStructuredMarker(line) : "";
    if (marker) {
      currentField = "";
      bodyLines.push(line);

      if (marker === "SIDEBYSIDE" || marker === "TABBED") {
        structuredDepth += 1;
      }

      if (marker === "END-SIDEBYSIDE" || marker === "END-TABBED") {
        structuredDepth = Math.max(0, structuredDepth - 1);
      }

      return;
    }

    const field = !inFence && structuredDepth === 0 ? parseTabFieldStart(line) : null;
    if (field) {
      currentField = field.name;
      fieldLines[currentField] = field.inline ? [field.inline] : [];
      return;
    }

    if (currentField) {
      fieldLines[currentField].push(line);
    } else {
      bodyLines.push(line);
    }

    if (isFenceLine(line)) inFence = !inFence;
  });

  Object.keys(fields).forEach((key) => {
    fields[key] = fieldLines[key].join("\n").trim();
  });

  return {
    title: fields.title.replace(/\s+/g, " ").trim(),
    fields,
    body: bodyLines.join("\n").trim()
  };
}

function parseSideBySideContent(body) {
  const lines = splitLines(body);
  const leftLines = [];
  const rightLines = [];
  let target = "";
  let inFence = false;

  lines.forEach((line) => {
    const marker = !inFence ? getStructuredMarker(line) : "";

    if (marker === "LEFT") {
      target = "left";
      return;
    }

    if (marker === "END-LEFT") {
      if (target === "left") target = "";
      return;
    }

    if (marker === "RIGHT") {
      target = "right";
      return;
    }

    if (marker === "END-RIGHT") {
      if (target === "right") target = "";
      return;
    }

    if (target === "left") leftLines.push(line);
    if (target === "right") rightLines.push(line);
    if (isFenceLine(line)) inFence = !inFence;
  });

  return {
    left: leftLines.join("\n").trim(),
    right: rightLines.join("\n").trim()
  };
}

function collectImplicitSideBySide(lines, startIndex) {
  const collected = [];
  let inFence = false;
  let sawRight = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    const marker = !inFence ? getStructuredMarker(line) : "";
    collected.push(line);

    if (marker === "RIGHT") sawRight = true;
    if (marker === "END-RIGHT" && sawRight) {
      return { body: collected.join("\n").trim(), nextIndex: index + 1 };
    }

    if (isFenceLine(line)) inFence = !inFence;
  }

  return { body: collected.join("\n").trim(), nextIndex: lines.length };
}

function collectUntilMarker(lines, startIndex, endMarker) {
  const collected = [];
  let inFence = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    const marker = !inFence ? getStructuredMarker(line) : "";

    if (marker === endMarker) {
      return { body: collected.join("\n").trim(), nextIndex: index + 1 };
    }

    collected.push(line);
    if (isFenceLine(line)) inFence = !inFence;
  }

  return { body: collected.join("\n").trim(), nextIndex: lines.length };
}

function parseTabFieldStart(line) {
  const match = String(line || "").match(/^(TITLE|IMAGE|EXPLANATION|SQL)\s*:\s*(.*)$/i);
  if (!match) return null;
  return {
    name: match[1].toLowerCase(),
    inline: (match[2] || "").trim()
  };
}

function getStructuredMarker(line) {
  const match = String(line || "").trim().match(/^::([A-Z-]+)::$/i);
  return match ? match[1].toUpperCase() : "";
}

function isFenceLine(line) {
  return /^```/.test(String(line || "").trim());
}

function splitLines(value) {
  return String(value || "").replace(/\r\n/g, "\n").split("\n");
}

function hasTabContent(tab) {
  return Boolean(
    tab?.title ||
    tab?.body ||
    tab?.fields?.image ||
    tab?.fields?.explanation ||
    tab?.fields?.sql
  );
}

function splitImageRefs(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim().replace(/^-\s+/, ""))
    .filter(Boolean);
}

function parseSqlField(value) {
  const raw = String(value || "").trim();
  if (!raw) return { lang: "sql", code: "" };

  const lines = splitLines(raw);
  const opening = lines[0]?.trim().match(/^```([A-Za-z0-9_-]*)\s*$/);
  const closing = lines[lines.length - 1]?.trim() === "```";

  if (opening && closing && lines.length >= 2) {
    return {
      lang: opening[1] || "sql",
      code: lines.slice(1, -1).join("\n").trim()
    };
  }

  return { lang: "sql", code: raw };
}

function parseLabeledPane(value) {
  const lines = splitLines(value);
  const firstContentIndex = lines.findIndex((line) => line.trim());
  if (firstContentIndex === -1) return null;

  const label = lines[firstContentIndex].trim().match(/^(SQL|EXPLANATION)\s*:\s*(.*)$/i);
  if (!label) return null;

  const content = [
    label[2],
    ...lines.slice(firstContentIndex + 1)
  ].filter((line, index) => index > 0 || String(line || "").trim()).join("\n").trim();

  if (label[1].toLowerCase() === "sql") {
    const sql = parseSqlField(content);
    return sql.code ? { type: "sql", ...sql } : null;
  }

  return content ? { type: "markdown", body: content } : null;
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
      const metadata = parseApiEndpointMeta(pendingText);
      if (!currentEndpoint && pendingText.trim()) {
        if (!hasApiEndpointMeta(metadata)) intro.push(pendingText.trim());
      }

      currentEndpoint = {
        ...createApiEndpoint(signature, metadata)
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

function createApiEndpoint(signature, metadata = {}) {
  return {
    ...signature,
    requirement: metadata.requirement || "",
    title: metadata.title || "",
    protocol: metadata.protocol || "",
    requestBody: null,
    status: null,
    responseHeader: null,
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
  const supportsNewEndpoints = target.current !== undefined;
  let pendingMeta = {};
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
    const metadata = supportsNewEndpoints ? parseApiMetaLine(trimmed) : null;

    if (metadata && !block) {
      const endpoint = getCurrentEndpoint();
      if (endpoint) {
        Object.assign(endpoint, mergeApiEndpointMeta(endpoint, metadata));
      } else {
        pendingMeta = mergeApiEndpointMeta(pendingMeta, metadata);
      }
      return;
    }

    const signature = parseEndpointSignatureLine(trimmed);

    if (signature) {
      flushBlock();
      setCurrentEndpoint(createApiEndpoint(signature, pendingMeta));
      pendingMeta = {};
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

function parseApiEndpointMeta(value) {
  const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
  return lines.reduce((metadata, line) => {
    const parsed = parseApiMetaLine(line);
    return parsed ? mergeApiEndpointMeta(metadata, parsed) : metadata;
  }, {});
}

function parseApiMetaLine(line) {
  const cleaned = cleanApiMetaLine(line);
  if (!cleaned) return null;

  const requirement = cleaned.match(/^(?:FR|Functional Requirement)\s*-?\s*(\d+)\s*(?::|-)?\s*(.*)$/i);
  if (requirement) {
    return {
      requirement: `FR-${requirement[1]}`,
      title: (requirement[2] || "").trim()
    };
  }

  const title = cleaned.match(/^(?:Title|API Title|Use Case|Operation)\s*:\s*(.+)$/i);
  if (title) return { title: title[1].trim() };

  const protocol = cleaned.match(/^(?:Protocol|Network Protocol|Networking Protocol|Network Protocol Used|Networking Protocol Used|Protocol Used|Network Type|Type)\s*:\s*(.+)$/i);
  if (protocol) return { protocol: protocol[1].trim() };

  return null;
}

function cleanApiMetaLine(line) {
  return String(line || "")
    .trim()
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*]\s+/, "")
    .replace(/^\*\*(.+)\*\*$/, "$1")
    .replace(/^__(.+)__$/, "$1")
    .trim();
}

function mergeApiEndpointMeta(current = {}, next = {}) {
  return {
    requirement: next.requirement || current.requirement || "",
    title: next.title || current.title || "",
    protocol: next.protocol || current.protocol || ""
  };
}

function parseApiFieldLabel(line) {
  const match = String(line || "").match(/^(REQUEST\s+BODY|RESPONSE\s+HEADERS?|RESPONSE\s+BODY|STATUS)\s*:\s*(.*)$/i);
  if (!match) return null;

  const label = match[1].replace(/\s+/g, " ").toLowerCase();
  const role = label === "request body"
    ? "requestBody"
    : label === "response body"
      ? "responseBody"
      : label === "response header" || label === "response headers"
        ? "responseHeader"
        : "status";

  return {
    role,
    inline: (match[2] || "").trim()
  };
}

function inferStructuredApiLang(role, code) {
  if (role === "status") return "http";
  if (role === "responseHeader") return "http";
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

  if (/\bresponse\s+headers?\b|\bheaders?\b/.test(text)) {
    return "responseHeader";
  }

  if (/\b(status|location)\b/.test(text) || /^\d{3}\b/.test(firstLine) || /^http\/\d/i.test(firstLine)) {
    return "status";
  }

  if (/\bresponse\s+body\b|\bresponse\b|\breturns?\b/.test(text)) {
    return "responseBody";
  }

  if (/\brequest\s+body\b|\brequest\b|\bpayload\b|\bpost\b|\bput\b|\bpatch\b/.test(text)) {
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

  if (role === "responseHeader" && !endpoint.responseHeader) {
    endpoint.responseHeader = block;
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

function joinMarkdownBlocks(...blocks) {
  return blocks
    .map((block) => String(block || "").trim())
    .filter(Boolean)
    .join("\n\n");
}

function resolveStructuredImageSet(imageRef, images = []) {
  const exact = findImageByRef(imageRef, images);
  const baseRef = removeImageTheme(exact?.fileName || imageRef);
  const light = findImageByRef(imagePathWithTheme(baseRef, "light"), images);
  const dark = findImageByRef(imagePathWithTheme(baseRef, "dark"), images);
  const fallback = exact && !exact.theme ? exact : findImageByRef(baseRef, images) || exact;

  return { light, dark, fallback };
}

function findImageByRef(imageRef, images = []) {
  const candidates = new Set(imageRefCandidates(imageRef));
  return images.find((image) => candidates.has(normalizeImagePath(image.fileName)));
}

function imageRefCandidates(imageRef) {
  const normalized = normalizeImagePath(imageRef);
  if (!normalized) return [];
  const withoutImagesPrefix = normalized.replace(/^images\//, "");
  return Array.from(new Set([
    normalized,
    withoutImagesPrefix,
    `images/${withoutImagesPrefix}`
  ]));
}

function normalizeImagePath(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^\/+/, "")
    .split(/[?#]/)[0];
}

function imagePathWithTheme(value, theme) {
  const withoutTheme = removeImageTheme(value);
  return withoutTheme.replace(/(\.[^./]+)$/i, `-${theme}$1`);
}

function removeImageTheme(value) {
  return normalizeImagePath(value).replace(/-(?:light|dark)(\.[^./]+)$/i, "$1");
}

function titleFromImagePath(value) {
  const fileName = normalizeImagePath(value).split("/").pop() || "Diagram";
  const name = removeImageTheme(fileName).replace(/\.[^/.]+$/, "");
  return slugify(name)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Diagram";
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
