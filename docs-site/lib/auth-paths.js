export const PROTECTED_PAGE_PATHS = ["/workspace", "/solve"];
export const PROTECTED_API_PATHS = ["/api/java"];

export function isProtectedPage(pathname) {
  return PROTECTED_PAGE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isProtectedApi(pathname) {
  return PROTECTED_API_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function sanitizeRedirectPath(value, fallback = "/workspace") {
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/[\r\n]/.test(value)) return fallback;
  return value;
}
