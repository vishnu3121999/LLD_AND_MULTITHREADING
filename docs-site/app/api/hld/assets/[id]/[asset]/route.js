import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const HLD_DATA_DIR = path.join(process.cwd(), "content", "hld", "problems");
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

export async function GET(_request, { params }) {
  const { id, asset } = await params;
  const relativeAsset = decodeURIComponent(asset || "");
  const ext = path.extname(relativeAsset).toLowerCase();
  const normalizedAsset = path.normalize(relativeAsset);

  if (
    !VALID_ID.test(id || "") ||
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

    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": IMAGE_TYPES.get(ext)
      }
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
