"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import { marked } from "marked";

const MERMAID_SRC = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
const GUIDE_INNER_HTML = "<header class=\"guide-head\">\r\n        <span class=\"tag\">Authoring</span>\r\n        <h1>Markdown & Diagram Guide</h1>\r\n        <p>Everything you can use in a section's body. Each example shows the <strong>source on the left</strong>\r\n            and the <strong>rendered output on the right</strong>.</p>\r\n    </header>\r\n\r\n    <aside class=\"guide-toc\">\r\n        <div class=\"toc-title\">Contents</div>\r\n        <nav id=\"guide-toc-list\"></nav>\r\n    </aside>\r\n\r\n    <main class=\"guide-main\">\r\n\r\n        <!-- HEADINGS -->\r\n        <section class=\"guide-section\" id=\"headings\">\r\n            <h2>Headings</h2>\r\n            <p class=\"lede\">Use <code>#</code> through <code>######</code>. Inside a problem, prefer <strong>bold text</strong>\r\n                over headings — section titles already produce the page heading.</p>\r\n            <div class=\"ex\" data-md=\"# Heading 1\r\n## Heading 2\r\n### Heading 3\r\n#### Heading 4\r\n##### Heading 5\r\n###### Heading 6\"></div>\r\n        </section>\r\n\r\n        <!-- EMPHASIS -->\r\n        <section class=\"guide-section\" id=\"emphasis\">\r\n            <h2>Emphasis</h2>\r\n            <div class=\"ex\" data-md=\"**bold** and __also bold__\r\n\r\n*italic* and _also italic_\r\n\r\n***bold + italic***\r\n\r\n~~strikethrough~~\r\n\r\n==highlighted== <!-- not standard, use bold instead -->\"></div>\r\n        </section>\r\n\r\n        <!-- INLINE CODE -->\r\n        <section class=\"guide-section\" id=\"inline-code\">\r\n            <h2>Inline code & keyboard</h2>\r\n            <div class=\"ex\" data-md=\"Use single backticks: `O(log n)` lookup.\r\n\r\nUse double backticks if the code itself contains a backtick: ``echo `date` ``.\r\n\r\nPress <kbd>⌘</kbd> + <kbd>S</kbd> to save.\"></div>\r\n        </section>\r\n\r\n        <!-- CODE BLOCKS -->\r\n        <section class=\"guide-section\" id=\"code-blocks\">\r\n            <h2>Code blocks (fenced, with syntax highlighting)</h2>\r\n            <p class=\"lede\">Open with three backticks and a language hint, close with three backticks.</p>\r\n\r\n            <h3 class=\"ex-h\">Python</h3>\r\n            <div class=\"ex\" data-md=\"```python\r\ndef shorten(url: str) -> str:\r\n    h = hashlib.sha256(url.encode()).digest()\r\n    return base62(h[:6])\r\n```\"></div>\r\n\r\n            <h3 class=\"ex-h\">SQL</h3>\r\n            <div class=\"ex\" data-md=\"```sql\r\nSELECT\r\n  date_trunc('day', ts) AS bucket,\r\n  AVG(price) AS price\r\nFROM  prices\r\nWHERE product_id = ?\r\n  AND ts &gt;= NOW() - INTERVAL '30 days'\r\nGROUP BY bucket\r\nORDER BY bucket;\r\n```\"></div>\r\n\r\n            <h3 class=\"ex-h\">HTTP / API</h3>\r\n            <div class=\"ex\" data-md=\"```http\r\nPOST /subscriptions HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{\r\n  &quot;product_id&quot;: &quot;B07X1ABCD&quot;,\r\n  &quot;price_threshold&quot;: 199.99,\r\n  &quot;notification_type&quot;: &quot;PUSH&quot;\r\n}\r\n```\"></div>\r\n\r\n            <h3 class=\"ex-h\">JSON</h3>\r\n            <div class=\"ex\" data-md=\"```json\r\n{\r\n  &quot;status&quot;: &quot;ok&quot;,\r\n  &quot;rows&quot;: 42,\r\n  &quot;tags&quot;: [&quot;cache&quot;, &quot;cdn&quot;]\r\n}\r\n```\"></div>\r\n\r\n            <h3 class=\"ex-h\">Plain text / pseudo</h3>\r\n            <div class=\"ex\" data-md=\"```\r\nfan-out write =&gt; followers * msgs/sec\r\nfan-out read  =&gt; 1\r\n```\"></div>\r\n        </section>\r\n\r\n        <!-- LISTS -->\r\n        <section class=\"guide-section\" id=\"lists\">\r\n            <h2>Lists</h2>\r\n\r\n            <h3 class=\"ex-h\">Bullets (use <code>-</code>; indent 2 spaces to nest)</h3>\r\n            <div class=\"ex\" data-md=\"- Functional Requirements\r\n- View price history\r\n- Subscribe to drops\r\n  - Email\r\n  - Push\r\n  - SMS\r\n- Out of scope\r\n  - Cross-retailer comparison\"></div>\r\n\r\n            <h3 class=\"ex-h\">Numbered</h3>\r\n            <div class=\"ex\" data-md=\"1. Receive request\r\n2. Authenticate\r\n3. Look up cache\r\n   1. Hit → return\r\n   2. Miss → query DB\r\n4. Return response\"></div>\r\n\r\n            <h3 class=\"ex-h\">Task list</h3>\r\n            <div class=\"ex\" data-md=\"- [x] Define core entities\r\n- [x] Sketch initial HLD\r\n- [ ] Capacity estimate\r\n- [ ] Deep dive: notifications\"></div>\r\n        </section>\r\n\r\n        <!-- TABLES -->\r\n        <section class=\"guide-section\" id=\"tables\">\r\n            <h2>Tables</h2>\r\n            <p class=\"lede\">Use <code>|</code> to separate columns. The second row controls alignment with\r\n                <code>:---</code>, <code>:---:</code>, or <code>---:</code>.</p>\r\n\r\n            <h3 class=\"ex-h\">Basic</h3>\r\n            <div class=\"ex\" data-md=\"| Tier | % products | scrape every |\r\n|------|------------|--------------:|\r\n| High |        1% | 1.5 hr        |\r\n| Med  |        9% | 15 hr         |\r\n| Low  |       90% | x days        |\"></div>\r\n\r\n            <h3 class=\"ex-h\">Trade-off table (great for HLD)</h3>\r\n            <div class=\"ex\" data-md=\"| Approach        | Latency | Cost | Verdict |\r\n|-----------------|:-------:|:----:|---------|\r\n| No index        |  10s    |  $   | ❌ BAD |\r\n| B-tree index    | 200ms   | $$   | ✅ GOOD |\r\n| Pre-aggregated  | 20ms    | $$$  | ✅ GOOD (1d stale) |\r\n| TSDB            |  8ms    | $$   | 🌟 GREAT |\"></div>\r\n        </section>\r\n\r\n        <!-- BLOCKQUOTES -->\r\n        <section class=\"guide-section\" id=\"blockquotes\">\r\n            <h2>Blockquotes & callouts</h2>\r\n            <div class=\"ex\" data-md=\"&gt; **Note:** YouTube reports 95% of views come from 3% of videos —\r\n&gt; product popularity follows a Pareto distribution.\r\n\r\n&gt; Nested:\r\n&gt;\r\n&gt; &gt; If poll interval is 1s, peak QPS hits `3 × 10^5 /s`.\r\n&gt; &gt; Postgres caps around 100k/s → use 3 read replicas.\"></div>\r\n        </section>\r\n\r\n        <!-- LINKS -->\r\n        <section class=\"guide-section\" id=\"links\">\r\n            <h2>Links</h2>\r\n            <div class=\"ex\" data-md=\"Inline: [camelcamelcamel](https://camelcamelcamel.com)\r\n\r\nAuto-link: &lt;https://aws.amazon.com/sqs/&gt;\r\n\r\nReference style:\r\nWe followed [the YouTube case study][yt] for popularity assumptions.\r\n\r\n[yt]: https://blog.youtube/inside-youtube/popularity\"></div>\r\n        </section>\r\n\r\n        <!-- IMAGES -->\r\n        <section class=\"guide-section\" id=\"images\">\r\n            <h2>Images</h2>\r\n            <p class=\"lede\">In the editor you can <strong>paste a screenshot</strong> (<kbd>⌘</kbd>+<kbd>V</kbd>),\r\n                drag-and-drop a file, or click <strong>\r\n                    📎 Add image</strong>. Either way, the editor uploads the image and inserts the markdown for you.</p>\r\n\r\n            <h3 class=\"ex-h\">Inline image</h3>\r\n            <div class=\"ex\" data-md=\"![Pareto distribution sketch](/static/uploads/sample-pareto.svg)\"></div>\r\n\r\n            <h3 class=\"ex-h\">With link</h3>\r\n            <div class=\"ex\" data-md=\"[![logo](/static/uploads/sample-pareto.svg)](https://camelcamelcamel.com)\"></div>\r\n\r\n            <h3 class=\"ex-h\">Sized via HTML (when you need control)</h3>\r\n            <div class=\"ex\" data-md='&lt;img src=&quot;/static/uploads/sample-pareto.svg&quot; alt=&quot;Pareto&quot; width=&quot;320&quot; /&gt;'></div>\r\n        </section>\r\n\r\n        <!-- HORIZONTAL RULES -->\r\n        <section class=\"guide-section\" id=\"rules\">\r\n            <h2>Horizontal rule & line breaks</h2>\r\n            <div class=\"ex\" data-md=\"Section A above the rule.\r\n\r\n---\r\n\r\nSection B below the rule.\r\n\r\nEnd a line with two trailing spaces\r\nto force a hard line break.\"></div>\r\n        </section>\r\n\r\n        <!-- ESCAPING -->\r\n        <section class=\"guide-section\" id=\"escaping\">\r\n            <h2>Escaping special characters</h2>\r\n            <div class=\"ex\" data-md=\"Show literal markdown by escaping with \\\\:\r\n\r\n\\\\*not italic\\\\* and \\\\`not code\\\\`.\"></div>\r\n        </section>\r\n\r\n        <!-- MERMAID DIAGRAMS -->\r\n        <section class=\"guide-section\" id=\"diagrams\">\r\n            <h2>Diagrams (Mermaid)</h2>\r\n            <p class=\"lede\">In a <strong>Diagram</strong> section type, paste Mermaid syntax — no fences, no <code>```</code>.\r\n                The whole body is the diagram.</p>\r\n\r\n            <h3 class=\"ex-h\">Flowchart — basics</h3>\r\n            <div class=\"ex diagram-ex\" data-mermaid=\"flowchart LR\r\nClient((Client)) --&gt; API[API Gateway]\r\nAPI --&gt; SVC[Service]\r\nSVC --&gt; DB[(Postgres)]\r\nSVC -. cache .-&gt; R[(Redis)]\"></div>\r\n\r\n            <h3 class=\"ex-h\">Node shapes cheat sheet</h3>\r\n            <div class=\"ex\" data-md=\"```\r\nA[rectangle]      — service / component\r\nB(rounded)        — soft component\r\nC[[stadium]]      — endpoint\r\nD[[subroutine]]   — internal job\r\nE[(database)]     — datastore\r\nF((circle))       — actor / client\r\nG{decision}       — branch\r\nH{{hexagon}}      — gateway\r\nI&gt;flag]          — note / event\r\n```\"></div>\r\n\r\n            <h3 class=\"ex-h\">Edge styles</h3>\r\n            <div class=\"ex diagram-ex\" data-mermaid=\"flowchart LR\r\nA --&gt; B\r\nB --&gt;|labelled| C\r\nC -.-&gt; D\r\nD ==&gt; E\r\nE --x F\r\nF --o G\"></div>\r\n\r\n            <h3 class=\"ex-h\">Subgraph (cluster)</h3>\r\n            <div class=\"ex diagram-ex\" data-mermaid=\"flowchart LR\r\nClient((Client)) --&gt; API\r\nsubgraph DataPlane\r\n  API[API Gateway] --&gt; SVC[Service]\r\n  SVC --&gt; PG[(Postgres)]\r\nend\r\nsubgraph Async\r\n  SVC --&gt; SQS[(SQS)]\r\n  SQS --&gt; W[Worker]\r\nend\"></div>\r\n\r\n            <h3 class=\"ex-h\">Sequence diagram</h3>\r\n            <div class=\"ex diagram-ex\" data-mermaid=\"sequenceDiagram\r\nparticipant C as Client\r\nparticipant API\r\nparticipant DB as Postgres\r\nC-&gt;&gt;API: GET /price\r\nAPI-&gt;&gt;DB: SELECT ...\r\nDB--&gt;&gt;API: rows\r\nAPI-&gt;&gt;C: JSON\"></div>\r\n\r\n            <h3 class=\"ex-h\">ER diagram</h3>\r\n            <div class=\"ex diagram-ex\" data-mermaid=\"erDiagram\r\nUSER ||--o{ SUBSCRIPTION : has\r\nPRODUCT ||--o{ SUBSCRIPTION : tracked_in\r\nPRODUCT ||--o{ PRICE : history\"></div>\r\n\r\n            <h3 class=\"ex-h\">Styling specific nodes</h3>\r\n            <div class=\"ex diagram-ex\" data-mermaid=\"flowchart LR\r\nA[Service] --&gt; B[(DB)]\r\nB --&gt; C[(Cache)]\r\nclassDef store fill:#fef3c7,stroke:#b45309,color:#78350f;\r\nclass B,C store;\"></div>\r\n        </section>\r\n\r\n        <!-- TIPS -->\r\n        <section class=\"guide-section\" id=\"tips\">\r\n            <h2>Authoring tips</h2>\r\n            <ul class=\"tips\">\r\n                <li>Keep one idea per bullet; use sub-bullets for sub-arguments.</li>\r\n                <li>Bold the verdict: <code>**GOOD**</code>, <code>**BAD**</code>, <code>**GREAT**</code>.</li>\r\n                <li>Quote your math inline with backticks: <code>`5 * 10^13`</code> reads cleaner than raw text.</li>\r\n                <li>Use a <strong>trade-off table</strong> when comparing 3+ approaches.</li>\r\n                <li>For each architecture iteration, add a <em>new</em> Diagram section so the evolution is preserved.</li>\r\n                <li>Paste screenshots directly — handy for whiteboard photos or diagrams from other tools.</li>\r\n            </ul>\r\n        </section>\r\n\r\n    </main>";

