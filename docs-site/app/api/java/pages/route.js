import { apiErrorResponse, getJavaModules } from "../../../../lib/java-workspace/java-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({
      root: "content/java-modules",
      modules: await getJavaModules()
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
