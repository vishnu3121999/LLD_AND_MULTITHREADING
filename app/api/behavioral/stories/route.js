import { NextResponse } from "next/server";
import { createSupabaseServerClient, requireApiUser } from "../../../../lib/supabase-server";

const TABLE_NAME = "behavioral_stories";
const MAX_STORIES = 100;
const MAX_TEXT_LENGTH = 20000;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, title, situation, task, action, result, updated_at")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false });

  if (error) return behavioralStoriesError(error);

  return NextResponse.json({
    stories: (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      situation: row.situation || "",
      task: row.task || "",
      action: row.action || "",
      result: row.result || "",
      updatedAt: row.updated_at
    }))
  });
}

export async function PUT(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const stories = normalizeStories(body.stories);
  if (stories.error) return NextResponse.json({ error: stories.error }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const rows = stories.value.map((story) => ({
    user_id: auth.user.id,
    id: story.id,
    title: story.title,
    situation: story.situation,
    task: story.task,
    action: story.action,
    result: story.result,
    updated_at: story.updatedAt || now
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(rows, { onConflict: "user_id,id" });

    if (error) return behavioralStoriesError(error);
  }

  const { data: existing, error: readError } = await supabase
    .from(TABLE_NAME)
    .select("id")
    .eq("user_id", auth.user.id);

  if (readError) return behavioralStoriesError(readError);

  const nextIds = new Set(rows.map((row) => row.id));
  const idsToDelete = (existing || []).map((row) => row.id).filter((id) => !nextIds.has(id));

  for (const id of idsToDelete) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("user_id", auth.user.id)
      .eq("id", id);

    if (error) return behavioralStoriesError(error);
  }

  return GET();
}

function normalizeStories(value) {
  if (!Array.isArray(value)) return { error: "stories must be an array" };
  if (value.length > MAX_STORIES) return { error: `At most ${MAX_STORIES} stories are allowed` };

  const stories = [];
  const seen = new Set();

  for (const item of value) {
    const id = String(item?.id || "").trim();
    const title = String(item?.title || "").trim();

    if (!isValidId(id)) return { error: "story id is invalid" };
    if (!title || title.length > 240) return { error: "story title is required and must be 240 characters or fewer" };
    if (seen.has(id)) continue;
    seen.add(id);

    stories.push({
      id,
      title,
      situation: sanitizeText(item?.situation),
      task: sanitizeText(item?.task),
      action: sanitizeText(item?.action),
      result: sanitizeText(item?.result),
      updatedAt: typeof item?.updatedAt === "string" ? item.updatedAt : ""
    });
  }

  return { value: stories };
}

function isValidId(value) {
  return /^[A-Za-z0-9._:-]{1,120}$/.test(value);
}

function sanitizeText(value) {
  return String(value || "").slice(0, MAX_TEXT_LENGTH);
}

function behavioralStoriesError(error) {
  const message = /behavioral_stories|relation .* does not exist/i.test(error.message || "")
    ? "Supabase table behavioral_stories is missing. Run supabase/behavioral-interviews.sql in Supabase SQL editor."
    : error.message || "Unable to access behavioral stories.";

  return NextResponse.json({ error: message }, { status: 500 });
}
