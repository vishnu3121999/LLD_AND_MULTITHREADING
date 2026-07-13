"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useLiveDocument } from "../../../../components/hld/use-live-document";
import { ProblemWorkbench } from "./problem-workbench";

export function ConcurrencyLessonRenderer({ lesson, previous, next }) {
  const renderedLesson = useLiveDocument(lesson, {
    enabled: Boolean(lesson?.slug),
    url: lesson?.slug ? `/api/concurrency/${lesson.slug}` : ""
  });
  const isProblem = renderedLesson.kind === "problem";

  if (isProblem) {
    return <ProblemWorkbench lesson={renderedLesson} />;
  }

  return (
    <article className="space-y-4">
      <section
        id="overview"
        className="scroll-mt-24 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--cor-brand-soft)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-brand)]">
            {renderedLesson.module.number}
          </span>
          <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-muted)]">
            {renderedLesson.module.title}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-[var(--cor-heading)]">{renderedLesson.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">{renderedLesson.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {renderedLesson.outcomes.map((outcome) => (
            <span key={outcome} className="inline-flex items-center gap-2 rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1.5 text-sm font-semibold text-[var(--cor-text)]">
              <CheckCircle2 size={15} className="text-[var(--cor-good)]" aria-hidden="true" />
              {outcome}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="space-y-6">
          {renderedLesson.sections.map(([title, body], index) => (
            <div
              key={`${title}-${index}`}
              id={`section-${index + 1}`}
              className="grid scroll-mt-24 gap-3 border-b border-[var(--cor-border)] pb-6 last:border-b-0 last:pb-0 md:grid-cols-[44px_minmax(0,1fr)]"
            >
              <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--cor-brand-soft)] font-mono text-xs font-bold text-[var(--cor-brand)]">
                {index + 1}
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-normal text-[var(--cor-heading)]">{title}</h2>
                <p className="mt-2 max-w-4xl text-base leading-7 text-[var(--cor-muted)]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {renderedLesson.mistakes.length > 0 && (
        <section
          id="mistakes"
          className="scroll-mt-24 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6"
        >
          <div className="border-b border-[var(--cor-border)] pb-4">
            <h2 className="text-xl font-semibold tracking-normal text-[var(--cor-heading)]">Common Mistakes</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">The points learners should avoid saying in interviews.</p>
          </div>
          <ul className="mt-4 grid gap-2">
            {renderedLesson.mistakes.map((mistake) => (
              <li key={mistake} className="flex items-start gap-2 text-sm leading-6 text-[var(--cor-muted)]">
                <XCircle size={16} className="mt-1 flex-none text-[var(--cor-danger)]" aria-hidden="true" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav id="navigation" className="grid scroll-mt-24 gap-3 md:grid-cols-2" aria-label="Lesson navigation">
        {previous ? (
          <LessonNavLink direction="previous" lesson={previous} />
        ) : (
          <div />
        )}
        {next && <LessonNavLink direction="next" lesson={next} />}
      </nav>
    </article>
  );
}

function LessonNavLink({ direction, lesson }) {
  const isPrevious = direction === "previous";

  return (
    <Link
      href={`/concurrency/${lesson.slug}`}
      className={`flex min-h-24 items-center gap-3 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4 transition hover:border-[var(--cor-brand)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${
        isPrevious ? "justify-start" : "justify-end text-right md:col-start-2"
      }`}
    >
      {isPrevious && <ArrowLeft size={17} aria-hidden="true" />}
      <span>
        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cor-muted)]">
          {isPrevious ? "Previous" : "Next"}
        </span>
        <span className="mt-1 block text-sm font-semibold text-[var(--cor-text)]">{lesson.title}</span>
      </span>
      {!isPrevious && <ArrowRight size={17} aria-hidden="true" />}
    </Link>
  );
}
