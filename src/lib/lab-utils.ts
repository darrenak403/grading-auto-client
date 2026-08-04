import type {
  LabAssignmentRosterItemDto,
  LabAssignmentWorkflowStatus,
  LabSubmissionStatus,
  LabTestCaseResultDto,
} from "@/types";

export function effectiveScore(row: LabTestCaseResultDto): number {
  return row.manualOverrideScore ?? row.awardedScore;
}

export function sumEffectiveScores(results: LabTestCaseResultDto[]): number {
  return results.reduce((sum, r) => sum + effectiveScore(r), 0);
}

export function isLabSubmissionTerminal(status: LabSubmissionStatus): boolean {
  return status !== "Pending" && status !== "Grading";
}

export function allSubmissionsTerminal(
  submissions: { status: LabSubmissionStatus }[]
): boolean {
  if (submissions.length === 0) return false;
  return submissions.every((s) => isLabSubmissionTerminal(s.status));
}

export function countByStatus(
  submissions: { status: LabSubmissionStatus }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    counts[s.status] = (counts[s.status] ?? 0) + 1;
  }
  return counts;
}

export function isRosterScorePending(item: LabAssignmentRosterItemDto): boolean {
  if (item.totalScore !== null) return false;
  if (item.submissionStatus === "Pending" && !item.jobStatus) return false;
  if (item.jobStatus === "Done" || item.jobStatus === "Failed") return false;
  return true;
}

export function formatWorkflowStatusLabel(
  status: LabAssignmentWorkflowStatus
): string {
  const labels: Record<LabAssignmentWorkflowStatus, string> = {
    Draft: "Draft",
    TestcasesReady: "Test cases ready",
    Grading: "Grading",
    Done: "Done",
  };
  return labels[status] ?? status;
}

export function rosterBySubmissionId(
  roster: LabAssignmentRosterItemDto[]
): Map<string, LabAssignmentRosterItemDto> {
  return new Map(roster.map((r) => [r.submissionId, r]));
}
