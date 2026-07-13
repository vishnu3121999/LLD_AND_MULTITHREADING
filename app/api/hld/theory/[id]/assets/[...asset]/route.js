import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const HLD_THEORY_DIR = path.join(process.cwd(), "content", "hld", "theory");
const VALID_ID = /^[a-z0-9][a-z0-9-]*$/;
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
  const { id, asset } = await params;
  const relativeAsset = normalizeAssetPath(asset);
  const ext = path.extname(relativeAsset).toLowerCase();

  if (!isValidId(id) || !relativeAsset || !IMAGE_TYPES.has(ext)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const theoryDir = path.resolve(HLD_THEORY_DIR, id);
    const filePath = path.resolve(theoryDir, relativeAsset);

    if (!isPathInside(filePath, theoryDir)) {
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

function isValidId(id) {
  return typeof id === "string" && VALID_ID.test(id);
}
