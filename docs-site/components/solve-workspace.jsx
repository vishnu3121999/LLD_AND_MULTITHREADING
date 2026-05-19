"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Columns3,
  FileText,
  LayoutDashboard,
  ListChecks,
  Map,
  Network,
  PanelsTopLeft,
  RotateCcw,
  Sparkles,
  SplitSquareHorizontal
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { cn } from "../lib/utils";

const STORAGE_KEY = "lld-playbook-solve-session-v1";

const systemTypes = ["Offline local app", "Online API-based system", "Mixed / distributed", "Not sure yet"];

const defaults = {
  problemStatement: "Design a Library Management System",
  activeSection: "requirements",
  requirements: {
    systemType: "Online API-based system",
    functional: "Search books\nBorrow book\nReturn book\nReserve book\nAdd inventory",
    clarifications: "Should we track multiple copies per book?\nDo reservations expire?\nIs fine calculation in scope?",
    assumptions: "Members are authenticated\nEach physical copy can be borrowed by one member at a time\nInventory updates are done by librarians",
    outOfScope: "Recommendation engine\nFull payment gateway integration"
  },
  useCases: {
    actors: "Member\nLibrarian\nSystem",
    userActions: "Search books\nBorrow available copy\nReturn borrowed copy\nReserve unavailable book",
    adminActions: "Add book\nAdd copy\nMark copy lost\nConfigure fine rules",
    systemActions: "Calculate due date\nApply fine\nExpire reservation\nSend notification"
  },
  entities: {
    core: "Book: catalog identity, title, author, category\nBookCopy: physical copy, barcode, status\nMember: borrower profile, active loans\nLoan: borrow lifecycle, due date, return date\nReservation: waiting request for a book\nFine: penalty for late return",
    relationships: "Book 1 -> many BookCopy\nMember 1 -> many Loan\nLoan many -> 1 BookCopy\nBook 1 -> many Reservation\nMember 1 -> many Reservation",
    invariants: "A BookCopy cannot have two active loans\nA Member cannot borrow beyond the active loan limit\nA Reservation must reference a Book, not a BookCopy"
  },
  services: {
    apis: "borrowBook(memberId, bookId)\nreturnBook(loanId)\nreserveBook(memberId, bookId)\naddBookCopy(bookId, copyDetails)",
    validations: "Member exists and is active\nBook copy is available\nLoan limit is not exceeded\nReservation is still valid",
    concurrency: "Two members may borrow the same last available copy\nReturn and borrow may update the same copy status\nReservation expiry may race with borrow flow",
    extensibility: "FineCalculationStrategy\nNotificationChannel\nSearchStrategy"
  }
};

const templateSections = [
  {
    id: "requirements",
    number: "01",
    title: "Requirements",
    shortTitle: "Requirements",
    icon: ClipboardList,
    intent: "Lock scope before designing classes.",
    templateNotes: [
      "Clarify offline vs online early.",
      "Separate functional requirements from assumptions.",
      "Call out what is intentionally out of scope."
    ],
    fields: [
      { key: "functional", label: "Functional requirements", placeholder: "One requirement per line" },
      { key: "clarifications", label: "Clarifying questions", placeholder: "Questions to ask interviewer" },
      { key: "assumptions", label: "Assumptions", placeholder: "Assumptions you will proceed with" },
      { key: "outOfScope", label: "Out of scope", placeholder: "Things you are explicitly not solving" }
    ]
  },
  {
    id: "useCases",
    number: "02",
    title: "Actors and Use Cases",
    shortTitle: "Use Cases",
    icon: Network,
    intent: "Convert vague behavior into actor-owned actions.",
    templateNotes: [
      "Identify who performs each action.",
      "Group user, admin, and system actions separately.",
      "Use this to derive facade methods later."
    ],
    fields: [
      { key: "actors", label: "Actors", placeholder: "Member\nAdmin\nSystem" },
      { key: "userActions", label: "User actions", placeholder: "Actions performed by users" },
      { key: "adminActions", label: "Admin actions", placeholder: "Actions performed by admins" },
      { key: "systemActions", label: "System actions", placeholder: "Automatic system behavior" }
    ]
  },
  {
    id: "entities",
    number: "04",
    title: "Core Entities",
    shortTitle: "Entities",
    icon: PanelsTopLeft,
    intent: "Model objects, relationships, and invariants.",
    templateNotes: [
      "Separate catalog/physical/user/transaction entities.",
      "Give entities behavior, not only setters.",
      "Write relationships explicitly before APIs."
    ],
    fields: [
      { key: "core", label: "Core entities", placeholder: "Entity: responsibility, fields, lifecycle" },
      { key: "relationships", label: "Relationships", placeholder: "A 1 -> many B" },
      { key: "invariants", label: "Invariants", placeholder: "Rules that must always be true" }
    ]
  },
  {
    id: "services",
    number: "07/12",
    title: "Service APIs and Concurrency",
    shortTitle: "Services",
    icon: ListChecks,
    intent: "Expose use-case APIs and protect check-then-update flows.",
    templateNotes: [
      "Facade methods should map to use cases.",
      "List validations before mutation.",
      "Concurrency risk usually appears in write APIs."
    ],
    fields: [
      { key: "apis", label: "Facade APIs", placeholder: "methodName(input...)" },
      { key: "validations", label: "Validations", placeholder: "Input/state checks before mutation" },
      { key: "concurrency", label: "Concurrency risks", placeholder: "Race conditions and critical sections" },
      { key: "extensibility", label: "Extensibility points", placeholder: "Strategies, factories, observers" }
    ]
  }
];

