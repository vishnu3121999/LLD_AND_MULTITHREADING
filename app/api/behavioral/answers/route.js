import { NextResponse } from "next/server";
import { createSupabaseServerClient, requireApiUser } from "../../../../lib/supabase-server";

const TABLE_NAME = "behavioral_answers";
const MAX_ANSWERS = 300;
const MAX_QUESTION_ID_LENGTH = 180;
const MAX_STORY_ID_LENGTH = 120;
const MAX_ANSWER_LENGTH = 30000;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("question_id, story_id, answer, updated_at")
    .eq("user_id", auth.user.id)
    .order("question_id", { ascending: true });

  if (error) return behavioralAnswersError(error);

  return NextResponse.json({
    answers: Object.fromEntries((data || []).map((row) => [
      row.question_id,
      {
        storyId: row.story_id || "",
        answer: row.answer || "",
        updatedAt: row.updated_at
      }
    ]))
  });
}

export async function PUT(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const answers = normalizeAnswers(body.answers);
  if (answers.error) return NextResponse.json({ error: answers.error }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const rows = answers.value.map(([questionId, answer]) => ({
    user_id: auth.user.id,
    question_id: questionId,
    story_id: answer.storyId || null,
    answer: answer.answer,
    updated_at: now
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(rows, { onConflict: "user_id,question_id" });

    if (error) return behavioralAnswersError(error);
  }

  return GET();
}

function normalizeAnswers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { value: [] };

  const entries = Object.entries(value);
  if (entries.length > MAX_ANSWERS) return { error: `At most ${MAX_ANSWERS} answers are allowed` };

  const normalized = [];
  for (const [questionId, item] of entries) {
    const normalizedQuestionId = String(questionId || "").trim();
    if (!normalizedQuestionId || normalizedQuestionId.length > MAX_QUESTION_ID_LENGTH) {
      return { error: "question id is invalid" };
    }

    const storyId = String(item?.storyId || "").trim();
    if (storyId.length > MAX_STORY_ID_LENGTH) {
      return { error: "story id is invalid" };
    }

    normalized.push([
      normalizedQuestionId,
      {
        storyId,
        answer: String(item?.answer || "").slice(0, MAX_ANSWER_LENGTH)
      }
    ]);
  }

  return { value: normalized };
}

function behavioralAnswersError(error) {
  const message = /behavioral_answers|relation .* does not exist/i.test(error.message || "")
    ? "Supabase table behavioral_answers is missing. Run supabase/behavioral-interviews.sql in Supabase SQL editor."
    : error.message || "Unable to access behavioral answers.";

  return NextResponse.json({ error: message }, { status: 500 });
}
