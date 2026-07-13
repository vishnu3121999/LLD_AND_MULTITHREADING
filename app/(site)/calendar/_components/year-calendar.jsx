"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eraser,
  ListChecks,
  Plus,
  RotateCcw,
  Trash2,
  X
} from "lucide-react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusOptions = [
  { id: "green", label: "Done", bg: "#15803d", text: "#ffffff", icon: Check },
  { id: "red", label: "Missed", bg: "#b91c1c", text: "#ffffff", icon: X },
  { id: "black", label: "IDK", bg: "#111827", text: "#ffffff", icon: CircleHelp }
];

const timeSlots = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

const timeOptions = [...timeSlots, "24:00"];

const calendarTheme = {
  "--cal-bg": "var(--site-bg)",
  "--cal-surface": "var(--site-surface)",
  "--cal-surface-2": "var(--site-surface-2)",
  "--cal-surface-3": "var(--site-surface-3)",
  "--cal-heading": "var(--site-heading)",
  "--cal-text": "var(--site-text)",
  "--cal-muted": "var(--site-muted)",
  "--cal-border": "var(--site-border)",
  "--cal-brand": "var(--site-brand)",
  "--cal-brand-soft": "var(--site-brand-soft)"
};

function getStorageKey(year) {
  return `calendar-day-marks:${year}`;
}

function getPlanStorageKey(year) {
  return `calendar-day-plans:${year}`;
}

function getInitialYear() {
  return new Date().getFullYear();
}

function getDateKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDateKeyFromDate(date) {
  return getDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTodayKey() {
  return getDateKeyFromDate(new Date());
}

function getDateFromKey(dateKey) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getMonthDays(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({ type: "blank", key: `blank-${monthIndex}-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = getDateKey(year, monthIndex, day);
    cells.push({ type: "day", day, dateKey });
  }

  return cells;
}

function normalizeStatusId(value) {
  if (value === "green" || value === "emerald") return "green";
  if (value === "red" || value === "rose") return "red";
  if (value === "black" || value === "slate") return "black";
  return "green";
}

function getStatus(optionId) {
  return statusOptions.find((option) => option.id === normalizeStatusId(optionId)) || statusOptions[0];
}

function isGreenMark(mark) {
  if (!mark) return false;
  return normalizeStatusId(mark?.status || mark?.color) === "green";
}

function getStreakStats(marks, year, todayKey) {
  const todayYear = Number(todayKey.slice(0, 4));
  const endDate = todayYear === year ? getDateFromKey(todayKey) : new Date(year, 11, 31);
  const startDate = new Date(year, 0, 1);
  let current = 0;
  let currentStartDate = addDays(endDate, 1);

  for (let date = new Date(endDate); date >= startDate; date = addDays(date, -1)) {
    if (!isGreenMark(marks[getDateKeyFromDate(date)])) break;
    current += 1;
    currentStartDate = new Date(date);
  }

  const previousEndDate = current > 0 ? addDays(currentStartDate, -1) : endDate;
  let previousBest = 0;
  let running = 0;

  for (let date = new Date(startDate); date <= previousEndDate; date = addDays(date, 1)) {
    if (isGreenMark(marks[getDateKeyFromDate(date)])) {
      running += 1;
      previousBest = Math.max(previousBest, running);
    } else {
      running = 0;
    }
  }

  return { current, previousBest };
}

function formatSelectedDate(dateKey) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

function formatTimeSlot(slot) {
  if (slot === "24:00") return "12:00 AM";
  const [hourValue, minute] = slot.split(":");
  const hour = Number(hourValue);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function getTimeValue(slot) {
  if (slot === "24:00") return 24 * 60;
  const [hour, minute] = String(slot || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

function getNextTimeOption(start) {
  const startValue = getTimeValue(start);
  return timeOptions.find((slot) => getTimeValue(slot) > startValue) || "24:00";
}

function getEndTimeOptions(start) {
  const startValue = getTimeValue(start);
  return timeOptions.filter((slot) => getTimeValue(slot) > startValue);
}

function createTimeBlock() {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: "",
    start: "09:00",
    end: "10:00"
  };
}

function createPriority() {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: "",
    done: false
  };
}

function normalizePriority(priority, index) {
  if (typeof priority === "string") {
    return {
      id: `priority-${index}`,
      text: priority,
      done: false
    };
  }

  return {
    id: typeof priority?.id === "string" && priority.id ? priority.id : `priority-${index}`,
    text: typeof priority?.text === "string" ? priority.text : "",
    done: Boolean(priority?.done)
  };
}

function normalizePriorities(priorities) {
  return Array.isArray(priorities) ? priorities.map(normalizePriority) : [];
}

function normalizeTimeBlock(block, index) {
  const start = timeSlots.includes(block?.start) ? block.start : "09:00";
  const validEndOptions = getEndTimeOptions(start);
  const end = validEndOptions.includes(block?.end) ? block.end : validEndOptions[0] || "24:00";

  return {
    id: typeof block?.id === "string" && block.id ? block.id : `block-${index}`,
    title: typeof block?.title === "string" ? block.title : "",
    start,
    end
  };
}

function migrateScheduleToBlocks(schedule) {
  if (!schedule || typeof schedule !== "object") return [];

  return Object.entries(schedule)
    .map(([slot, entry], index) => {
      const normalizedEntry = typeof entry === "string"
        ? { text: entry, span: 1 }
        : {
            text: typeof entry?.text === "string" ? entry.text : "",
            span: Number.isInteger(entry?.span) && entry.span > 0 ? entry.span : 1
          };

      if (!normalizedEntry.text.trim()) return null;

      const startIndex = timeSlots.indexOf(slot);
      const end = startIndex >= 0
        ? timeOptions[Math.min(timeOptions.length - 1, startIndex + normalizedEntry.span)]
        : getNextTimeOption("09:00");

      return normalizeTimeBlock({
        id: `migrated-${slot}-${index}`,
        title: normalizedEntry.text,
        start: timeSlots.includes(slot) ? slot : "09:00",
        end
      }, index);
    })
    .filter(Boolean);
}

function getBlockDurationLabel(block) {
  const minutes = Math.max(0, getTimeValue(block.end) - getTimeValue(block.start));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function normalizePlan(plan) {
  const blocks = Array.isArray(plan?.blocks)
    ? plan.blocks.map(normalizeTimeBlock)
    : migrateScheduleToBlocks(plan?.schedule);

  return {
    priorities: normalizePriorities(plan?.priorities),
    blocks: blocks.sort((a, b) => getTimeValue(a.start) - getTimeValue(b.start)),
    completed: typeof plan?.completed === "string" ? plan.completed : "",
    notes: typeof plan?.notes === "string" ? plan.notes : "",
    shutdown: typeof plan?.shutdown === "string" ? plan.shutdown : ""
  };
}

export function YearCalendar() {
  const [year, setYear] = useState(getInitialYear);
  const [marks, setMarks] = useState({});
  const [plans, setPlans] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayKey);
  const [activeMarkDate, setActiveMarkDate] = useState("");
  const todayScrolledRef = useRef(false);
  const todayKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(getStorageKey(year)) || "{}");
      setMarks(saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {});
    } catch {
      setMarks({});
    }
  }, [year]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(getPlanStorageKey(year)) || "{}");
      setPlans(saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {});
    } catch {
      setPlans({});
    }
  }, [year]);

  useEffect(() => {
    if (todayScrolledRef.current || year !== getInitialYear()) return;

    const timeoutId = window.setTimeout(() => {
      const todayCell = window.document.querySelector(`[data-date-key="${todayKey}"]`);
      if (!todayCell) return;

      todayScrolledRef.current = true;
      todayCell.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [todayKey, year]);

  useEffect(() => {
    const selectedYear = Number(String(selectedDate || "").slice(0, 4));
    if (selectedYear === year) return;
    setSelectedDate(getDateKey(year, 0, 1));
    setActiveMarkDate("");
  }, [selectedDate, year]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (event.target instanceof Element && event.target.closest("[data-calendar-mark-control]")) return;
      setActiveMarkDate("");
    }

    window.document.addEventListener("pointerdown", handlePointerDown);
    return () => window.document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function persistMarks(nextMarks) {
    setMarks(nextMarks);
    localStorage.setItem(getStorageKey(year), JSON.stringify(nextMarks));
  }

  function persistPlans(nextPlans) {
    setPlans(nextPlans);
    localStorage.setItem(getPlanStorageKey(year), JSON.stringify(nextPlans));
  }

  function selectDay(dateKey) {
    setSelectedDate(dateKey);
    setActiveMarkDate(dateKey);
  }

  function setDayStatus(dateKey, statusId) {
    persistMarks({
      ...marks,
      [dateKey]: {
        ...marks[dateKey],
        status: statusId
      }
    });
    setSelectedDate(dateKey);
    setActiveMarkDate("");
  }

  function clearDayStatus(dateKey) {
    const nextMarks = { ...marks };
    delete nextMarks[dateKey];
    persistMarks(nextMarks);
    setSelectedDate(dateKey);
    setActiveMarkDate("");
  }

  function updateSelectedPlan(updater) {
    if (!selectedDate) return;

    const currentPlan = normalizePlan(plans[selectedDate]);
    const nextPlan = updater(currentPlan);
    persistPlans({
      ...plans,
      [selectedDate]: nextPlan
    });
  }

  function resetToCurrentYear() {
    setYear(getInitialYear());
    setSelectedDate(todayKey);
    setActiveMarkDate(todayKey);
    todayScrolledRef.current = false;
  }

  const markedCount = Object.keys(marks).length;
  const streakStats = useMemo(() => getStreakStats(marks, year, todayKey), [marks, todayKey, year]);
  const selectedPlan = useMemo(() => normalizePlan(plans[selectedDate]), [plans, selectedDate]);

  return (
    <main style={calendarTheme} className="min-h-[calc(100vh-3rem)] bg-[var(--cal-bg)] text-[var(--cal-text)]">
      <div className="site-container grid gap-4 py-4 xl:grid-cols-[minmax(300px,0.35fr)_minmax(0,0.65fr)] 2xl:grid-cols-[minmax(340px,0.35fr)_minmax(0,0.65fr)]">
        <section className="grid min-w-0 content-start gap-3" aria-label={`${year} months`}>
          <div className="sticky top-14 z-30 rounded-lg border border-[var(--cal-border)] bg-[var(--cal-surface)]/95 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-base font-black tracking-normal text-[var(--cal-heading)]">Calendar</h1>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <div className="inline-flex items-center rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface-2)] p-0.5">
                  <button
                    type="button"
                    onClick={() => setYear((current) => current - 1)}
                    className="grid h-8 w-8 place-items-center rounded text-[var(--cal-muted)] transition hover:bg-[var(--cal-surface)] hover:text-[var(--cal-heading)]"
                    aria-label="Previous year"
                    title="Previous year"
                  >
                    <ChevronLeft size={15} aria-hidden="true" />
                  </button>
                  <label className="sr-only" htmlFor="calendar-year">
                    Year
                  </label>
                  <input
                    id="calendar-year"
                    type="number"
                    min="1900"
                    max="2200"
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value) || getInitialYear())}
                    className="h-8 w-20 rounded border border-transparent bg-[var(--cal-surface)] px-2 text-center text-xs font-black text-[var(--cal-heading)] outline-none focus:border-[var(--cal-brand)]"
                  />
                  <button
                    type="button"
                    onClick={() => setYear((current) => current + 1)}
                    className="grid h-8 w-8 place-items-center rounded text-[var(--cal-muted)] transition hover:bg-[var(--cal-surface)] hover:text-[var(--cal-heading)]"
                    aria-label="Next year"
                    title="Next year"
                  >
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetToCurrentYear}
                  className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface)] text-[var(--cal-muted)] transition hover:border-[var(--cal-brand)] hover:text-[var(--cal-brand)]"
                  aria-label="Current year"
                  title="Current year"
                >
                  <RotateCcw size={15} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatPill label={`${markedCount} marked`} />
              <StatPill label={`🔥 Current ${streakStats.current}`} />
              <StatPill label={`🔥 Prev best ${streakStats.previousBest}`} />
            </div>
          </div>

          {monthNames.map((monthName, monthIndex) => (
            <MonthCalendar
              key={`${year}-${monthName}`}
              marks={marks}
              monthIndex={monthIndex}
              monthName={monthName}
              onClearStatus={clearDayStatus}
              onSelectDay={selectDay}
              onSetStatus={setDayStatus}
              activeMarkDate={activeMarkDate}
              todayKey={todayKey}
              year={year}
            />
          ))}
        </section>

        <aside className="min-w-0 xl:sticky xl:top-32 xl:self-start">
          <DayPlanner
            onUpdatePlan={updateSelectedPlan}
            plan={selectedPlan}
            selectedDate={selectedDate}
          />
        </aside>
      </div>
    </main>
  );
}

function StatPill({ label }) {
  return (
    <span className="rounded-full border border-[var(--cal-border)] bg-[var(--cal-surface-2)] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--cal-muted)]">
      {label}
    </span>
  );
}

function MonthCalendar({
  activeMarkDate,
  marks,
  monthIndex,
  monthName,
  onClearStatus,
  onSelectDay,
  onSetStatus,
  todayKey,
  year
}) {
  const cells = getMonthDays(year, monthIndex);
  const monthMarkCount = cells.filter((cell) => cell.type === "day" && marks[cell.dateKey]).length;

  return (
    <article className="overflow-visible rounded-lg border border-[var(--cal-border)] bg-[var(--cal-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--cal-border)] bg-[var(--cal-surface-2)] px-3 py-2">
        <div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--cal-brand)]">
            {String(monthIndex + 1).padStart(2, "0")}
          </div>
          <h2 className="mt-0.5 text-base font-black tracking-normal text-[var(--cal-heading)]">{monthName}</h2>
        </div>
        <span className="rounded-full border border-[var(--cal-border)] bg-[var(--cal-surface)] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--cal-muted)]">
          {monthMarkCount}
        </span>
      </header>

      <div className="p-2.5">
        <div className="grid grid-cols-7 gap-1">
          {weekdayNames.map((weekday) => (
            <div key={weekday} className="h-6 rounded bg-[var(--cal-surface-2)] text-center text-[9px] font-bold uppercase leading-6 tracking-[0.04em] text-[var(--cal-muted)]">
              {weekday.slice(0, 2)}
            </div>
          ))}

          {cells.map((cell) => {
            if (cell.type === "blank") {
              return <div key={cell.key} className="min-h-14 rounded-md border border-transparent" aria-hidden="true" />;
            }

            const mark = marks[cell.dateKey];
            const status = getStatus(mark?.status || mark?.color);
            const StatusIcon = status.icon;
            const isToday = cell.dateKey === todayKey;
            const isActive = cell.dateKey === activeMarkDate;
            const isMarked = Boolean(mark);

            return (
              <div
                key={cell.dateKey}
                data-calendar-mark-control
                data-date-key={cell.dateKey}
                className={`relative flex min-h-14 min-w-0 flex-col rounded-md border p-1.5 text-left transition ${
                  isActive
                    ? "border-[var(--cal-brand)] ring-2 ring-[var(--cal-brand)] ring-offset-1 ring-offset-[var(--cal-bg)]"
                    : "border-[var(--cal-border)]"
                } ${isMarked ? "text-white" : "bg-[var(--cal-surface)]"}`}
                style={isMarked ? { backgroundColor: status.bg, color: status.text, borderColor: status.bg } : undefined}
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(cell.dateKey)}
                  className="flex min-h-10 flex-1 flex-col text-left"
                  aria-label={`${monthName} ${cell.day}, ${year}${mark ? `: ${status.label}` : ""}`}
                >
                  <span className="flex items-start justify-between gap-1">
                    <span className={`grid h-6 w-6 place-items-center rounded text-xs font-black ${
                      isMarked
                        ? "bg-white/15 text-white"
                        : isToday
                          ? "bg-[var(--cal-heading)] text-[var(--cal-bg)]"
                          : "text-[var(--cal-heading)]"
                    }`}>
                      {cell.day}
                    </span>
                    {mark ? (
                      <span className="grid h-6 w-6 place-items-center rounded bg-white/15" aria-hidden="true">
                        <StatusIcon size={14} />
                      </span>
                    ) : null}
                  </span>
                </button>

                {isActive ? (
                  <div className="absolute left-1/2 top-[calc(100%+0.35rem)] z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-[var(--cal-border)] bg-[var(--cal-surface)] p-1 shadow-[0_16px_36px_rgba(15,23,42,0.18)]">
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => onSetStatus(cell.dateKey, option.id)}
                          className="grid h-8 w-8 place-items-center rounded-md text-white opacity-90 transition hover:opacity-100"
                          style={{ backgroundColor: option.bg }}
                          aria-label={option.label}
                          title={option.label}
                        >
                          <Icon size={14} aria-hidden="true" />
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => onClearStatus(cell.dateKey)}
                      className="grid h-8 w-8 place-items-center rounded-md bg-[var(--cal-surface-2)] text-[var(--cal-muted)] transition hover:bg-[var(--cal-surface-3)] hover:text-[var(--cal-heading)]"
                      aria-label="Remove mark"
                      title="Remove mark"
                    >
                      <Eraser size={14} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function DayPlanner({ onUpdatePlan, plan, selectedDate }) {
  const [activeTab, setActiveTab] = useState("targets");
  const selectedLabel = selectedDate ? formatSelectedDate(selectedDate) : "Select a day";
  const filledPriorities = plan.priorities.filter((item) => item.text.trim()).length;
  const donePriorities = plan.priorities.filter((item) => item.text.trim() && item.done).length;
  const filledBlocks = plan.blocks.filter((block) => block.title.trim()).length;

  function addPriority() {
    onUpdatePlan((current) => ({
      ...current,
      priorities: [...current.priorities, createPriority()]
    }));
  }

  function updatePriority(priorityId, patch) {
    onUpdatePlan((current) => {
      const priorities = current.priorities.map((priority) => (
        priority.id === priorityId ? { ...priority, ...patch } : priority
      ));
      return { ...current, priorities };
    });
  }

  function removePriority(priorityId) {
    onUpdatePlan((current) => ({
      ...current,
      priorities: current.priorities.filter((priority) => priority.id !== priorityId)
    }));
  }

  function addBlock() {
    onUpdatePlan((current) => ({
      ...current,
      blocks: [...current.blocks, createTimeBlock()]
    }));
  }

  function updateBlock(blockId, patch) {
    onUpdatePlan((current) => {
      const blocks = current.blocks.map((block) => {
        if (block.id !== blockId) return block;

        const nextBlock = { ...block, ...patch };
        if (getTimeValue(nextBlock.end) <= getTimeValue(nextBlock.start)) {
          nextBlock.end = getNextTimeOption(nextBlock.start);
        }

        return normalizeTimeBlock(nextBlock);
      });

      return { ...current, blocks: blocks.sort((a, b) => getTimeValue(a.start) - getTimeValue(b.start)) };
    });
  }

  function removeBlock(blockId) {
    onUpdatePlan((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== blockId)
    }));
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--cal-border)] bg-[var(--cal-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
      <header className="border-b border-[var(--cal-border)] bg-[var(--cal-surface-2)] px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cal-brand)]">
              Day Plan
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-normal text-[var(--cal-heading)]">{selectedLabel}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatPill label={`${donePriorities}/${filledPriorities} targets`} />
            <StatPill label={`${filledBlocks} blocks`} />
          </div>
        </div>
      </header>

      <div className="border-b border-[var(--cal-border)] bg-[var(--cal-surface)] px-4 pt-3">
        <div className="flex gap-1">
          <TabButton active={activeTab === "targets"} onClick={() => setActiveTab("targets")}>
            Targets
          </TabButton>
          <TabButton active={activeTab === "blocks"} onClick={() => setActiveTab("blocks")}>
            Time Plan
          </TabButton>
        </div>
      </div>

      {activeTab === "targets" ? (
        <div className="grid gap-4 p-4 lg:p-5">
          <section className="rounded-lg border border-[var(--cal-border)] bg-[var(--cal-surface-2)] p-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-sm font-black text-[var(--cal-heading)]">
                    <ListChecks size={15} aria-hidden="true" />
                    Targets
                  </div>
                  <button
                    type="button"
                    onClick={addPriority}
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface)] px-3 text-xs font-black text-[var(--cal-heading)] transition hover:border-[var(--cal-brand)] hover:text-[var(--cal-brand)]"
                  >
                    <Plus size={14} aria-hidden="true" />
                    Add
                  </button>
                </div>

                <div className="mt-3 grid gap-2">
                  {plan.priorities.length > 0 ? (
                    plan.priorities.map((priority, index) => (
                      <div key={priority.id} className="grid gap-2 rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface)] p-2 sm:grid-cols-[32px_minmax(0,1fr)_36px] sm:items-center">
                        <label className="grid h-8 w-8 place-items-center rounded-md bg-[var(--cal-surface-2)]">
                          <input
                            type="checkbox"
                            checked={priority.done}
                            onChange={(event) => updatePriority(priority.id, { done: event.target.checked })}
                            className="h-4 w-4 accent-[var(--cal-brand)]"
                            aria-label={`Target ${index + 1} complete`}
                          />
                        </label>
                        <label className="grid gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cal-muted)]">
                            Target {index + 1}
                          </span>
                          <input
                            type="text"
                            value={priority.text}
                            onChange={(event) => updatePriority(priority.id, { text: event.target.value })}
                            placeholder="Target"
                            className={`h-9 rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface-2)] px-3 text-sm font-semibold text-[var(--cal-heading)] outline-none transition placeholder:text-[var(--cal-muted)] focus:border-[var(--cal-brand)] ${
                              priority.done ? "line-through opacity-70" : ""
                            }`}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removePriority(priority.id)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface-2)] text-[var(--cal-muted)] transition hover:border-[var(--site-danger)] hover:text-[var(--site-danger)]"
                          aria-label={`Remove target ${index + 1}`}
                          title="Remove"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-[var(--cal-border)] bg-[var(--cal-surface)] p-4 text-center text-sm font-medium text-[var(--cal-muted)]">
                      No targets yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--cal-border)] bg-[var(--cal-surface-2)] p-4">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cal-muted)]">Additional notes</span>
              <textarea
                value={plan.notes}
                onChange={(event) => onUpdatePlan((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Loose thoughts, reminders, links, or prep notes."
                rows={8}
                className="resize-y rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface)] px-3 py-2 text-sm leading-6 text-[var(--cal-heading)] outline-none transition placeholder:text-[var(--cal-muted)] focus:border-[var(--cal-brand)]"
              />
            </label>
          </section>
        </div>
      ) : (
        <div className="grid gap-4 p-4 lg:p-5">
          <section className="rounded-lg border border-[var(--cal-border)] bg-[var(--cal-surface-2)]">
            <div className="flex flex-col gap-3 border-b border-[var(--cal-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-black text-[var(--cal-heading)]">
                  <Clock3 size={16} aria-hidden="true" />
                  Time Plan
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--cal-muted)]">
                  Create only the blocks you need by choosing start and end times.
                </p>
              </div>
              <button
                type="button"
                onClick={addBlock}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--cal-brand)] px-3 text-sm font-black text-white transition hover:brightness-95"
              >
                <Plus size={15} aria-hidden="true" />
                Add block
              </button>
            </div>

            <div className="grid gap-3 p-3">
              {plan.blocks.length > 0 ? (
                plan.blocks.map((block) => (
                  <TimeBlockRow
                    key={block.id}
                    block={block}
                    onRemove={() => removeBlock(block.id)}
                    onUpdate={(patch) => updateBlock(block.id, patch)}
                  />
                ))
              ) : (
                <div className="rounded-md border border-dashed border-[var(--cal-border)] bg-[var(--cal-surface)] p-6 text-center text-sm font-medium text-[var(--cal-muted)]">
                  No blocks yet.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-t-md px-4 py-2 text-sm font-black transition ${
        active
          ? "bg-[var(--cal-surface-2)] text-[var(--cal-heading)]"
          : "text-[var(--cal-muted)] hover:bg-[var(--cal-surface-2)] hover:text-[var(--cal-heading)]"
      }`}
    >
      {children}
    </button>
  );
}

