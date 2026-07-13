import { NextResponse } from "next/server";
import {
  readHldProblemMarkdown,
  updateHldProblemMarkdown
} from "../../../../../../lib/hld-store";
import { requireApiAdmin } from "../../../../../../lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const source = await readHldProblemMarkdown(id);
  if (!source) return NextResponse.json({ error: "Markdown source not found" }, { status: 404 });
  return NextResponse.json(source);
}

export async function PUT(request, { params }) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const payload = await request.json();
    const problem = await updateHldProblemMarkdown(id, payload.markdown);
    if (!problem) return NextResponse.json({ error: "Markdown source not found" }, { status: 404 });
    return NextResponse.json(problem);
  } catch (error) {
    return hldErrorResponse(error);
  }
}

function hldErrorResponse(error) {
  const status = Number(error?.status) || 500;
  return NextResponse.json({ error: error?.message || "Unexpected HLD markdown storage error" }, { status });
}
