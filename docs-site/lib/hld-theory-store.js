import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { extractMarkdownHeadings, stripMarkdownMarkup } from "./markdown-headings.js";

const HLD_THEORY_DIR = path.join(process.cwd(), "content", "hld", "theory");
const VALID_ID = /^[a-z0-9][a-z0-9-]*$/;
const TITLE_OVERRIDES = new Map([
  ["api", "API"],
  ["apis", "APIs"],
  ["cdn", "CDN"],
  ["clickhouse", "ClickHouse"],
  ["db", "DB"],
  ["hld", "HLD"],
  ["http", "HTTP"],
  ["olap", "OLAP"],
  ["oltp", "OLTP"],
  ["sql", "SQL"]
]);

export async function listHldTheoryDocs() {
  const entries = await readdir(HLD_THEORY_DIR, { withFileTypes: true }).catch(() => []);
  const docs = [];

  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name) !== ".md") continue;

    const id = idFromFileName(entry.name);
    if (!isValidId(id)) continue;

    const doc = await readHldTheoryDocFile(id, entry.name);
    if (!doc) continue;

    docs.push({
      id: doc.id,
      title: doc.title,
      summary: doc.summary,
      source: "theory",
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

export async function getHldTheoryDoc(id) {
  if (!isValidId(id)) return null;

  const entries = await readdir(HLD_THEORY_DIR, { withFileTypes: true }).catch(() => []);
  const entry = entries.find((candidate) => (
    candidate.isFile() &&
    path.extname(candidate.name) === ".md" &&
    idFromFileName(candidate.name) === id
  ));

  if (!entry) return null;
  return readHldTheoryDocFile(id, entry.name);
}

async function readHldTheoryDocFile(id, fileName) {
  const filePath = path.join(HLD_THEORY_DIR, fileName);

  try {
    const [raw, meta] = await Promise.all([
      readFile(filePath, "utf8"),
      stat(filePath)
    ]);
    const { data, content } = parseFrontmatter(raw);
    const body = content.trim();
    const headings = extractMarkdownHeadings(body);
    const title = stringValue(data.title) || titleFromId(id);
    const summary = stringValue(data.summary) || extractSummary(body);
    const sectionCount = headings.filter((heading) => heading.level <= 2).length || headings.length;

    return {
      id,
      title,
      summary,
      body,
      headings,
      source: "theory",
      order: numberValue(data.order),
      sectionCount,
      created_at: meta.birthtime?.toISOString?.() || "",
      updated_at: meta.mtime?.toISOString?.() || ""
    };
  } catch {
    return null;
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

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;

    data[pair[1]] = cleanYamlScalar(pair[2]);
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

function titleFromId(id) {
  const override = TITLE_OVERRIDES.get(id);
  if (override) return override;

  return String(id || "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => TITLE_OVERRIDES.get(part) || part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function idFromFileName(fileName) {
  return slugify(path.basename(fileName, path.extname(fileName)));
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
