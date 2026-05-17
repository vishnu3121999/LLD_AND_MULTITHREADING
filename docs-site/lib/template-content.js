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
