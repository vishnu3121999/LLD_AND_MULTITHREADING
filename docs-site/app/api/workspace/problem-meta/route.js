import { NextResponse } from "next/server";
import { createSupabaseServerClient, requireApiUser } from "../../../../lib/supabase-server";

const TABLE_NAME = "workspace_problem_meta";
const MAX_MODULE_NAME_LENGTH = 240;
const MAX_NOTES_LENGTH = 20000;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const moduleName = new URL(request.url).searchParams.get("moduleName");
  if (moduleName && !isValidModuleName(moduleName)) {
    return NextResponse.json({ error: "moduleName is invalid" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from(TABLE_NAME)
    .select("module_name, completed, notes, updated_at")
    .eq("user_id", auth.user.id)
    .order("module_name", { ascending: true });

  if (moduleName) query = query.eq("module_name", moduleName);

  const { data, error } = await query;
  if (error) return workspaceProblemMetaError(error);

  return NextResponse.json({
    meta: Object.fromEntries((data || []).map((row) => [
      row.module_name,
      {
        completed: Boolean(row.completed),
        notes: typeof row.notes === "string" ? row.notes : "",
        updatedAt: row.updated_at
      }
    ]))
  });
}

export async function PUT(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  if (!isValidModuleName(body.moduleName)) {
    return NextResponse.json({ error: "moduleName is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: readError } = await supabase
    .from(TABLE_NAME)
    .select("completed, notes")
    .eq("user_id", auth.user.id)
    .eq("module_name", body.moduleName)
    .maybeSingle();

  if (readError) return workspaceProblemMetaError(readError);

  const row = {
    user_id: auth.user.id,
    module_name: body.moduleName,
    completed: typeof body.completed === "boolean" ? body.completed : Boolean(existing?.completed),
    notes: typeof body.notes === "string" ? sanitizeNotes(body.notes) : existing?.notes || "",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(row, { onConflict: "user_id,module_name" })
    .select("module_name, completed, notes, updated_at")
    .single();

  if (error) return workspaceProblemMetaError(error);

  return NextResponse.json({
    ok: true,
    meta: {
      moduleName: data.module_name,
      completed: Boolean(data.completed),
      notes: typeof data.notes === "string" ? data.notes : "",
      updatedAt: data.updated_at
    }
  });
}

function isValidModuleName(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_MODULE_NAME_LENGTH;
}

function sanitizeNotes(value) {
  return value.slice(0, MAX_NOTES_LENGTH);
}

function workspaceProblemMetaError(error) {
  const message = /workspace_problem_meta|relation .* does not exist/i.test(error.message || "")
    ? "Supabase table workspace_problem_meta is missing. Run docs-site/supabase/workspace-problem-meta.sql in Supabase SQL editor."
    : error.message || "Unable to access workspace problem metadata.";

  return NextResponse.json({ error: message }, { status: 500 });
}
