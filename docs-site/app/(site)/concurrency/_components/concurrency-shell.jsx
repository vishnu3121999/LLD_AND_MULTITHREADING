"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ListTree,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { concurrencyModules } from "../../../../lib/concurrency-curriculum";

const shellTheme = {
  "--cor-bg": "#f6f8fb",
  "--cor-surface": "#ffffff",
  "--cor-surface-2": "#f8fafc",
  "--cor-heading": "#1f2937",
  "--cor-text": "#475569",
  "--cor-muted": "#64748b",
  "--cor-border": "#dbe4ef",
  "--cor-brand": "#4f46e5",
  "--cor-brand-soft": "rgba(79, 70, 229, 0.1)",
  "--cor-good": "#0f766e",
  "--cor-danger": "#dc2626",
  "--cor-code-bg": "#070b14",
  "--cor-code-top": "#111827",
  "--cor-code-border": "#273244"
};

const completionStorageKey = "lld-concurrency-completed-lessons";
const openModulesStorageKey = "lld-concurrency-open-modules";
const railCollapsedStorageKey = "lld-concurrency-rail-collapsed";
const allModuleIds = concurrencyModules.map((module) => module.id);
const allLessonSlugs = concurrencyModules.flatMap((module) =>
  module.lessons.map((lesson) => lesson.slug)
);
const lessonSlugSet = new Set(allLessonSlugs);
const problemCategoryLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};

function getActiveModuleId(activeSlug) {
  if (!activeSlug) return null;
  return concurrencyModules.find((module) =>
    module.lessons.some((lesson) => lesson.slug === activeSlug)
  )?.id || null;
}

function getDefaultOpenModules(activeSlug) {
  const activeModuleId = getActiveModuleId(activeSlug);
  return activeModuleId ? [activeModuleId] : allModuleIds;
}

