export function buildHldNavGroups(problems = [], theoryDocs = []) {
  const groups = [
    {
      id: "problem-library",
      number: "Library",
      title: "Problem Library",
      description: "Solved high-level design problems.",
      items: problems.map((problem) => ({
        slug: problem.id,
        title: problem.title,
        summary: problem.summary || "",
        sectionCount: problem.sectionCount || 0
      }))
    }
  ];

  if (theoryDocs.length > 0) {
    groups.push({
      id: "theory",
      number: "Theory",
      title: "Theory",
      description: "Core HLD theory notes.",
      items: theoryDocs.map((doc) => ({
        slug: `theory:${doc.id}`,
        href: `/hld/theory/${doc.id}`,
        title: doc.title,
        summary: doc.summary || "",
        sectionCount: doc.sectionCount || 0
      }))
    });
  }

  return groups;
}

export function buildHldPageNav(problem) {
  if (!problem) return [];

  const used = new Map();
  const sectionItems = (problem.sections || []).map((section, index) => ({
    href: `#${makeId(section.title, `section-${index}`, used)}`,
    label: section.title || "Untitled"
  }));

  return [
    { href: "#overview", label: "Overview" },
    ...sectionItems
  ];
}

export function buildHldTheoryPageNav(doc) {
  if (!doc) return [];

  const headingItems = (doc.headings || [])
    .filter((heading) => heading.level <= 2)
    .map((heading) => ({
      href: `#${heading.id}`,
      label: heading.title || "Untitled"
    }));

  return [
    { href: "#overview", label: "Overview" },
    ...headingItems
  ];
}

function makeId(title, fallback, used) {
  const base = slugify(title) || fallback || "section";
  const count = used.get(base) || 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
