/* guide.js — render side-by-side source/output examples on the markdown guide page. */
(function () {
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: false,
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

  function decode(s) {
    const t = document.createElement("textarea");
    t.innerHTML = s;
    return t.value;
  }

  let mc = 0;

  document.querySelectorAll(".ex").forEach(async (host) => {
    const isMermaid = host.classList.contains("diagram-ex");
    const src = decode(isMermaid ? host.dataset.mermaid : host.dataset.md);

    const wrap = document.createElement("div");
    wrap.className = "ex-grid";

    // left: source
    const left = document.createElement("div");
    left.className = "ex-source";
    const lh = document.createElement("div");
    lh.className = "ex-label";
    lh.innerHTML = '<span>Source</span><button class="ex-copy" type="button">Copy</button>';
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.className = isMermaid ? "language-mermaid" : "language-markdown";
    code.textContent = src;
    pre.appendChild(code);
    left.appendChild(lh);
    left.appendChild(pre);

    // right: rendered
    const right = document.createElement("div");
    right.className = "ex-rendered";
    const rh = document.createElement("div");
    rh.className = "ex-label";
    rh.innerHTML = '<span>Rendered</span>';
    const target = document.createElement("div");
    target.className = isMermaid ? "diagram-wrap" : "prose";
    if (isMermaid) {
      try {
        const id = `gmd-${++mc}`;
        const { svg } = await mermaid.render(id, src);
        target.innerHTML = svg;
      } catch (e) {
        target.innerHTML = `<pre style="color:#b91c1c">Diagram error: ${e.message || e}</pre>`;
      }
    } else {
      target.innerHTML = marked.parse(src);
      if (window.hljs) target.querySelectorAll("pre code").forEach((b) => { try { hljs.highlightElement(b); } catch (_) {} });
    }
    right.appendChild(rh);
    right.appendChild(target);

    wrap.appendChild(left);
    wrap.appendChild(right);
    host.replaceWith(wrap);

    if (window.hljs) {
      try { hljs.highlightElement(code); } catch (_) {}
    }
    lh.querySelector(".ex-copy").addEventListener("click", () => {
      navigator.clipboard.writeText(src).then(() => {
        const btn = lh.querySelector(".ex-copy");
        const prev = btn.textContent;
        btn.textContent = "Copied ✓";
        setTimeout(() => { btn.textContent = prev; }, 1200);
      });
    });
  });

  // build TOC
  const toc = document.getElementById("guide-toc-list");
  if (toc) {
    document.querySelectorAll(".guide-section").forEach((s) => {
      const h2 = s.querySelector("h2");
      if (!h2) return;
      const a = document.createElement("a");
      a.href = `#${s.id}`;
      a.textContent = h2.textContent;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        s.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${s.id}`);
      });
      toc.appendChild(a);
    });

    const sections = Array.from(document.querySelectorAll(".guide-section"));
    const links = Array.from(toc.querySelectorAll("a"));
    const onScroll = () => {
      const top = window.scrollY + 130;
      let active = sections[0];
      for (const s of sections) { if (s.offsetTop <= top) active = s; else break; }
      if (!active) return;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${active.id}`));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();