function TimeBlockRow({ block, onRemove, onUpdate }) {
  const endOptions = getEndTimeOptions(block.start);

  return (
    <div className="grid gap-2 rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface)] p-3 xl:grid-cols-[116px_116px_minmax(0,1fr)_40px] xl:items-center">
      <label className="grid gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cal-muted)]">Start</span>
        <select
          value={block.start}
          onChange={(event) => onUpdate({ start: event.target.value })}
          className="h-9 rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface-2)] px-2 text-xs font-black text-[var(--cal-heading)] outline-none transition focus:border-[var(--cal-brand)]"
        >
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {formatTimeSlot(slot)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cal-muted)]">End</span>
        <select
          value={block.end}
          onChange={(event) => onUpdate({ end: event.target.value })}
          className="h-9 rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface-2)] px-2 text-xs font-black text-[var(--cal-heading)] outline-none transition focus:border-[var(--cal-brand)]"
        >
          {endOptions.map((slot) => (
            <option key={slot} value={slot}>
              {formatTimeSlot(slot)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cal-muted)]">
          Block ({getBlockDurationLabel(block)})
        </span>
        <input
          type="text"
          value={block.title}
          onChange={(event) => onUpdate({ title: event.target.value })}
          placeholder="Deep work, interview prep, gym..."
          className="h-9 min-w-0 rounded-md border border-transparent bg-[var(--cal-surface-2)] px-3 text-sm font-medium text-[var(--cal-heading)] outline-none transition placeholder:text-[var(--cal-muted)] focus:border-[var(--cal-brand)] focus:bg-[var(--cal-surface)]"
        />
      </label>

      <button
        type="button"
        onClick={onRemove}
        className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cal-border)] bg-[var(--cal-surface-2)] text-[var(--cal-muted)] transition hover:border-[var(--site-danger)] hover:text-[var(--site-danger)]"
        aria-label="Remove time block"
        title="Remove"
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
