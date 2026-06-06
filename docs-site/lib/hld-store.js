import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const HLD_DATA_DIR = path.join(process.cwd(), "content", "hld", "problems");
const VALID_ID = /^[a-z0-9][a-z0-9-]*$/;

let writeQueue = Promise.resolve();

export async function listHldProblems() {
  await ensureHldDataDir();
  const entries = await readdir(HLD_DATA_DIR, { withFileTypes: true }).catch(() => []);
  const problems = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const id = entry.name.slice(0, -5);
    const problem = await readHldProblemFile(id);
    if (!problem) continue;

    problems.push({
      id: problem.id || id,
      title: problem.title || "Untitled",
      summary: problem.summary || "",
      tags: Array.isArray(problem.tags) ? problem.tags : [],
      updated_at: problem.updated_at || "",
      created_at: problem.created_at || "",
      sectionCount: countSections(problem.sections)
    });
  }

  return problems.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
}

export async function getHldProblem(id) {
  if (!isValidId(id)) return null;
  return readHldProblemFile(id);
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

async function readHldProblemFile(id) {
  if (!isValidId(id)) return null;

  try {
    const raw = await readFile(problemPath(id), "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
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
