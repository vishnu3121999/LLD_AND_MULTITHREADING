"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronRight, MessageSquareText, Save } from "lucide-react";
import {
  behavioralAnswersChangedEvent,
  formatStoryAnswer,
  loadBehavioralAnswers,
  loadBehavioralStories,
  saveBehavioralAnswers
} from "./behavioral-storage";

export function BehavioralQuestionPage({ category }) {
  const [stories, setStories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [ready, setReady] = useState(false);
  const [questionSaveState, setQuestionSaveState] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [openQuestionIds, setOpenQuestionIds] = useState(() => new Set([category.questions[0]?.id].filter(Boolean)));
  const [openExpectationIds, setOpenExpectationIds] = useState(() => new Set());
  const [openExampleIds, setOpenExampleIds] = useState(() => new Set());
  const questionIds = useMemo(() => category.questions.map((question) => question.id), [category.questions]);
  const expectationQuestionIds = useMemo(
    () => category.questions.filter((question) => question.expectations?.length > 0).map((question) => question.id),
    [category.questions]
  );
  const exampleQuestionIds = useMemo(
    () => category.questions.filter((question) => question.exampleAnswers?.length > 0).map((question) => question.id),
    [category.questions]
  );
  const allQuestionsOpen = questionIds.length > 0 && openQuestionIds.size === questionIds.length;
  const allExpectationsOpen = expectationQuestionIds.length > 0 && expectationQuestionIds.every((id) => openExpectationIds.has(id));
  const allExamplesOpen = exampleQuestionIds.length > 0 && exampleQuestionIds.every((id) => openExampleIds.has(id));

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadBehavioralStories(), loadBehavioralAnswers()])
      .then(([loadedStories, loadedAnswers]) => {
        if (cancelled) return;
        setStories(loadedStories);
        setAnswers(loadedAnswers);
        setReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setReady(true);
        setStatusMessage(error.message || "Unable to load behavioral interview data.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOpenQuestionIds(new Set([category.questions[0]?.id].filter(Boolean)));
    setOpenExpectationIds(new Set());
    setOpenExampleIds(new Set());
    setQuestionSaveState({});
  }, [category.slug, category.questions]);

  const storyById = useMemo(() => new Map(stories.map((story) => [story.id, story])), [stories]);

  function markDirty(questionId) {
    setStatusMessage("");
    setQuestionSaveState((current) => ({
      ...current,
      [questionId]: "dirty"
    }));
  }

  function selectStory(questionId, storyId) {
    const story = storyById.get(storyId);
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        storyId,
        answer: story ? formatStoryAnswer(story) : current[questionId]?.answer || ""
      }
    }));
    markDirty(questionId);
  }

  function updateAnswer(questionId, answer) {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        storyId: current[questionId]?.storyId || "",
        answer
      }
    }));
    markDirty(questionId);
  }

  async function saveQuestion(questionId) {
    const payload = {
      [questionId]: answers[questionId] || { storyId: "", answer: "" }
    };

    setQuestionSaveState((current) => ({
      ...current,
      [questionId]: "saving"
    }));

    try {
      const savedAnswers = await saveBehavioralAnswers(payload);
      setAnswers(savedAnswers);
      emitAnswersChanged(savedAnswers);
      setStatusMessage("");
      setQuestionSaveState((current) => ({
        ...current,
        [questionId]: "saved"
      }));
    } catch (error) {
      setQuestionSaveState((current) => ({
        ...current,
        [questionId]: "error"
      }));
      setStatusMessage(error.message || "Unable to save behavioral interview answer.");
    }
  }

  function toggleQuestion(questionId) {
    setOpenQuestionIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }

  function toggleExpectation(questionId) {
    setOpenExpectationIds((current) => toggleSetValue(current, questionId));
  }

  function toggleExamples(questionId) {
    setOpenExampleIds((current) => toggleSetValue(current, questionId));
  }

  function toggleAllQuestions() {
    setOpenQuestionIds(allQuestionsOpen ? new Set() : new Set(questionIds));
  }

  function toggleAllExpectations() {
    setOpenExpectationIds(allExpectationsOpen ? new Set() : new Set(expectationQuestionIds));
  }

  function toggleAllExamples() {
    setOpenExampleIds(allExamplesOpen ? new Set() : new Set(exampleQuestionIds));
  }

  return (
    <article className="min-w-0 space-y-4 text-[var(--site-text)]">
      <header className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
        <div className="p-5 sm:p-6">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
            {category.eyebrow}
          </div>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-[var(--site-heading)]">
                {category.title}
              </h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--site-muted)]">
                {category.description}
              </p>
            </div>
            <Link
              href="/behavioral"
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] px-3 text-sm font-semibold text-[var(--site-heading)] transition hover:border-[var(--site-brand)] hover:bg-[var(--site-surface-2)]"
            >
              Story Builder
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--site-border)] pt-4">
            <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-2)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--site-muted)]">
              {category.questions.length} questions
            </span>
            <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-2)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--site-muted)]">
              {stories.length} stories
            </span>
            {statusMessage && (
              <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--site-danger)]">
                {statusMessage}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ExpandToggleButton
              active={allQuestionsOpen}
              label="Questions"
              onClick={toggleAllQuestions}
            />
            <ExpandToggleButton
              active={allExpectationsOpen}
              label="Expectations"
              onClick={toggleAllExpectations}
            />
            <ExpandToggleButton
              active={allExamplesOpen}
              label="Examples"
              onClick={toggleAllExamples}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-3">
        {category.questions.map((question) => (
          <QuestionAnswerCard
            key={question.id}
            answer={answers[question.id]?.answer || ""}
            examplesOpen={openExampleIds.has(question.id)}
            expectationsOpen={openExpectationIds.has(question.id)}
            open={openQuestionIds.has(question.id)}
            question={question}
            ready={ready}
            saveState={questionSaveState[question.id] || "idle"}
            selectedStoryId={answers[question.id]?.storyId || ""}
            stories={stories}
            onSave={() => saveQuestion(question.id)}
            onSelectStory={(storyId) => selectStory(question.id, storyId)}
            onToggleExamples={() => toggleExamples(question.id)}
            onToggleExpectation={() => toggleExpectation(question.id)}
            onToggle={() => toggleQuestion(question.id)}
            onUpdateAnswer={(answer) => updateAnswer(question.id, answer)}
          />
        ))}
      </section>
    </article>
  );
}

function ExpandToggleButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition ${
        active
          ? "border-[var(--site-border)] bg-[var(--site-heading)] text-[var(--site-surface)]"
          : "border-[var(--site-border)] bg-[var(--site-surface-2)] text-[var(--site-muted)] hover:border-[var(--site-heading)] hover:text-[var(--site-heading)]"
      }`}
    >
      {active ? "Collapse" : "Expand"} {label}
    </button>
  );
}

function QuestionGuidance({ examplesOpen, expectationsOpen, question }) {
  const hasExpectations = question.expectations?.length > 0;
  const hasExamples = question.exampleAnswers?.length > 0;
  if (!question.importance && !hasExpectations && !hasExamples) return null;
  if (!expectationsOpen && !examplesOpen) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {hasExpectations && expectationsOpen && (
        <section className="rounded-md border border-[var(--site-border)] bg-[var(--site-surface-2)] p-4">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-muted)]">
              Interview Guidance
            </div>
            <h3 className="text-sm font-semibold text-[var(--site-heading)]">
              Interviewer's Expectation
            </h3>
            <BulletList items={question.expectations} />
          </div>
        </section>
      )}

      {hasExamples && examplesOpen && (
        <section className="rounded-md border border-[var(--site-border)] bg-[var(--site-surface-2)] p-4">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-muted)]">
            Example Answers
          </div>
          <div className="mt-3 divide-y divide-[var(--site-border)]">
            {question.exampleAnswers.map((example) => (
              <article key={`${question.id}-${example.number}-${example.title}`} className="py-3 first:pt-0 last:pb-0">
                <h3 className="text-sm font-semibold text-[var(--site-heading)]">
                  Example {example.number}{example.title ? `: ${example.title}` : ""}
                </h3>
                <BulletList items={example.items} />
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BulletList({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="mt-3 grid gap-2">
      {items.map((item, index) => (
        <li key={`${item.label}-${item.text}-${index}`} className="flex gap-2 text-sm leading-6 text-[var(--site-muted)]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--site-brand)]" aria-hidden="true" />
          <span>
            {item.label && (
              <span className="font-semibold text-[var(--site-heading)]">
                {item.label}:{" "}
              </span>
            )}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ImportancePill({ value }) {
  const tone = getImportanceTone(value);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-[var(--site-surface)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--site-heading)] ${tone.border}`}>
      <span className={`h-2 w-2 rounded-full ${tone.dot}`} aria-hidden="true" />
      {value}
    </span>
  );
}

