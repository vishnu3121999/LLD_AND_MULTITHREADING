import { readFile } from "node:fs/promises";
import path from "node:path";

const BEHAVIORAL_INDEX = path.join(process.cwd(), "content", "behavioral", "index.md");

export const behavioralStoryBuilder = {
  slug: "story-builder",
  title: "Story Builder",
  eyebrow: "STAR Library",
  description: "Create reusable STAR stories and attach them to behavioral interview questions."
};

export async function getBehavioralCurriculum() {
  const raw = await readFile(BEHAVIORAL_INDEX, "utf8").catch(() => "");
  const categories = parseBehavioralIndex(raw);
  return {
    storyBuilder: behavioralStoryBuilder,
    categories,
    items: [behavioralStoryBuilder, ...categories]
  };
}

export async function getBehavioralCategory(slug) {
  const curriculum = await getBehavioralCurriculum();
  return curriculum.categories.find((category) => category.slug === slug) || null;
}

function parseBehavioralIndex(raw) {
  const lines = String(raw || "").replace(/\r\n/g, "\n").split("\n");
  const categories = [];
  const seenQuestionIds = new Set();
  let currentCategory = null;
  let currentQuestion = null;
  let currentSection = "";
  let currentExample = null;

  function finishQuestion() {
    if (!currentQuestion) return;
    if (!currentCategory) {
      throw new Error(`Behavioral question "${currentQuestion.text}" is missing a category.`);
    }
    if (seenQuestionIds.has(currentQuestion.id)) {
      throw new Error(`Duplicate behavioral question id: ${currentQuestion.id}`);
    }
    seenQuestionIds.add(currentQuestion.id);
    currentCategory.questions.push(currentQuestion);
    currentQuestion = null;
    currentSection = "";
    currentExample = null;
  }

  function finishCategory() {
    finishQuestion();
    if (currentCategory) categories.push(finalizeCategory(currentCategory));
    currentCategory = null;
  }

  for (const rawLine of lines) {
    const line = repairCommonMojibake(rawLine).trim();
    if (!line || line === "---" || line.startsWith("<!--") || line.endsWith("-->")) continue;

    const categoryHeading = line.match(/^#\s+(\d+)\.\s+(.+)$/);
    if (categoryHeading) {
      finishCategory();
      currentCategory = {
        number: categoryHeading[1],
        title: categoryHeading[2].trim(),
        descriptionLines: [],
        questions: []
      };
      continue;
    }

    const questionHeading = line.match(/^##\s+(\d+)\.\s+\[id:\s*([A-Za-z0-9._:-]+)\]\s+(.+)$/i);
    if (questionHeading) {
      finishQuestion();
      if (!currentCategory) {
        throw new Error(`Behavioral question "${questionHeading[3].trim()}" is missing a category.`);
      }
      currentQuestion = {
        id: questionHeading[2].trim(),
        number: Number(questionHeading[1]),
        text: questionHeading[3].trim(),
        importance: "",
        expectations: [],
        exampleAnswers: []
      };
      currentSection = "";
      currentExample = null;
      continue;
    }

    if (!currentCategory) continue;

    if (!currentQuestion) {
      if (!line.startsWith("#")) currentCategory.descriptionLines.push(line);
      continue;
    }

    const importance = line.match(/^\*\*Importance:\*\*\s*(.+)$/i);
    if (importance) {
      currentQuestion.importance = importance[1].trim();
      currentSection = "importance";
      currentExample = null;
      continue;
    }

    if (/^\*\*Interviewer(?:'|\u2019)s Expectation:\*\*\s*$/i.test(line)) {
      currentSection = "expectations";
      currentExample = null;
      continue;
    }

    const exampleHeading = line.match(/^\*\*Example Answers?(?:\s+(\d+))?(?::\s*(.+?))?\*\*\s*$/i);
    if (exampleHeading) {
      currentSection = "example";
      currentExample = {
        number: exampleHeading[1] ? Number(exampleHeading[1]) : currentQuestion.exampleAnswers.length + 1,
        title: (exampleHeading[2] || "").trim(),
        items: []
      };
      currentQuestion.exampleAnswers.push(currentExample);
      continue;
    }

    if (currentSection === "expectations" && isListItem(line)) {
      currentQuestion.expectations.push(parseListItem(line));
      continue;
    }

    if (currentSection === "example" && currentExample && isListItem(line)) {
      currentExample.items.push(parseListItem(line));
    }
  }

  finishCategory();
  return categories;
}

function finalizeCategory(category) {
  if (category.questions.length === 0) {
    throw new Error(`Behavioral category "${category.title}" has no questions.`);
  }

  return {
    number: category.number,
    slug: slugify(category.title),
    title: category.title,
    eyebrow: `Category ${category.number}`,
    description: category.descriptionLines.join(" ").trim(),
    questions: category.questions
  };
}

function isListItem(line) {
  return /^[-*]\s+/.test(line);
}

function parseListItem(line) {
  const text = String(line || "").replace(/^[-*]\s+/, "").trim();
  const labeled = text.match(/^\*\*([^*]+?):\*\*\s*(.*)$/);

  if (!labeled) {
    return {
      label: "",
      text
    };
  }

  return {
    label: labeled[1].trim(),
    text: labeled[2].trim()
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function repairCommonMojibake(value) {
  return String(value || "")
    .replace(/Ã¢â‚¬â€œ/g, "-")
    .replace(/Ã¢â‚¬â€\u009d/g, "-")
    .replace(/Ã¢â‚¬â„¢/g, "'")
    .replace(/Ã¢â‚¬Å“|Ã¢â‚¬Â\u009d/g, "\"");
}
