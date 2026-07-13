"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileText, Save } from "lucide-react";

export function HldMarkdownAdminEditor({
  initialProblem,
  initialMarkdown = "",
  sourcePath = "index.md",
  saveUrl,
  backHref,
  backLabel = "Page",
  headerLabel = "Admin Markdown",
  savedMessage = "Saved to index.md"
}) {
  const router = useRouter();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [lastSavedMarkdown, setLastSavedMarkdown] = useState(initialMarkdown);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const dirty = markdown !== lastSavedMarkdown;

  async function saveMarkdown() {
    if (!markdown.trim()) {
      window.alert("Markdown content cannot be empty.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(saveUrl || `/api/hld/problems/${initialProblem.id}/markdown`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);

      setLastSavedMarkdown(markdown);
      setStatus(savedMessage);
      router.refresh();
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  function handleEditorKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!saving) saveMarkdown();
    }
  }

  return (
    <div className="min-h-screen bg-[var(--site-bg)] text-[var(--site-text)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
                <FileText size={14} aria-hidden="true" />
                {headerLabel}
              </div>
              <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-normal text-[var(--site-heading)]">
                {initialProblem.title}
              </h1>
              <p className="mt-1 break-all font-mono text-xs text-[var(--site-muted)]">{sourcePath}</p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={backHref || `/hld/${initialProblem.id}`}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] px-3 text-sm font-semibold text-[var(--site-heading)] transition hover:border-[var(--site-brand)] hover:bg-[var(--site-surface-2)]"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                {backLabel}
              </Link>
              <button
                type="button"
                onClick={saveMarkdown}
                disabled={saving || !dirty}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--site-brand)] px-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={15} aria-hidden="true" />
                {saving ? "Saving" : "Save"}
              </button>
            </div>
          </div>

          {status ? (
            <div
              className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                status.startsWith("Save failed")
                  ? "border-[var(--site-danger)] bg-red-50 text-[var(--site-danger)]"
                  : "border-[var(--site-border)] bg-[var(--site-surface-2)] text-[var(--site-heading)]"
              }`}
            >
              {status}
            </div>
          ) : null}
        </header>

        <section className="overflow-hidden rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-4 py-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--site-brand)]">
              index.md
            </span>
            <span className="text-xs font-semibold text-[var(--site-muted)]">
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
          </div>
          <textarea
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            onKeyDown={handleEditorKeyDown}
            spellCheck={false}
            className="block min-h-[calc(100vh-260px)] w-full resize-y border-0 bg-[var(--site-code-bg)] p-4 font-mono text-sm leading-6 text-[var(--site-heading)] outline-none"
          />
        </section>
      </main>
    </div>
  );
}
