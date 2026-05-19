import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleDot,
  Code2,
  GitBranch,
  Layers3,
  ListChecks,
  Map,
  ShieldCheck
} from "lucide-react";
import { getTemplateMarkdown, getTemplateSections } from "../../../lib/template-content";

export const metadata = {
  title: "LLD Template | LLD Playbook"
};

const chapterMeta = [
  {
    match: /^0\.|how to use/i,
    label: "Start",
    summary: "The interview operating sequence before any class design.",
    accent: "#5b8af0",
    soft: "rgba(91, 138, 240, 0.14)"
  },
  {
    match: /requirements/i,
    label: "Foundation",
    summary: "Scope, actors, operating mode, edge cases, and non-functional checks.",
    accent: "#5b8af0",
    soft: "rgba(91, 138, 240, 0.14)"
  },
  {
    match: /use case/i,
    label: "Actors",
    summary: "Convert vague behavior into concrete actor actions and system flows.",
    accent: "#38b2c8",
    soft: "rgba(56, 178, 200, 0.14)"
  },
  {
    match: /class diagram|layering/i,
    label: "Structure",
    summary: "Separate controller, service, model, strategy, factory, and store roles.",
    accent: "#e8a84c",
    soft: "rgba(232, 168, 76, 0.14)"
  },
  {
    match: /core entities/i,
    label: "Modeling",
    summary: "Find entities, fields, methods, IDs, references, and ownership boundaries.",
    accent: "#4ecb8d",
    soft: "rgba(78, 203, 141, 0.14)"
  },
  {
    match: /inheritance|interfaces|abstract/i,
    label: "Types",
    summary: "Use abstract classes, interfaces, and enums for the right reasons.",
    accent: "#9b6dff",
    soft: "rgba(155, 109, 255, 0.14)"
  },
  {
    match: /extensibility/i,
    label: "Evolution",
    summary: "Design the places where product rules and domain variants will change.",
    accent: "#4ecb8d",
    soft: "rgba(78, 203, 141, 0.14)"
  },
  {
    match: /service|facade/i,
    label: "API",
    summary: "Expose interview-friendly operations and keep business flows coherent.",
    accent: "#38b2c8",
    soft: "rgba(56, 178, 200, 0.14)"
  },
  {
    match: /datastore|repository/i,
    label: "State",
    summary: "Choose in-memory storage, repositories, IDs, and persistence boundaries.",
    accent: "#5b8af0",
    soft: "rgba(91, 138, 240, 0.14)"
  },
  {
    match: /object creation|registration/i,
    label: "Creation",
    summary: "Place construction logic, registration APIs, factories, builders, and singleton usage.",
    accent: "#e8a84c",
    soft: "rgba(232, 168, 76, 0.14)"
  },
  {
    match: /non-functional|pattern/i,
    label: "Patterns",
    summary: "Apply patterns only when they solve a visible design pressure.",
    accent: "#9b6dff",
    soft: "rgba(155, 109, 255, 0.14)"
  },
  {
    match: /exception/i,
    label: "Failure",
    summary: "Handle invalid input, invalid state, not-found paths, and rollback risk.",
    accent: "#e05a6b",
    soft: "rgba(224, 90, 107, 0.14)"
  },
  {
    match: /concurrency/i,
    label: "Senior Signal",
    summary: "Spot check-then-update races, locking boundaries, and collection misuse.",
    accent: "#e05a6b",
    soft: "rgba(224, 90, 107, 0.14)"
  },
  {
    match: /mistakes/i,
    label: "Review",
    summary: "Avoid common interview regressions before writing code.",
    accent: "#e8a84c",
    soft: "rgba(232, 168, 76, 0.14)"
  },
  {
    match: /problem-specific/i,
    label: "Examples",
    summary: "Parking Lot, Chess, TicTacToe, BookMyShow, and ride booking modeling notes.",
    accent: "#38b2c8",
    soft: "rgba(56, 178, 200, 0.14)"
  },
  {
    match: /communication/i,
    label: "Narration",
    summary: "Phrases for explaining scope, in-memory choices, patterns, and concurrency.",
    accent: "#5b8af0",
    soft: "rgba(91, 138, 240, 0.14)"
  },
  {
    match: /checklist|mental/i,
    label: "Close",
    summary: "A final pass over requirements, entities, services, extensibility, and code quality.",
    accent: "#4ecb8d",
    soft: "rgba(78, 203, 141, 0.14)"
  }
];

const fallbackMeta = {
  label: "Chapter",
  summary: "A focused section from the LLD interview playbook.",
  accent: "#5b8af0",
  soft: "rgba(91, 138, 240, 0.14)"
};

const focusCards = [
  { label: "Model", value: "Entities", icon: CircleDot },
  { label: "Separate", value: "Layers", icon: Layers3 },
  { label: "Evolve", value: "Patterns", icon: GitBranch },
  { label: "Protect", value: "Concurrency", icon: ShieldCheck }
];