const modeCards = [
  {
    id: "workbench",
    icon: LayoutDashboard,
    title: "Workbench",
    text: "Template map, active editor, and live answer preview. Best default for real practice."
  },
  {
    id: "split",
    icon: SplitSquareHorizontal,
    title: "Split Screen",
    text: "Reference guidance beside the fillable fields, with the answer visible on the right."
  },
  {
    id: "wizard",
    icon: Map,
    title: "Wizard",
    text: "One template section at a time. Useful when learning the flow."
  }
];

export function SolveWorkspace() {
  const [session, setSession] = useState(defaults);
  const [mode, setMode] = useState("workbench");
  const [wizardIndex, setWizardIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSession(mergeDefaults(JSON.parse(saved)));
      }
    } catch {
      setSession(defaults);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [isLoaded, session]);

  const activeSection = templateSections.find((section) => section.id === session.activeSection) || templateSections[0];
  const wizardSection = templateSections[wizardIndex] || templateSections[0];
  const completion = useMemo(() => getCompletion(session), [session]);
  const solution = useMemo(() => buildSolution(session), [session]);

  function updateSession(updater) {
    setSession((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return next;
    });
  }

  function updateTopLevel(key, value) {
    updateSession((current) => ({ ...current, [key]: value }));
  }

  function updateSection(sectionId, key, value) {
    updateSession((current) => ({
      ...current,
      [sectionId]: {
        ...current[sectionId],
        [key]: value
      }
    }));
  }

  function selectSection(sectionId) {
    updateTopLevel("activeSection", sectionId);
  }

  function reset() {
    updateSession(defaults);
    setWizardIndex(0);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="problem-statement">
              Problem statement
            </label>
            <Input
              id="problem-statement"
              value={session.problemStatement}
              onChange={(event) => updateTopLevel("problemStatement", event.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="teal">{completion.completed}/{completion.total} sections ready</Badge>
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <RotateCcw size={15} aria-hidden="true" />
              Reset demo
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {modeCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setMode(card.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition",
                  mode === card.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon size={17} aria-hidden="true" />
                  {card.title}
                </div>
                <p className={cn("mt-2 text-sm leading-6", mode === card.id ? "text-slate-300" : "text-slate-600")}>{card.text}</p>
              </button>
            );
          })}
        </div>
      </section>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="w-full justify-start overflow-x-auto bg-slate-100">
          <TabsTrigger value="workbench" className="gap-2">
            <LayoutDashboard size={15} aria-hidden="true" />
            Workbench
          </TabsTrigger>
          <TabsTrigger value="split" className="gap-2">
            <Columns3 size={15} aria-hidden="true" />
            Split Screen
          </TabsTrigger>
          <TabsTrigger value="wizard" className="gap-2">
            <Map size={15} aria-hidden="true" />
            Wizard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workbench">
          <WorkbenchMode
            session={session}
            activeSection={activeSection}
            completion={completion}
            solution={solution}
            onSelectSection={selectSection}
            onUpdateSection={updateSection}
          />
        </TabsContent>

        <TabsContent value="split">
          <SplitScreenMode session={session} solution={solution} onUpdateSection={updateSection} />
        </TabsContent>

        <TabsContent value="wizard">
          <WizardMode
            session={session}
            section={wizardSection}
            sectionIndex={wizardIndex}
            completion={completion}
            solution={solution}
            onUpdateSection={updateSection}
            onStepChange={setWizardIndex}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkbenchMode({ session, activeSection, completion, solution, onSelectSection, onUpdateSection }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_380px]">
      <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft xl:sticky xl:top-24 xl:self-start">
        <div className="px-2 pb-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Template Map</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">Pick a section, fill it, and watch the answer grow.</p>
        </div>
        <div className="grid gap-2">
          {templateSections.map((section) => (
            <SectionNavButton
              key={section.id}
              section={section}
              active={activeSection.id === section.id}
              status={completion.bySection[section.id]}
              onClick={() => onSelectSection(section.id)}
            />
          ))}
        </div>
      </aside>

      <SectionEditor section={activeSection} values={session[activeSection.id]} onChange={(key, value) => onUpdateSection(activeSection.id, key, value)} />

      <LivePreview solution={solution} activeSectionId={activeSection.id} compact />
    </div>
  );
}

