import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractMarkdownHeadings, stripMarkdownMarkup } from "./markdown-headings.js";

const VALID_ID = /^[a-z0-9][a-z0-9-]*$/;

export async function listMarkdownDocs({ contentDir, titleOverrides = new Map() }) {
  const sources = await listMarkdownDocSources(contentDir);
  const docs = [];

  for (const source of sources) {
    const doc = await readMarkdownDocFile({ ...source, titleOverrides });
    if (!doc) continue;

    docs.push({
      id: doc.id,
      title: doc.title,
      summary: doc.summary,
      usedIn: doc.usedIn,
      order: doc.order,
      updated_at: doc.updated_at,
      created_at: doc.created_at,
      sectionCount: doc.sectionCount
    });
  }

  return docs.sort((a, b) => {
    const orderCompare = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
    if (orderCompare !== 0) return orderCompare;
    return a.title.localeCompare(b.title, undefined, { numeric: true });
  });
}

export async function getMarkdownDoc({ contentDir, id, titleOverrides = new Map() }) {
  if (!isValidId(id)) return null;

  const source = await findMarkdownDocSource({ contentDir, id, titleOverrides });
  return source?.doc || null;
}

export async function readMarkdownDocSource({ contentDir, id, titleOverrides = new Map() }) {
  if (!isValidId(id)) return null;

  const source = await findMarkdownDocSource({ contentDir, id, titleOverrides });
  if (!source) return null;

  const raw = await readFile(source.filePath, "utf8");
  return {
    id: source.doc.id,
    fileName: path.relative(contentDir, source.filePath).replace(/\\/g, "/"),
    markdown: raw
  };
}

export async function updateMarkdownDocSource({ contentDir, id, markdown, titleOverrides = new Map() }) {
  if (!isValidId(id)) return null;

  const source = await findMarkdownDocSource({ contentDir, id, titleOverrides });
  if (!source) return null;

  const normalized = normalizeMarkdownSource(markdown);
  validateMarkdownDocId(id, normalized, source.id);
  await writeFile(source.filePath, normalized, "utf8");
  return getMarkdownDoc({ contentDir, id, titleOverrides });
}

async function findMarkdownDocSource({ contentDir, id, titleOverrides }) {
  const sources = await listMarkdownDocSources(contentDir);

  for (const source of sources) {
    const doc = await readMarkdownDocFile({ ...source, titleOverrides });
    if (doc?.id === id) return { ...source, doc };
  }

  return null;
}

async function listMarkdownDocSources(contentDir) {
  const entries = (await readdir(contentDir, { withFileTypes: true }).catch(() => []))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  const sources = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const id = idFromPathName(entry.name);
      if (!isValidId(id)) continue;

      const filePath = path.join(contentDir, entry.name, "index.md");
      if (!(await isFile(filePath))) continue;

      sources.push({ id, filePath });
      continue;
    }

    if (!entry.isFile() || path.extname(entry.name) !== ".md") continue;

    const id = idFromPathName(entry.name);
    if (!isValidId(id)) continue;

    sources.push({
      id,
      filePath: path.join(contentDir, entry.name)
    });
  }

  return sources;
}

async function readMarkdownDocFile({ id: fallbackId, filePath, titleOverrides }) {
  try {
    const [raw, meta] = await Promise.all([
      readFile(filePath, "utf8"),
      stat(filePath)
    ]);
    const { data, content } = parseFrontmatter(raw);
    const body = content.trim();
    const headings = extractMarkdownHeadings(body);
    const firstHeading = headings.find((heading) => heading.level === 1);
    const frontmatterId = slugify(stringValue(data.slug) || stringValue(data.id));
    const id = isValidId(frontmatterId) ? frontmatterId : fallbackId;
    const title = stringValue(data.title) || firstHeading?.title || titleFromId(id, titleOverrides);
    const summary = stringValue(data.summary) || extractSummary(body);
    const usedIn = normalizeStringList(data.usedIn || data.usedin || data.used_in || data["used-in"]);
    const sectionCount = headings.filter((heading) => heading.level <= 2).length || headings.length;

    return {
      id,
      title,
      summary,
      usedIn,
      body,
      headings,
      order: numberValue(data.order),
      sectionCount,
      created_at: meta.birthtime?.toISOString?.() || "",
      updated_at: meta.mtime?.toISOString?.() || ""
    };
  } catch {
    return null;
  }
}

function normalizeMarkdownSource(markdown) {
  const normalized = String(markdown || "").replace(/\r\n/g, "\n");
  return normalized.endsWith("\n") ? normalized : `${normalized}\n`;
}

function validateMarkdownDocId(id, markdown, fallbackId) {
  const { data } = parseFrontmatter(markdown);
  const frontmatterId = slugify(stringValue(data.slug) || stringValue(data.id));
  const nextId = isValidId(frontmatterId) ? frontmatterId : fallbackId;

  if (nextId !== id) {
    const error = new Error(`Frontmatter slug must remain "${id}" for this page.`);
    error.status = 400;
    throw error;
  }
}

function parseFrontmatter(raw) {
  const content = String(raw || "").replace(/\r\n/g, "\n").replace(/^(?:[ \t]*\n)+/, "");
  if (!content.startsWith("---\n")) return { data: {}, content };

  const end = content.indexOf("\n---", 4);
  if (end === -1) return { data: {}, content };

  const frontmatter = content.slice(4, end).trim();
  const markdown = content.slice(end + 4).replace(/^\n+/, "");
  return { data: parseSimpleYaml(frontmatter), content: markdown };
}

function parseSimpleYaml(source) {
  const data = {};
  const lines = String(source || "").split("\n");
  let currentKey = "";

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(cleanYamlScalar(listItem[1]));
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;

    currentKey = pair[1];
    const value = pair[2].trim();
    if (!value) {
      data[currentKey] = [];
    } else if (value.startsWith("[") && value.endsWith("]")) {
      data[currentKey] = value
        .slice(1, -1)
        .split(",")
        .map((item) => cleanYamlScalar(item))
        .filter(Boolean);
    } else {
      data[currentKey] = cleanYamlScalar(value);
    }
  }

  return data;
}

function cleanYamlScalar(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function extractSummary(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const paragraph = [];
  let inFence = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^(`{3,}|~{3,})/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;
    if (!trimmed && paragraph.length > 0) break;
    if (!trimmed || /^-{3,}$/.test(trimmed) || /^\[[^\]]+]:/.test(trimmed)) continue;
    if (/^#{1,6}\s+/.test(trimmed)) {
      if (paragraph.length > 0) break;
      continue;
    }

    paragraph.push(trimmed);
  }

  return truncate(stripMarkdownMarkup(paragraph.join(" ")), 220);
}

function truncate(value, maxLength) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function titleFromId(id, titleOverrides) {
  const override = titleOverrides.get(id);
  if (override) return override;

  return String(id || "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => titleOverrides.get(part) || part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function isFile(filePath) {
  try {
    const meta = await stat(filePath);
    return meta.isFile();
  } catch {
    return false;
  }
}

function idFromPathName(name) {
  return slugify(path.basename(name, path.extname(name)));
}

function slugify(value) {
  return String(value || "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidId(id) {
  return typeof id === "string" && VALID_ID.test(id);
}
