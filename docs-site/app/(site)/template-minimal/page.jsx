import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { marked } from "marked";
import { BookOpenCheck, Code2, FileText, ListChecks } from "lucide-react";

export const metadata = {
  title: "Template Minimal | LLD Playbook"
};

export const dynamic = "force-dynamic";

const templatePath = path.resolve(process.cwd(), "..", "my-template.txt");

export default function TemplateMinimalPage() {
  const markdown = readTemplate();
  const parsed = parseTemplate(markdown);
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const headingCount = markdown.split("\n").filter((line) => /^#{1,6}\s+/.test(line)).length;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container py-10 lg:py-14">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <FileText size={14} aria-hidden="true" />
                my-template.txt
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                {parsed.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                A focused, readable version of your LLD interview template with navigation, clean typography, and code-friendly formatting.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
              <Stat label="Sections" value={parsed.sections.length} />
              <Stat label="Headings" value={headingCount} />
              <Stat label="Words" value={formatCount(words)} />
            </div>
          </div>
        </div>
      </section>

      <div className="site-container grid gap-8 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-10">
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <ListChecks size={16} aria-hidden="true" />
              Sections
            </div>
            <nav className="grid gap-1" aria-label="Template sections">
              {parsed.sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex gap-3 rounded-md px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                >
                  <span className="font-mono text-xs text-slate-400 group-hover:text-slate-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 truncate font-medium">{section.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BookOpenCheck size={16} className="text-emerald-600" aria-hidden="true" />
              Read-only template view
            </div>
            <Link
              href="/lld-template"
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Code2 size={15} aria-hidden="true" />
              Full manual
            </Link>
          </div>

          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            {parsed.introHtml && (
              <section className="minimal-template-prose border-b border-slate-200 px-5 py-6 sm:px-8">
                <div dangerouslySetInnerHTML={{ __html: parsed.introHtml }} />
              </section>
            )}

            {parsed.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="minimal-template-section scroll-mt-24 border-b border-slate-200 px-5 py-7 last:border-b-0 sm:px-8 sm:py-9"
              >
                <div className="mb-5 flex items-start gap-4">
                  <div className="grid h-9 w-9 flex-none place-items-center rounded-md bg-slate-950 font-mono text-xs font-semibold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
                      Section
                    </div>
                    <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div
                  className="minimal-template-prose"
                  dangerouslySetInnerHTML={{ __html: section.html }}
                />
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function readTemplate() {
  try {
    return fs.readFileSync(templatePath, "utf8");
  } catch {
    return "# LLD Interview Design Template\n\nmy-template.txt was not found.";
  }
}

function parseTemplate(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const titleLine = lines.find((line) => /^#\s+/.test(line));
  const title = titleLine?.replace(/^#\s+/, "").trim() || "LLD Interview Design Template";
  const sections = [];
  let intro = [];
  let current = null;

  for (const line of lines) {
    if (/^#\s+/.test(line)) continue;

    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
    if (sectionMatch) {
      if (current) sections.push(finalizeSection(current));
      current = {
        title: sectionMatch[1].trim(),
        lines: []
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  }

  if (current) sections.push(finalizeSection(current));

  return {
    title,
    introHtml: renderMarkdown(intro.join("\n").trim()),
    sections
  };
}

function finalizeSection(section) {
  return {
    id: slugify(section.title),
    title: section.title,
    html: renderMarkdown(section.lines.join("\n").trim())
  };
}

function renderMarkdown(markdown) {
  if (!markdown.trim()) return "";
  return marked.parse(markdown, {
    mangle: false,
    headerIds: true
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function formatCount(value) {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1)}k`;
}
