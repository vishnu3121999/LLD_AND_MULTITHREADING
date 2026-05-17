import { NextResponse } from "next/server";

export function proxy(request) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/problems/")) {
    response.headers.set("X-Robots-Tag", "noarchive");
    response.headers.set("Cache-Control", "private, max-age=60");
  }

  return response;
}

export const config = {
  matcher: ["/problems/:path*"]
};
