import { NextResponse } from "next/server";
import { createSupabaseServerClient, requireApiUser } from "../../../../lib/supabase-server";

const TABLE_NAME = "hld_completions";
const MAX_SLUG_LENGTH = 240;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("item_slug")
    .eq("user_id", auth.user.id)
    .eq("completed", true)
    .order("item_slug", { ascending: true });

  if (error) return hldCompletionsError(error);

  return NextResponse.json({
    completed: (data || []).map((row) => row.item_slug)
  });
}

export async function PUT(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  if (!isValidSlug(body.slug)) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const row = {
    user_id: auth.user.id,
    item_slug: body.slug.trim(),
    completed: Boolean(body.completed),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(row, { onConflict: "user_id,item_slug" });

  if (error) return hldCompletionsError(error);

  return GET();
}

function isValidSlug(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_SLUG_LENGTH;
}

function hldCompletionsError(error) {
  const message = /hld_completions|relation .* does not exist/i.test(error.message || "")
    ? "Supabase table hld_completions is missing. Run docs-site/supabase/hld-completions.sql in Supabase SQL editor."
    : error.message || "Unable to access HLD completion data.";

  return NextResponse.json({ error: message }, { status: 500 });
}
