export function buildHldNavGroups(problems = []) {
  return [
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
