import path from "node:path";
import { getMarkdownDoc, listMarkdownDocs } from "./hld-markdown-doc-store.js";

const HLD_THEORY_DIR = path.join(process.cwd(), "content", "hld", "theory");
const TITLE_OVERRIDES = new Map([
  ["api", "API"],
  ["apis", "APIs"],
  ["cdn", "CDN"],
  ["clickhouse", "ClickHouse"],
  ["db", "DB"],
  ["hld", "HLD"],
  ["http", "HTTP"],
  ["olap", "OLAP"],
  ["oltp", "OLTP"],
  ["sql", "SQL"]
]);

export async function listHldTheoryDocs() {
  const docs = await listMarkdownDocs({ contentDir: HLD_THEORY_DIR, titleOverrides: TITLE_OVERRIDES });
  return docs.map((doc) => ({ ...doc, source: "theory" }));
}

export async function getHldTheoryDoc(id) {
  const doc = await getMarkdownDoc({ contentDir: HLD_THEORY_DIR, id, titleOverrides: TITLE_OVERRIDES });
  return doc ? { ...doc, source: "theory" } : null;
}
