import { NextResponse } from "next/server";
import { searchContent } from "../../../lib/site-data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_SEARCH_API_KEY;
  const indexName = process.env.ALGOLIA_INDEX_NAME;

  if (appId && apiKey && indexName) {
    try {
      const algolia = await import("algoliasearch");
      const createClient = algolia.algoliasearch || algolia.default;
      const client = createClient(appId, apiKey);
      const response = client.searchSingleIndex
        ? await client.searchSingleIndex({ indexName, searchParams: { query, hitsPerPage: 8 } })
        : await client.initIndex(indexName).search(query, { hitsPerPage: 8 });

      return NextResponse.json({
        provider: "algolia",
        results: (response.hits || []).map((hit) => ({
          title: hit.title,
          href: hit.href,
          type: hit.type || "Content",
          excerpt: hit.excerpt || ""
        }))
      });
    } catch (error) {
      return NextResponse.json({
        provider: "local",
        warning: error.message,
        results: searchContent(query)
      });
    }
  }

  return NextResponse.json({ provider: "local", results: searchContent(query) });
}
