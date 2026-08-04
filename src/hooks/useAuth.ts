"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib";
import {
  getGoogleAuthUrl,
  isGoogleAuthConfigured,
  OAUTH_QUERY,
  type UserRole,
} from "@/lib/auth/constants";
import { clearAuthCookies, parseRole, setAuthCookies } from "@/lib/auth/cookies";
import { isAuthBypassEnabled } from "@/lib/auth/skip-auth";

export interface User {
  id: string;
  email: string;
  role?: UserRole;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistSession(user: User, token: string, role: UserRole) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("user", JSON.stringify({ ...user, role }));
  setAuthCookies(token, role);
}

const SKIP_AUTH_MOCK: AuthState = {
  user: { id: "dev", email: "dev@local", role: "admin" },
  isLoading: false,
  isAuthenticated: true,
};

function getInitialAuthState(): AuthState {
  if (isAuthBypassEnabled()) {
    return SKIP_AUTH_MOCK;
  }
  if (typeof window === "undefined") {
    return { user: null, isLoading: false, isAuthenticated: false };
  }
  const token = localStorage.getItem("auth_token");
  const user = readStoredUser();
  if (token && user) {
    const role = user.role ?? parseRole(getCookieValue("role")) ?? "user";
    setAuthCookies(token, role);
    return {
      user: { ...user, role },
      isLoading: false,
      isAuthenticated: true,
    };
  }
  return { user: null, isLoading: false, isAuthenticated: false };
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await api.post<{ user: User; token: string }>(
        "/auth/login",
        credentials
      );

      if (response.status && response.data) {
        const role = response.data.user.role ?? "user";
        persistSession(response.data.user, response.data.token, role);
        setAuthState({
          user: { ...response.data.user, role },
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true as const };
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false as const, error: response.message };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await api.post<{ user: User; token: string }>(
        "/auth/register",
        data
      );

      if (response.status && response.data) {
        const role = response.data.user.role ?? "user";
        persistSession(response.data.user, response.data.token, role);
        setAuthState({
          user: { ...response.data.user, role },
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true as const };
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false as const, error: response.message };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }, []);

  const loginWithGoogle = useCallback((): {
    success: boolean;
    error?: string;
  } => {
    if (!isGoogleAuthConfigured()) {
      return { success: false, error: "Sign-in is not configured yet." };
    }

    const url = getGoogleAuthUrl();
    if (!url) {
      return { success: false, error: "Sign-in is not configured yet." };
    }

    setAuthState((prev) => ({ ...prev, isLoading: true }));
    window.location.assign(url);
    return { success: true };
  }, []);

  const completeOAuthCallback = useCallback(
    (params: URLSearchParams): { success: boolean; error?: string } => {
      const error = params.get(OAUTH_QUERY.error);
      if (error) {
        const message = params.get(OAUTH_QUERY.message);
        return {
          success: false,
          error: message || error.replace(/_/g, " "),
        };
      }

      const token = params.get(OAUTH_QUERY.token);
      if (!token) {
        return { success: false, error: "Missing sign-in token." };
      }

      const email = params.get(OAUTH_QUERY.email) ?? "";
      const role = parseRole(params.get(OAUTH_QUERY.role) ?? undefined) ?? "user";
      const user: User = {
        id: email || "oauth-user",
        email,
        role,
      };

      persistSession(user, token, role);
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    clearAuthCookies();
    setAuthState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    loginWithGoogle,
    completeOAuthCallback,
  };
}

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}
