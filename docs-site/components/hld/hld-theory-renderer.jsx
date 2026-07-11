"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, BookOpenText, Edit3, FileText } from "lucide-react";
import hljs from "highlight.js";
import { marked } from "marked";
import { extractMarkdownHeadings } from "../../lib/markdown-headings.js";
import { useLiveDocument } from "./use-live-document";

marked.setOptions({ gfm: true, breaks: false });

const hldTheme = {
  "--hld-bg": "var(--site-bg)",
  "--hld-surface": "var(--site-surface)",
  "--hld-surface-2": "var(--site-surface-2)",
  "--hld-heading": "var(--site-heading)",
  "--hld-text": "var(--site-text)",
  "--hld-muted": "var(--site-muted)",
  "--hld-border": "var(--site-border)",
  "--hld-brand": "var(--site-brand)",
  "--hld-brand-soft": "var(--site-brand-soft)",
  "--hld-code-bg": "var(--site-code-bg)"
};

export function HldTheoryRenderer({ doc, label = "Theory", editHref = "", liveUrl = "", assetBaseUrl = "" }) {
  const renderedDoc = useLiveDocument(doc, {
    enabled: Boolean(liveUrl),
    url: liveUrl
  });

  return (
    <article style={hldTheme} className="min-w-0 space-y-4 text-[var(--hld-text)]">
      <header
        id="overview"
        className="scroll-mt-24 rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                <BookOpenText size={14} aria-hidden="true" />
                {label}
              </div>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-[var(--hld-heading)]">
                {renderedDoc.title}
              </h1>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/hld"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)]"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                HLD
              </Link>
              {editHref ? (
                <Link
                  href={editHref}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--hld-border)] bg-[var(--hld-surface)] px-3 text-sm font-semibold text-[var(--hld-heading)] transition hover:border-[var(--hld-brand)] hover:bg-[var(--hld-surface-2)]"
                >
                  <Edit3 size={15} aria-hidden="true" />
                  Edit
                </Link>
              ) : null}
            </div>
          </div>

          {renderedDoc.summary && (
            <div className="mt-5 border-t border-[var(--hld-border)] pt-5">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--hld-brand)]">
                <FileText size={14} aria-hidden="true" />
                Overview
              </div>
              <p className="mt-2 max-w-4xl text-base leading-7 text-[var(--hld-muted)]">
                {renderedDoc.summary}
              </p>
            </div>
          )}
        </div>
      </header>

      <section className="rounded-lg border border-[var(--hld-border)] bg-[var(--hld-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6">
        {renderedDoc.body ? (
          <TheoryMarkdown assetBaseUrl={assetBaseUrl} body={renderedDoc.body} docId={renderedDoc.id} />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--hld-border)] bg-[var(--hld-surface-2)] p-8 text-center text-sm font-medium text-[var(--hld-muted)]">
            No content added yet.
          </div>
        )}
      </section>
    </article>
  );
}

function TheoryMarkdown({ body, assetBaseUrl = "", docId = "" }) {
  const parsed = useMemo(() => parseTheoryStructuredBlocks(body || ""), [body]);

  if (parsed.hasStructuredBlocks) {
    return (
      <div className="grid gap-4">
        {parsed.blocks.map((block, index) => (
          <TheoryStructuredBlock
            key={`${block.type}-${index}`}
            assetBaseUrl={assetBaseUrl}
            block={block}
            docId={docId}
          />
        ))}
      </div>
    );
  }

  return <TheoryMarkdownBlock assetBaseUrl={assetBaseUrl} body={body} docId={docId} />;
}

