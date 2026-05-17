import { getSupabaseConfig } from "../../../../lib/supabase-config";
import { getCurrentUser, publicUser } from "../../../../lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { configured } = getSupabaseConfig();
  const user = configured ? await getCurrentUser() : null;
  return Response.json({
    configured,
    user: publicUser(user)
  });
}
