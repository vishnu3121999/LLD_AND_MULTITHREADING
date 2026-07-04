import path from "node:path";
import { getMarkdownDoc, listMarkdownDocs } from "./hld-markdown-doc-store.js";

const HLD_REUSED_SUBPROBLEMS_DIR = path.join(process.cwd(), "content", "hld", "reused-subproblems");
const TITLE_OVERRIDES = new Map([
  ["api", "API"],
  ["blob", "Blob"],
  ["blobs", "Blobs"],
  ["cdn", "CDN"],
  ["db", "DB"],
  ["handlingblobs", "Handling Blobs"],
  ["http", "HTTP"],
  ["notificationsystem", "Notification System"],
  ["sql", "SQL"],
  ["uuid", "UUID"],
  ["uuidgenerator", "UUID Generator"],
  ["webcrawler", "Web Crawler"]
]);

export async function listHldReusedSubproblemDocs() {
  const docs = await listMarkdownDocs({
    contentDir: HLD_REUSED_SUBPROBLEMS_DIR,
    titleOverrides: TITLE_OVERRIDES
  });
  return docs.map((doc) => ({ ...doc, source: "reused-subproblems" }));
}

export async function getHldReusedSubproblemDoc(id) {
  const doc = await getMarkdownDoc({
    contentDir: HLD_REUSED_SUBPROBLEMS_DIR,
    id,
    titleOverrides: TITLE_OVERRIDES
  });
  return doc ? { ...doc, source: "reused-subproblems" } : null;
}
