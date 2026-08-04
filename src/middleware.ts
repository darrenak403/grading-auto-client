import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  type UserRole,
} from "@/lib/auth/constants";
import {
  isAdminOnlyPath,
  isAuthenticatedPath,
  isPublicPath,
  isUserAllowedPath,
} from "@/lib/auth/routes";
import { isAuthBypassEnabled } from "@/lib/auth/skip-auth";

function parseRole(value: string | undefined): UserRole | null {
  if (value === "admin" || value === "user") return value;
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isAuthBypassEnabled()) {
    if (pathname === "/" || pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = parseRole(request.cookies.get(ROLE_COOKIE_NAME)?.value);
  const isAuthenticated = Boolean(token);

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg"
  ) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    if (isAuthenticated && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    const target = isAuthenticated ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (!isAuthenticatedPath(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminOnlyPath(pathname) && role !== "admin") {
    const forbidden = new URL("/dashboard", request.url);
    forbidden.searchParams.set("forbidden", "1");
    return NextResponse.redirect(forbidden);
  }

  if (role === "user" && !isUserAllowedPath(pathname) && isAuthenticatedPath(pathname)) {
    const forbidden = new URL("/dashboard", request.url);
    forbidden.searchParams.set("forbidden", "1");
    return NextResponse.redirect(forbidden);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