function SplitScreenMode({ session, solution, onUpdateSection }) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-4 lg:grid-cols-2">
        {templateSections.map((section) => (
          <section key={section.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <TemplateGuidance section={section} dense />
            <div className="space-y-4 p-4">
              <SectionFields section={section} values={session[section.id]} onChange={(key, value) => onUpdateSection(section.id, key, value)} dense />
            </div>
          </section>
        ))}
      </div>
      <LivePreview solution={solution} activeSectionId="all" />
    </div>
  );
}

function WizardMode({ session, section, sectionIndex, completion, solution, onUpdateSection, onStepChange }) {
  const canGoBack = sectionIndex > 0;
  const canGoNext = sectionIndex < templateSections.length - 1;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Step {sectionIndex + 1} of {templateSections.length}
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">{section.title}</h2>
            </div>
            <StatusBadge status={completion.bySection[section.id]} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {templateSections.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onStepChange(index)}
                className={cn(
                  "h-2 rounded-full transition",
                  index === sectionIndex ? "bg-slate-950" : completion.bySection[item.id] === "complete" ? "bg-emerald-500" : "bg-slate-200"
                )}
                aria-label={`Open ${item.title}`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <TemplateGuidance section={section} cardless />
          <SectionFields section={section} values={session[section.id]} onChange={(key, value) => onUpdateSection(section.id, key, value)} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4">
          <Button type="button" variant="outline" onClick={() => onStepChange(sectionIndex - 1)} disabled={!canGoBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </Button>
          <Button type="button" onClick={() => onStepChange(sectionIndex + 1)} disabled={!canGoNext}>
            Next section
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </section>

      <LivePreview solution={solution} activeSectionId={section.id} compact />
    </div>
  );
}

function SectionEditor({ section, values, onChange }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <TemplateGuidance section={section} />
      <div className="space-y-5 p-5">
        <SectionFields section={section} values={values} onChange={onChange} />
      </div>
    </section>
  );
}

