/* editor.js — section-based authoring UI for HLD problems.
 * Features:
 *  - recursive deep-dive sections (any depth)
 *  - paste/drop/pick image uploads (auto-inserts markdown)
 *  - live preview pane
 */
(function () {
  const root = document.getElementById("editor");
  const seedRaw = root.dataset.problem || "{}";
  const seed = JSON.parse(seedRaw);
  const isEditing = !!seed.id;

  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        background: "#ffffff",
        primaryColor: "#fef3c7",
        primaryTextColor: "#1f2328",
        primaryBorderColor: "#b45309",
        lineColor: "#6b7280",
        secondaryColor: "#dbeafe",
        tertiaryColor: "#dcfce7",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      },
      flowchart: { curve: "basis", htmlLabels: true, padding: 14 },
    });
  }
  if (window.marked) marked.setOptions({ gfm: true, breaks: false });

  // ---------- model ----------
  const state = {
    title: seed.title || "",
    summary: seed.summary || "",
    tags: (seed.tags || []).join(", "),
    sections: JSON.parse(JSON.stringify(seed.sections || [])),
  };

  const titleInput = document.getElementById("f-title");
  const summaryInput = document.getElementById("f-summary");
  const tagsInput = document.getElementById("f-tags");
  titleInput.value = state.title;
  summaryInput.value = state.summary;
  tagsInput.value = state.tags;
  titleInput.addEventListener("input", (e) => { state.title = e.target.value; refreshPreview(); });
  summaryInput.addEventListener("input", (e) => { state.summary = e.target.value; });
  tagsInput.addEventListener("input", (e) => { state.tags = e.target.value; });

  // ---------- helpers ----------
  function move(arr, from, to) {
    if (to < 0 || to >= arr.length) return;
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
  }

  function makePill(type) {
    const span = document.createElement("span");
    span.className = `type-pill ${type}`;
    span.textContent = type === "deepdive" ? "Deep Dive" : type;
    return span;
  }

  function iconBtn(label, title, onClick, cls) {
    const b = document.createElement("button");
    b.className = "icon-btn" + (cls ? " " + cls : "");
    b.type = "button";
    b.textContent = label;
    b.title = title;
    b.addEventListener("click", onClick);
    return b;
  }

  // ---------- image upload ----------
  async function uploadDataUrl(dataUrl) {
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.url;
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.url;
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const v = textarea.value;
    textarea.value = v.slice(0, start) + text + v.slice(end);
    const pos = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
    textarea.focus();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function showStatus(textarea, msg, kind = "info") {
    let s = textarea.parentElement.querySelector(".upload-status");
    if (!s) {
      s = document.createElement("div");
      s.className = "upload-status";
      textarea.parentElement.appendChild(s);
    }
    s.textContent = msg;
    s.dataset.kind = kind;
    if (kind !== "loading") setTimeout(() => { if (s.textContent === msg) s.textContent = ""; }, 2200);
  }

  function attachImageHandlers(textarea, isMarkdown) {
    if (!isMarkdown) return; // diagrams = mermaid text only

    textarea.addEventListener("paste", async (e) => {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (const it of items) {
        if (it.type && it.type.startsWith("image/")) {
          e.preventDefault();
          const blob = it.getAsFile();
          if (!blob) continue;
          showStatus(textarea, "Uploading pasted image…", "loading");
          try {
            const dataUrl = await blobToDataURL(blob);
            const url = await uploadDataUrl(dataUrl);
            insertAtCursor(textarea, `\n![pasted image](${url})\n`);
            showStatus(textarea, "Image inserted ✓", "ok");
          } catch (err) {
            showStatus(textarea, "Upload failed: " + err.message, "err");
          }
          return;
        }
      }
    });

    textarea.addEventListener("dragover", (e) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.items || []).some((i) => i.kind === "file")) {
        e.preventDefault();
        textarea.classList.add("dropping");
      }
    });

    textarea.addEventListener("dragleave", () => textarea.classList.remove("dropping"));
    textarea.addEventListener("drop", async (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type && file.type.startsWith("image/")) {
        e.preventDefault();
        textarea.classList.remove("dropping");
        showStatus(textarea, "Uploading dropped image…", "loading");
        try {
          const url = await uploadFile(file);
          insertAtCursor(textarea, `\n![${file.name}](${url})\n`);
          showStatus(textarea, "Image inserted ✓", "ok");
        } catch (err) {
          showStatus(textarea, "Upload failed: " + err.message, "err");
        }
      }
    });
  }

  function makeImagePicker(textarea) {
    const wrap = document.createElement("div");
    wrap.className = "ta-toolbar";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost btn-sm";
    btn.innerHTML = "📎 Add image";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    btn.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      showStatus(textarea, "Uploading…", "loading");
      try {
        const url = await uploadFile(file);
        insertAtCursor(textarea, `\n![${file.name}](${url})\n`);
        showStatus(textarea, "Image inserted ✓", "ok");
      } catch (err) {
        showStatus(textarea, "Upload failed: " + err.message, "err");
      }
      input.value = "";
    });

    const hint = document.createElement("span");
    hint.className = "ta-hint";
    hint.textContent = "or paste / drop a screenshot";

    wrap.appendChild(btn);
    wrap.appendChild(input);
    wrap.appendChild(hint);
    return wrap;
  }

  // ---------- recursive renderer ----------
  // container: array (state.sections or parent.items) the item lives in
  // index: position in that array
  // depth: 0 for top-level
  function renderItem(item, container, index, depth) {
    const card = document.createElement("div");
    card.className = "editor-section";
    card.setAttribute("data-depth", String(depth));

    // head
    const head = document.createElement("div");
    head.className = "editor-section-head";

    const grip = document.createElement("span");
    grip.className = "grip";
    grip.textContent = "⋮⋮";
    head.appendChild(grip);
    head.appendChild(makePill(item.type));

    const titleI = document.createElement("input");
    titleI.className = "section-title";
    titleI.value = item.title || "";
    titleI.placeholder = item.type === "deepdive" ? "Deep dive title" : "Section title";
    titleI.addEventListener("input", (e) => { item.title = e.target.value; refreshPreview(); });
    head.appendChild(titleI);

    head.appendChild(iconBtn("↑", "Move up", () => { move(container, index, index - 1); rerender(); }));
    head.appendChild(iconBtn("↓", "Move down", () => { move(container, index, index + 1); rerender(); }));
    head.appendChild(iconBtn("×", "Delete", () => {
      if (confirm(`Delete "${item.title || item.type}"?`)) {
        container.splice(index, 1);
        rerender();
      }
    }, "danger"));

    card.appendChild(head);

    // body
    const body = document.createElement("div");
    body.className = "editor-section-body";

    if (item.type === "deepdive") {
      const items = document.createElement("div");
      items.className = "deepdive-items";
      (item.items = item.items || []).forEach((child, j) => {
        items.appendChild(renderItem(child, item.items, j, depth + 1));
      });
      body.appendChild(items);

      const addRow = document.createElement("div");
      addRow.className = "deepdive-add-row";

      const addMd = document.createElement("button");
      addMd.className = "btn btn-ghost btn-sm"; addMd.type = "button"; addMd.textContent = "+ Markdown";
      addMd.addEventListener("click", () => {
        item.items.push({ type: "markdown", title: "New sub-section", body: "" });
        rerender();
      });

      const addDg = document.createElement("button");
      addDg.className = "btn btn-ghost btn-sm"; addDg.type = "button"; addDg.textContent = "+ Diagram";
      addDg.addEventListener("click", () => {
        item.items.push({ type: "diagram", title: "New diagram", body: "flowchart LR\n  A --> B" });
        rerender();
      });

      const addNested = document.createElement("button");
      addNested.className = "btn btn-ghost btn-sm"; addNested.type = "button";
      addNested.textContent = "+ Nested deep-dive";
      addNested.addEventListener("click", () => {
        item.items.push({ type: "deepdive", title: "New nested deep-dive", items: [] });
        rerender();
      });

      addRow.appendChild(addMd);
      addRow.appendChild(addDg);
      addRow.appendChild(addNested);
      body.appendChild(addRow);
    } else {
      const ta = document.createElement("textarea");
      ta.value = item.body || "";
      ta.placeholder = item.type === "diagram"
        ? "Mermaid syntax — e.g. \nflowchart LR\n  Client --> API[API Gateway]\n  API --> DB[(Postgres)]"
        : "Markdown — bullets, **bold**, ```code```, tables, images…";
      ta.addEventListener("input", (e) => { item.body = e.target.value; refreshPreview(); });
      body.appendChild(ta);

      attachImageHandlers(ta, item.type === "markdown");
      if (item.type === "markdown") body.appendChild(makeImagePicker(ta));

      if (item.type === "diagram") {
        const cap = document.createElement("input");
        cap.className = "caption-input";
        cap.placeholder = "Optional caption";
        cap.value = item.caption || "";
        cap.addEventListener("input", (e) => { item.caption = e.target.value; refreshPreview(); });
        body.appendChild(cap);
      }
    }

    card.appendChild(body);
    return card;
  }

  // ---------- mounting ----------
  const list = document.getElementById("section-list");
  function rerender() {
    list.innerHTML = "";
    state.sections.forEach((s, i) => list.appendChild(renderItem(s, state.sections, i, 0)));
    refreshPreview();
  }

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.getAttribute("data-add");
      if (t === "markdown") state.sections.push({ type: "markdown", title: "New section", body: "" });
      else if (t === "diagram") state.sections.push({
        type: "diagram", title: "New diagram",
        body: "flowchart LR\n  Client((Client)) --> API[API Gateway]\n  API --> DB[(Postgres)]",
        caption: "",
      });
      else if (t === "deepdive") state.sections.push({ type: "deepdive", title: "Deep Dives", items: [] });
      rerender();
    });
  });

  // ---------- preview ----------
  const previewBox = document.getElementById("editor-preview");
  const previewInner = document.getElementById("preview-inner");
  const editorBody = document.querySelector(".editor-body");

  document.getElementById("btn-preview-toggle").addEventListener("click", () => {
    const showing = !previewBox.hasAttribute("hidden");
    if (showing) {
      previewBox.setAttribute("hidden", "");
      editorBody.classList.remove("with-preview");
    } else {
      previewBox.removeAttribute("hidden");
      editorBody.classList.add("with-preview");
      refreshPreview();
    }
  });

  let mc = 0;
  let previewDebounce;
  function refreshPreview() {
    if (previewBox.hasAttribute("hidden")) return;
    clearTimeout(previewDebounce);
    previewDebounce = setTimeout(doPreview, 180);
  }

  async function doPreview() {
    previewInner.innerHTML = "";
    const head = document.createElement("div");
    head.innerHTML = `<h1 style="margin:0 0 6px;font-size:28px;letter-spacing:-0.01em">${escapeHtml(state.title || "Untitled")}</h1>
      <p style="margin:0 0 18px;color:#6b7280">${escapeHtml(state.summary || "")}</p>`;
    previewInner.appendChild(head);
    for (const s of state.sections) previewInner.appendChild(await renderPreviewItem(s, 0));
  }

  async function renderPreviewItem(item, depth) {
    let wrap;
    if (depth === 0) {
      wrap = document.createElement("section");
      wrap.className = "section";
    } else {
      wrap = document.createElement("div");
      wrap.className = "deepdive-card";
      wrap.setAttribute("data-depth", String(depth));
    }

    const tag = depth === 0 ? "h2" : `h${Math.min(6, depth + 2)}`;
    const h = document.createElement(tag);
    h.textContent = item.title || "";
    wrap.appendChild(h);

    if (item.type === "deepdive") {
      for (const child of (item.items || [])) wrap.appendChild(await renderPreviewItem(child, depth + 1));
    } else if (item.type === "diagram") {
      wrap.appendChild(await renderPreviewDiagram(item));
    } else {
      wrap.appendChild(renderPreviewMarkdown(item.body));
    }
    return wrap;
  }

  function renderPreviewMarkdown(body) {
    const d = document.createElement("div");
    d.className = "prose";
    d.innerHTML = window.marked ? marked.parse(body || "") : (body || "");
    return d;
  }

  async function renderPreviewDiagram(section) {
    const wrap = document.createElement("div");
    wrap.className = "diagram-wrap";
    const target = document.createElement("div");
    wrap.appendChild(target);
    try {
      if (window.mermaid) {
        const id = `pmd-${++mc}`;
        const { svg } = await mermaid.render(id, section.body || "flowchart LR\n  A --> B");
        target.innerHTML = svg;
      }
    } catch (e) {
      target.innerHTML = `<pre style="color:#b91c1c">Diagram error: ${escapeHtml(e.message || String(e))}</pre>`;
    }
    if (section.caption) {
      const cap = document.createElement("div");
      cap.className = "diagram-caption";
      cap.textContent = section.caption;
      wrap.appendChild(cap);
    }
    return wrap;
  }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- save ----------
  const toast = document.getElementById("saving-toast");
  document.getElementById("btn-save").addEventListener("click", async () => {
    if (!state.title.trim()) {
      alert("Please give the problem a title.");
      titleInput.focus();
      return;
    }

    const payload = {
      title: state.title.trim(),
      summary: state.summary.trim(),
      tags: state.tags.split(",").map((t) => t.trim()).filter(Boolean),
      sections: state.sections,
    };
    const url = isEditing ? `/api/problems/${seed.id}` : `/api/problems`;
    const method = isEditing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      toast.removeAttribute("hidden");
      setTimeout(() => toast.setAttribute("hidden", ""), 1200);
      if (!isEditing) setTimeout(() => { window.location.href = `/problem/${saved.id}`; }, 600);
    } catch (e) {
      alert("Save failed: " + e.message);
    }
  });

  rerender();
})();