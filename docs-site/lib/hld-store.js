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
      if (ext !== ".json" && ext !== ".txt") continue;

      id = entry.name.slice(0, -ext.length);
      problem = ext === ".json"
        ? await readHldProblemFile(id)
        : await readTextHldProblemFile(id);
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
  return (await readDirectoryHldProblem(id)) || (await readHldProblemFile(id)) || readTextHldProblemFile(id);
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

async function collectProblemImages(id, assetDir) {
  try {
    const entries = await readdir(assetDir, { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => {
        const ext = path.extname(entry.name);
        const basename = entry.name.slice(0, -ext.length);
        return {
          fileName: entry.name,
          src: `/api/hld/assets/${id}/${encodeURIComponent(entry.name)}`,
          alt: titleFromId(basename),
          sectionSlug: sectionSlugForImage(basename)
        };
      });

    return images.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

function attachImagesToSections(sections = [], images = []) {
  if (!Array.isArray(sections) || !images.length) return sections;

  return sections.map((section) => {
    const sectionSlug = slugify(section.title);
    const sectionImages = images.filter((image) => image.sectionSlug === sectionSlug);
    const next = { ...section };

    if (sectionImages.length > 0) {
      next.images = [...(Array.isArray(section.images) ? section.images : []), ...sectionImages];
    }

    if (section.type === "deepdive" && Array.isArray(section.items)) {
      next.items = attachImagesToSections(section.items, images);
    }

    return next;
  });
}

function sectionSlugForImage(value) {
  const slug = slugify(value);
  if (/^(hld|high-level-design|architecture|system-design|diagram)(-|\d|$)/.test(slug) || slug === "hld") {
    return "high-level-design";
  }

  if (/^(deep-dive|deepdive|deep)(-|\d|$)/.test(slug)) {
    return "deep-dives";
  }

  if (/^(api|api-design)(-|\d|$)/.test(slug)) {
    return "api-design";
  }

  if (/^(nfr|non-functional|non-functional-requirements)(-|\d|$)/.test(slug)) {
    return "non-functional-requirements";
  }

  if (/^(fr|functional|functional-requirements)(-|\d|$)/.test(slug)) {
    return "functional-requirements";
  }

  if (/^(entities|core-entities|data-model)(-|\d|$)/.test(slug)) {
    return "core-entities";
  }

  return slug;
}

async function readHldProblemFile(id, target = problemPath(id), assetDir = path.join(HLD_DATA_DIR, id)) {
  if (!isValidId(id)) return null;

  try {
    const raw = await readFile(target, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const images = await collectProblemImages(id, assetDir);
    return {
      ...parsed,
      images,
      sections: attachImagesToSections(parsed.sections || [], images)
    };
  } catch {
    return null;
  }
}

async function readTextHldProblemFile(id, target = path.join(HLD_DATA_DIR, `${id}.txt`), assetDir = path.join(HLD_DATA_DIR, id)) {
  if (!isValidId(id)) return null;

  try {
    const [raw, fileStat] = await Promise.all([
      readFile(target, "utf8"),
      stat(target)
    ]);
    const images = await collectProblemImages(id, assetDir);
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
      sections: attachImagesToSections(
        parseTextProblemSections(repairCommonMojibake(raw)),
        images
      )
    };
  } catch {
    return null;
  }
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
    const textFile = files.includes(`${id}.txt`)
      ? `${id}.txt`
      : files.find((file) => path.extname(file) === ".txt");

    if (jsonFile) {
      return readHldProblemFile(id, path.join(dir, jsonFile), dir);
    }

    if (textFile) {
      return readTextHldProblemFile(id, path.join(dir, textFile), dir);
    }

    return null;
  } catch {
    return null;
  }
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
