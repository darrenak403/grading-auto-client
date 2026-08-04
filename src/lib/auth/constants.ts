import { siteConfig } from "@/config/site";

export type UserRole = "admin" | "user";

export const OAUTH_CALLBACK_PATH = "/auth/callback";

export const AUTH_COOKIE_NAME = "auth_token";
export const ROLE_COOKIE_NAME = "role";

/** Query params from backend redirect (adjust when API contract is fixed). */
export const OAUTH_QUERY = {
  token: "token",
  role: "role",
  email: "email",
  error: "error",
  message: "message",
} as const;

export function getGoogleAuthUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL?.trim();
  if (explicit) return explicit;

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || siteConfig.apiUrl;
  if (!apiBase) return null;

  const returnUrl = `${siteConfig.url}${OAUTH_CALLBACK_PATH}`;
  return `${apiBase.replace(/\/$/, "")}/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL?.trim());
}
