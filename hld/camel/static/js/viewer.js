/* viewer.js — render an HLD problem from JSON to a beautiful page.
💡 Supports recursive (arbitrarily nested) deep-dive sections.
*/
(function () {
  const dataEl = document.getElementById("problem-data");
  if (!dataEl) return;
  const problem = JSON.parse(dataEl.textContent);

  if (window.marked) {
    marked.setOptions({
      breaks: false,
      gfm: true,
      highlight: function (code, lang) {
        if (window.hljs && lang && hljs.getLanguage(lang)) {
          try { return hljs.highlight(code, { language: lang }).value; } catch (_) {}
        }
        return code;
      },
    });
  }

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

  const slug = (s) => (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const tocEntries = [];
  const root = document.getElementById("content");
  const usedIds = new Set();
  function uniqueId(base) {
    let id = base || "section";
    let i = 2;
    while (usedIds.has(id)) { id = `${base}-${i}`; i++; }
    usedIds.add(id);
    return id;
  }

  let mermaidCounter = 0;
  async function renderMermaid(target, code) {
    try {
      const id = `mmd-${++mermaidCounter}`;
      const { svg } = await mermaid.render(id, code);
      target.innerHTML = svg;
    } catch (e) {
      target.innerHTML = `<pre style="color:#b91c1c">Diagram error: ${e.message || e}</pre>`;
    }
  }

  function renderMarkdownBlock(body) {
    const div = document.createElement("div");
    div.className = "prose";
    div.innerHTML = window.marked ? marked.parse(body || "") : (body || "");
    if (window.hljs) {
      div.querySelectorAll("pre code").forEach((b) => { try { hljs.highlightElement(b); } catch (_) {} });
    }
    return div;
  }

  function renderDiagramBlock(section) {
    const wrap = document.createElement("div");
    wrap.className = "diagram-wrap";
    const target = document.createElement("div");
    wrap.appendChild(target);
    if (window.mermaid) renderMermaid(target, section.body || "");
    if (section.caption) {
      const cap = document.createElement("div");
      cap.className = "diagram-caption";
      cap.textContent = section.caption;
      wrap.appendChild(cap);
    }
    return wrap;
  }

  /**
   * Recursive renderer.
   * depth = 0 → top-level page section (h2 with accent bar)
   * depth >= 1 → nested deepdive card (h3 / h4 / h5 / h6)
   */
  function renderItem(item, depth) {
    const headingTag = depth === 0 ? "h2" : `h${Math.min(6, depth + 2)}`;
    const id = uniqueId(slug(item.title || item.type || "section"));
    tocEntries.push({ id, label: item.title || "(untitled)", depth });

    let wrap;
    if (depth === 0) {
      wrap = document.createElement("section");
      wrap.className = "section";
    } else {
      wrap = document.createElement("div");
      wrap.className = "deepdive-card";
      wrap.setAttribute("data-depth", String(depth));
    }

    const h = document.createElement(headingTag);
    h.id = id;
    h.textContent = item.title || "";
    wrap.appendChild(h);

    if (item.type === "deepdive") {
      (item.items || []).forEach((child) => {
        wrap.appendChild(renderItem(child, depth + 1));
      });
    } else if (item.type === "diagram") {
      wrap.appendChild(renderDiagramBlock(item));
    } else {
      wrap.appendChild(renderMarkdownBlock(item.body || ""));
    }
    return wrap;
  }

  (problem.sections || []).forEach((s) => root.appendChild(renderItem(s, 0)));

  // build TOC (depth-aware)
  const toc = document.getElementById("toc-list");
  tocEntries.forEach((e) => {
    const a = document.createElement("a");
    a.href = `#${e.id}`;
    a.textContent = e.label;
    a.setAttribute("data-depth", String(e.depth));
    a.style.paddingLeft = `${16 + Math.min(e.depth, 4) * 12}px`;
    if (e.depth === 0) a.classList.add("toc-top");
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const target = document.getElementById(e.id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${e.id}`);
      }
    });
    toc.appendChild(a);
  });

  // scrollspy
  const headings = tocEntries.map((e) => document.getElementById(e.id)).filter(Boolean);
  const links = Array.from(toc.querySelectorAll("a"));
  function onScroll() {
    let active = headings[0];
    const top = window.scrollY + 120;
    for (const h of headings) { if (h.offsetTop <= top) active = h; else break; }
    if (!active) return;
    links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${active.id}`));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();