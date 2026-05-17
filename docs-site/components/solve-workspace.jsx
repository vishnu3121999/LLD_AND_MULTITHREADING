"use client";

import { useMemo, useState } from "react";
import { Plus, WandSparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

const defaults = {
  problem: "Design a Library Management System",
  systemType: "Online API-based system",
  actors: "Member\nLibrarian\nSystem",
  actions: "Search books\nBorrow book\nReturn book\nReserve book\nAdd inventory",
  entities: "Book\nBookCopy\nMember\nLoan\nReservation\nFine",
  varyingTypes: "Payment mode\nNotification channel\nSearch strategy",
  writeApis: "borrowBook(memberId, copyId)\nreturnBook(loanId)\nreserveBook(memberId, bookId)"
};

export function SolveWorkspace() {
  const [form, setForm] = useState(defaults);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const solution = useMemo(() => buildSolution(form), [form]);

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">Guided Solver</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Fill the template inputs and generate a structured answer.</p>
          </div>
          <Button type="button" variant="subtle" size="sm" onClick={() => setForm(defaults)}>
            <Plus size={16} aria-hidden="true" />
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <Field label="Problem statement">
            <Input value={form.problem} onChange={(event) => update("problem", event.target.value)} />
          </Field>

          <Field label="System type">
            <div className="grid grid-cols-1 gap-2">
              {["Offline local app", "Online API-based system", "Not sure"].map((item) => (
                <label key={item} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <input type="radio" checked={form.systemType === item} onChange={() => update("systemType", item)} />
                  {item}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Actors">
            <Textarea value={form.actors} onChange={(event) => update("actors", event.target.value)} />
          </Field>
          <Field label="Actions / use cases">
            <Textarea value={form.actions} onChange={(event) => update("actions", event.target.value)} />
          </Field>
          <Field label="Core entities">
            <Textarea value={form.entities} onChange={(event) => update("entities", event.target.value)} />
          </Field>
          <Field label="Varying behavior or types">
            <Textarea value={form.varyingTypes} onChange={(event) => update("varyingTypes", event.target.value)} />
          </Field>
          <Field label="Write APIs with concurrency risk">
            <Textarea value={form.writeApis} onChange={(event) => update("writeApis", event.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">Generated LLD Draft</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Use this as a first interview answer, then refine details.</p>
          </div>
          <Badge variant="teal">Template output</Badge>
        </div>

        <div className="space-y-6 p-5">
          <DraftSection title="1. Problem Statement" body={solution.problem} />
          <DraftSection title="2. Requirement Clarification" body={solution.requirements} />
          <DraftList title="3. Actors and Use Cases" items={solution.actors} />
          <DraftList title="4. Core Entities" items={solution.entities} />
          <DraftList title="5. Service / Facade APIs" items={solution.services} mono />
          <DraftList title="6. Extensibility Points" items={solution.patterns} />
          <DraftList title="7. Concurrency Checklist" items={solution.concurrency} />
          <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-100">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <WandSparkles size={16} aria-hidden="true" />
              Interview Summary
            </div>
            <p className="text-sm leading-6 text-slate-200">{solution.summary}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function DraftSection({ title, body }) {
  return (
    <section>
      <h3 className="text-base font-semibold tracking-normal text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
    </section>
  );
}

function DraftList({ title, items, mono = false }) {
  return (
    <section>
      <h3 className="text-base font-semibold tracking-normal text-slate-950">{title}</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className={`rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 ${mono ? "font-mono" : ""}`}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function lines(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function buildSolution(form) {
  const actors = lines(form.actors);
  const actions = lines(form.actions);
  const entities = lines(form.entities);
  const varying = lines(form.varyingTypes);
  const writeApis = lines(form.writeApis);

  return {
    problem: form.problem,
    requirements: `${form.systemType}. Clarify whether persistence, authentication, payment, notifications, history, and concurrent users are in scope.`,
    actors: actors.flatMap((actor) => actions.slice(0, 3).map((action) => `${actor}: ${action}`)).slice(0, 8),
    entities: entities.map((entity) => `${entity}: identity, lifecycle, relationships, and invariants`),
    services: actions.map((action) => `${camel(action)}(...)`),
    patterns: varying.map((item) => `${item}: extract Strategy or Factory if behavior/object creation varies`),
    concurrency: writeApis.map((api) => `${api}: identify modified entities, lock check-and-update section, re-check inside lock`),
    summary: `I will model ${entities.slice(0, 5).join(", ")} and expose use-case methods through a service layer. The main extensibility points are ${varying.slice(0, 3).join(", ") || "not yet identified"}. For concurrency, I will protect ${writeApis[0] || "write APIs"} with a small critical section or database transaction.`
  };
}

function camel(value) {
  const cleaned = value.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 0) return "method";
  return parts[0].toLowerCase() + parts.slice(1).map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase()).join("");
}
