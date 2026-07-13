import Link from "next/link";
import { ArrowRight, Database, Layers3, Network } from "lucide-react";
import { HldShell } from "./_components/hld-shell";
import { buildHldNavGroups } from "../../../lib/hld-navigation";
import { listHldReusedSubproblemDocs } from "../../../lib/hld-reused-subproblems-store";
import { listHldProblems } from "../../../lib/hld-store";
import { listHldTheoryDocs } from "../../../lib/hld-theory-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "HLD Problem Library | 01 Interview"
};

export default async function HldLibraryPage() {
  const [problems, theoryDocs, reusedSubproblemDocs] = await Promise.all([
    listHldProblems(),
    listHldTheoryDocs(),
    listHldReusedSubproblemDocs()
  ]);
  const solvedProblems = problems.filter((problem) => problem.source === "markdown" || problem.source === "text");
  const groups = buildHldNavGroups(problems, theoryDocs, reusedSubproblemDocs);
  const pageNav = [
    { href: "#library-overview", label: "Overview" },
    { href: "#problems", label: "Problems" }
  ];

  return (
    <HldShell groups={groups} pageNav={pageNav}>
      <section
        id="library-overview"
        className="scroll-mt-24 overflow-hidden rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
      >
          <div className="border-b border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                  HLD Academy
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--hld-heading)]">
                  Problem Library
                </h1>
                <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--hld-muted)]">
                  Read solved system design problems with requirements, APIs, architecture choices, and deep dives in one consistent format.
                </p>
              </div>
            </div>
          </div>

          <div className="grid border-b border-[var(--hld-border)] sm:grid-cols-3">
            <StatCard icon={Layers3} label="Solved problems" value={solvedProblems.length} />
            <StatCard icon={Network} label="Design sections" value={problems.reduce((total, problem) => total + (problem.sectionCount || 0), 0)} />
            <StatCard icon={Database} label="Source" value="Local content" />
          </div>

          <div id="problems" className="scroll-mt-24 p-5 sm:p-6">
            {problems.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {problems.map((problem) => (
                  <ProblemCard key={problem.id} problem={problem} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--hld-border)] bg-[var(--hld-surface-2)] p-8 text-center">
                <h2 className="text-lg font-semibold text-[var(--hld-heading)]">No HLD problems found</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--hld-muted)]">
                  Add Markdown solved problems under `content/hld/problems` or create a new authored problem.
                </p>
              </div>
            )}
          </div>
        </section>
    </HldShell>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--hld-border)] px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--hld-brand-soft)] text-[var(--hld-brand)]">
        <Icon size={17} aria-hidden="true" />
      </div>
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--hld-muted)]">
          {label}
        </div>
        <div className="mt-0.5 text-lg font-semibold text-[var(--hld-heading)]">{value}</div>
      </div>
    </div>
  );
}

function ProblemCard({ problem }) {
  return (
    <Link
      href={`/hld/${problem.id}`}
      className="group flex min-h-56 flex-col rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] p-5 transition hover:border-[var(--hld-brand)] hover:shadow-[var(--site-shadow)]"
    >
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

      <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-[var(--hld-heading)]">
        {problem.title}
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--hld-muted)]">
        {problem.summary}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <div className="text-xs font-medium text-[var(--hld-muted)]">
          {problem.sectionCount || 0} sections
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--hld-brand)]">
          Open
          <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
