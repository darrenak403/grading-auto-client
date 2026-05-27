import {
  AUTH_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  type UserRole,
} from "@/lib/auth/constants";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function buildCookie(name: string, value: string, maxAge = MAX_AGE_SECONDS): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function setAuthCookies(token: string, role: UserRole): void {
  if (typeof document === "undefined") return;
  document.cookie = buildCookie(AUTH_COOKIE_NAME, token);
  document.cookie = buildCookie(ROLE_COOKIE_NAME, role);
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  const expired = "path=/; max-age=0; SameSite=Lax";
  document.cookie = `${AUTH_COOKIE_NAME}=; ${expired}`;
  document.cookie = `${ROLE_COOKIE_NAME}=; ${expired}`;
}

export function parseRole(value: string | undefined): UserRole | null {
  if (value === "admin" || value === "user") return value;
  return null;
}
