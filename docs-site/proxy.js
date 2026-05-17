import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isProtectedApi, isProtectedPage } from "./lib/auth-paths";
import { getSupabaseConfig } from "./lib/supabase-config";

export async function proxy(request) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const needsAuth = isProtectedPage(pathname) || isProtectedApi(pathname);
  let user = null;

  if (needsAuth) {
    const { url, anonKey, configured } = getSupabaseConfig();

    if (!configured) {
      response = authFailureResponse(request, "auth_not_configured", 503);
    } else {
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headersToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            Object.entries(headersToSet || {}).forEach(([key, value]) => response.headers.set(key, value));
          }
        }
      });

      const { data } = await supabase.auth.getClaims();
      user = data?.claims?.sub ? { id: data.claims.sub } : null;

      if (!user) {
        response = authFailureResponse(request, "auth_required", 401);
      }
    }
  }

  if (pathname.startsWith("/problems/")) {
    response.headers.set("X-Robots-Tag", "noarchive");
    response.headers.set("Cache-Control", "private, max-age=60");
  }

  return response;
}

function authFailureResponse(request, reason, status) {
  if (isProtectedApi(request.nextUrl.pathname)) {
    return NextResponse.json({ error: reason === "auth_not_configured" ? "Supabase auth is not configured" : "Authentication required" }, { status });
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  redirectUrl.searchParams.set("error", reason);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/problems/:path*", "/workspace/:path*", "/solve/:path*", "/api/java/:path*"]
};
