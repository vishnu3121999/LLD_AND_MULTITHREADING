import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "hld", "uploads");
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);
const MIME_EXTS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg"
};

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file || typeof file.arrayBuffer !== "function") {
        return NextResponse.json({ error: "file is required" }, { status: 400 });
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const ext = inferExtension(file.name, file.type);
      return saveUpload(bytes, ext);
    }

    const payload = await request.json().catch(() => ({}));
    const match = String(payload.data || "").match(/^data:image\/([\w+.-]+);base64,(.+)$/s);
    if (!match) return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });

    const ext = normalizeExtension(match[1]);
    const bytes = Buffer.from(match[2], "base64");
    return saveUpload(bytes, ext);
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: Number(error?.status) || 500 });
  }
}

async function saveUpload(bytes, ext) {
  const normalizedExt = normalizeExtension(ext);
  if (!ALLOWED_EXTS.has(normalizedExt)) {
    return NextResponse.json({ error: `Unsupported image type: ${ext}` }, { status: 400 });
  }

  if (bytes.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${normalizedExt === "jpeg" ? "jpg" : normalizedExt}`;
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return NextResponse.json({ url: `/hld/uploads/${filename}`, filename }, { status: 201 });
}

function inferExtension(name = "", type = "") {
  const fromName = path.extname(name).slice(1).toLowerCase();
  if (fromName) return fromName;
  return MIME_EXTS[type] || "";
}

function normalizeExtension(ext) {
  const normalized = String(ext || "").toLowerCase().replace(/^\./, "");
  return normalized === "jpeg" ? "jpg" : normalized;
}