marked.setOptions({ gfm: true, breaks: false });

export function HldMarkdownGuide() {
  const rootRef = useRef(null);
  const [mermaidReady, setMermaidReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.mermaid) {
      initializeMermaid();
      setMermaidReady(true);
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !mermaidReady || root.dataset.rendered === "true") return;
    root.dataset.rendered = "true";

    initializeMermaid();

    root.querySelectorAll(".ex").forEach(async (host) => {
      const isMermaid = host.classList.contains("diagram-ex");
      const src = decode(isMermaid ? host.dataset.mermaid : host.dataset.md);
      const wrap = document.createElement("div");
      wrap.className = "ex-grid";

      const left = document.createElement("div");
      left.className = "ex-source";
      const leftHead = document.createElement("div");
      leftHead.className = "ex-label";
      leftHead.innerHTML = '<span>Source</span><button class="ex-copy" type="button">Copy</button>';
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.className = isMermaid ? "language-mermaid" : "language-markdown";
      code.textContent = src;
      pre.appendChild(code);
      left.appendChild(leftHead);
      left.appendChild(pre);

      const right = document.createElement("div");
      right.className = "ex-rendered";
      const rightHead = document.createElement("div");
      rightHead.className = "ex-label";
      rightHead.innerHTML = "<span>Rendered</span>";
      const target = document.createElement("div");
      target.className = isMermaid ? "diagram-wrap" : "prose";

      if (isMermaid) {
        try {
          const id = `gmd-${Math.random().toString(36).slice(2)}`;
          const { svg } = await window.mermaid.render(id, src);
          target.innerHTML = svg;
        } catch (error) {
          target.innerHTML = `<pre style="color:#b91c1c">Diagram error: ${escapeHtml(error?.message || String(error))}</pre>`;
        }
      } else {
        target.innerHTML = marked.parse(src || "");
        target.querySelectorAll("pre code").forEach((block) => {
          try { hljs.highlightElement(block); } catch {}
        });
      }

      right.appendChild(rightHead);
      right.appendChild(target);
      wrap.appendChild(left);
      wrap.appendChild(right);
      host.replaceWith(wrap);

      leftHead.querySelector(".ex-copy")?.addEventListener("click", () => {
        navigator.clipboard.writeText(src).then(() => {
          const button = leftHead.querySelector(".ex-copy");
          if (!button) return;
          const previous = button.textContent;
          button.textContent = "Copied ?";
          window.setTimeout(() => { button.textContent = previous; }, 1200);
        });
      });
    });

    const toc = root.querySelector("#guide-toc-list");
    if (!toc) return;
    root.querySelectorAll(".guide-section").forEach((section) => {
      const heading = section.querySelector("h2");
      if (!heading) return;
      const link = document.createElement("a");
      link.href = `#${section.id}`;
      link.textContent = heading.textContent;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${section.id}`);
      });
      toc.appendChild(link);
    });

    const sections = Array.from(root.querySelectorAll(".guide-section"));
    const links = Array.from(toc.querySelectorAll("a"));
    function onScroll() {
      const top = window.scrollY + 130;
      let active = sections[0];
      for (const section of sections) {
        if (section.offsetTop <= top) active = section;
        else break;
      }
      if (!active) return;
      links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${active.id}`));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [mermaidReady]);

  return (
    <>
      <Script
        src={MERMAID_SRC}
        strategy="afterInteractive"
        onLoad={() => {
          initializeMermaid();
          setMermaidReady(true);
        }}
      />
      <div ref={rootRef} className="guide" dangerouslySetInnerHTML={{ __html: GUIDE_INNER_HTML }} />
    </>
  );
}

function decode(value = "") {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
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
