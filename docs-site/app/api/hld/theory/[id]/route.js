import { NextResponse } from "next/server";
import { getHldTheoryDoc } from "../../../../../lib/hld-theory-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const doc = await getHldTheoryDoc(id);
  if (!doc) return NextResponse.json({ error: "Theory doc not found" }, { status: 404 });
  return NextResponse.json(doc);
}
