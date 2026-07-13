import { NextResponse } from "next/server";
import { deleteHldProblem, getHldProblem, updateHldProblem } from "../../../../../lib/hld-store";
import { requireApiAdmin } from "../../../../../lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const problem = await getHldProblem(id);
  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  return NextResponse.json(problem);
}

export async function PUT(request, { params }) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const payload = await request.json();
    const problem = await updateHldProblem(id, payload);
    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    return NextResponse.json(problem);
  } catch (error) {
    return hldErrorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const deleted = await deleteHldProblem(id);
  if (!deleted) return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}

function hldErrorResponse(error) {
  const status = Number(error?.status) || 500;
  return NextResponse.json({ error: error?.message || "Unexpected HLD storage error" }, { status });
}
