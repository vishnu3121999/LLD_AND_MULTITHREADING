import { NextResponse } from "next/server";
import { deleteLocalDataValue, getLocalDataValue, setLocalDataValue } from "../../../lib/local-data-store";
import { requireApiAdmin } from "../../../lib/supabase-server";

export async function GET(request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });
  return NextResponse.json({ key, value: await getLocalDataValue(key) });
}

export async function PUT(request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  if (!body.key) return NextResponse.json({ error: "key is required" }, { status: 400 });
  const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? null);
  await setLocalDataValue(body.key, value);
  return NextResponse.json({ ok: true, key: body.key });
}

export async function DELETE(request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  if (!body.key) return NextResponse.json({ error: "key is required" }, { status: 400 });
  await deleteLocalDataValue(body.key);
  return NextResponse.json({ ok: true, key: body.key });
}
