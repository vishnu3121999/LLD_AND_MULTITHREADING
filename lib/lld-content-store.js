import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { extractMarkdownHeadings, stripMarkdownMarkup } from "./markdown-headings.js";

const LLD_CONTENT_DIR = path.join(process.cwd(), "content", "lld");
const VALID_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const TITLE_OVERRIDES = new Map([
  ["api", "API"],
  ["apis", "APIs"],
  ["crud", "CRUD"],
  ["db", "DB"],
  ["lld", "LLD"],
  ["oop", "OOP"],
  ["oops", "OOPs"],
  ["sql", "SQL"],
  ["uml", "UML"]
]);

export async function getLldCurriculum() {
  const moduleDirs = await listModuleDirs();
  const modules = [];

  for (let index = 0; index < moduleDirs.length; index += 1) {
    const moduleDir = moduleDirs[index];
    const parsed = parseOrderedName(moduleDir.name);
    const moduleId = slugify(parsed.name) || `module-${index + 1}`;
    const modulePath = path.join(LLD_CONTENT_DIR, moduleDir.name);
    const moduleIndex = await readModuleIndex(modulePath, moduleId);
    const lessons = await listModuleLessons({ moduleId, modulePath });

    modules.push({
      id: moduleId,
      number: `Module ${parsed.order ?? index + 1}`,
      title: moduleIndex?.title || titleFromName(parsed.name),
      description: moduleIndex?.summary || lessons[0]?.summary || "Content for this module has not been added yet.",
      lessons
    });
  }

  ensureUniqueLessonSlugs(modules);

  const allLessons = modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      module: {
        id: module.id,
        number: module.number,
        title: module.title
      }
    }))
  );

  return { modules: modules.map(withNavigationLessonsOnly), allLessons };
}

export async function getLldLesson(slug) {
  if (!isValidSlug(slug)) return null;
  const { allLessons } = await getLldCurriculum();
  return allLessons.find((lesson) => lesson.slug === slug) || null;
}

export async function getAdjacentLldLessons(slug) {
  const { allLessons } = await getLldCurriculum();
  const index = allLessons.findIndex((lesson) => lesson.slug === slug);

  return {
    previous: index > 0 ? allLessons[index - 1] : null,
    next: index >= 0 && index < allLessons.length - 1 ? allLessons[index + 1] : null
  };
}

async function listModuleDirs() {
  const entries = await safeReadDir(LLD_CONTENT_DIR);
  return entries
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => compareOrderedNames(a.name, b.name));
}

async function readModuleIndex(modulePath, moduleId) {
  const filePath = path.join(modulePath, "index.md");
  if (!(await isFile(filePath))) return null;

  return readMarkdownDoc({
    filePath,
    fallbackSlug: moduleId,
    fallbackTitle: titleFromName(moduleId),
    sourceOrder: 0
  });
}

async function listModuleLessons({ moduleId, modulePath }) {
  const sources = await listMarkdownSources(modulePath);
  const lessons = [];

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    const fallbackSlug = fallbackSlugFromRelativePath(source.relativePath, moduleId);
    const fallbackTitle = titleFromRelativePath(source.relativePath, moduleId);
    const lesson = await readMarkdownDoc({
      filePath: source.filePath,
      fallbackSlug,
      fallbackTitle,
      sourceOrder: index
    });

    if (lesson) lessons.push(lesson);
  }

  return lessons.sort((a, b) => {
    const orderCompare = (a.order ?? a.sourceOrder) - (b.order ?? b.sourceOrder);
    if (orderCompare !== 0) return orderCompare;
    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
  });
}

async function listMarkdownSources(rootDir) {
  const sources = [];

  async function walk(currentDir) {
    const entries = await safeReadDir(currentDir);

    for (const entry of entries.sort((a, b) => compareOrderedNames(a.name, b.name))) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".md") continue;

      sources.push({
        filePath: fullPath,
        relativePath: path.relative(rootDir, fullPath).replace(/\\/g, "/")
      });
    }
  }

  await walk(rootDir);
  return sources;
}

