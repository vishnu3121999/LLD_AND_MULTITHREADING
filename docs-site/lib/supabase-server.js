import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sanitizeRedirectPath } from "./auth-paths";
import { getSupabaseConfig } from "./supabase-config";

export async function createSupabaseServerClient() {
  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot always write cookies. The proxy refreshes auth cookies before render.
        }
      }
    }
  });
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user || null;
}

export async function requireUser(nextPath = "/workspace") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(sanitizeRedirectPath(nextPath))}`);
  }
  return user;
}

export async function requireApiUser() {
  const { configured } = getSupabaseConfig();
  if (!configured) {
    return {
      response: Response.json(
        { error: "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
        { status: 503 }
      )
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return {
      response: Response.json({ error: "Authentication required" }, { status: 401 })
    };
  }

  return { user };
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || null
  };
}
