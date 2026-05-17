import cors from "cors";
import express from "express";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { marked } from "marked";
import { cleanJavaSource } from "./javaCleaner.js";

const app = express();
const port = Number(process.env.PORT || 5174);
const rootDir = process.cwd();
const projectRoot = path.resolve(rootDir, "..");
const docsDir = path.join(rootDir, "content", "docs");
const moduleDocsDir = path.join(rootDir, "content", "module-docs");
const templatePath = path.join(rootDir, "content", "Template.md");
const ignoredRootDirs = new Set([".git", ".idea", ".vscode", "docs-site", "out", "target", "build"]);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/docs", async (_request, response) => {
  try {
    const files = await readdir(docsDir, { withFileTypes: true });
    const docs = [];

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(".md")) continue;
      const slug = file.name.replace(/\.md$/, "");
      const raw = await readFile(path.join(docsDir, file.name), "utf8");
      const title = extractTitle(raw) || slug;
      docs.push({ slug, title });
    }

    response.json({ docs });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/api/docs/:slug", async (request, response) => {
  try {
    const slug = sanitizeSlug(request.params.slug);
    const filePath = path.join(docsDir, `${slug}.md`);
    const raw = await readFile(filePath, "utf8");
    response.json({ slug, title: extractTitle(raw) || slug, markdown: raw });
  } catch (error) {
    response.status(404).json({ error: "Document not found" });
  }
});

