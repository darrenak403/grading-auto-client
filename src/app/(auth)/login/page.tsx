"use client";

import { GraduationCap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { isGoogleAuthConfigured } from "@/lib/auth/constants";

export default function LoginPage() {
  const { loginWithGoogle, isLoading } = useAuth();
  const configured = isGoogleAuthConfigured();

  const handleSignIn = () => {
    const result = loginWithGoogle();
    if (!result.success && result.error) {
      // Button stays disabled when not configured; this covers edge cases.
      console.warn(result.error);
    }
  };

  return (
    <main className="w-full max-w-sm">
      <div className="rounded-2xl border border-[#ebebeb] bg-white p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316] text-white"
            aria-hidden
          >
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-[#222222]">Sign in</h1>
          <p className="mt-2 text-sm text-[#71717a]">
            Use your Google account to continue.
          </p>
          <p className="mt-1 text-xs text-[#a1a1aa]">{siteConfig.name}</p>
        </div>

        <GoogleSignInButton
          disabled={!configured}
          loading={isLoading}
          onClick={handleSignIn}
        />

        {!configured && (
          <p className="mt-4 text-center text-xs text-[#71717a]" role="status">
            Sign-in is not configured yet. Contact your administrator.
          </p>
        )}
      </div>
    </main>
  );
}
