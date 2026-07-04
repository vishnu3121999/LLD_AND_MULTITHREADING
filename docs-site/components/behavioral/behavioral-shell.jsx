"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from "lucide-react";
import { behavioralAnswersChangedEvent, loadBehavioralAnswers } from "./behavioral-storage";

const railStorageKey = "behavioral-rail-collapsed";
const openGroupsStorageKey = "behavioral-open-groups";

export function BehavioralShell({ activeSlug, items, children }) {
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState(["behavioral"]);
  const [completedQuestionIds, setCompletedQuestionIds] = useState([]);
  const storyBuilder = useMemo(() => items.find((item) => item.slug === "story-builder"), [items]);
  const categories = useMemo(() => items.filter((item) => item.slug !== "story-builder"), [items]);
  const allQuestionIds = useMemo(
    () => categories.flatMap((category) => (category.questions || []).map((question) => question.id)),
    [categories]
  );
  const questionIdSet = useMemo(() => new Set(allQuestionIds), [allQuestionIds]);
  const completedSet = useMemo(() => new Set(completedQuestionIds), [completedQuestionIds]);
  const questionCount = allQuestionIds.length;
  const completedCount = completedQuestionIds.length;
  const progress = questionCount === 0 ? 0 : Math.round((completedCount / questionCount) * 100);

  useEffect(() => {
    try {
      const savedRail = localStorage.getItem(railStorageKey);
      const savedOpenGroups = JSON.parse(localStorage.getItem(openGroupsStorageKey) || "null");

      if (savedRail === "true" || savedRail === "false") setRailCollapsed(savedRail === "true");
      if (Array.isArray(savedOpenGroups) && savedOpenGroups.length > 0) setOpenGroups(savedOpenGroups);
    } catch {
      setRailCollapsed(false);
      setOpenGroups(["behavioral"]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadBehavioralAnswers()
      .then((answers) => {
        if (cancelled) return;
        setCompletedQuestionIds(getCompletedQuestionIds(answers, questionIdSet, allQuestionIds));
      })
      .catch(() => {
        if (!cancelled) setCompletedQuestionIds([]);
      });

    function handleAnswersChanged(event) {
      setCompletedQuestionIds(getCompletedQuestionIds(event.detail?.answers || {}, questionIdSet, allQuestionIds));
    }

    window.addEventListener(behavioralAnswersChangedEvent, handleAnswersChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(behavioralAnswersChangedEvent, handleAnswersChanged);
    };
  }, [allQuestionIds, questionIdSet]);

  function toggleRail() {
    setRailCollapsed((current) => {
      const next = !current;
      localStorage.setItem(railStorageKey, String(next));
      return next;
    });
  }

  function toggleGroup(groupId) {
    setOpenGroups((current) => {
      const next = current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId];
      localStorage.setItem(openGroupsStorageKey, JSON.stringify(next));
      return next;
    });
  }

  const nav = (
    <BehavioralNav
      activeSlug={activeSlug}
      categories={categories}
      collapsed={railCollapsed}
      completedCount={completedCount}
      completedSet={completedSet}
      onToggleGroup={toggleGroup}
      onToggleRail={toggleRail}
      openGroups={openGroups}
      progress={progress}
      questionCount={questionCount}
      showRailToggle
      storyBuilder={storyBuilder}
    />
  );

  const gridClass = railCollapsed
    ? "xl:grid-cols-[64px_minmax(0,1fr)]"
    : "xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[328px_minmax(0,1fr)]";

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-[var(--site-bg)] font-sans text-[var(--site-text)] antialiased">
      <div className={`grid w-full gap-4 px-4 py-4 xl:pl-0 xl:pr-4 ${gridClass}`}>
        <aside className="hidden overflow-hidden rounded-r-lg border border-l-0 border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)] xl:sticky xl:top-16 xl:block xl:h-[calc(100vh-4.5rem)]">
          {nav}
        </aside>

        <details className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] p-3 xl:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--site-heading)]">
            Behavioral contents
          </summary>
          <div className="mt-3 max-h-[72vh] overflow-y-auto">
            <BehavioralNav
              activeSlug={activeSlug}
              categories={categories}
              collapsed={false}
              completedCount={completedCount}
              completedSet={completedSet}
              onToggleGroup={toggleGroup}
              onToggleRail={toggleRail}
              openGroups={openGroups}
              progress={progress}
              questionCount={questionCount}
              showRailToggle={false}
              storyBuilder={storyBuilder}
            />
          </div>
        </details>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}

