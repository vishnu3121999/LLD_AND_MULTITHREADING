import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

export function getTemplateMarkdown() {
  const candidates = [
    path.resolve(process.cwd(), "..", "template.md"),
    path.resolve(process.cwd(), "..", "Template.md"),
    path.resolve(process.cwd(), "content", "Template.md")
  ];

  const filePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!filePath) return "# LLD Template\n\nTemplate file was not found.";
  return fs.readFileSync(filePath, "utf8");
}

export function getTemplateHtml() {
  return marked.parse(getTemplateMarkdown(), {
    mangle: false,
    headerIds: true
  });
}

export function getTemplateSections() {
  const markdown = getTemplateMarkdown().replace(/\r\n/g, "\n");
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);

    if (headingMatch && isManualChapterHeading(headingMatch, index)) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      if (current) sections.push(finalizeSection(current));
      current = {
        id: slugifyHeading(title),
        title,
        level,
        lines: [line]
      };
      continue;
    }

    if (!current) continue;

    if (line.trim() === "---") continue;
    current.lines.push(line);
  }

  if (current) sections.push(finalizeSection(current));
  return sections.filter((section) => section.html.trim());
}

function finalizeSection(section) {
  return {
    ...section,
    html: marked.parse(section.lines.join("\n").trim(), {
      mangle: false,
      headerIds: true
    })
  };
}

function isManualChapterHeading(match, lineIndex) {
  const level = match[1].length;
  const title = match[2].trim();

  if (lineIndex === 0) return false;
  if (level === 1 && /^\d+\./.test(title)) return true;
  if (level === 2 && /^0\./.test(title)) return true;
  return false;
}

function slugifyHeading(value) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