function getImportanceTone(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "very high") {
    return {
      border: "border-red-300 dark:border-red-800",
      dot: "bg-red-600 dark:bg-red-400"
    };
  }

  if (normalized === "high") {
    return {
      border: "border-amber-300 dark:border-amber-800",
      dot: "bg-amber-500 dark:bg-amber-300"
    };
  }

  if (normalized === "medium") {
    return {
      border: "border-teal-300 dark:border-teal-800",
      dot: "bg-teal-600 dark:bg-teal-300"
    };
  }

  return {
    border: "border-sky-300 dark:border-sky-800",
    dot: "bg-sky-600 dark:bg-sky-300"
  };
}

function emitAnswersChanged(answers) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(behavioralAnswersChangedEvent, {
    detail: { answers }
  }));
}

function QuestionAnswerCard({
  answer,
  examplesOpen,
  expectationsOpen,
  open,
  question,
  ready,
  saveState,
  selectedStoryId,
  stories,
  onSave,
  onSelectStory,
  onToggleExamples,
  onToggleExpectation,
  onToggle,
  onUpdateAnswer
}) {
  const isSaving = saveState === "saving";
  const hasExpectations = question.expectations?.length > 0;
  const hasExamples = question.exampleAnswers?.length > 0;

  return (
    <section className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
      <div
        className={`flex w-full items-start justify-between gap-4 bg-[var(--site-surface-2)] px-5 py-4 text-left transition hover:bg-[var(--site-surface)] ${
          open ? "border-b border-[var(--site-border)]" : ""
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          aria-expanded={open}
        >
          <span className="grid h-8 min-w-8 place-items-center rounded-md bg-[var(--site-brand-soft)] font-mono text-xs font-bold text-[var(--site-brand)]">
            {question.number}
          </span>
          <span className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
              <MessageSquareText size={13} aria-hidden="true" />
              Question
            </div>
            <h2 className="mt-1 text-lg font-semibold leading-snug tracking-normal text-[var(--site-heading)]">
              {question.text}
            </h2>
          </span>
        </button>
        <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {question.importance && <ImportancePill value={question.importance} />}
          {hasExpectations && (
            <QuestionChip
              active={expectationsOpen}
              label="Expectation"
              onClick={onToggleExpectation}
            />
          )}
          {hasExamples && (
            <QuestionChip
              active={examplesOpen}
              label="Examples"
              onClick={onToggleExamples}
            />
          )}
          <span className="grid h-8 w-8 place-items-center rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-muted)]">
            {open ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
          </span>
        </span>
      </div>

      {open && (
        <div className="grid gap-5 p-5">
          <QuestionGuidance
            examplesOpen={examplesOpen}
            expectationsOpen={expectationsOpen}
            question={question}
          />

          <div className="grid gap-4 border-t border-[var(--site-border)] pt-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--site-heading)]">Use existing story</span>
              <select
                value={selectedStoryId}
                onChange={(event) => onSelectStory(event.target.value)}
                className="h-10 rounded-md border border-[var(--site-border)] bg-[var(--site-surface-2)] px-3 text-sm text-[var(--site-heading)] outline-none transition focus:border-[var(--site-brand)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={stories.length === 0}
              >
                <option value="">{stories.length === 0 ? "No stories saved yet" : "Select a story"}</option>
                {stories.map((story) => (
                  <option key={story.id} value={story.id}>{story.title}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[var(--site-heading)]">Answer</span>
                <span className="flex items-center gap-2">
                  <SaveStateLabel state={saveState} />
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={!ready || isSaving}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--site-brand)] bg-[var(--site-brand)] px-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saveState === "saved" ? <Check size={15} aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
                    {isSaving ? "Saving" : "Save"}
                  </button>
                </span>
              </span>
              <textarea
                value={answer}
                onChange={(event) => onUpdateAnswer(event.target.value)}
                className="min-h-52 resize-y rounded-md border border-[var(--site-border)] bg-[var(--site-surface-2)] px-3 py-2 text-sm leading-6 text-[var(--site-heading)] outline-none transition focus:border-[var(--site-brand)]"
                placeholder="Select a saved story or write a STAR answer here."
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}

function QuestionChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-md border px-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition ${
        active
          ? "border-[var(--site-border)] bg-[var(--site-heading)] text-[var(--site-surface)]"
          : "border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-muted)] hover:border-[var(--site-heading)] hover:text-[var(--site-heading)]"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function toggleSetValue(current, value) {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function SaveStateLabel({ state }) {
  if (state === "idle") return null;

  const label = {
    dirty: "Unsaved",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed"
  }[state];

  return (
    <span className={`text-xs font-semibold ${
      state === "error" ? "text-[var(--site-danger)]" : "text-[var(--site-muted)]"
    }`}>
      {label}
    </span>
  );
}
