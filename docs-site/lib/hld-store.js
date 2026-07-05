import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const HLD_DATA_DIR = path.join(process.cwd(), "content", "hld", "problems");
const VALID_ID = /^[a-z0-9][a-z0-9-]*$/;
const IMAGE_EXTENSIONS = new Set([".apng", ".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const TEXT_PROBLEM_META = {
  camelcamelcamel: {
    title: "Design CamelCamelCamel",
    summary: "Price history, product crawling, and price-drop notifications for a large-scale commerce tracking system.",
    tags: ["Price tracking", "Notifications", "Crawling"]
  },
  googlenews: {
    title: "Design Google News",
    summary: "Regional news feed aggregation with low-latency infinite scroll, publisher ingestion, and feed caching.",
    tags: ["Feed", "Aggregation", "Caching"]
  }
};

let writeQueue = Promise.resolve();

export async function listHldProblems() {
  await ensureHldDataDir();
  const entries = await readdir(HLD_DATA_DIR, { withFileTypes: true }).catch(() => []);
  const problems = new Map();

  for (const entry of entries) {
    let id = "";
    let problem = null;

    if (entry.isDirectory()) {
      id = entry.name;
      problem = await readDirectoryHldProblem(id);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (ext !== ".json" && ext !== ".md" && ext !== ".txt") continue;

      id = entry.name.slice(0, -ext.length);
      if (ext === ".json") {
        problem = await readHldProblemFile(id);
      } else if (ext === ".md") {
        problem = await readMarkdownHldProblemFile(id);
      } else {
        problem = await readTextHldProblemFile(id);
      }
    }

    if (!problem) continue;

    problems.set(problem.id || id, {
      id: problem.id || id,
      title: problem.title || "Untitled",
      summary: problem.summary || "",
      tags: Array.isArray(problem.tags) ? problem.tags : [],
      source: problem.source || "json",
      updated_at: problem.updated_at || "",
      created_at: problem.created_at || "",
      sectionCount: countSections(problem.sections),
      imageCount: Array.isArray(problem.images) ? problem.images.length : 0
    });
  }

  return Array.from(problems.values()).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
}

export async function getHldProblem(id) {
  if (!isValidId(id)) return null;
  return (
    (await readDirectoryHldProblem(id)) ||
    (await readHldProblemFile(id)) ||
    (await readMarkdownHldProblemFile(id)) ||
    (await readTextHldProblemFile(id)) ||
    findHldProblemByPublicId(id)
  );
}

export async function createHldProblem(payload) {
  return enqueueWrite(async () => {
    await ensureHldDataDir();
    const normalized = normalizeHldProblem(payload);
    const base = slugify(normalized.title) || randomUUID().slice(0, 8);
    let id = base;
    let suffix = 2;

    while (await fileExists(problemPath(id))) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }

    const now = isoNow();
    const problem = {
      ...normalized,
      id,
      created_at: now,
      updated_at: now
    };

    await writeHldProblemFile(problem);
    return problem;
  });
}

export async function updateHldProblem(id, payload) {
  if (!isValidId(id)) return null;

  return enqueueWrite(async () => {
    const existing = await readHldProblemFile(id);
    if (!existing) return null;

    const normalized = normalizeHldProblem(payload);
    const problem = {
      ...normalized,
      id,
      created_at: existing.created_at || isoNow(),
      updated_at: isoNow()
    };

    await writeHldProblemFile(problem);
    return problem;
  });
}

