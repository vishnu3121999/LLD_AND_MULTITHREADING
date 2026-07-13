"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLiveDocument } from "../../../../components/hld/use-live-document";
import { LldMarkdownRenderer } from "./lld-markdown-renderer";

export function LldLessonRenderer({ lesson, previous, next }) {
  const renderedLesson = useLiveDocument(lesson, {
    enabled: Boolean(lesson?.slug),
    url: lesson?.slug ? `/api/lld/${lesson.slug}` : ""
  });

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
        {renderedLesson.summary ? (
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">{renderedLesson.summary}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6">
        {renderedLesson.body ? (
          <LldMarkdownRenderer
            assetBaseUrl={`/api/lld/assets/${renderedLesson.slug}`}
            body={renderedLesson.body}
            docId={renderedLesson.slug}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-8 text-center text-sm font-medium text-[var(--cor-muted)]">
            No content added yet.
          </div>
        )}
      </section>

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
      href={`/lld/${lesson.slug}`}
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
