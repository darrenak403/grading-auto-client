"use client";

import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { useLabGradingProgress, useLabWizard } from "../../context";

export type ReadinessState = "ready" | "warning" | "blocked";

export type ReadinessItem = {
  id: string;
  label: string;
  detail: string;
  state: ReadinessState;
  step: number;
};

const stateMeta: Record<
  ReadinessState,
  {
    label: string;
    text: string;
    bg: string;
    border: string;
    icon: typeof CheckCircle2;
  }
> = {
  ready: {
    label: "Ready",
    text: "text-[#166534]",
    bg: "bg-[#f0fdf4]",
    border: "border-[#bbf7d0]",
    icon: CheckCircle2,
  },
  warning: {
    label: "Check",
    text: "text-[#c2410c]",
    bg: "bg-[#fff7ed]",
    border: "border-[#fed7aa]",
    icon: Clock3,
  },
  blocked: {
    label: "Blocked",
    text: "text-[#991b1b]",
    bg: "bg-[#fef2f2]",
    border: "border-[#fecaca]",
    icon: AlertCircle,
  },
};

function buildReadinessItems({
  assignmentTitle,
  testCaseCount,
  submissionCount,
  workflowStatus,
  isGradingActive,
  completedSubmissionCount,
}: {
  assignmentTitle: string;
  testCaseCount: number;
  submissionCount: number;
  workflowStatus?: string;
  isGradingActive: boolean;
  completedSubmissionCount: number;
}): ReadinessItem[] {
  const hasDetails = assignmentTitle.trim().length > 0;
  const hasTestCases = testCaseCount > 0;
  const testsReady =
    hasTestCases &&
    workflowStatus != null &&
    workflowStatus !== "Draft";
  const hasSubmissions = submissionCount > 0;
  const hasCompletedGrades = completedSubmissionCount > 0;

  return [
    {
      id: "details",
      label: "Lab details",
      detail: hasDetails ? "Title and assignment shell are set" : "Add a title before continuing",
      state: hasDetails ? "ready" : "blocked",
      step: 1,
    },
    {
      id: "test-cases",
      label: "Test cases",
      detail: testsReady
        ? `${testCaseCount} test case${testCaseCount === 1 ? "" : "s"} ready`
        : hasTestCases
          ? `${testCaseCount} imported, approve before grading`
          : "Import and approve at least one test case",
      state: testsReady ? "ready" : hasTestCases ? "warning" : "blocked",
      step: 2,
    },
    {
      id: "submissions",
      label: "Submissions",
      detail: hasSubmissions
        ? `${submissionCount} submission${submissionCount === 1 ? "" : "s"} uploaded`
        : "Upload student ZIP/RAR files",
      state: hasSubmissions ? "ready" : "blocked",
      step: 3,
    },
    {
      id: "grading",
      label: "Grading",
      detail: isGradingActive
        ? "Grading is running"
        : hasCompletedGrades
          ? `${completedSubmissionCount} submission${completedSubmissionCount === 1 ? "" : "s"} graded`
          : hasSubmissions
            ? "Run Grade All to produce scores"
            : "Upload submissions before grading",
      state: isGradingActive || hasCompletedGrades ? "ready" : hasSubmissions ? "warning" : "blocked",
      step: 3,
    },
    {
      id: "export",
      label: "Export",
      detail: hasCompletedGrades
        ? "Excel export is available in Review Results"
        : "Finish grading before export",
      state: hasCompletedGrades ? "ready" : "blocked",
      step: 4,
    },
  ];
}

export function useLabReadiness() {
  const { assignment } = useLabWizard();
  const { progress } = useLabGradingProgress();

  if (!assignment) {
    return {
      items: [],
      blockers: 0,
      warnings: 0,
      ready: 0,
      nextIssue: undefined,
      state: "blocked" as ReadinessState,
    };
  }

  const items = buildReadinessItems({
    assignmentTitle: assignment.title,
    testCaseCount: assignment.testCaseCount,
    submissionCount: assignment.submissionCount,
    workflowStatus: progress?.assignmentStatus,
    isGradingActive: progress?.isGradingActive ?? false,
    completedSubmissionCount: progress?.completedSubmissionCount ?? 0,
  });

  const blockers = items.filter((item) => item.state === "blocked").length;
  const warnings = items.filter((item) => item.state === "warning").length;
  const ready = items.length - blockers - warnings;
  const nextIssue = items.find((item) => item.state !== "ready");
  const state: ReadinessState = blockers > 0 ? "blocked" : warnings > 0 ? "warning" : "ready";

  return { items, blockers, warnings, ready, nextIssue, state };
}

export function LabReadinessNudge() {
  const { currentStep, goToStep } = useLabWizard();
  const { items, ready, nextIssue, state } = useLabReadiness();
  const meta = stateMeta[state];
  const Icon = meta.icon;

  if (items.length === 0) return null;

  const label = state === "ready" ? "Ready to export" : nextIssue?.label;
  const detail =
    state === "ready"
      ? `${ready}/${items.length} checks complete`
      : nextIssue?.detail;

  return (
    <button
      type="button"
      onClick={() => nextIssue && goToStep(nextIssue.step, nextIssue.step > currentStep ? 1 : -1)}
      disabled={!nextIssue}
      className={`hidden min-w-0 max-w-[320px] items-center gap-2 rounded-full border px-3 py-1.5 text-left transition-colors md:inline-flex ${meta.bg} ${meta.border} ${nextIssue ? "cursor-pointer hover:border-[#f97316]" : "cursor-default"}`}
      aria-label={
        nextIssue
          ? `Readiness: ${nextIssue.label} needs attention. ${nextIssue.detail}`
          : "Readiness: all grading requirements are ready"
      }
      title={detail}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.text}`} aria-hidden />
      <span className="min-w-0">
        <span className={`block truncate text-[11px] font-bold leading-tight ${meta.text}`}>
          {label}
        </span>
        <span className="block truncate text-[10px] font-medium text-[#717171]">
          {detail}
        </span>
      </span>
    </button>
  );
}
