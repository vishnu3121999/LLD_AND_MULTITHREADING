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

const shellTheme = {
  "--hld-bg": "var(--site-bg)",
  "--hld-surface": "var(--site-surface)",
  "--hld-surface-2": "var(--site-surface-2)",
  "--hld-heading": "var(--site-heading)",
  "--hld-text": "var(--site-text)",
  "--hld-muted": "var(--site-muted)",
  "--hld-border": "var(--site-border)",
  "--hld-brand": "var(--site-brand)",
  "--hld-brand-soft": "var(--site-brand-soft)",
  "--hld-good": "var(--site-good)",
  "--hld-danger": "var(--site-danger)",
  "--hld-code-bg": "var(--site-code-bg)"
};

const completionStorageKey = "hld-completed-problems";
const openGroupsStorageKey = "hld-open-groups";
const railCollapsedStorageKey = "hld-rail-collapsed";

function getAllGroupIds(groups) {
  return groups.map((group) => group.id);
}

function getAllItemSlugs(groups) {
  return groups.flatMap((group) => group.items.map((item) => item.slug));
}

function getActiveGroupId(groups, activeSlug) {
  if (!activeSlug) return null;
  return groups.find((group) => group.items.some((item) => item.slug === activeSlug))?.id || null;
}

function getDefaultOpenGroups(groups, activeSlug) {
  const activeGroupId = getActiveGroupId(groups, activeSlug);
  return activeGroupId ? [activeGroupId] : getAllGroupIds(groups);
}

