import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { cleanJavaSource } from "./java-cleaner";

const javaModulesDir = path.join(process.cwd(), "content", "java-modules");
const ignoredDirs = new Set(["out", "target", "build", ".git", ".idea", ".vscode"]);
const cache = {
  modules: null,
  pages: new Map(),
  diffs: new Map()
};

export async function getJavaModules() {
  if (cache.modules) return cache.modules;

  const entries = await safeReadDir(javaModulesDir);
  const modules = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    const modulePath = path.join(javaModulesDir, entry.name);
    const srcPath = path.join(modulePath, "src");
    if (!await isDirectory(srcPath)) continue;

    const packageEntries = await safeReadDir(srcPath);
    const pages = [];

    for (const packageEntry of packageEntries) {
      if (!packageEntry.isDirectory() || ignoredDirs.has(packageEntry.name)) continue;

      const packagePath = path.join(srcPath, packageEntry.name);
      const files = await findJavaFiles(packagePath);
      if (files.length === 0) continue;

      pages.push({
        id: pageId(entry.name, packageEntry.name),
        module: entry.name,
        packageName: packageEntry.name,
        title: packageEntry.name,
        count: files.length
      });
    }

    if (pages.length > 0) {
      modules.push({
        name: entry.name,
        pages: pages.sort((left, right) => left.title.localeCompare(right.title))
      });
    }
  }

  cache.modules = modules.sort((left, right) => left.name.localeCompare(right.name));
  return cache.modules;
}

export async function getJavaPage(moduleName, packageName) {
  const safeModule = sanitizePathPart(moduleName);
  const safePackage = sanitizePathPart(packageName);
  if (!safeModule || !safePackage) {
    throw badRequest("module and package query params are required");
  }

  const cacheKey = `${safeModule}::${safePackage}`;
  if (cache.pages.has(cacheKey)) return cache.pages.get(cacheKey);

  const packagePath = resolvePackagePath(safeModule, safePackage);
  if (!await isDirectory(packagePath)) {
    throw notFound("Package page not found");
  }

  const javaFiles = await findJavaFiles(packagePath);
  const files = [];

  for (const filePath of javaFiles) {
    files.push(await buildJavaFilePayload(filePath, packagePath, { includeRawCode: true }));
  }

  const page = {
    id: pageId(safeModule, safePackage),
    module: safeModule,
    packageName: safePackage,
    title: safePackage,
    root: `content/java-modules/${safeModule}/src/${safePackage}`,
    count: files.length,
    files
  };
  cache.pages.set(cacheKey, page);
  return page;
}

export async function getJavaDiff(moduleName, fromPackage, toPackage) {
  const safeModule = sanitizePathPart(moduleName);
  const safeFrom = sanitizePathPart(fromPackage);
  const safeTo = sanitizePathPart(toPackage);
  if (!safeModule || !safeFrom || !safeTo) {
    throw badRequest("module, from, and to query params are required");
  }

  const cacheKey = `${safeModule}::${safeFrom}::${safeTo}`;
  if (cache.diffs.has(cacheKey)) return cache.diffs.get(cacheKey);

  const fromPath = resolvePackagePath(safeModule, safeFrom);
  const toPath = resolvePackagePath(safeModule, safeTo);
  if (!await isDirectory(fromPath)) throw notFound("From package not found");
  if (!await isDirectory(toPath)) throw notFound("To package not found");

  const fromFiles = await loadCleanedJavaFiles(fromPath);
  const toFiles = await loadCleanedJavaFiles(toPath);
  const relativePaths = Array.from(new Set([...fromFiles.keys(), ...toFiles.keys()])).sort((left, right) => left.localeCompare(right));
  const files = [];

  for (const relativePath of relativePaths) {
    const fromFile = fromFiles.get(relativePath);
    const toFile = toFiles.get(relativePath);

    if (!fromFile && toFile) {
      files.push({
        id: relativePath,
        fileName: path.basename(relativePath),
        relativePath,
        status: "added",
        hasConstructors: toFile.hasConstructors,
        diffLines: toFile.code.split("\n").map((text) => ({ type: "add", text })),
        diffLinesWithConstructors: toFile.codeWithConstructors.split("\n").map((text) => ({ type: "add", text }))
      });
      continue;
    }

    if (fromFile && !toFile) {
      files.push({
        id: relativePath,
        fileName: path.basename(relativePath),
        relativePath,
        status: "removed",
        hasConstructors: fromFile.hasConstructors,
        diffLines: fromFile.code.split("\n").map((text) => ({ type: "remove", text })),
        diffLinesWithConstructors: fromFile.codeWithConstructors.split("\n").map((text) => ({ type: "remove", text }))
      });
      continue;
    }

    if (fromFile.code !== toFile.code || fromFile.codeWithConstructors !== toFile.codeWithConstructors) {
      files.push({
        id: relativePath,
        fileName: path.basename(relativePath),
        relativePath,
        status: "modified",
        hasConstructors: fromFile.hasConstructors || toFile.hasConstructors,
        diffLines: createLineDiff(fromFile.code, toFile.code),
        diffLinesWithConstructors: createLineDiff(fromFile.codeWithConstructors, toFile.codeWithConstructors)
      });
    }
  }

  const diff = {
    id: `diff::${safeModule}::${safeFrom}::${safeTo}`,
    module: safeModule,
    from: safeFrom,
    to: safeTo,
    count: files.length,
    files
  };
  cache.diffs.set(cacheKey, diff);
  return diff;
}

