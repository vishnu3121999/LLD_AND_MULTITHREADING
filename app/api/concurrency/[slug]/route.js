import { NextResponse } from "next/server";
import { getConcurrencyLesson } from "../../../../lib/concurrency-curriculum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { slug } = await params;
  const lesson = getConcurrencyLesson(slug);

  if (!lesson) {
    return NextResponse.json({ error: "Concurrency lesson not found" }, { status: 404 });
  }

  return NextResponse.json(lesson, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
