import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLldLesson } from "../../../../../../lib/lld-content-store";

const IMAGE_TYPES = new Map([
  [".apng", "image/apng"],
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { slug, asset } = await params;
  const lesson = await getLldLesson(slug);
  const relativeAsset = normalizeAssetPath(asset);
  const ext = path.extname(relativeAsset).toLowerCase();

  if (!lesson?.sourceDir || !relativeAsset || !IMAGE_TYPES.has(ext)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const sourceDir = path.resolve(lesson.sourceDir);
    const filePath = path.resolve(sourceDir, relativeAsset);

    if (!isPathInside(filePath, sourceDir)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const etag = `"${fileStat.size}-${Math.trunc(fileStat.mtimeMs)}"`;
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache, must-revalidate",
          "ETag": etag
        }
      });
    }

    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
        "Content-Type": IMAGE_TYPES.get(ext),
        "ETag": etag,
        "Last-Modified": fileStat.mtime.toUTCString()
      }
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}

function normalizeAssetPath(asset) {
  const value = Array.isArray(asset) ? asset.join("/") : String(asset || "");
  const decoded = safeDecodeURIComponent(value).replace(/\\/g, "/").replace(/^\.?\//, "");
  const normalized = path.posix.normalize(decoded);

  if (
    !normalized ||
    normalized === "." ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    path.isAbsolute(normalized)
  ) {
    return "";
  }

  return normalized;
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return String(value || "");
  }
}

function isPathInside(target, root) {
  const relative = path.relative(root, target);
  return Boolean(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}
