"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailSubmissionDialog } from "@/components/shared/DetailSubmissionDialog";

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        router.push("/submissions");
      }
    },
    [router]
  );

  return (
    <DetailSubmissionDialog
      open={true}
      submissionId={submissionId}
      onOpenChange={handleOpenChange}
    />
  );
}