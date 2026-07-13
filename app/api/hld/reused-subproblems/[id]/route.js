import { NextResponse } from "next/server";
import { getHldReusedSubproblemDoc } from "../../../../../lib/hld-reused-subproblems-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const doc = await getHldReusedSubproblemDoc(id);
  if (!doc) return NextResponse.json({ error: "Reused subproblem not found" }, { status: 404 });
  return NextResponse.json(doc);
}