export async function deleteHldProblem(id) {
  if (!isValidId(id)) return false;

  return enqueueWrite(async () => {
    const target = problemPath(id);
    if (!(await fileExists(target))) return false;
    await unlink(target);
    return true;
  });
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeHldProblem(payload = {}) {
  const title = String(payload.title || "").trim();
  if (!title) {
    const error = new Error("title is required");
    error.status = 400;
    throw error;
  }

  return {
    title,
    summary: String(payload.summary || "").trim(),
    tags: normalizeTags(payload.tags),
    sections: Array.isArray(payload.sections) ? payload.sections.map(normalizeSection) : []
  };
}

function normalizeSection(section = {}) {
  const type = ["markdown", "diagram", "deepdive"].includes(section.type) ? section.type : "markdown";
  const normalized = {
    type,
    title: String(section.title || defaultTitleForType(type)).trim()
  };

  if (type === "deepdive") {
    normalized.items = Array.isArray(section.items) ? section.items.map(normalizeSection) : [];
    return normalized;
  }

  normalized.body = String(section.body || "");
  if (type === "diagram") normalized.caption = String(section.caption || "");
  return normalized;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

function defaultTitleForType(type) {
  if (type === "diagram") return "New diagram";
  if (type === "deepdive") return "Deep Dives";
  return "New section";
}

function countSections(sections = []) {
  if (!Array.isArray(sections)) return 0;
  return sections.reduce((total, section) => {
    if (section?.type === "deepdive") return total + 1 + countSections(section.items);
    return total + 1;
  }, 0);
}

async function collectProblemImages(id, assetDir, assetId = id) {
  try {
    const imagesDir = path.join(assetDir, "images");
    const files = await collectImageFiles(imagesDir);
    const images = files.map((file) => {
      const ext = path.extname(file.relativePath);
      const basename = path.basename(file.relativePath, ext);
      const fileName = `images/${file.relativePath}`;
      const assetVersion = `${Math.trunc(file.mtimeMs || 0)}-${file.size || 0}`;

      return {
        fileName,
        src: `/api/hld/assets/${encodeURIComponent(assetId)}/${encodeURIComponent(fileName)}?v=${assetVersion}`,
        alt: titleFromId(basename.replace(/-(?:light|dark)$/i, "")),
        theme: parseImageTheme(basename)
      };
    });

    return images.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function collectImageFiles(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectImageFiles(rootDir, target));
      continue;
    }

    if (!entry.isFile() || !IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

    const relativePath = path.relative(rootDir, target).replace(/\\/g, "/");
    const fileStat = await stat(target);
    files.push({
      relativePath,
      directory: path.dirname(relativePath) === "." ? "" : path.dirname(relativePath),
      size: fileStat.size,
      mtimeMs: fileStat.mtimeMs
    });
  }

  return files;
}

function parseImageTheme(value) {
  const match = String(value || "").match(/-(light|dark)$/i);
  return match ? match[1].toLowerCase() : "";
}

async function readHldProblemFile(id, target = problemPath(id), assetDir = path.join(HLD_DATA_DIR, id), assetId = id) {
  if (!isValidId(id)) return null;

  try {
    const raw = await readFile(target, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const images = await collectProblemImages(id, assetDir, assetId);
    return {
      ...parsed,
      images,
      sections: parsed.sections || []
    };
  } catch {
    return null;
  }
}

async function readTextHldProblemFile(id, target = path.join(HLD_DATA_DIR, `${id}.txt`), assetDir = path.join(HLD_DATA_DIR, id), assetId = id) {
  if (!isValidId(id)) return null;

  try {
    const [raw, fileStat] = await Promise.all([
      readFile(target, "utf8"),
      stat(target)
    ]);
    const images = await collectProblemImages(id, assetDir, assetId);
    const meta = TEXT_PROBLEM_META[id] || {
      title: titleFromId(id),
      summary: "Solved high-level design problem.",
      tags: ["HLD"]
    };

    return {
      id,
      title: meta.title,
      summary: meta.summary,
      tags: meta.tags,
      source: "text",
      created_at: fileStat.birthtime.toISOString(),
      updated_at: fileStat.mtime.toISOString(),
      images,
      sections: parseTextProblemSections(repairCommonMojibake(raw))
    };
  } catch {
    return null;
  }
}

async function readMarkdownHldProblemFile(
  id,
  target = path.join(HLD_DATA_DIR, `${id}.md`),
  assetDir = path.join(HLD_DATA_DIR, id),
  assetId = id,
  options = {}
) {
  if (!isValidId(id)) return null;

  try {
    const [raw, fileStat] = await Promise.all([
      readFile(target, "utf8"),
      stat(target)
    ]);
    const images = await collectProblemImages(id, assetDir, assetId);
    const parsed = parseMarkdownProblem(raw, id);
    if (options.requireMatchingSlug && parsed.slug !== id) return null;

    const problemId = isValidId(parsed.id) ? parsed.id : id;

    const sections = parsed.sections.map((section) => ({
      ...section,
      body: rewriteMarkdownAssetRefs(section.body, assetId)
    }));

    return {
      id: problemId,
      title: parsed.title || titleFromId(id),
      summary: parsed.summary || "Solved high-level design problem.",
      tags: parsed.tags,
      source: "markdown",
      created_at: parsed.created_at || fileStat.birthtime.toISOString(),
      updated_at: parsed.updated_at || fileStat.mtime.toISOString(),
      images,
      sections
    };
  } catch {
    return null;
  }
}

async function findHldProblemByPublicId(id) {
  const entries = await readdir(HLD_DATA_DIR, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    let problem = null;

    if (entry.isDirectory()) {
      problem = await readDirectoryHldProblem(entry.name);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const fileId = entry.name.slice(0, -ext.length);
      if (ext === ".json") problem = await readHldProblemFile(fileId);
      if (ext === ".md") problem = await readMarkdownHldProblemFile(fileId);
      if (ext === ".txt") problem = await readTextHldProblemFile(fileId);
    }

    if (problem?.id === id) return problem;
  }

  return null;
}

async function readDirectoryHldProblem(id) {
  if (!isValidId(id)) return null;

  try {
    const dir = path.join(HLD_DATA_DIR, id);
    const entries = await readdir(dir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    const jsonFile = files.includes(`${id}.json`)
      ? `${id}.json`
      : files.find((file) => path.extname(file) === ".json");
    const markdownFile = files.includes("index.md")
      ? "index.md"
      : files.includes(`${id}.md`)
        ? `${id}.md`
        : files.find((file) => path.extname(file) === ".md");
    const textFile = files.includes(`${id}.txt`)
      ? `${id}.txt`
      : files.find((file) => path.extname(file) === ".txt");

    if (jsonFile) {
      return readHldProblemFile(id, path.join(dir, jsonFile), dir, id);
    }

    if (markdownFile) {
      return readDirectoryMarkdownHldProblemFile(id, path.join(dir, markdownFile), dir, id);
    }

    if (textFile) {
      return readTextHldProblemFile(id, path.join(dir, textFile), dir, id);
    }

    return null;
  } catch {
    return null;
  }
}

async function readDirectoryMarkdownHldProblemFile(id, target, assetDir, assetId) {
  const problem = await readMarkdownHldProblemFile(id, target, assetDir, assetId, { requireMatchingSlug: true });
  if (!problem) return null;
  return problem.id === id ? problem : null;
}

async function writeHldProblemFile(problem) {
  await ensureHldDataDir();
  await writeFile(problemPath(problem.id), `${JSON.stringify(problem, null, 2)}\n`, "utf8");
}

async function ensureHldDataDir() {
  await mkdir(HLD_DATA_DIR, { recursive: true });
}

async function fileExists(target) {
  try {
    await readFile(target);
    return true;
  } catch {
    return false;
  }
}

function problemPath(id) {
  return path.join(HLD_DATA_DIR, `${id}.json`);
}

function isValidId(id) {
  return typeof id === "string" && VALID_ID.test(id);
}

function isoNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function enqueueWrite(operation) {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.catch(() => {});
  return next;
}

function titleFromId(id) {
  return String(id || "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseTextProblemSections(raw) {
  const lines = String(raw || "").replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = detectTextHeading(line);
    if (heading) {
      if (current) sections.push(current);
      current = { type: "markdown", title: heading, bodyLines: [] };
      continue;
    }

    if (!current) current = { type: "markdown", title: "Problem Notes", bodyLines: [] };
    current.bodyLines.push(cleanTextProblemLine(line));
  }

  if (current) sections.push(current);

  return sections
    .map((section) => ({
      type: "markdown",
      title: section.title,
      body: section.bodyLines.join("\n").trim()
    }))
    .filter((section) => section.body);
}

function parseMarkdownProblem(raw, id) {
  const { data, content } = parseFrontmatter(raw);
  const slug = stringValue(data.slug);
  const title = stringValue(data.title) || titleFromId(id);
  const body = stripMatchingTitleHeading(content, title);

  return {
    id: slug || id,
    slug,
    title,
    summary: stringValue(data.summary),
    tags: normalizeTags(data.tags),
    created_at: stringValue(data.created_at),
    updated_at: stringValue(data.updated_at),
    sections: parseMarkdownSections(body)
  };
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

function stripMatchingTitleHeading(content, title) {
  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim());
  if (firstContentIndex === -1) return "";

  const first = lines[firstContentIndex].trim();
  const heading = first.match(/^#\s+(.+)$/);
  if (!heading || slugify(heading[1]) !== slugify(title)) return lines.join("\n").trim();

  return [...lines.slice(0, firstContentIndex), ...lines.slice(firstContentIndex + 1)].join("\n").trim();
}

function parseMarkdownSections(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;
  const introLines = [];

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (current) sections.push(current);
      current = { type: "markdown", title: heading[1].trim(), bodyLines: [] };
      continue;
    }

    if (current) {
      current.bodyLines.push(line);
    } else {
      introLines.push(line);
    }
  }

  if (current) sections.push(current);

  const parsedSections = sections
    .map((section) => ({
      type: "markdown",
      title: section.title,
      body: section.bodyLines.join("\n").trim()
    }))
    .filter((section) => section.title || section.body);

  return parsedSections;
}

function rewriteMarkdownAssetRefs(body, id) {
  return String(body || "").replace(/(!\[[^\]]*]\()\.\/([^)]+)\)/g, (_match, prefix, asset) => {
    const [fileName, suffix = ""] = asset.split(/(?=[?#])/);
    return `${prefix}/api/hld/assets/${id}/${encodeURIComponent(fileName)}${suffix})`;
  });
}

function detectTextHeading(line) {
  const cleaned = String(line || "")
    .trim()
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/[()]/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/:$/, "")
    .trim();

  const normalized = cleaned.toLowerCase();
  const headings = new Map([
    ["functional requirements", "Functional Requirements"],
    ["non functional requirements", "Non-Functional Requirements"],
    ["non functional requiements", "Non-Functional Requirements"],
    ["core entities", "Core Entities"],
    ["api", "API Design"],
    ["api design", "API Design"],
    ["hld", "High-Level Design"],
    ["high level design", "High-Level Design"],
    ["deep dives", "Deep Dives"],
    ["deep dive", "Deep Dives"],
    ["below the line", "Out of Scope"],
    ["below the line out of scope", "Out of Scope"],
    ["out of scope", "Out of Scope"]
  ]);

  return headings.get(normalized) || null;
}

function cleanTextProblemLine(line) {
  const original = String(line || "").replace(/\t/g, "  ");
  if (!original.trim()) return "";

  const indentSize = Math.min(10, original.length - original.trimStart().length);
  const indent = " ".repeat(indentSize);
  const trimmed = original.trim();
  const numbered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
  if (numbered) return `${indent}${numbered[1]}. ${numbered[2]}`;

  const stripped = trimmed
    .replace(/^(?:[-*•○◦▪▫□◊§®]|[a-z][.)]|[ivxlcdm]+[.)])\s+/i, "")
    .trim();

  if (stripped && stripped !== trimmed) {
    return `${indent}- ${stripped}`;
  }

  return `${indent}${trimmed}`;
}

function repairCommonMojibake(value) {
  return String(value || "")
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, "\"")
    .replace(/â€�/g, "\"")
    .replace(/â€“/g, "-")
    .replace(/â€”/g, "-")
    .replace(/â€¢|â—‹|Â§|â–¡|Â®|â—Š/g, "-")
    .replace(/Â /g, " ")
    .replace(/Â/g, "");
}
