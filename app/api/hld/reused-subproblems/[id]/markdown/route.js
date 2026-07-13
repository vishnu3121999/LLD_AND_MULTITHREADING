import { NextResponse } from "next/server";
import {
  readHldReusedSubproblemMarkdown,
  updateHldReusedSubproblemMarkdown
} from "../../../../../../lib/hld-reused-subproblems-store";
import { requireApiAdmin } from "../../../../../../lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const source = await readHldReusedSubproblemMarkdown(id);
  if (!source) return NextResponse.json({ error: "Markdown source not found" }, { status: 404 });
  return NextResponse.json(source);
}

export async function PUT(request, { params }) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const payload = await request.json();
    const doc = await updateHldReusedSubproblemMarkdown(id, payload.markdown);
    if (!doc) return NextResponse.json({ error: "Markdown source not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    return markdownErrorResponse(error);
  }
}

function markdownErrorResponse(error) {
  const status = Number(error?.status) || 500;
  return NextResponse.json({ error: error?.message || "Unexpected reused subproblem markdown storage error" }, { status });
}
