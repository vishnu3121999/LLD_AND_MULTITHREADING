"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FilePenLine, Plus, Save, Trash2 } from "lucide-react";
import {
  emptyStory,
  formatStoryAnswer,
  loadBehavioralStories,
  saveBehavioralStories
} from "./behavioral-storage";

export function BehavioralStoryBuilder() {
  const [stories, setStories] = useState([]);
  const [draft, setDraft] = useState(() => emptyStory());
  const [selectedId, setSelectedId] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("info");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadBehavioralStories()
      .then((loaded) => {
        if (cancelled) return;
        setStories(loaded);
        setReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setReady(true);
        setMessageKind("error");
        setMessage(error.message || "Unable to load stories.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedStory = useMemo(() => stories.find((story) => story.id === selectedId), [selectedId, stories]);

  function startNewStory() {
    setSelectedId("");
    setDraft(emptyStory());
    setMessage("");
    setMessageKind("info");
  }

  function selectStory(story) {
    setSelectedId(story.id);
    setDraft(story);
    setMessage("");
    setMessageKind("info");
  }

  async function saveStory() {
    const title = draft.title.trim();
    if (!title) {
      setMessageKind("error");
      setMessage("Title is required.");
      return;
    }

    const now = new Date().toISOString();
    const story = {
      ...draft,
      id: draft.id || createId(),
      title,
      updatedAt: now
    };
    const nextStories = stories.some((item) => item.id === story.id)
      ? stories.map((item) => item.id === story.id ? story : item)
      : [story, ...stories];

    setSaving(true);
    setMessage("");
    setMessageKind("info");

    try {
      const savedStories = await saveBehavioralStories(nextStories);
      const savedStory = savedStories.find((item) => item.id === story.id) || story;
      setStories(savedStories);
      setDraft(savedStory);
      setSelectedId(savedStory.id);
      setMessageKind("success");
      setMessage("Saved.");
    } catch (error) {
      setMessageKind("error");
      setMessage(error.message || "Unable to save story.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStory() {
    if (!selectedId) return;
    const nextStories = stories.filter((story) => story.id !== selectedId);
    setSaving(true);
    setMessage("");
    setMessageKind("info");

    try {
      const savedStories = await saveBehavioralStories(nextStories);
      setStories(savedStories);
      setSelectedId("");
      setDraft(emptyStory());
      setMessageKind("success");
      setMessage("Deleted.");
    } catch (error) {
      setMessageKind("error");
      setMessage(error.message || "Unable to delete story.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="min-w-0 space-y-4 text-[var(--site-text)]">
      <header className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
        <div className="p-5 sm:p-6">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
            Behavioral Interviews
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--site-heading)]">
            Story Builder
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--site-muted)]">
            Create STAR stories once, then reuse them as answers across behavioral interview questions.
          </p>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <aside className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-4 py-3">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
                Stories
              </div>
              <div className="mt-1 text-sm font-semibold text-[var(--site-heading)]">
                {stories.length} saved
              </div>
            </div>
            <button
              type="button"
              onClick={startNewStory}
              className="grid h-9 w-9 place-items-center rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-muted)] transition hover:border-[var(--site-brand)] hover:text-[var(--site-brand)]"
              aria-label="Create new story"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="grid max-h-[56vh] gap-2 overflow-y-auto p-3">
            {!ready && <p className="px-2 py-3 text-sm text-[var(--site-muted)]">Loading stories...</p>}
            {ready && stories.length === 0 && (
              <p className="rounded-md border border-dashed border-[var(--site-border)] bg-[var(--site-surface-2)] p-4 text-sm leading-6 text-[var(--site-muted)]">
                No stories yet. Start with one strong project, conflict, failure, or leadership example.
              </p>
            )}
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => selectStory(story)}
                className={`rounded-md border p-3 text-left transition ${
                  selectedId === story.id
                    ? "border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]"
                    : "border-transparent bg-[var(--site-surface-2)] hover:border-[var(--site-border)] hover:bg-[var(--site-surface)]"
                }`}
              >
                <div className="flex items-start gap-2">
                  <FilePenLine size={15} className="mt-0.5 shrink-0 text-[var(--site-brand)]" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--site-heading)]">{story.title}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--site-muted)]">
                      {story.action || story.result || story.situation || "No STAR details added yet."}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
          <div className="border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
                  STAR Format
                </div>
                <h2 className="mt-1 text-xl font-semibold tracking-normal text-[var(--site-heading)]">
                  {selectedStory ? "Edit story" : "Create story"}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveStory}
                  disabled={!ready || saving}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--site-brand)] bg-[var(--site-brand)] px-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={15} aria-hidden="true" />
                  {saving ? "Saving" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={deleteStory}
                  disabled={!selectedId || saving}
                  className="grid h-9 w-9 place-items-center rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-muted)] transition hover:border-[var(--site-danger)] hover:text-[var(--site-danger)] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Delete selected story"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
            {message && (
              <div className={`mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium ${
                messageKind === "error"
                  ? "border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-danger)]"
                  : "border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-muted)]"
              }`}>
                <Check size={13} className={messageKind === "error" ? "text-[var(--site-danger)]" : "text-[var(--site-good)]"} aria-hidden="true" />
                {message}
              </div>
            )}
          </div>

          <div className="grid gap-4 p-5 sm:p-6">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--site-heading)]">Title</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="h-10 rounded-md border border-[var(--site-border)] bg-[var(--site-surface-2)] px-3 text-sm text-[var(--site-heading)] outline-none transition focus:border-[var(--site-brand)]"
                placeholder="Ex: Reduced feed latency under launch pressure"
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <StarField label="Situation" value={draft.situation} onChange={(value) => setDraft((current) => ({ ...current, situation: value }))} />
              <StarField label="Task" value={draft.task} onChange={(value) => setDraft((current) => ({ ...current, task: value }))} />
              <StarField label="Action" value={draft.action} onChange={(value) => setDraft((current) => ({ ...current, action: value }))} />
              <StarField label="Result" value={draft.result} onChange={(value) => setDraft((current) => ({ ...current, result: value }))} />
            </div>

            <div className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface-2)] p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
                Answer Preview
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] p-4 text-sm leading-6 text-[var(--site-text)]">
                {formatStoryAnswer(draft) || "Fill the STAR fields to generate a reusable answer."}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}

function StarField({ label, value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--site-heading)]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-36 resize-y rounded-md border border-[var(--site-border)] bg-[var(--site-surface-2)] px-3 py-2 text-sm leading-6 text-[var(--site-heading)] outline-none transition focus:border-[var(--site-brand)]"
        placeholder={`${label}...`}
      />
    </label>
  );
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `story-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
