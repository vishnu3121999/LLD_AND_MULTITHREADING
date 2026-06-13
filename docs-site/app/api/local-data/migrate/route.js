import { NextResponse } from "next/server";
import { migrateLocalData } from "../../../../lib/local-data-store";
import { requireApiAdmin } from "../../../../lib/supabase-server";

export async function POST(request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const migrated = await migrateLocalData(body.entries || {});
  return NextResponse.json({ ok: true, migrated });
}
