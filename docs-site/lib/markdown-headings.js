export function extractMarkdownHeadings(markdown, { maxDepth = 6 } = {}) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const headings = [];
  const used = new Map();
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const level = match[1].length;
    if (level > maxDepth) continue;

    const rawTitle = normalizeHeadingTitle(match[2]);
    const title = stripMarkdownMarkup(rawTitle);
    const id = makeUniqueHeadingId(title, `section-${headings.length + 1}`, used);

    headings.push({ id, level, rawTitle, title });
  }

  return headings;
}

export function stripMarkdownMarkup(value) {
  return String(value || "")
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeadingTitle(value) {
  return String(value || "")
    .replace(/\s+#+\s*$/g, "")
    .trim();
}

function makeUniqueHeadingId(title, fallback, used) {
  const base = slugify(title) || fallback || "section";
  const count = used.get(base) || 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
