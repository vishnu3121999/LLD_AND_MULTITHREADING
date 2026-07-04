"use client";

const STORIES_API = "/api/behavioral/stories";
const ANSWERS_API = "/api/behavioral/answers";

export const behavioralAnswersChangedEvent = "behavioral:answers-changed";

export function emptyStory() {
  return {
    id: "",
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    updatedAt: ""
  };
}

export async function loadBehavioralStories() {
  const payload = await fetchJson(STORIES_API);
  return normalizeStories(payload.stories);
}

export async function saveBehavioralStories(stories) {
  const payload = await fetchJson(STORIES_API, {
    method: "PUT",
    body: JSON.stringify({ stories: normalizeStories(stories) })
  });
  return normalizeStories(payload.stories);
}

export async function loadBehavioralAnswers() {
  const payload = await fetchJson(ANSWERS_API);
  return normalizeAnswers(payload.answers);
}

export async function saveBehavioralAnswers(answers) {
  const payload = await fetchJson(ANSWERS_API, {
    method: "PUT",
    body: JSON.stringify({ answers: normalizeAnswers(answers) })
  });
  return normalizeAnswers(payload.answers);
}

export function formatStoryAnswer(story) {
  if (!story) return "";

  return [
    ["Situation", story.situation],
    ["Task", story.task],
    ["Action", story.action],
    ["Result", story.result]
  ]
    .filter(([, value]) => String(value || "").trim())
    .map(([label, value]) => `${label}: ${String(value).trim()}`)
    .join("\n\n");
}

function normalizeStories(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((story) => ({
      id: String(story?.id || "").trim(),
      title: String(story?.title || "").trim(),
      situation: String(story?.situation || ""),
      task: String(story?.task || ""),
      action: String(story?.action || ""),
      result: String(story?.result || ""),
      updatedAt: String(story?.updatedAt || "")
    }))
    .filter((story) => story.id && story.title);
}

function normalizeAnswers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([questionId, answer]) => [
      questionId,
      {
        storyId: String(answer?.storyId || ""),
        answer: String(answer?.answer || ""),
        updatedAt: String(answer?.updatedAt || "")
      }
    ])
  );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sign in to save and load behavioral interview data.");
    }
    throw new Error(payload.error || "Unable to access behavioral interview data.");
  }

  return payload;
}