export function HldShell({ activeSlug, groups, pageNav = [], children }) {
  const allGroupIds = useMemo(() => getAllGroupIds(groups), [groups]);
  const allItemSlugs = useMemo(() => getAllItemSlugs(groups), [groups]);
  const itemSlugSet = useMemo(() => new Set(allItemSlugs), [allItemSlugs]);
  const [completedItems, setCompletedItems] = useState([]);
  const [openGroups, setOpenGroups] = useState(() => getDefaultOpenGroups(groups, activeSlug));
  const [railCollapsed, setRailCollapsed] = useState(false);

  useEffect(() => {
    try {
      const savedCompleted = JSON.parse(localStorage.getItem(completionStorageKey) || "[]");
      const savedOpenGroups = JSON.parse(localStorage.getItem(openGroupsStorageKey) || "null");
      const savedRailCollapsed = localStorage.getItem(railCollapsedStorageKey);

      if (Array.isArray(savedCompleted)) {
        setCompletedItems(savedCompleted.filter((slug) => itemSlugSet.has(slug)));
      }

      if (Array.isArray(savedOpenGroups)) {
        const validOpenGroups = savedOpenGroups.filter((groupId) => allGroupIds.includes(groupId));
        setOpenGroups(validOpenGroups.length > 0 ? validOpenGroups : getDefaultOpenGroups(groups, activeSlug));
      } else {
        setOpenGroups(getDefaultOpenGroups(groups, activeSlug));
      }

      if (savedRailCollapsed === "true" || savedRailCollapsed === "false") {
        setRailCollapsed(savedRailCollapsed === "true");
      }
    } catch {
      setCompletedItems([]);
      setOpenGroups(getDefaultOpenGroups(groups, activeSlug));
    }
  }, [activeSlug, allGroupIds, groups, itemSlugSet]);

  useEffect(() => {
    if (!activeSlug) return;

    const activeGroupId = getActiveGroupId(groups, activeSlug);
    if (!activeGroupId) return;

    setOpenGroups((current) => {
      if (current.includes(activeGroupId)) return current;
      const next = [...current, activeGroupId];
      localStorage.setItem(openGroupsStorageKey, JSON.stringify(next));
      return next;
    });
  }, [activeSlug, groups]);

  const completedSet = useMemo(() => new Set(completedItems), [completedItems]);
  const completedCount = completedItems.length;
  const itemCount = allItemSlugs.length;
  const progress = itemCount === 0 ? 0 : Math.round((completedCount / itemCount) * 100);

  function toggleComplete(slug = activeSlug) {
    if (!slug || !itemSlugSet.has(slug)) return;

    setCompletedItems((current) => {
      const currentSet = new Set(current);
      if (currentSet.has(slug)) {
        currentSet.delete(slug);
      } else {
        currentSet.add(slug);
      }

      const next = allItemSlugs.filter((itemSlug) => currentSet.has(itemSlug));
      localStorage.setItem(completionStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function toggleGroup(groupId) {
    setOpenGroups((current) => {
      const isOpen = current.includes(groupId);
      const next = isOpen
        ? current.filter((id) => id !== groupId)
        : [...current, groupId];

      localStorage.setItem(openGroupsStorageKey, JSON.stringify(next));
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
      className="min-h-[calc(100vh-3rem)] bg-[var(--hld-bg)] font-sans text-[var(--hld-text)] antialiased"
    >
      <div className={`grid w-full gap-4 px-4 py-4 xl:pl-0 xl:pr-4 ${gridClass}`}>
        <aside className="hidden overflow-hidden rounded-r-lg border border-l-0 border-[var(--hld-border)] bg-[var(--hld-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)] xl:sticky xl:top-16 xl:block xl:h-[calc(100vh-4.5rem)]">
          <HldCourseNav
            activeSlug={activeSlug}
            collapsed={railCollapsed}
            completedCount={completedCount}
            completedSet={completedSet}
            groups={groups}
            itemCount={itemCount}
            onToggleComplete={toggleComplete}
            onToggleGroup={toggleGroup}
            onToggleRail={toggleRail}
            openGroups={openGroups}
            progress={progress}
            showRailToggle
          />
        </aside>

        <details className="rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] p-3 xl:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--hld-heading)]">
            HLD contents
          </summary>
          <div className="mt-3 max-h-[72vh] overflow-y-auto">
            <HldCourseNav
              activeSlug={activeSlug}
              collapsed={false}
              completedCount={completedCount}
              completedSet={completedSet}
              groups={groups}
              itemCount={itemCount}
              onToggleComplete={toggleComplete}
              onToggleGroup={toggleGroup}
              onToggleRail={toggleRail}
              openGroups={openGroups}
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

function HldCourseNav({
  activeSlug,
  collapsed,
  completedCount,
  completedSet,
  groups,
  itemCount,
  onToggleComplete,
  onToggleGroup,
  onToggleRail,
  openGroups,
  progress,
  showRailToggle
}) {
  if (collapsed) {
    return (
      <nav className="flex h-full flex-col items-center" aria-label="HLD contents">
        <div className="flex w-full flex-col items-center gap-3 border-b border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-2 py-3">
          <button
            type="button"
            onClick={onToggleRail}
            className="grid h-9 w-9 place-items-center rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] text-[var(--hld-muted)] transition hover:border-[var(--hld-brand)] hover:text-[var(--hld-brand)]"
            aria-label="Expand HLD contents"
          >
            <PanelLeftOpen size={17} aria-hidden="true" />
          </button>
          <BookOpenCheck size={18} className="text-[var(--hld-brand)]" aria-hidden="true" />
          <div className="flex h-24 w-2 items-end overflow-hidden rounded-full bg-[var(--site-surface-3)]" aria-label={`${progress}% complete`}>
            <div
              className="w-full rounded-full bg-[var(--hld-brand)] transition-[height] duration-300"
              style={{ height: `${progress}%` }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="grid gap-2">
            {groups.map((group, index) => {
              const isActiveGroup = group.items.some((item) => item.slug === activeSlug);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => onToggleGroup(group.id)}
                  className={`grid h-9 w-9 place-items-center rounded-md border text-[11px] font-semibold transition ${
                    isActiveGroup
                      ? "border-[var(--hld-border)] bg-[var(--hld-surface)] text-[var(--hld-heading)] shadow-sm"
                      : "border-transparent text-[var(--hld-muted)] hover:border-[var(--hld-border)] hover:bg-[var(--hld-surface)]"
                  }`}
                  aria-label={group.title}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex h-full flex-col" aria-label="HLD contents">
      <div className="border-b border-[var(--hld-border)] bg-[var(--hld-surface-2)] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
              <BookOpenCheck size={15} aria-hidden="true" />
              HLD
            </div>
            <div className="mt-1 text-xl font-semibold tracking-normal text-[var(--hld-heading)]">
              Course Contents
            </div>
          </div>
          {showRailToggle && (
            <button
              type="button"
              onClick={onToggleRail}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] text-[var(--hld-muted)] transition hover:border-[var(--hld-brand)] hover:text-[var(--hld-brand)]"
              aria-label="Collapse HLD contents"
            >
              <PanelLeftClose size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium text-[var(--hld-muted)]">
          <span>{completedCount} of {itemCount} complete</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--site-surface-3)]">
          <div
            className="h-full rounded-full bg-[var(--hld-brand)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {groups.map((group) => {
            const isOpen = openGroups.includes(group.id);
            const groupCompleted = group.items.filter((item) => completedSet.has(item.slug)).length;

            return (
              <section key={group.id} className="rounded-md border border-transparent">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left transition hover:bg-[var(--hld-surface-2)]"
                  onClick={() => onToggleGroup(group.id)}
                  aria-expanded={isOpen}
                >
                  <span className="min-w-0">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                      {group.number}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold tracking-normal text-[var(--hld-heading)]">
                      {group.title}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-[var(--hld-muted)]">
                      {groupCompleted}/{group.items.length} complete
                    </span>
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[var(--hld-muted)]">
                    <span className="rounded-full border border-[var(--hld-border)] bg-[var(--hld-surface)] px-2 py-0.5 font-mono text-[10px] font-bold">
                      {group.items.length}
                    </span>
                    {isOpen ? (
                      <ChevronDown size={16} aria-hidden="true" />
                    ) : (
                      <ChevronRight size={16} aria-hidden="true" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-1 grid gap-1 pl-1">
                    {group.items.map((item) => (
                      <HldNavItem
                        key={item.slug}
                        activeSlug={activeSlug}
                        completedSet={completedSet}
                        item={item}
                        onToggleComplete={onToggleComplete}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function HldNavItem({ activeSlug, completedSet, item, onToggleComplete }) {
  const isActive = activeSlug === item.slug;
  const isComplete = completedSet.has(item.slug);

  return (
    <div
      className={`group flex min-h-9 items-start gap-1 rounded-md border transition ${
        isActive
          ? "border-[var(--hld-border)] bg-[var(--hld-surface)] text-[var(--hld-heading)] shadow-[var(--site-shadow)]"
          : "border-transparent text-[var(--hld-muted)] hover:border-[var(--hld-border)] hover:bg-[var(--hld-surface)] hover:text-[var(--hld-heading)]"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleComplete(item.slug)}
        className={`ml-1 mt-1.5 grid h-6 w-6 flex-none place-items-center rounded-md transition ${
          isComplete
            ? "text-[var(--hld-good)] hover:bg-[rgba(15,118,110,0.08)]"
            : "text-[var(--hld-muted)] hover:bg-[var(--hld-surface-2)] hover:text-[var(--hld-brand)]"
        }`}
        aria-label={isComplete ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
        title={isComplete ? "Mark incomplete" : "Mark complete"}
      >
        {isComplete ? (
          <CheckCircle2 size={15} aria-hidden="true" />
        ) : (
          <Circle size={14} aria-hidden="true" />
        )}
      </button>
      <Link
        href={`/hld/${item.slug}`}
        className={`min-w-0 flex-1 rounded-r-md py-2 pl-1 pr-2 text-[13px] leading-5 transition ${
          isActive ? "font-medium" : "font-normal"
        }`}
      >
        {item.title}
      </Link>
    </div>
  );
}

function PageNav({ items }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Page navigation" className="group relative flex justify-end">
      <button
        type="button"
        aria-label="Show page navigation"
        className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] text-[var(--hld-muted)] shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:border-[var(--hld-brand)] hover:text-[var(--hld-brand)]"
      >
        <ListTree size={18} aria-hidden="true" />
      </button>
      <div className="pointer-events-none absolute right-0 top-0 z-30 w-64 rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] p-3 opacity-0 shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="border-b border-[var(--hld-border)] px-1 pb-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
            Page Nav
          </div>
          <div className="mt-1 text-sm font-semibold text-[var(--hld-heading)]">On this page</div>
        </div>
        <div className="mt-2 grid max-h-[70vh] gap-1 overflow-y-auto">
          {items.map((item) => (
            <a
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-md px-2 py-2 text-xs font-medium leading-5 text-[var(--hld-muted)] transition hover:bg-[var(--hld-surface-2)] hover:text-[var(--hld-heading)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
