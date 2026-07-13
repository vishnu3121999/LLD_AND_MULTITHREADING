import { apiErrorResponse, getJavaDiff } from "../../../../lib/java-workspace/java-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const diff = await getJavaDiff(searchParams.get("module"), searchParams.get("from"), searchParams.get("to"));
    return Response.json(diff);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
