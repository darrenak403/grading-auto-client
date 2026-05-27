export const PUBLIC_PATHS = ["/login", "/auth/callback"] as const;

export const ADMIN_ONLY_PREFIXES = [
  "/exam-sessions",
  "/assignments",
  "/grading",
  "/exports",
  "/lab",
] as const;

export const USER_ALLOWED_PREFIXES = ["/dashboard", "/submissions"] as const;

export const AUTHENTICATED_PREFIXES = [
  ...USER_ALLOWED_PREFIXES,
  ...ADMIN_ONLY_PREFIXES,
] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isAuthenticatedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return AUTHENTICATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isUserAllowedPath(pathname: string): boolean {
  return USER_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
