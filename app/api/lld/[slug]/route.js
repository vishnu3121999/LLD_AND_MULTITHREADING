import { NextResponse } from "next/server";
import { getLldLesson } from "../../../../lib/lld-content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { slug } = await params;
  const lesson = await getLldLesson(slug);

  if (!lesson) {
    return NextResponse.json({ error: "LLD lesson not found" }, { status: 404 });
  }

  return NextResponse.json(toPublicLesson(lesson), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function toPublicLesson(lesson) {
  const { sourceDir, sourceOrder, sourcePath, ...publicLesson } = lesson;
  return publicLesson;
}
