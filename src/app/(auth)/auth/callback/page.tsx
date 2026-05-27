"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeOAuthCallback } = useAuth();

  const result = useMemo(
    () => completeOAuthCallback(searchParams),
    [completeOAuthCallback, searchParams]
  );

  useEffect(() => {
    if (result.success) {
      router.replace("/dashboard");
    }
  }, [result.success, router]);

  if (result.success) {
    return (
      <p className="text-center text-sm text-[#71717a]" role="status">
        Completing sign-in…
      </p>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[#ebebeb] bg-white p-8 text-center">
      <h1 className="text-lg font-semibold text-[#222222]">Sign-in failed</h1>
      <p className="mt-2 text-sm text-[#71717a]">
        {result.error ?? "Sign-in could not be completed."}
      </p>
      <Button href="/login" variant="primary" className="mt-6">
        Back to sign in
      </Button>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="w-full max-w-sm">
      <Suspense
        fallback={
          <p className="text-center text-sm text-[#71717a]">Completing sign-in…</p>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </main>
  );
}