async function readMarkdownDoc({ filePath, fallbackSlug, fallbackTitle, sourceOrder }) {
  try {
    const [raw, meta] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
    const { data, content } = parseFrontmatter(raw);
    const initialBody = content.trim();
    const initialHeadings = extractMarkdownHeadings(initialBody);
    const firstHeading = initialHeadings.find((heading) => heading.level === 1);
    const frontmatterSlug = slugify(stringValue(data.slug) || stringValue(data.id));
    const slug = isValidSlug(frontmatterSlug) ? frontmatterSlug : fallbackSlug;
    const title = stringValue(data.title) || firstHeading?.title || fallbackTitle;
    const body = stripLeadingTitleHeading(initialBody, title);
    const headings = extractMarkdownHeadings(body, { maxDepth: 3 });
    const summary = stringValue(data.summary) || extractSummary(body) || extractSummary(initialBody);

    return {
      slug,
      title,
      summary,
      body,
      headings,
      order: numberValue(data.order),
      sourceDir: path.dirname(filePath),
      sourceOrder,
      sourcePath: path.relative(LLD_CONTENT_DIR, filePath).replace(/\\/g, "/"),
      updated_at: meta.mtime?.toISOString?.() || ""
    };
  } catch {
    return null;
  }
}

function withNavigationLessonsOnly(module) {
  return {
    ...module,
    lessons: module.lessons.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary
    }))
  };
}

function ensureUniqueLessonSlugs(modules) {
  const used = new Set();

  for (const module of modules) {
    for (const lesson of module.lessons) {
      const base = isValidSlug(lesson.slug) ? lesson.slug : slugify(lesson.title) || "lesson";
      let nextSlug = base;

      if (used.has(nextSlug)) {
        nextSlug = `${module.id}-${base}`;
      }

      let suffix = 2;
      while (used.has(nextSlug)) {
        nextSlug = `${base}-${suffix}`;
        suffix += 1;
      }

      lesson.slug = nextSlug;
      used.add(nextSlug);
    }
  }
}

function fallbackSlugFromRelativePath(relativePath, moduleId) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (/^index\.md$/i.test(normalized)) return moduleId;

  const withoutIndex = normalized
    .replace(/\/index\.md$/i, "")
    .replace(/\.md$/i, "");
  const slug = withoutIndex
    .split("/")
    .map((segment) => parseOrderedName(segment).name)
    .filter(Boolean)
    .join("-");

  return slugify(slug) || moduleId;
}

function titleFromRelativePath(relativePath, moduleId) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (/^index\.md$/i.test(normalized)) return titleFromName(moduleId);

  const withoutIndex = normalized
    .replace(/\/index\.md$/i, "")
    .replace(/\.md$/i, "");
  const lastSegment = withoutIndex.split("/").filter(Boolean).pop() || moduleId;

  return titleFromName(parseOrderedName(lastSegment).name);
}

function stripLeadingTitleHeading(markdown, title) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim());
  if (firstContentIndex === -1) return "";

  const match = lines[firstContentIndex].match(/^#\s+(.+?)\s*#*\s*$/);
  if (!match) return markdown;

  const headingTitle = stripMarkdownMarkup(match[1]).toLowerCase();
  const currentTitle = stripMarkdownMarkup(title).toLowerCase();
  if (headingTitle !== currentTitle) return markdown;

  const nextLines = lines.slice(0, firstContentIndex).concat(lines.slice(firstContentIndex + 1));
  return nextLines.join("\n").replace(/^\s*\n/, "").trim();
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
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function parseOrderedName(name) {
  const baseName = path.basename(String(name || ""), path.extname(String(name || "")));
  const match = baseName.match(/^(\d+)[\s_.-]+(.+)$/);
  return {
    order: match ? Number(match[1]) : null,
    name: match ? match[2] : baseName
  };
}

function compareOrderedNames(first, second) {
  const a = parseOrderedName(first);
  const b = parseOrderedName(second);
  const orderCompare = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
  if (orderCompare !== 0) return orderCompare;
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

function titleFromName(value) {
  const normalized = String(value || "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "Untitled";

  return normalized
    .split(" ")
    .map((part) => {
      const override = TITLE_OVERRIDES.get(part.toLowerCase());
      if (override) return override;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function slugify(value) {
  return String(value || "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidSlug(slug) {
  return typeof slug === "string" && VALID_SLUG.test(slug);
}

async function safeReadDir(dir) {
  return readdir(dir, { withFileTypes: true }).catch(() => []);
}

async function isFile(filePath) {
  try {
    const meta = await stat(filePath);
    return meta.isFile();
  } catch {
    return false;
  }
}
