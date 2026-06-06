import { NextResponse } from "next/server";
import { createHldProblem, listHldProblems } from "../../../../lib/hld-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const problems = await listHldProblems();
  return NextResponse.json({ problems });
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const problem = await createHldProblem(payload);
    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    return hldErrorResponse(error);
  }
}

function hldErrorResponse(error) {
  const status = Number(error?.status) || 500;
  return NextResponse.json({ error: error?.message || "Unexpected HLD storage error" }, { status });
}
