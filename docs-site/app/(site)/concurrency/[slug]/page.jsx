import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { ConcurrencyShell } from "../_components/concurrency-shell";
import { ProblemWorkbench } from "../_components/problem-workbench";
import {
  allConcurrencyLessons,
  getAdjacentConcurrencyLessons,
  getConcurrencyLesson
} from "../../../../lib/concurrency-curriculum";

export function generateStaticParams() {
  return allConcurrencyLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getConcurrencyLesson(slug);

  return {
    title: lesson ? `${lesson.title} | LLD Concurrency` : "Concurrency Lesson | LLD Playbook"
  };
}

export default async function ConcurrencyLessonPage({ params }) {
  const { slug } = await params;
  const lesson = getConcurrencyLesson(slug);
  if (!lesson) notFound();

  const { previous, next } = getAdjacentConcurrencyLessons(slug);
  const isProblem = lesson.kind === "problem";
  const pageNav = isProblem
    ? []
    : [
        { href: "#overview", label: "Overview" },
        ...lesson.sections.map(([title], index) => ({
          href: `#section-${index + 1}`,
          label: title
        })),
        ...(lesson.mistakes.length > 0 ? [{ href: "#mistakes", label: "Common Mistakes" }] : []),
        { href: "#navigation", label: "Next / Previous" }
      ];

  return (
    <ConcurrencyShell activeSlug={lesson.slug} pageNav={pageNav}>
      {isProblem ? (
        <ProblemWorkbench lesson={lesson} />
      ) : (
      <article className="space-y-4">
        <section
          id="overview"
          className="scroll-mt-24 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--cor-brand-soft)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-brand)]">
              {lesson.module.number}
            </span>
            <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-muted)]">
              {lesson.module.title}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-[var(--cor-heading)]">{lesson.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">{lesson.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {lesson.outcomes.map((outcome) => (
              <span key={outcome} className="inline-flex items-center gap-2 rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1.5 text-sm font-semibold text-[var(--cor-text)]">
                <CheckCircle2 size={15} className="text-[var(--cor-good)]" aria-hidden="true" />
                {outcome}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="space-y-6">
            {lesson.sections.map(([title, body], index) => (
              <div
                key={title}
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

        {lesson.mistakes.length > 0 && (
          <section
            id="mistakes"
            className="scroll-mt-24 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6"
          >
            <div className="border-b border-[var(--cor-border)] pb-4">
              <h2 className="text-xl font-semibold tracking-normal text-[var(--cor-heading)]">Common Mistakes</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">The points learners should avoid saying in interviews.</p>
            </div>
            <ul className="mt-4 grid gap-2">
              {lesson.mistakes.map((mistake) => (
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
      )}
    </ConcurrencyShell>
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