export default function TemplatePage() {
  const markdown = getTemplateMarkdown();
  const sections = getTemplateSections();
  const howToUse = sections.find((section) => /^0\./.test(section.title)) || sections[0];
  const chapters = sections.filter((section) => section !== howToUse);
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const headingCount = countHeadings(markdown);
  const intro = extractIntro(markdown);

  return (
    <main className="template-manual">
      <aside className="manual-sidebar" aria-label="Template sections">
        <Link href="/" className="manual-logo">
          <span className="manual-logo-mark">
            <Code2 size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="manual-logo-kicker">Interview Prep</span>
            <span className="manual-logo-title">LLD Playbook</span>
          </span>
        </Link>

        <div className="manual-sidebar-panel">
          <div className="manual-sidebar-label">Manual</div>
          <div className="manual-sidebar-title">Template Navigation</div>
          <div className="manual-sidebar-copy">{sections.length} chapters mapped from the workspace markdown.</div>
        </div>

        <nav className="manual-nav">
          {sections.map((section, index) => {
            const meta = getChapterMeta(section.title);
            return (
              <a key={section.id} href={`#${section.id}`} className="manual-nav-item" style={{ "--manual-accent": meta.accent }}>
                <span className="manual-nav-num">{getChapterNumber(section.title, index)}</span>
                <span className="manual-nav-text">{getDisplayTitle(section.title)}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="manual-progress-line" aria-hidden="true" />

      <div className="manual-main">
        <section className="manual-mobile-jump xl:hidden">
          <details>
            <summary>
              <Map size={16} aria-hidden="true" />
              Sections
            </summary>
            <div>
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{getChapterNumber(section.title, index)}</span>
                  {getDisplayTitle(section.title)}
                </a>
              ))}
            </div>
          </details>
        </section>

        <header className="manual-hero">
          <div className="manual-eyebrow">Verbose Playbook v1.0</div>
          <h1>
            LLD Interview
            <span>Template</span>
          </h1>
          <p>{intro}</p>

          <div className="manual-tag-row" aria-label="Template focus areas">
            <span>Object-Oriented Design</span>
            <span>Design Patterns</span>
            <span>Java Examples</span>
            <span>Concurrency</span>
          </div>

          <div className="manual-hero-actions">
            <Link href="/solve" className="manual-primary-action">
              Use in practice
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/problems" className="manual-secondary-action">
              Open solved examples
            </Link>
          </div>

          <div className="manual-stat-grid">
            <div>
              <span>Chapters</span>
              <strong>{sections.length}</strong>
            </div>
            <div>
              <span>Headings</span>
              <strong>{headingCount}</strong>
            </div>
            <div>
              <span>Words</span>
              <strong>{formatCount(words)}</strong>
            </div>
          </div>
        </header>

        <section className="manual-focus-strip" aria-label="Interview design loop">
          {focusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label}>
                <Icon size={17} aria-hidden="true" />
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            );
          })}
        </section>

        {howToUse && (
          <section id={howToUse.id} className="manual-how" style={{ "--manual-accent": "#5b8af0", "--manual-accent-soft": "rgba(91, 138, 240, 0.14)" }}>
            <div className="manual-section-kicker">Section 00</div>
            <div className="manual-section-title-row">
              <BookOpenCheck size={22} aria-hidden="true" />
              <h2>{getDisplayTitle(howToUse.title)}</h2>
            </div>
            <article className="template-prose manual-how-prose" dangerouslySetInnerHTML={{ __html: howToUse.html }} />
          </section>
        )}

        <div className="manual-chapter-list">
          {chapters.map((section, index) => {
            const meta = getChapterMeta(section.title);
            return (
              <section
                key={section.id}
                id={section.id}
                className="manual-chapter"
                style={{ "--manual-accent": meta.accent, "--manual-accent-soft": meta.soft }}
              >
                <header className="manual-chapter-header">
                  <div className="manual-chapter-left">
                    <div className="manual-chapter-number">{getChapterNumber(section.title, index + 1)}</div>
                    <div>
                      <div className="manual-chapter-label">{meta.label}</div>
                      <h2>{getDisplayTitle(section.title)}</h2>
                      <p>{meta.summary}</p>
                    </div>
                  </div>
                  <a href={`#${section.id}`} className="manual-anchor">
                    Anchor
                  </a>
                </header>
                <article className="template-prose manual-chapter-prose" dangerouslySetInnerHTML={{ __html: section.html }} />
              </section>
            );
          })}
        </div>

        <section className="manual-close-panel">
          <div>
            <ListChecks size={20} aria-hidden="true" />
            <span>Final pass</span>
          </div>
          <p>
            Requirements, entities, APIs, extensibility, exceptions, concurrency, and code quality should all be visible before the
            answer is considered complete.
          </p>
          <CheckCircle2 size={22} aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}

function getChapterMeta(title) {
  return chapterMeta.find((meta) => meta.match.test(title)) || fallbackMeta;
}

function getDisplayTitle(title) {
  return title
    .replace(/^\d+(?:\.\d+)*\.\s*/, "")
    .replace(/\s+-\s+(good|needs refinement)$/i, "")
    .trim();
}

function getChapterNumber(title, fallbackIndex) {
  const match = title.match(/^(\d+)/);
  if (match) return match[1].padStart(2, "0");
  return String(fallbackIndex).padStart(2, "0");
}

function extractIntro(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const titleIndex = lines.findIndex((line) => /^#\s+/.test(line));
  const nextSectionIndex = lines.findIndex((line, index) => index > titleIndex && /^##\s+0\./.test(line));
  const start = titleIndex >= 0 ? titleIndex + 1 : 0;
  const end = nextSectionIndex > start ? nextSectionIndex : Math.min(lines.length, start + 8);

  return lines
    .slice(start, end)
    .map((line) => line.trim())
    .filter((line) => line && line !== "---")
    .join(" ");
}

function countHeadings(markdown) {
  return markdown.split("\n").filter((line) => /^#{1,6}\s+/.test(line)).length;
}

function formatCount(value) {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1)}k`;
}