function TemplateGuidance({ section, dense = false, cardless = false }) {
  const Icon = section.icon;

  return (
    <div className={cn(!cardless && "border-b border-slate-200 bg-slate-50", dense ? "p-4" : "p-5")}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-slate-950 text-white">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Template Section {section.number}</div>
          <h2 className={cn("mt-1 font-semibold tracking-normal text-slate-950", dense ? "text-lg" : "text-2xl")}>{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{section.intent}</p>
        </div>
      </div>
      <div className={cn("mt-4 grid gap-2", dense ? "text-xs" : "text-sm")}>
        {section.templateNotes.map((note) => (
          <div key={note} className="flex gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700">
            <Sparkles size={14} className="mt-0.5 flex-none text-teal-600" aria-hidden="true" />
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionFields({ section, values, onChange, dense = false }) {
  return (
    <div className="space-y-4">
      {section.id === "requirements" && (
        <FieldBlock label="System type">
          <div className="grid gap-2 sm:grid-cols-2">
            {systemTypes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onChange("systemType", item)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm transition",
                  values.systemType === item ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </FieldBlock>
      )}

      {section.fields.map((field) => (
        <FieldBlock key={field.key} label={field.label}>
          <Textarea
            value={values[field.key] || ""}
            onChange={(event) => onChange(field.key, event.target.value)}
            placeholder={field.placeholder}
            className={cn(dense ? "min-h-24" : "min-h-32")}
          />
        </FieldBlock>
      ))}
    </div>
  );
}

function FieldBlock({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SectionNavButton({ section, active, status, onClick }) {
  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left transition",
        active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
      )}
    >
      <span className={cn("grid h-8 w-8 flex-none place-items-center rounded-md", active ? "bg-white/10 text-white" : "bg-white text-slate-700")}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{section.number}</span>
        <span className="mt-0.5 block text-sm font-semibold">{section.shortTitle}</span>
        <span className={cn("mt-2 block text-xs", active ? "text-slate-300" : "text-slate-500")}>
          <StatusText status={status} />
        </span>
      </span>
      <StatusIcon status={status} active={active} />
    </button>
  );
}

function LivePreview({ solution, activeSectionId, compact = false }) {
  const sections = activeSectionId === "all" ? solution.sections : solution.sections.filter((section) => section.id === activeSectionId || !compact);
  const visibleSections = compact ? solution.sections.filter((section) => section.id === activeSectionId) : sections;

  return (
    <aside className="rounded-lg border border-slate-200 bg-white shadow-soft xl:sticky xl:top-24 xl:self-start">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Live Output</div>
            <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">Interview Draft</h2>
          </div>
          <Badge variant="blue">Preview</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{solution.summary}</p>
      </div>

      <div className={cn("space-y-5 overflow-auto p-5", compact ? "max-h-[720px]" : "max-h-[calc(100vh-220px)]")}>
        {(visibleSections.length ? visibleSections : solution.sections).map((section) => (
          <PreviewSection key={section.id} title={section.title} items={section.items} body={section.body} />
        ))}
      </div>
    </aside>
  );
}

function PreviewSection({ title, body, items }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <FileText size={15} aria-hidden="true" />
        {title}
      </h3>
      {body && <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>}
      {items?.length > 0 && (
        <div className="mt-3 grid gap-2">
          {items.map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
              {item}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }) {
  if (status === "complete") return <Badge variant="teal">Complete</Badge>;
  if (status === "partial") return <Badge variant="amber">Partial</Badge>;
  return <Badge>Empty</Badge>;
}

function StatusIcon({ status, active }) {
  if (status === "complete") return <CheckCircle2 size={17} className={active ? "text-emerald-300" : "text-emerald-600"} aria-hidden="true" />;
  if (status === "partial") return <Circle size={17} className={active ? "text-amber-300" : "text-amber-600"} aria-hidden="true" />;
  return <Circle size={17} className={active ? "text-slate-500" : "text-slate-300"} aria-hidden="true" />;
}

function StatusText({ status }) {
  if (status === "complete") return "Ready for draft";
  if (status === "partial") return "Partially filled";
  return "Empty";
}

function getCompletion(session) {
  const bySection = {};
  let completed = 0;

  for (const section of templateSections) {
    const values = session[section.id] || {};
    const keys = section.id === "requirements" ? ["systemType", ...section.fields.map((field) => field.key)] : section.fields.map((field) => field.key);
    const filled = keys.filter((key) => String(values[key] || "").trim()).length;
    const status = filled === 0 ? "empty" : filled >= Math.ceil(keys.length * 0.7) ? "complete" : "partial";
    bySection[section.id] = status;
    if (status === "complete") completed += 1;
  }

  return {
    bySection,
    completed,
    total: templateSections.length
  };
}

function buildSolution(session) {
  const requirements = session.requirements;
  const useCases = session.useCases;
  const entities = session.entities;
  const services = session.services;

  const actors = lines(useCases.actors);
  const userActions = lines(useCases.userActions);
  const adminActions = lines(useCases.adminActions);
  const systemActions = lines(useCases.systemActions);
  const entityRows = lines(entities.core);
  const apiRows = lines(services.apis);

  return {
    summary: `For ${session.problemStatement}, start with ${requirements.systemType.toLowerCase()}, model ${entityRows.slice(0, 3).map((row) => row.split(":")[0]).join(", ") || "the core entities"}, and expose ${apiRows[0] || "use-case APIs"} through a facade.`,
    sections: [
      {
        id: "requirements",
        title: "1. Requirements",
        body: `${requirements.systemType}. Clarify scope first, then proceed with explicit assumptions.`,
        items: [
          ...prefix(lines(requirements.functional), "FR"),
          ...prefix(lines(requirements.clarifications), "Question"),
          ...prefix(lines(requirements.assumptions), "Assumption"),
          ...prefix(lines(requirements.outOfScope), "Out of scope")
        ]
      },
      {
        id: "useCases",
        title: "2. Actors and Use Cases",
        items: [
          ...actors.map((actor) => `Actor: ${actor}`),
          ...prefix(userActions, "User"),
          ...prefix(adminActions, "Admin"),
          ...prefix(systemActions, "System")
        ]
      },
      {
        id: "entities",
        title: "3. Core Entities",
        items: [
          ...entityRows,
          ...prefix(lines(entities.relationships), "Relation"),
          ...prefix(lines(entities.invariants), "Invariant")
        ]
      },
      {
        id: "services",
        title: "4. Service APIs and Concurrency",
        items: [
          ...prefix(apiRows, "API"),
          ...prefix(lines(services.validations), "Validate"),
          ...prefix(lines(services.concurrency), "Race"),
          ...prefix(lines(services.extensibility), "Extensibility")
        ]
      }
    ]
  };
}

function lines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function prefix(items, label) {
  return items.map((item) => `${label}: ${item}`);
}

function mergeDefaults(value) {
  return {
    ...defaults,
    ...value,
    requirements: { ...defaults.requirements, ...(value?.requirements || {}) },
    useCases: { ...defaults.useCases, ...(value?.useCases || {}) },
    entities: { ...defaults.entities, ...(value?.entities || {}) },
    services: { ...defaults.services, ...(value?.services || {}) }
  };
}