function TheoryStructuredBlock({ block, assetBaseUrl, docId }) {
  if (block.type === "sideBySide") {
    return (
      <div className="hld-side-by-side grid min-w-0 gap-4 xl:grid-cols-2">
        <div className="min-w-0">
          {block.left ? <TheoryMarkdownBlock assetBaseUrl={assetBaseUrl} body={block.left} docId={docId} /> : null}
        </div>
        <div className="min-w-0">
          {block.right ? <TheoryMarkdownBlock assetBaseUrl={assetBaseUrl} body={block.right} docId={docId} /> : null}
        </div>
      </div>
    );
  }

  if (block.type === "separator") {
    return <div className="hld-content-separator" aria-hidden="true" />;
  }

  return <TheoryMarkdownBlock assetBaseUrl={assetBaseUrl} body={block.body} docId={docId} />;
}

function TheoryMarkdownBlock({ body, assetBaseUrl = "", docId = "" }) {
  const ref = useRef(null);
  const html = useMemo(() => {
    const markdown = rewriteRelativeImageRefs(body || "", { assetBaseUrl, docId });
    return marked.parse(addHeadingAnchors(markdown));
  }, [assetBaseUrl, body, docId]);

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

  return <div ref={ref} className="hld-course-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

function parseTheoryStructuredBlocks(body) {
  const lines = splitLines(body);
  const blocks = [];
  const markdownLines = [];
  let hasStructuredBlocks = false;
  let inFence = false;

  function flushMarkdown() {
    const markdown = markdownLines.join("\n").trim();
    if (markdown) blocks.push({ type: "markdown", body: markdown });
    markdownLines.length = 0;
  }

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const marker = !inFence ? getStructuredMarker(line) : "";

    if (marker === "SIDEBYSIDE") {
      flushMarkdown();
      const collected = collectUntilMarker(lines, index + 1, "END-SIDEBYSIDE");
      blocks.push({ type: "sideBySide", ...parseSideBySideContent(collected.body) });
      hasStructuredBlocks = true;
      index = collected.nextIndex;
      continue;
    }

    if (marker === "LEFT") {
      flushMarkdown();
      const collected = collectImplicitSideBySide(lines, index);
      blocks.push({ type: "sideBySide", ...parseSideBySideContent(collected.body) });
      hasStructuredBlocks = true;
      index = collected.nextIndex;
      continue;
    }

    if (marker === "SEPERATOR") {
      flushMarkdown();
      blocks.push({ type: "separator" });
      hasStructuredBlocks = true;
      index += 1;
      continue;
    }

    markdownLines.push(line);
    if (isFenceLine(line)) inFence = !inFence;
    index += 1;
  }

  flushMarkdown();
  return { blocks, hasStructuredBlocks };
}

