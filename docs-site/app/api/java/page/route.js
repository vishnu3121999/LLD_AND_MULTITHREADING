import { apiErrorResponse, getJavaPage } from "../../../../lib/java-workspace/java-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = await getJavaPage(searchParams.get("module"), searchParams.get("package"));
    return Response.json(page);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
