import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LldShell } from "./_components/lld-shell";
import { getLldCurriculum } from "../../../lib/lld-content-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Low Level Design | 01 Interview"
};

export default async function LldPage() {
  const { modules, allLessons } = await getLldCurriculum();
  const firstLesson = allLessons[0];
  const pageNav = [
    { href: "#course-overview", label: "Overview" },
    { href: "#modules", label: "Modules" }
  ];

  return (
    <LldShell modules={modules} pageNav={pageNav}>
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
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--cor-heading)]">Low Level Design</h2>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">
                Object-oriented design concepts, patterns, and LLD problems organized from the content folder.
              </p>
            </div>
            {firstLesson ? (
              <Link
                href={`/lld/${firstLesson.slug}`}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-[var(--cor-brand)] px-4 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Start course
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>

        <div id="modules" className="scroll-mt-24 divide-y divide-[var(--cor-border)]">
          {modules.length > 0 ? (
            modules.map((module) => (
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
                  {module.lessons.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {module.lessons.slice(0, 6).map((lesson) => (
                        <Link
                          key={lesson.slug}
                          href={`/lld/${lesson.slug}`}
                          className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1 text-xs font-bold text-[var(--cor-muted)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-heading)]"
                        >
                          {lesson.title}
                        </Link>
                      ))}
                      {module.lessons.length > 6 && (
                        <span className="rounded-full px-3 py-1 text-xs font-bold text-[var(--cor-muted)]">
                          +{module.lessons.length - 6} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-lg border border-dashed border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-4 py-3 text-sm font-medium text-[var(--cor-muted)]">
                      No lessons yet
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-sm font-medium text-[var(--cor-muted)] sm:px-6">
              No LLD modules found.
            </div>
          )}
        </div>
      </section>
    </LldShell>
  );
}
