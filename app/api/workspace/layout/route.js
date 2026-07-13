import { NextResponse } from "next/server";
import { createSupabaseServerClient, requireApiUser } from "../../../../lib/supabase-server";

const TABLE_NAME = "workspace_layouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const pageId = new URL(request.url).searchParams.get("pageId");
  if (!isValidPageId(pageId)) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("page_id, layouts, parent_zoom, constructor_visibility, collapsed_methods, updated_at")
    .eq("user_id", auth.user.id)
    .eq("page_id", pageId)
    .maybeSingle();

  if (error) return workspaceLayoutError(error);

  return NextResponse.json({
    layout: data ? {
      pageId: data.page_id,
      layouts: data.layouts || {},
      parentZoom: Number(data.parent_zoom) || 1,
      constructorVisibility: data.constructor_visibility || {},
      collapsedMethods: data.collapsed_methods || {},
      updatedAt: data.updated_at
    } : null
  });
}

export async function PUT(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  if (!isValidPageId(body.pageId)) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const row = {
    user_id: auth.user.id,
    page_id: body.pageId,
    layouts: sanitizeObject(body.layouts),
    parent_zoom: sanitizeParentZoom(body.parentZoom),
    constructor_visibility: sanitizeObject(body.constructorVisibility),
    collapsed_methods: sanitizeObject(body.collapsedMethods),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(row, { onConflict: "user_id,page_id" })
    .select("page_id, updated_at")
    .single();

  if (error) return workspaceLayoutError(error);

  return NextResponse.json({
    ok: true,
    pageId: data.page_id,
    updatedAt: data.updated_at
  });
}

function isValidPageId(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 240;
}

function sanitizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function sanitizeParentZoom(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(2, Math.max(0.25, Number(number.toFixed(2))));
}

function workspaceLayoutError(error) {
  const message = /workspace_layouts|relation .* does not exist/i.test(error.message || "")
    ? "Supabase table workspace_layouts is missing. Run supabase/workspace-layouts.sql in Supabase SQL editor."
    : error.message || "Unable to access workspace layout.";

  return NextResponse.json({ error: message }, { status: 500 });
}
