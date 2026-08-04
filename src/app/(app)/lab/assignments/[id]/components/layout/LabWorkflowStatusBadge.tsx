"use client";

import { useLabGradingProgress } from "../../context";
import { formatWorkflowStatusLabel } from "@/lib/lab-utils";

const statusStyles: Record<string, string> = {
  Draft: "bg-[#f4f4f5] text-[#717171] border-[#ebebeb]",
  TestcasesReady: "bg-[#eff6ff] text-[#1d4ed8] border-[#dbeafe]",
  Grading: "bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]",
  Done: "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]",
};

export function LabWorkflowStatusBadge({
  className = "hidden sm:inline-flex",
}: {
  className?: string;
}) {
  const { progress } = useLabGradingProgress();
  if (!progress?.assignmentStatus) return null;

  const status = progress.assignmentStatus;
  const style =
    statusStyles[status] ?? "bg-[#f4f4f5] text-[#717171] border-[#ebebeb]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style} ${className}`}
    >
      {status === "Grading" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {formatWorkflowStatusLabel(status)}
    </span>
  );
}
