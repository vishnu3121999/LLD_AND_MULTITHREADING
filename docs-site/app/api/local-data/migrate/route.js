import { NextResponse } from "next/server";
import { migrateLocalData } from "../../../../lib/local-data-store";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const migrated = await migrateLocalData(body.entries || {});
  return NextResponse.json({ ok: true, migrated });
}
