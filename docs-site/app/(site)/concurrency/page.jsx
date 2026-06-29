import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConcurrencyShell } from "./_components/concurrency-shell";
import { allConcurrencyLessons, concurrencyModules } from "../../../lib/concurrency-curriculum";

export const metadata = {
  title: "LLD Concurrency Curriculum | LLD Playbook"
};

const problemCategoryLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};

export default function ConcurrencyPage() {
  const firstLesson = allConcurrencyLessons[0];
  const pageNav = [
    { href: "#course-overview", label: "Overview" },
    { href: "#modules", label: "Modules" }
  ];

  return (
    <ConcurrencyShell pageNav={pageNav}>
      <section
        id="course-overview"
        className="scroll-mt-24 overflow-hidden rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
      >
        <div className="border-b border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
                LLD Academy
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--cor-heading)]">Concurrency Curriculum</h2>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">
                Use the left rail as the source of truth. Each item opens a dedicated lesson page.
              </p>
            </div>
            <Link
              href={`/concurrency/${firstLesson.slug}`}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-[var(--cor-brand)] px-4 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Start course
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div id="modules" className="scroll-mt-24 divide-y divide-[var(--cor-border)]">
          {concurrencyModules.map((module) => (
            <div key={module.id} className="grid gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
                  {module.number}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-[var(--cor-heading)]">{module.title}</h3>
                <div className="mt-2 inline-flex rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--cor-muted)]">
                  {module.lessons.length} lessons
                </div>
              </div>
              <div>
                <p className="text-sm leading-6 text-[var(--cor-muted)]">{module.description}</p>
                {module.id === "coding-problems" ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {Object.entries(problemCategoryLabels).map(([category, label]) => {
                      const lessons = module.lessons.filter((lesson) => lesson.category === category);
                      return (
                        <div key={category} className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-3">
                          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cor-brand)]">
                            {label}
                          </div>
                          <div className="mt-2 grid gap-1">
                            {lessons.map((lesson) => (
                              <Link
                                key={lesson.slug}
                                href={`/concurrency/${lesson.slug}`}
                                className="rounded-md px-2 py-1.5 text-xs font-semibold text-[var(--cor-muted)] transition hover:bg-white hover:text-[var(--cor-heading)]"
                              >
                                {lesson.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {module.lessons.slice(0, 4).map((lesson) => (
                      <Link
                        key={lesson.slug}
                        href={`/concurrency/${lesson.slug}`}
                        className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1 text-xs font-bold text-[var(--cor-muted)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-heading)]"
                      >
                        {lesson.title}
                      </Link>
                    ))}
                    {module.lessons.length > 4 && (
                      <span className="rounded-full px-3 py-1 text-xs font-bold text-[var(--cor-muted)]">
                        +{module.lessons.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </ConcurrencyShell>
  );
}
