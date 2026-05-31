"use client";

import { isRosterScorePending } from "@/lib/lab-utils";
import type { LabAssignmentRosterItemDto } from "@/types";
import { BeatLoading } from "respinner";

/** Animated grading indicator shown while a score is not yet available. */
export function GradingPlaceholderProgress({ className = "" }: { className?: string }) {
  return (
    <div className={`mt-1.5 flex min-h-[18px] items-center ${className}`} aria-hidden="true">
      <BeatLoading 
        width={28}
        count={4}
        gap={3}
        duration={0.9}
        color="#1d4ed8"
        className="block"
      />
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
