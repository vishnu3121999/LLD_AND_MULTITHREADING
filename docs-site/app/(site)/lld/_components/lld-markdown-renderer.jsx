"use client";

import { useEffect, useMemo, useRef } from "react";
import hljs from "highlight.js";
import { marked } from "marked";
import { extractMarkdownHeadings } from "../../../../lib/markdown-headings.js";

marked.setOptions({ gfm: true, breaks: false });

const markdownTheme = {
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

export function LldMarkdownRenderer({ body, assetBaseUrl = "", docId = "" }) {
  const parsed = useMemo(() => parseStructuredBlocks(body || ""), [body]);

  if (parsed.hasStructuredBlocks) {
    return (
      <div style={markdownTheme} className="grid gap-4">
        {parsed.blocks.map((block, index) => (
          <StructuredBlock
            key={`${block.type}-${index}`}
            assetBaseUrl={assetBaseUrl}
            block={block}
            docId={docId}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={markdownTheme}>
      <MarkdownBlock assetBaseUrl={assetBaseUrl} body={body} docId={docId} />
    </div>
  );
}

function StructuredBlock({ block, assetBaseUrl, docId }) {
  if (block.type === "sideBySide") {
    return (
      <div className="hld-side-by-side grid min-w-0 gap-4 xl:grid-cols-2">
        <div className="min-w-0">
          {block.left ? <MarkdownBlock assetBaseUrl={assetBaseUrl} body={block.left} docId={docId} /> : null}
        </div>
        <div className="min-w-0">
          {block.right ? <MarkdownBlock assetBaseUrl={assetBaseUrl} body={block.right} docId={docId} /> : null}
        </div>
      </div>
    );
  }

  if (block.type === "separator") {
    return <div className="hld-content-separator" aria-hidden="true" />;
  }

  return <MarkdownBlock assetBaseUrl={assetBaseUrl} body={block.body} docId={docId} />;
}

function MarkdownBlock({ body, assetBaseUrl = "", docId = "" }) {
  const ref = useRef(null);
  const html = useMemo(() => {
    const markdown = rewriteRelativeImageRefs(body || "", { assetBaseUrl, docId });
    return marked.parse(formatLldNotes(addHeadingAnchors(markdown)));
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

function parseStructuredBlocks(body) {
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

    if (marker === "SEPERATOR" || marker === "SEPARATOR") {
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

function formatLldNotes(body) {
  const lines = splitLines(body);
  const output = [];
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (isFenceLine(line)) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (!inFence) {
      const quoteNote = parseQuotedNoteLine(line);
      if (quoteNote) {
        const noteLines = quoteNote.inline ? [quoteNote.inline] : [];
        index += 1;

        while (index < lines.length) {
          const quoted = lines[index].match(/^\s*>\s?(.*)$/);
          if (!quoted) break;
          noteLines.push(quoted[1]);
          index += 1;
        }

        index -= 1;
        output.push(renderLldNoteHtml(noteLines.join("\n").trim()));
        continue;
      }

      const note = parseNoteLine(line);
      if (note) {
        const noteLines = note.inline ? [note.inline] : [];

        if (!note.inline) {
          index += 1;
          while (index < lines.length) {
            const next = lines[index];
            const nextTrimmed = next.trim();
            if (!nextTrimmed || /^#{1,6}\s+/.test(nextTrimmed) || parseNoteLine(next)) break;
            noteLines.push(next);
            index += 1;
          }
          index -= 1;
        }

        output.push(renderLldNoteHtml(noteLines.join("\n").trim()));
        continue;
      }
    }

    output.push(line);
  }

  return output.join("\n");
}

function parseQuotedNoteLine(line) {
  const quoted = String(line || "").match(/^\s*>\s?(.*)$/);
  if (!quoted) return null;
  return parseNoteLine(quoted[1]);
}

function parseNoteLine(line) {
  const cleaned = String(line || "").trim();
  if (!cleaned) return null;

  const callout = cleaned.match(/^\[!NOTE]\s*(.*)$/i);
  if (callout) return { inline: callout[1].trim() };

  const boldColon = cleaned.match(/^\*\*NOTE\s*[:-]\s*\*\*\s*(.*)$/i);
  if (boldColon) return { inline: boldColon[1].trim() };

  const boldThenColon = cleaned.match(/^\*\*NOTE\*\*\s*[:-]\s*(.*)$/i);
  if (boldThenColon) return { inline: boldThenColon[1].trim() };

  const plain = cleaned.match(/^NOTE\s*[:-]\s*(.*)$/i);
  if (plain) return { inline: plain[1].trim() };

  if (/^(?:\*\*)?NOTE(?:\*\*)?$/i.test(cleaned)) return { inline: "" };

  return null;
}

function renderLldNoteHtml(body) {
  const noteBody = body || "Note";
  return [
    '<aside class="hld-note-callout">',
    '<div class="hld-note-label">NOTE</div>',
    `<div class="hld-note-content">${marked.parse(noteBody)}</div>`,
    "</aside>"
  ].join("");
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

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