app.get("/api/module-docs", async (request, response) => {
  try {
    const moduleName = sanitizePathPart(request.query.module);
    if (!moduleName) {
      response.status(400).json({ error: "module query param is required" });
      return;
    }

    const directory = path.join(moduleDocsDir, moduleName);
    await mkdir(directory, { recursive: true });
    const entries = await readdir(directory, { withFileTypes: true });
    const versions = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
      .map((entry) => entry.name.replace(/\.html$/, ""))
      .sort((left, right) => left.localeCompare(right));

    response.json({ module: moduleName, versions });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/api/module-docs/template", async (request, response) => {
  try {
    const moduleName = sanitizePathPart(request.query.module) || "Module";
    const markdown = await readFile(templatePath, "utf8");
    response.json({
      markdown,
      html: marked.parse(markdown.replaceAll("{{module}}", moduleName))
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/api/module-docs/:module/:version", async (request, response) => {
  try {
    const moduleName = sanitizePathPart(request.params.module);
    const version = sanitizeDocVersion(request.params.version);
    const filePath = moduleDocPath(moduleName, version);
    const html = await readFile(filePath, "utf8");
    response.json({ module: moduleName, version, html });
  } catch (error) {
    response.status(404).json({ error: "Document version not found" });
  }
});

app.post("/api/module-docs", async (request, response) => {
  try {
    const moduleName = sanitizePathPart(request.body?.module);
    const version = sanitizeDocVersion(request.body?.version);
    const html = typeof request.body?.html === "string" ? request.body.html : "";

    if (!moduleName || !version) {
      response.status(400).json({ error: "module and version are required" });
      return;
    }

    const directory = path.join(moduleDocsDir, moduleName);
    await mkdir(directory, { recursive: true });
    await writeFile(moduleDocPath(moduleName, version), html, "utf8");
    response.json({ ok: true, module: moduleName, version });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.delete("/api/module-docs/:module/:version", async (request, response) => {
  try {
    const moduleName = sanitizePathPart(request.params.module);
    const version = sanitizeDocVersion(request.params.version);
    await unlink(moduleDocPath(moduleName, version));
    response.json({ ok: true, module: moduleName, version });
  } catch (error) {
    response.status(404).json({ error: "Document version not found" });
  }
});

app.get("/api/java/pages", async (_request, response) => {
  try {
    response.json({ root: projectRoot, modules: await discoverJavaPages() });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/api/java/page", async (request, response) => {
  try {
    const moduleName = sanitizePathPart(request.query.module);
    const packageName = sanitizePathPart(request.query.package);

    if (!moduleName || !packageName) {
      response.status(400).json({ error: "module and package query params are required" });
      return;
    }

    const packagePath = path.resolve(projectRoot, moduleName, "src", packageName);
    if (!packagePath.startsWith(path.resolve(projectRoot, moduleName, "src"))) {
      response.status(400).json({ error: "Invalid package path" });
      return;
    }

    const info = await stat(packagePath);
    if (!info.isDirectory()) {
      response.status(404).json({ error: "Package page not found" });
      return;
    }

    const javaFiles = await findJavaFiles(packagePath);
    const files = [];

    for (const filePath of javaFiles) {
      const source = await readFile(filePath, "utf8");
      const fileBaseName = path.basename(filePath, ".java");
      const cleaned = cleanJavaSource(source, fileBaseName);
      const withConstructors = cleanJavaSource(source, fileBaseName, { removeConstructors: false });
      files.push({
        id: path.relative(packagePath, filePath).replaceAll(path.sep, "/"),
        fileName: path.basename(filePath),
        relativePath: path.relative(packagePath, filePath).replaceAll(path.sep, "/"),
        absolutePath: filePath,
        rawCode: source,
        code: cleaned.code,
        codeWithConstructors: withConstructors.code,
        hasConstructors: withConstructors.removed.constructors > 0
      });
    }

    response.json({
      id: pageId(moduleName, packageName),
      module: moduleName,
      packageName,
      title: packageName,
      root: packagePath,
      count: files.length,
      files
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/api/java/diff", async (request, response) => {
  try {
    const moduleName = sanitizePathPart(request.query.module);
    const fromPackage = sanitizePathPart(request.query.from);
    const toPackage = sanitizePathPart(request.query.to);

    if (!moduleName || !fromPackage || !toPackage) {
      response.status(400).json({ error: "module, from, and to query params are required" });
      return;
    }

    const fromPath = resolvePackagePath(moduleName, fromPackage);
    const toPath = resolvePackagePath(moduleName, toPackage);
    await assertDirectory(fromPath, "From package not found");
    await assertDirectory(toPath, "To package not found");

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

    response.json({
      id: `diff::${moduleName}::${fromPackage}::${toPackage}`,
      module: moduleName,
      from: fromPackage,
      to: toPackage,
      count: files.length,
      files
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post("/api/java/scan", async (request, response) => {
  try {
    const folderPath = request.body?.folderPath;
    if (!folderPath || typeof folderPath !== "string") {
      response.status(400).json({ error: "folderPath is required" });
      return;
    }

    const resolvedPath = path.resolve(folderPath);
    const info = await stat(resolvedPath);
    if (!info.isDirectory()) {
      response.status(400).json({ error: "folderPath must point to a directory" });
      return;
    }

    const javaFiles = await findJavaFiles(resolvedPath);
    const files = [];

    for (const filePath of javaFiles) {
      const source = await readFile(filePath, "utf8");
      const fileBaseName = path.basename(filePath, ".java");
      const cleaned = cleanJavaSource(source, fileBaseName);
      const withConstructors = cleanJavaSource(source, fileBaseName, { removeConstructors: false });
      files.push({
        id: path.relative(resolvedPath, filePath).replaceAll(path.sep, "/"),
        fileName: path.basename(filePath),
        relativePath: path.relative(resolvedPath, filePath).replaceAll(path.sep, "/"),
        absolutePath: filePath,
        code: cleaned.code,
        codeWithConstructors: withConstructors.code,
        hasConstructors: withConstructors.removed.constructors > 0,
        removed: cleaned.removed
      });
    }

    response.json({ root: resolvedPath, count: files.length, files });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`API listening at http://127.0.0.1:${port}`);
});

async function findJavaFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "out" || entry.name === "target" || entry.name === "build") continue;
      files.push(...await findJavaFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".java")) {
      files.push(fullPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

async function loadCleanedJavaFiles(packagePath) {
  const javaFiles = await findJavaFiles(packagePath);
  const files = new Map();

  for (const filePath of javaFiles) {
    const source = await readFile(filePath, "utf8");
    const fileBaseName = path.basename(filePath, ".java");
    const cleaned = cleanJavaSource(source, fileBaseName);
    const withConstructors = cleanJavaSource(source, fileBaseName, { removeConstructors: false });
    const relativePath = path.relative(packagePath, filePath).replaceAll(path.sep, "/");
    files.set(relativePath, {
      fileName: path.basename(filePath),
      relativePath,
      absolutePath: filePath,
      code: cleaned.code,
      codeWithConstructors: withConstructors.code,
      hasConstructors: withConstructors.removed.constructors > 0
    });
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
  const packagePath = path.resolve(projectRoot, moduleName, "src", packageName);
  const srcPath = path.resolve(projectRoot, moduleName, "src");
  if (!packagePath.startsWith(srcPath)) {
    throw new Error("Invalid package path");
  }
  return packagePath;
}

async function assertDirectory(directory, message) {
  const info = await stat(directory);
  if (!info.isDirectory()) throw new Error(message);
}

async function discoverJavaPages() {
  const entries = await readdir(projectRoot, { withFileTypes: true });
  const modules = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoredRootDirs.has(entry.name) || entry.name.startsWith(".")) continue;

    const modulePath = path.join(projectRoot, entry.name);
    const srcPath = path.join(modulePath, "src");

    try {
      const srcInfo = await stat(srcPath);
      if (!srcInfo.isDirectory()) continue;
    } catch {
      continue;
    }

    const packageEntries = await readdir(srcPath, { withFileTypes: true });
    const pages = [];

    for (const packageEntry of packageEntries) {
      if (!packageEntry.isDirectory()) continue;
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

  return modules.sort((left, right) => left.name.localeCompare(right.name));
}

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

function sanitizeSlug(slug) {
  return slug.replace(/[^a-zA-Z0-9-_]/g, "");
}

function sanitizePathPart(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9._-]/g, "");
}

function sanitizeDocVersion(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function moduleDocPath(moduleName, version) {
  const directory = path.resolve(moduleDocsDir, moduleName);
  const filePath = path.resolve(directory, `${version}.html`);
  if (!filePath.startsWith(directory)) {
    throw new Error("Invalid document path");
  }
  return filePath;
}

function pageId(moduleName, packageName) {
  return `${moduleName}::${packageName}`;
}
