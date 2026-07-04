import Link from "next/link";
import {
  ArrowRight,
  Code2,
  LockKeyhole,
  MessageSquareText,
  Network
} from "lucide-react";

const dashboardTheme = {
  "--cor-bg": "var(--site-bg)",
  "--cor-surface": "var(--site-surface)",
  "--cor-surface-2": "var(--site-surface-2)",
  "--cor-text": "var(--site-heading)",
  "--cor-muted": "var(--site-muted)",
  "--cor-border": "var(--site-border)",
  "--cor-brand": "var(--site-brand)",
  "--cor-brand-soft": "var(--site-brand-soft)",
  "--cor-code-bg": "var(--site-code-bg)",
  "--cor-code-top": "var(--site-code-top)",
  "--cor-code-border": "var(--site-code-border)"
};

const lldSections = [
  {
    title: "Concurrency",
    href: "/concurrency",
    eyebrow: "Correctness",
    description: "Theory and solved examples for races, locks, atomic updates, idempotency, and transactions.",
    icon: LockKeyhole,
    meta: "Theory"
  },
  {
    title: "Java Workspace",
    href: "/workspace",
    eyebrow: "Code visualizer",
    description: "Browse Java implementations, compare versions, inspect class layouts, and save workspace state.",
    icon: Code2,
    meta: "Workspace"
  }
];

const hldSections = [
  {
    title: "Problem Library",
    href: "/hld",
    eyebrow: "Case studies",
    description: "System design problems written as interview docs with diagrams, trade-offs, and deep dives.",
    icon: Network,
    meta: "HLD"
  }
];

const behavioralSections = [
  {
    title: "Behavioral Interviews",
    href: "/behavioral",
    eyebrow: "STAR stories",
    description: "Build reusable STAR stories, map them to common behavioral questions, and prepare focused answers.",
    icon: MessageSquareText,
    meta: "Behavioral"
  }
];

const mainSections = [
  ...lldSections,
  ...hldSections,
  ...behavioralSections
];

export default function HomePage() {
  return (
    <main style={dashboardTheme} className="min-h-[calc(100vh-4rem)] bg-[var(--cor-bg)] text-[var(--cor-text)]">
      <section className="border-b border-[var(--cor-border)] bg-[var(--cor-surface)]">
        <div className="site-container py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
                Design interview academy
              </div>
              <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-normal sm:text-4xl">
                LLD, HLD, and behavioral interviews in one place.
              </h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">
                Start directly from the section grid below.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-4 lg:py-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {mainSections.map((section) => (
            <SectionCard key={section.href} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionCard({ section }) {
  const Icon = section.icon;

  return (
    <Link
      href={section.href}
      className="group flex min-h-44 flex-col rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--cor-brand)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--cor-brand-soft)] text-[var(--cor-brand)]">
          <Icon size={19} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cor-muted)]">
          {section.meta}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-brand)]">
          {section.eyebrow}
        </div>
        <h3 className="mt-1 text-lg font-black tracking-normal">{section.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--cor-muted)]">{section.description}</p>
      </div>

      <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[var(--cor-text)]">
        Open section
        <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