function BehavioralNav({
  activeSlug,
  categories,
  collapsed,
  completedCount,
  completedSet,
  onToggleGroup,
  onToggleRail,
  openGroups,
  progress,
  questionCount,
  showRailToggle,
  storyBuilder
}) {
  const isOpen = openGroups.includes("behavioral");

  if (collapsed) {
    return (
      <nav className="flex h-full flex-col items-center" aria-label="Behavioral contents">
        <div className="flex w-full flex-col items-center gap-3 border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-2 py-3">
          <button
            type="button"
            onClick={onToggleRail}
            className="grid h-9 w-9 place-items-center rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-muted)] transition hover:border-[var(--site-brand)] hover:text-[var(--site-brand)]"
            aria-label="Expand behavioral contents"
          >
            <PanelLeftOpen size={17} aria-hidden="true" />
          </button>
          <Sparkles size={18} className="text-[var(--site-brand)]" aria-hidden="true" />
          <div className="flex h-24 w-2 items-end overflow-hidden rounded-full bg-[var(--site-surface-3)]" aria-label={`${progress}% complete`}>
            <div
              className="w-full rounded-full bg-[var(--site-brand)] transition-[height] duration-300"
              style={{ height: `${progress}%` }}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="grid gap-2">
            <CollapsedNavLink href="/behavioral" active={activeSlug === "story-builder"} label="Story Builder" value="S" />
            {categories.map((category) => (
              <CollapsedNavLink
                key={category.slug}
                href={`/behavioral/${category.slug}`}
                active={activeSlug === category.slug}
                label={category.title}
                value={category.number}
              />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex h-full flex-col" aria-label="Behavioral contents">
      <div className="border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
              <BookOpenCheck size={15} aria-hidden="true" />
              Behavioral
            </div>
            <div className="mt-1 text-xl font-semibold tracking-normal text-[var(--site-heading)]">
              Interview Prep
            </div>
          </div>
          {showRailToggle && (
            <button
              type="button"
              onClick={onToggleRail}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-muted)] transition hover:border-[var(--site-brand)] hover:text-[var(--site-brand)]"
              aria-label="Collapse behavioral contents"
            >
              <PanelLeftClose size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--site-muted)]">
          Build STAR stories once, then map them to interview questions.
        </p>
        <div className="mt-3 flex items-center justify-between text-xs font-medium text-[var(--site-muted)]">
          <span>{completedCount} of {questionCount} complete</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--site-surface-3)]">
          <div
            className="h-full rounded-full bg-[var(--site-brand)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {storyBuilder && (
            <BehavioralNavItem
              active={activeSlug === "story-builder"}
              href="/behavioral"
              item={storyBuilder}
              prefix="STAR"
            />
          )}

          <section className="rounded-md border border-transparent">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left transition hover:bg-[var(--site-surface-2)]"
              onClick={() => onToggleGroup("behavioral")}
              aria-expanded={isOpen}
            >
              <span className="min-w-0">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
                  Questions
                </span>
                <span className="mt-0.5 block truncate text-sm font-semibold tracking-normal text-[var(--site-heading)]">
                  Interview Categories
                </span>
                <span className="mt-1 block text-xs font-medium text-[var(--site-muted)]">
                  {completedCount}/{questionCount} complete
                </span>
              </span>
              <span className="mt-1 flex items-center gap-1 text-[var(--site-muted)]">
                <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] px-2 py-0.5 font-mono text-[10px] font-bold">
                  {categories.length}
                </span>
                {isOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
              </span>
            </button>

            {isOpen && (
              <div className="mt-1 grid gap-1 pl-1">
                {categories.map((category) => (
                  <BehavioralNavItem
                    key={category.slug}
                    active={activeSlug === category.slug}
                    completedSet={completedSet}
                    href={`/behavioral/${category.slug}`}
                    item={category}
                    prefix={category.number}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </nav>
  );
}

function BehavioralNavItem({ active, completedSet, href, item, prefix }) {
  const questions = item.questions || [];
  const completedQuestions = questions.filter((question) => completedSet?.has(question.id)).length;

  return (
    <Link
      href={href}
      className={`group flex min-h-10 items-start gap-2 rounded-md border px-2 py-2 transition ${
        active
          ? "border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-heading)] shadow-[var(--site-shadow)]"
          : "border-transparent text-[var(--site-muted)] hover:border-[var(--site-border)] hover:bg-[var(--site-surface)] hover:text-[var(--site-heading)]"
      }`}
    >
      <span className="mt-0.5 grid h-6 min-w-6 place-items-center rounded-md bg-[var(--site-brand-soft)] px-1 font-mono text-[10px] font-bold text-[var(--site-brand)]">
        {prefix}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium leading-5">{item.title}</span>
        {item.questions && (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium leading-4 text-[var(--site-muted)]">
            {completedQuestions === questions.length && questions.length > 0 && (
              <CheckCircle2 size={12} className="text-[var(--site-good)]" aria-hidden="true" />
            )}
            {completedQuestions}/{questions.length} complete
          </span>
        )}
      </span>
    </Link>
  );
}

function getCompletedQuestionIds(answers, questionIdSet, orderedQuestionIds) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return [];

  const completed = new Set();
  for (const [questionId, value] of Object.entries(answers)) {
    if (!questionIdSet.has(questionId)) continue;
    if (String(value?.answer || "").trim()) completed.add(questionId);
  }

  return orderedQuestionIds.filter((questionId) => completed.has(questionId));
}

function CollapsedNavLink({ href, active, label, value }) {
  return (
    <Link
      href={href}
      className={`grid h-9 w-9 place-items-center rounded-md border text-[11px] font-semibold transition ${
        active
          ? "border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-heading)] shadow-sm"
          : "border-transparent text-[var(--site-muted)] hover:border-[var(--site-border)] hover:bg-[var(--site-surface)]"
      }`}
      aria-label={label}
      title={label}
    >
      {value}
    </Link>
  );
}