function rewriteRelativeImageRefs(markdown, { assetBaseUrl, docId }) {
  if (!assetBaseUrl) return markdown;

  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  let inFence = false;

  return lines
    .map((line) => {
      if (/^\s*(`{3,}|~{3,})/.test(line)) {
        inFence = !inFence;
        return line;
      }

      if (inFence) return line;

      return line.replace(/(!\[[^\]]*]\()([^)]+)(\))/g, (match, prefix, target, suffix) => {
        const parsed = parseMarkdownImageTarget(target);
        if (!parsed || !shouldRewriteImageUrl(parsed.url)) return match;

        const { assetPath, urlSuffix } = splitAssetUrl(parsed.url);
        const normalizedAsset = normalizeImageAssetPath(assetPath, docId);
        if (!normalizedAsset) return match;

        const encodedAsset = normalizedAsset.split("/").map(encodeURIComponent).join("/");
        return `${prefix}${assetBaseUrl}/${encodedAsset}${urlSuffix}${parsed.title}${suffix}`;
      });
    })
    .join("\n");
}

function parseMarkdownImageTarget(target) {
  const raw = String(target || "").trim();
  if (!raw) return null;

  const angle = raw.match(/^<([^>]+)>(.*)$/);
  if (angle) {
    return {
      url: angle[1].trim(),
      title: angle[2] || ""
    };
  }

  const parts = raw.match(/^(\S+)(\s+.+)?$/);
  if (!parts) return null;

  return {
    url: parts[1],
    title: parts[2] || ""
  };
}

function shouldRewriteImageUrl(url) {
  const value = String(url || "").trim();
  return Boolean(
    value &&
    !value.startsWith("/") &&
    !value.startsWith("#") &&
    !value.startsWith("//") &&
    !/^[a-z][a-z0-9+.-]*:/i.test(value)
  );
}

function splitAssetUrl(url) {
  const match = String(url || "").match(/^([^?#]*)([?#].*)?$/);
  return {
    assetPath: match?.[1] || "",
    urlSuffix: match?.[2] || ""
  };
}

function normalizeImageAssetPath(assetPath, docId) {
  let normalized = String(assetPath || "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .split("/")
    .filter(Boolean)
    .join("/");

  if (docId && normalized.startsWith(`${docId}/`)) {
    normalized = normalized.slice(docId.length + 1);
  }

  if (
    !normalized ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    return "";
  }

  return normalized;
}

function parseSideBySideContent(body) {
  const lines = splitLines(body);
  const leftLines = [];
  const rightLines = [];
  let target = "";
  let inFence = false;

  lines.forEach((line) => {
    const marker = !inFence ? getStructuredMarker(line) : "";

    if (marker === "LEFT") {
      target = "left";
      return;
    }

    if (marker === "END-LEFT") {
      if (target === "left") target = "";
      return;
    }

    if (marker === "RIGHT") {
      target = "right";
      return;
    }

    if (marker === "END-RIGHT") {
      if (target === "right") target = "";
      return;
    }

    if (target === "left") leftLines.push(line);
    if (target === "right") rightLines.push(line);
    if (isFenceLine(line)) inFence = !inFence;
  });

  return {
    left: leftLines.join("\n").trim(),
    right: rightLines.join("\n").trim()
  };
}

function collectImplicitSideBySide(lines, startIndex) {
  const collected = [];
  let inFence = false;
  let sawRight = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    const marker = !inFence ? getStructuredMarker(line) : "";
    collected.push(line);

    if (marker === "RIGHT") sawRight = true;
    if (marker === "END-RIGHT" && sawRight) {
      return { body: collected.join("\n").trim(), nextIndex: index + 1 };
    }

    if (isFenceLine(line)) inFence = !inFence;
  }

  return { body: collected.join("\n").trim(), nextIndex: lines.length };
}

function collectUntilMarker(lines, startIndex, endMarker) {
  const collected = [];
  let inFence = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    const marker = !inFence ? getStructuredMarker(line) : "";

    if (marker === endMarker) {
      return { body: collected.join("\n").trim(), nextIndex: index + 1 };
    }

    collected.push(line);
    if (isFenceLine(line)) inFence = !inFence;
  }

  return { body: collected.join("\n").trim(), nextIndex: lines.length };
}

function getStructuredMarker(line) {
  const match = String(line || "").trim().match(/^::([A-Z-]+)::$/i);
  return match ? match[1].toUpperCase() : "";
}

function isFenceLine(line) {
  return /^(```|~~~)/.test(String(line || "").trim());
}

function splitLines(value) {
  return String(value || "").replace(/\r\n/g, "\n").split("\n");
}

function addHeadingAnchors(markdown) {
  const headings = extractMarkdownHeadings(markdown);
  let headingIndex = 0;
  let inFence = false;

  return String(markdown || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      if (/^\s*(`{3,}|~{3,})/.test(line)) {
        inFence = !inFence;
        return line;
      }

      if (inFence) return line;

      const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (!match) return line;

      const heading = headings[headingIndex];
      headingIndex += 1;
      if (!heading) return line;

      const depth = match[1].length;
      const inner = marked.parseInline(heading.rawTitle);
      return `<h${depth} id="${escapeAttribute(heading.id)}" class="scroll-mt-24">${inner}</h${depth}>`;
    })
    .join("\n");
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
