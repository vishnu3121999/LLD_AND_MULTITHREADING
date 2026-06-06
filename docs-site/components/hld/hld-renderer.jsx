"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import hljs from "highlight.js";
import { marked } from "marked";

const MERMAID_SRC = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";

marked.setOptions({ gfm: true, breaks: false });

export function HldProblemRenderer({ problem, preview = false }) {
  const [mermaidReady, setMermaidReady] = useState(false);
  const tree = useMemo(() => buildSectionTree(problem?.sections || []), [problem?.sections]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.mermaid) {
      initializeMermaid();
      setMermaidReady(true);
    }
  }, []);

  useEffect(() => {
    if (preview) return undefined;

    const toc = document.getElementById("toc-list");
    if (!toc) return undefined;

    const headings = tree.flat.map((entry) => document.getElementById(entry.id)).filter(Boolean);
    const links = Array.from(toc.querySelectorAll("a"));

    function onScroll() {
      let active = headings[0];
      const top = window.scrollY + 120;
      for (const heading of headings) {
        if (heading.offsetTop <= top) active = heading;
        else break;
      }
      if (!active) return;
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${active.id}`);
      });
    }

    function onTocClick(event) {
      const link = event.currentTarget;
      const id = link.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }

    links.forEach((link) => link.addEventListener("click", onTocClick));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      links.forEach((link) => link.removeEventListener("click", onTocClick));
      window.removeEventListener("scroll", onScroll);
    };
  }, [preview, tree.flat]);

  const content = (
    <>
      <Script
        src={MERMAID_SRC}
        strategy="afterInteractive"
        onLoad={() => {
          initializeMermaid();
          setMermaidReady(true);
        }}
      />
      {tree.nodes.map((node) => (
        <HldSectionNode key={node.id} node={node} mermaidReady={mermaidReady} />
      ))}
    </>
  );

  if (preview) {
    return <div>{content}</div>;
  }

  return (
    <article className="reader">
      <aside className="reader-sidebar" id="toc">
        <div className="toc-title">On this page</div>
        <nav id="toc-list">
          {tree.flat.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              data-depth={entry.depth}
              className={entry.depth === 0 ? "toc-top" : ""}
              style={{ paddingLeft: `${16 + Math.min(entry.depth, 4) * 12}px` }}
            >
              {entry.title || "Untitled"}
            </a>
          ))}
        </nav>
      </aside>

      <div className="reader-main">
        <header className="reader-head">
          <div className="reader-tags">
            {(problem.tags || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
          <h1>{problem.title}</h1>
          {problem.summary ? <p className="reader-summary">{problem.summary}</p> : null}
          <div className="reader-meta">
            <span>Updated {problem.updated_at ? problem.updated_at.slice(0, 10) : ""}</span>
            <Link className="btn btn-ghost" href={`/hld/${problem.id}/edit`}>✎ Edit</Link>
          </div>
        </header>

        <div id="content">{content}</div>
      </div>
    </article>
  );
}

function HldSectionNode({ node, mermaidReady }) {
  const Heading = node.depth === 0 ? "h2" : `h${Math.min(6, node.depth + 2)}`;
  const isTopLevel = node.depth === 0;

  return (
    <section className={isTopLevel ? "section" : "deepdive-card"} data-depth={node.depth}>
      <Heading id={node.id}>{node.title || "Untitled"}</Heading>
      {node.type === "deepdive" ? (
        <>
          {node.children.length === 0 ? <p className="prose">No deep-dive items yet.</p> : null}
          {node.children.map((child) => (
            <HldSectionNode key={child.id} node={child} mermaidReady={mermaidReady} />
          ))}
        </>
      ) : node.type === "diagram" ? (
        <MermaidBlock code={node.body} caption={node.caption} ready={mermaidReady} />
      ) : (
        <MarkdownBlock body={node.body} />
      )}
    </section>
  );
}

function MarkdownBlock({ body }) {
  const ref = useRef(null);
  const html = useMemo(() => marked.parse(body || ""), [body]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll("pre code").forEach((block) => {
      try {
        hljs.highlightElement(block);
      } catch {
        // Invalid language hints should not break reading.
      }
    });
  }, [html]);

  return <div ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MermaidBlock({ code, caption, ready }) {
  const ref = useRef(null);
  const idRef = useRef(`hld-mmd-${Math.random().toString(36).slice(2)}`);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!ref.current || !ready || !window.mermaid) return;
      setError("");
      try {
        const { svg } = await window.mermaid.render(idRef.current, code || "flowchart LR\n  A --> B");
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (err) {
        if (!cancelled) setError(err?.message || String(err));
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [code, ready]);

  return (
    <div className="diagram-wrap">
      {ready ? <div ref={ref} /> : <pre>{code}</pre>}
      {error ? <pre style={{ color: "#b91c1c" }}>Diagram error: {error}</pre> : null}
      {caption ? <div className="diagram-caption">{caption}</div> : null}
    </div>
  );
}

function buildSectionTree(sections) {
  const used = new Map();
  const flat = [];

  function makeId(title, fallback) {
    const base = slugify(title) || fallback || "section";
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  }

  function visit(section, depth, indexPath) {
    const id = makeId(section.title, `section-${indexPath.join("-")}`);
    const node = {
      id,
      depth,
      type: section.type || "markdown",
      title: section.title || "Untitled",
      body: section.body || "",
      caption: section.caption || "",
      children: []
    };

    flat.push({ id, depth, title: node.title });

    if (node.type === "deepdive") {
      node.children = (section.items || []).map((child, index) => visit(child, depth + 1, [...indexPath, index]));
    }

    return node;
  }

  return { nodes: sections.map((section, index) => visit(section, 0, [index])), flat };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initializeMermaid() {
  if (!window.mermaid) return;
  window.mermaid.initialize({
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
      fontSize: "14px"
    },
    flowchart: { curve: "basis", htmlLabels: true, padding: 14 }
  });
}
