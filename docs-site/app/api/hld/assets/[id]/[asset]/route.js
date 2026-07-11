import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const HLD_DATA_DIR = path.join(process.cwd(), "content", "hld", "problems");
const VALID_STORAGE_ID = /^[a-z0-9][a-z0-9._-]*$/;
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

export async function GET(request, { params }) {
  const { id, asset } = await params;
  const relativeAsset = decodeURIComponent(asset || "");
  const ext = path.extname(relativeAsset).toLowerCase();
  const normalizedAsset = path.normalize(relativeAsset);

  if (
    !isValidStorageId(id) ||
    !relativeAsset ||
    path.isAbsolute(normalizedAsset) ||
    normalizedAsset.startsWith("..") ||
    !IMAGE_TYPES.has(ext)
  ) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const problemDir = path.join(HLD_DATA_DIR, id);
    const filePath = path.join(problemDir, normalizedAsset);
    const resolvedPath = path.resolve(filePath);
    const relativePath = path.relative(path.resolve(problemDir), resolvedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const fileStat = await stat(filePath);
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

function isValidStorageId(id) {
  return (
    typeof id === "string" &&
    VALID_STORAGE_ID.test(id) &&
    !id.includes("..") &&
    !id.endsWith(".")
  );
}