export function apiErrorResponse(error) {
  const status = error.status || 500;
  return Response.json({ error: error.message || "Unexpected error" }, { status });
}

async function safeReadDir(directory) {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function isDirectory(directory) {
  try {
    return (await stat(directory)).isDirectory();
  } catch {
    return false;
  }
}

async function findJavaFiles(directory) {
  const entries = await safeReadDir(directory);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...await findJavaFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".java")) {
      files.push(fullPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

async function buildJavaFilePayload(filePath, packagePath, { includeRawCode = false } = {}) {
  const source = await readFile(filePath, "utf8");
  const fileBaseName = path.basename(filePath, ".java");
  const cleaned = cleanJavaSource(source, fileBaseName);
  const withConstructors = cleanJavaSource(source, fileBaseName, { removeConstructors: false });
  const relativePath = path.relative(packagePath, filePath).replaceAll(path.sep, "/");

  return {
    id: relativePath,
    fileName: path.basename(filePath),
    relativePath,
    ...(includeRawCode ? { rawCode: source } : {}),
    code: cleaned.code,
    codeWithConstructors: withConstructors.code,
    hasConstructors: withConstructors.removed.constructors > 0,
    removed: cleaned.removed
  };
}

async function loadCleanedJavaFiles(packagePath) {
  const javaFiles = await findJavaFiles(packagePath);
  const files = new Map();

  for (const filePath of javaFiles) {
    const payload = await buildJavaFilePayload(filePath, packagePath);
    files.set(payload.relativePath, payload);
  }

  return files;
}

function createLineDiff(fromCode, toCode) {
  const oldLines = fromCode.split("\n");
  const newLines = toCode.split("\n");
  const table = Array.from({ length: oldLines.length + 1 }, () => Array(newLines.length + 1).fill(0));

  for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
      if (oldLines[oldIndex] === newLines[newIndex]) {
        table[oldIndex][newIndex] = table[oldIndex + 1][newIndex + 1] + 1;
      } else {
        table[oldIndex][newIndex] = Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
      }
    }
  }

  const diffLines = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length && newIndex < newLines.length) {
    if (oldLines[oldIndex] === newLines[newIndex]) {
      diffLines.push({ type: "context", text: oldLines[oldIndex] });
      oldIndex += 1;
      newIndex += 1;
    } else if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) {
      diffLines.push({ type: "remove", text: oldLines[oldIndex] });
      oldIndex += 1;
    } else {
      diffLines.push({ type: "add", text: newLines[newIndex] });
      newIndex += 1;
    }
  }

  while (oldIndex < oldLines.length) {
    diffLines.push({ type: "remove", text: oldLines[oldIndex] });
    oldIndex += 1;
  }

  while (newIndex < newLines.length) {
    diffLines.push({ type: "add", text: newLines[newIndex] });
    newIndex += 1;
  }

  return diffLines;
}

function resolvePackagePath(moduleName, packageName) {
  const srcPath = path.resolve(javaModulesDir, moduleName, "src");
  const packagePath = path.resolve(srcPath, packageName);
  if (!packagePath.startsWith(`${srcPath}${path.sep}`) && packagePath !== srcPath) {
    throw badRequest("Invalid package path");
  }
  return packagePath;
}

function sanitizePathPart(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9._-]/g, "");
}

function pageId(moduleName, packageName) {
  return `${moduleName}::${packageName}`;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}