export function ConcurrencyShell({ activeSlug, pageNav = [], children }) {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [openModules, setOpenModules] = useState(() => getDefaultOpenModules(activeSlug));
  const [railCollapsed, setRailCollapsed] = useState(false);

  useEffect(() => {
    try {
      const savedCompleted = JSON.parse(localStorage.getItem(completionStorageKey) || "[]");
      const savedOpenModules = JSON.parse(localStorage.getItem(openModulesStorageKey) || "null");
      const savedRailCollapsed = localStorage.getItem(railCollapsedStorageKey);

      if (Array.isArray(savedCompleted)) {
        setCompletedLessons(savedCompleted.filter((slug) => lessonSlugSet.has(slug)));
      }

      if (Array.isArray(savedOpenModules)) {
        const validOpenModules = savedOpenModules.filter((moduleId) => allModuleIds.includes(moduleId));
        setOpenModules(validOpenModules.length > 0 ? validOpenModules : getDefaultOpenModules(activeSlug));
      }

      if (savedRailCollapsed === "true" || savedRailCollapsed === "false") {
        setRailCollapsed(savedRailCollapsed === "true");
      }
    } catch {
      setCompletedLessons([]);
      setOpenModules(getDefaultOpenModules(activeSlug));
    }
  }, [activeSlug]);

  useEffect(() => {
    if (!activeSlug) return;

    const activeModuleId = getActiveModuleId(activeSlug);
    if (!activeModuleId) return;

    setOpenModules((current) => {
      if (current.includes(activeModuleId)) return current;
      const next = [...current, activeModuleId];
      localStorage.setItem(openModulesStorageKey, JSON.stringify(next));
      return next;
    });
  }, [activeSlug]);

  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons]);
  const completedCount = completedLessons.length;
  const lessonCount = allLessonSlugs.length;
  const progress = lessonCount === 0 ? 0 : Math.round((completedCount / lessonCount) * 100);

  function toggleComplete(slug = activeSlug) {
    if (!slug || !lessonSlugSet.has(slug)) return;

    setCompletedLessons((current) => {
      const currentSet = new Set(current);
      if (currentSet.has(slug)) {
        currentSet.delete(slug);
      } else {
        currentSet.add(slug);
      }

      const next = allLessonSlugs.filter((lessonSlug) => currentSet.has(lessonSlug));
      localStorage.setItem(completionStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function toggleModule(moduleId) {
    setOpenModules((current) => {
      const isOpen = current.includes(moduleId);
      const next = isOpen
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId];

      localStorage.setItem(openModulesStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function toggleRail() {
    setRailCollapsed((current) => {
      const next = !current;
      localStorage.setItem(railCollapsedStorageKey, String(next));
      return next;
    });
  }

  const hasPageNav = pageNav.length > 0;
  const gridClass = railCollapsed
    ? hasPageNav
      ? "xl:grid-cols-[64px_minmax(0,1fr)_52px]"
      : "xl:grid-cols-[64px_minmax(0,1fr)]"
    : hasPageNav
      ? "xl:grid-cols-[320px_minmax(0,1fr)_52px] 2xl:grid-cols-[328px_minmax(0,1fr)_56px]"
      : "xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[328px_minmax(0,1fr)]";

  return (
    <main
      style={shellTheme}
      className="min-h-[calc(100vh-3rem)] bg-[var(--cor-bg)] font-sans text-[var(--cor-text)] antialiased"
    >
      <div className={`grid w-full gap-4 px-4 py-4 xl:pl-0 xl:pr-4 ${gridClass}`}>
        <aside className="hidden overflow-hidden rounded-r-lg border border-l-0 border-[var(--cor-border)] bg-[var(--cor-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)] xl:sticky xl:top-16 xl:block xl:h-[calc(100vh-4.5rem)]">
          <CurriculumNav
            activeSlug={activeSlug}
            collapsed={railCollapsed}
            completedCount={completedCount}
            completedSet={completedSet}
            lessonCount={lessonCount}
            onToggleComplete={toggleComplete}
            onToggleModule={toggleModule}
            onToggleRail={toggleRail}
            openModules={openModules}
            progress={progress}
            showRailToggle
          />
        </aside>

        <details className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-3 xl:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--cor-heading)]">
            Course contents
          </summary>
          <div className="mt-3 max-h-[72vh] overflow-y-auto">
            <CurriculumNav
              activeSlug={activeSlug}
              collapsed={false}
              completedCount={completedCount}
              completedSet={completedSet}
              lessonCount={lessonCount}
              onToggleComplete={toggleComplete}
              onToggleModule={toggleModule}
              onToggleRail={toggleRail}
              openModules={openModules}
              progress={progress}
              showRailToggle={false}
            />
          </div>
        </details>

        <div className="min-w-0">{children}</div>

        {hasPageNav && (
          <aside className="hidden xl:sticky xl:top-16 xl:block xl:h-fit">
            <PageNav items={pageNav} />
          </aside>
        )}
      </div>
    </main>
  );
}

function CurriculumNav({
  activeSlug,
  collapsed,
  completedCount,
  completedSet,
  lessonCount,
  onToggleComplete,
  onToggleModule,
  onToggleRail,
  openModules,
  progress,
  showRailToggle
}) {
  if (collapsed) {
    return (
      <nav className="flex h-full flex-col items-center" aria-label="Concurrency curriculum">
        <div className="flex w-full flex-col items-center gap-3 border-b border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-2 py-3">
          <button
            type="button"
            onClick={onToggleRail}
            className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cor-border)] bg-white text-[var(--cor-muted)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-brand)]"
            aria-label="Expand course contents"
          >
            <PanelLeftOpen size={17} aria-hidden="true" />
          </button>
          <BookOpenCheck size={18} className="text-[var(--cor-brand)]" aria-hidden="true" />
          <div className="flex h-24 w-2 items-end overflow-hidden rounded-full bg-[#e5ebf3]" aria-label={`${progress}% complete`}>
            <div
              className="w-full rounded-full bg-[var(--cor-brand)] transition-[height] duration-300"
              style={{ height: `${progress}%` }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="grid gap-2">
            {concurrencyModules.map((module) => {
              const isActiveModule = module.lessons.some((lesson) => lesson.slug === activeSlug);
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => onToggleModule(module.id)}
                  className={`grid h-9 w-9 place-items-center rounded-md border text-[11px] font-semibold transition ${
                    isActiveModule
                      ? "border-slate-300 bg-white text-[var(--cor-heading)] shadow-sm"
                      : "border-transparent text-[var(--cor-muted)] hover:border-[var(--cor-border)] hover:bg-white"
                  }`}
                  aria-label={module.title}
                >
                  {module.number.replace("Module ", "")}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex h-full flex-col" aria-label="Concurrency curriculum">
      <div className="border-b border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
              <BookOpenCheck size={15} aria-hidden="true" />
              Concurrency
            </div>
            <div className="mt-1 text-xl font-semibold tracking-normal text-[var(--cor-heading)]">
              Course Contents
            </div>
          </div>
          {showRailToggle && (
            <button
              type="button"
              onClick={onToggleRail}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--cor-border)] bg-white text-[var(--cor-muted)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-brand)]"
              aria-label="Collapse course contents"
            >
              <PanelLeftClose size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium text-[var(--cor-muted)]">
          <span>{completedCount} of {lessonCount} complete</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ebf3]">
          <div
            className="h-full rounded-full bg-[var(--cor-brand)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {concurrencyModules.map((module) => {
            const isOpen = openModules.includes(module.id);
            const moduleCompleted = module.lessons.filter((lesson) =>
              completedSet.has(lesson.slug)
            ).length;

            return (
              <section key={module.id} className="rounded-md border border-transparent">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left transition hover:bg-[var(--cor-surface-2)]"
                  onClick={() => onToggleModule(module.id)}
                  aria-expanded={isOpen}
                >
                  <span className="min-w-0">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
                      {module.number}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold tracking-normal text-[var(--cor-heading)]">
                      {module.title}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-[var(--cor-muted)]">
                      {moduleCompleted}/{module.lessons.length} complete
                    </span>
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[var(--cor-muted)]">
                    <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface)] px-2 py-0.5 font-mono text-[10px] font-bold">
                      {module.lessons.length}
                    </span>
                    {isOpen ? (
                      <ChevronDown size={16} aria-hidden="true" />
                    ) : (
                      <ChevronRight size={16} aria-hidden="true" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <ModuleLessonList
                    activeSlug={activeSlug}
                    completedSet={completedSet}
                    module={module}
                    onToggleComplete={onToggleComplete}
                  />
                )}
              </section>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function ModuleLessonList({ activeSlug, completedSet, module, onToggleComplete }) {
  if (module.id !== "coding-problems") {
    return (
      <div className="mt-1 grid gap-1 pl-1">
        {module.lessons.map((lesson) => (
          <LessonNavItem
            key={lesson.slug}
            activeSlug={activeSlug}
            completedSet={completedSet}
            lesson={lesson}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-3 pl-1">
      {Object.entries(problemCategoryLabels).map(([category, label]) => {
        const lessons = module.lessons.filter((lesson) => lesson.category === category);
        if (lessons.length === 0) return null;

        return (
          <div key={category}>
            <div className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cor-muted)]">
              {label}
            </div>
            <div className="grid gap-1">
              {lessons.map((lesson) => (
                <LessonNavItem
                  key={lesson.slug}
                  activeSlug={activeSlug}
                  completedSet={completedSet}
                  lesson={lesson}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LessonNavItem({ activeSlug, completedSet, lesson, onToggleComplete }) {
  const isActive = activeSlug === lesson.slug;
  const isComplete = completedSet.has(lesson.slug);

  return (
    <div
      className={`group flex min-h-9 items-start gap-1 rounded-md border transition ${
        isActive
          ? "border-slate-200 bg-white text-[var(--cor-heading)] shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
          : "border-transparent text-[var(--cor-muted)] hover:border-[var(--cor-border)] hover:bg-white hover:text-[var(--cor-heading)]"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleComplete(lesson.slug)}
        className={`ml-1 mt-1.5 grid h-6 w-6 flex-none place-items-center rounded-md transition ${
          isComplete
            ? "text-[var(--cor-good)] hover:bg-[rgba(15,118,110,0.08)]"
            : "text-slate-300 hover:bg-slate-100 hover:text-[var(--cor-brand)]"
        }`}
        aria-label={isComplete ? `Mark ${lesson.title} incomplete` : `Mark ${lesson.title} complete`}
        title={isComplete ? "Mark incomplete" : "Mark complete"}
      >
        {isComplete ? (
          <CheckCircle2
            size={15}
            aria-hidden="true"
          />
        ) : (
          <Circle
            size={14}
            aria-hidden="true"
          />
        )}
      </button>
      <Link
        href={`/concurrency/${lesson.slug}`}
        className={`min-w-0 flex-1 rounded-r-md py-2 pl-1 pr-2 text-[13px] leading-5 transition ${
          isActive ? "font-medium" : "font-normal"
        }`}
      >
        {lesson.title}
      </Link>
    </div>
  );
}

function PageNav({ items }) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Page navigation" className="group relative flex justify-end">
      <button
        type="button"
        aria-label="Show page navigation"
        className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] text-[var(--cor-muted)] shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-brand)]"
      >
        <ListTree size={18} aria-hidden="true" />
      </button>
      <div className="pointer-events-none absolute right-0 top-0 z-30 w-64 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-3 opacity-0 shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="border-b border-[var(--cor-border)] px-1 pb-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
            Page Nav
          </div>
          <div className="mt-1 text-sm font-semibold text-[var(--cor-heading)]">On this page</div>
        </div>
        <div className="mt-2 grid gap-1">
          {items.map((item) => (
            <a
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-md px-2 py-2 text-xs font-medium leading-5 text-[var(--cor-muted)] transition hover:bg-[var(--cor-surface-2)] hover:text-[var(--cor-heading)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
