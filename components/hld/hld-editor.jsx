"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { HldProblemRenderer } from "./hld-renderer";

export function HldEditor({ initialProblem = null }) {
  const router = useRouter();
  const isEditing = Boolean(initialProblem?.id);
  const [draft, setDraft] = useState(() => ({
    title: initialProblem?.title || "",
    summary: initialProblem?.summary || "",
    tagsText: (initialProblem?.tags || []).join(", "),
    sections: cloneSections(initialProblem?.sections || [])
  }));
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const previewProblem = useMemo(() => ({
    title: draft.title || "Untitled",
    summary: draft.summary,
    tags: parseTags(draft.tagsText),
    sections: draft.sections
  }), [draft]);

  function patchDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateSection(path, updater) {
    setDraft((current) => {
      const sections = cloneSections(current.sections);
      const container = getContainer(sections, path);
      const index = path[path.length - 1];
      const nextItem = updater(container[index]);
      if (nextItem) container[index] = nextItem;
      return { ...current, sections };
    });
  }

  function moveSection(path, direction) {
    setDraft((current) => {
      const sections = cloneSections(current.sections);
      const container = getContainer(sections, path);
      const index = path[path.length - 1];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= container.length) return current;
      const [item] = container.splice(index, 1);
      container.splice(nextIndex, 0, item);
      return { ...current, sections };
    });
  }

  function deleteSection(path) {
    if (!window.confirm("Delete this section?")) return;
    setDraft((current) => {
      const sections = cloneSections(current.sections);
      const container = getContainer(sections, path);
      container.splice(path[path.length - 1], 1);
      return { ...current, sections };
    });
  }

  function addTopLevel(type) {
    setDraft((current) => ({ ...current, sections: [...current.sections, createSection(type)] }));
  }

  function addChild(path, type) {
    updateSection(path, (section) => ({
      ...section,
      type: "deepdive",
      items: [...(section.items || []), createSection(type, true)]
    }));
  }

  async function saveProblem() {
    if (!draft.title.trim()) {
      window.alert("Please give the problem a title.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        summary: draft.summary.trim(),
        tags: parseTags(draft.tagsText),
        sections: draft.sections
      };
      const response = await fetch(isEditing ? `/api/hld/problems/${initialProblem.id}` : "/api/hld/problems", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(saved.error || `HTTP ${response.status}`);
      setToast("Saved ✓");
      window.setTimeout(() => setToast(""), 1200);
      if (isEditing) router.refresh();
      else window.setTimeout(() => router.push(`/hld/${saved.id}`), 500);
    } catch (error) {
      window.alert(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <input
          className="editor-title-input"
          value={draft.title}
          onChange={(event) => patchDraft({ title: event.target.value })}
          placeholder="Problem title (e.g. CamelCamelCamel)"
        />
        <div className="editor-toolbar-actions">
          <button className="btn btn-ghost" type="button" onClick={() => setShowPreview((value) => !value)}>Preview</button>
          <button className="btn btn-primary" type="button" onClick={saveProblem} disabled={saving}>{saving ? "Saving" : "Save"}</button>
        </div>
      </div>

      <div className="editor-meta">
        <input className="editor-input" value={draft.summary} onChange={(event) => patchDraft({ summary: event.target.value })} placeholder="One-line summary" />
        <input className="editor-input" value={draft.tagsText} onChange={(event) => patchDraft({ tagsText: event.target.value })} placeholder="comma,separated,tags" />
      </div>

      <div className={showPreview ? "editor-body with-preview" : "editor-body"}>
        <div className="editor-pane">
          <div className="editor-section-list">
            {draft.sections.map((section, index) => (
              <SectionEditor
                key={String(index)}
                section={section}
                path={[index]}
                depth={0}
                onUpdate={updateSection}
                onMove={moveSection}
                onDelete={deleteSection}
                onAddChild={addChild}
              />
            ))}
          </div>

          <div className="editor-add-row">
            <span>Add section:</span>
            <button className="btn btn-ghost" type="button" onClick={() => addTopLevel("markdown")}>+ Markdown</button>
            <button className="btn btn-ghost" type="button" onClick={() => addTopLevel("diagram")}>+ Diagram</button>
            <button className="btn btn-ghost" type="button" onClick={() => addTopLevel("deepdive")}>+ Deep Dives</button>
          </div>

          <div className="editor-help">
            <details>
              <summary>Cheat sheet · <Link href="/hld/markdown-guide" target="_blank" rel="noopener">open full guide ↗</Link></summary>
              <ul>
                <li><strong>Markdown</strong>: nested bullets, <code>**bold**</code>, fenced code <code>```sql ... ```</code>, tables, blockquotes.</li>
                <li><strong>Diagrams</strong>: paste Mermaid syntax — start with <code>flowchart LR</code>, <code>sequenceDiagram</code>, or <code>erDiagram</code>.</li>
                <li><strong>Deep Dives</strong>: groups of related sub-sections. Each can be markdown, diagram, or another nested deep-dive.</li>
                <li><strong>Images</strong>: paste a screenshot, drag-and-drop a file, or click <strong>Add image</strong> in any markdown section.</li>
              </ul>
            </details>
          </div>
        </div>

        {showPreview ? (
          <div className="editor-preview">
            <div className="preview-inner">
              <div>
                <h1 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-0.01em" }}>{previewProblem.title}</h1>
                <p style={{ margin: "0 0 18px", color: "#6b7280" }}>{previewProblem.summary}</p>
              </div>
              <HldProblemRenderer problem={previewProblem} preview />
            </div>
          </div>
        ) : null}
      </div>

      {toast ? <div className="editor-saving">{toast}</div> : null}
    </div>
  );
}

function SectionEditor({ section, path, depth, onUpdate, onMove, onDelete, onAddChild }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const isDeepDive = section.type === "deepdive";

  function patch(patchValue) {
    onUpdate(path, (current) => ({ ...current, ...patchValue }));
  }

  async function uploadFile(file, altText) {
    if (!file) return;
    setUploadStatus("Uploading…");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/hld/uploads", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
      insertMarkdown(`\n![${altText || file.name || "image"}](${payload.url})\n`);
      setUploadStatus("Image inserted ✓");
      window.setTimeout(() => setUploadStatus(""), 1800);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  }

  function insertMarkdown(markdown) {
    const textarea = textareaRef.current;
    const body = section.body || "";
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    patch({ body: `${body.slice(0, start)}${markdown}${body.slice(end)}` });
    window.requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      const nextCursor = start + markdown.length;
      textareaRef.current.focus();
      textareaRef.current.selectionStart = nextCursor;
      textareaRef.current.selectionEnd = nextCursor;
    });
  }

  async function handlePaste(event) {
    if (section.type !== "markdown") return;
    const imageItem = Array.from(event.clipboardData?.items || []).find((item) => item.type?.startsWith("image/"));
    const file = imageItem?.getAsFile();
    if (!file) return;
    event.preventDefault();
    await uploadFile(file, "pasted image");
  }

  async function handleDrop(event) {
    if (section.type !== "markdown") return;
    const file = Array.from(event.dataTransfer?.files || []).find((item) => item.type?.startsWith("image/"));
    if (!file) return;
    event.preventDefault();
    await uploadFile(file, file.name || "dropped image");
  }

  return (
    <div className="editor-section" data-depth={String(depth)}>
      <div className="editor-section-head">
        <span className="grip">⋮⋮</span>
        <span className={`type-pill ${section.type}`}>{section.type === "deepdive" ? "Deep Dive" : section.type}</span>
        <input className="section-title" value={section.title || ""} onChange={(event) => patch({ title: event.target.value })} placeholder={isDeepDive ? "Deep dive title" : "Section title"} />
        <button className="icon-btn" type="button" title="Move up" onClick={() => onMove(path, -1)}>↑</button>
        <button className="icon-btn" type="button" title="Move down" onClick={() => onMove(path, 1)}>↓</button>
        <button className="icon-btn danger" type="button" title="Delete" onClick={() => onDelete(path)}>×</button>
      </div>

      <div className="editor-section-body">
        {isDeepDive ? (
          <>
            <div className="deepdive-items">
              {(section.items || []).map((child, index) => (
                <SectionEditor
                  key={`${path.join("-")}-${index}`}
                  section={child}
                  path={[...path, index]}
                  depth={depth + 1}
                  onUpdate={onUpdate}
                  onMove={onMove}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                />
              ))}
            </div>
            <div className="deepdive-add-row">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => onAddChild(path, "markdown")}>+ Markdown</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => onAddChild(path, "diagram")}>+ Diagram</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => onAddChild(path, "deepdive")}>+ Nested deep-dive</button>
            </div>
          </>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={section.body || ""}
              onChange={(event) => patch({ body: event.target.value })}
              onPaste={handlePaste}
              onDragOver={(event) => section.type === "markdown" && event.preventDefault()}
              onDrop={handleDrop}
              placeholder={section.type === "diagram" ? "Mermaid syntax — e.g.\nflowchart LR\n  Client --> API[API Gateway]\n  API --> DB[(Postgres)]" : "Markdown — bullets, **bold**, ```code```, tables, images…"}
            />
            {section.type === "markdown" ? (
              <div className="ta-toolbar">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileInputRef.current?.click()}>📎 Add image</button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(event) => uploadFile(event.target.files?.[0], event.target.files?.[0]?.name)} />
                <span className="ta-hint">or paste / drop a screenshot</span>
                {uploadStatus ? <span className="upload-status">{uploadStatus}</span> : null}
              </div>
            ) : null}
            {section.type === "diagram" ? <input className="caption-input" value={section.caption || ""} onChange={(event) => patch({ caption: event.target.value })} placeholder="Optional caption" /> : null}
          </>
        )}
      </div>
    </div>
  );
}

function createSection(type, nested = false) {
  if (type === "diagram") {
    return {
      type: "diagram",
      title: nested ? "New diagram" : "New diagram",
      body: "flowchart LR\n  A --> B",
      caption: ""
    };
  }
  if (type === "deepdive") return { type: "deepdive", title: nested ? "New nested deep-dive" : "Deep Dives", items: [] };
  return { type: "markdown", title: nested ? "New sub-section" : "New section", body: "" };
}

function getContainer(sections, path) {
  let container = sections;
  for (let index = 0; index < path.length - 1; index += 1) {
    const item = container[path[index]];
    if (!Array.isArray(item.items)) item.items = [];
    container = item.items;
  }
  return container;
}

function cloneSections(sections) {
  return JSON.parse(JSON.stringify(sections || []));
}

function parseTags(tagsText) {
  return String(tagsText || "").split(",").map((tag) => tag.trim()).filter(Boolean);
}
