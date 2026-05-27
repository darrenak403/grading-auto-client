"use client";

import { isRosterScorePending } from "@/lib/lab-utils";
import type { LabAssignmentRosterItemDto } from "@/types";

/** Decorative slow progress bar shown while a score is not yet available. */
export function GradingPlaceholderProgress({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mt-1.5 h-1 w-full min-w-[72px] max-w-[140px] overflow-hidden rounded-full bg-[#f4f4f5] ${className}`}
      aria-hidden="true"
    >
      <div className="lab-grading-placeholder-fill h-full rounded-full bg-[#1d4ed8]" />
    </div>
  );
}

export function RosterScoreCell({ item }: { item: LabAssignmentRosterItemDto }) {
  if (item.totalScore === null && item.submissionStatus === "Pending" && !item.jobStatus) {
    return <span className="text-sm text-[#717171]">—</span>;
  }

  if (
    item.totalScore === null &&
    (item.jobStatus === "Done" || item.jobStatus === "Failed")
  ) {
    return <span className="text-sm text-[#717171]">—</span>;
  }

  if (isRosterScorePending(item)) {
    return (
      <div className="min-w-[100px]">
        <span className="text-xs font-semibold text-[#1d4ed8]">Grading…</span>
        <GradingPlaceholderProgress />
      </div>
    );
  }

  return (
    <span className="text-sm font-medium text-[#222222] tabular-nums">
      {item.totalScore} / {item.maxScore}
    </span>
  );
}
