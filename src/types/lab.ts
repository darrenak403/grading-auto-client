// ==================== Lab Grading ====================

export type LabAssignmentStatus = "Active" | "Archived";
export type LabTestCaseStatus = "Draft" | "Approved" | "Rejected";
export type LabMatchMode = "Subset" | "Exact" | "StatusOnly";
export type LabSubmissionStatus =
  | "Pending"
  | "Grading"
  | "Done"
  | "BuildFailed"
  | "Error";

/** Grading job status from roster / progress APIs */
export type LabJobStatus = "Pending" | "Running" | "Done" | "Failed";

/**
 * Lab grading pipeline state from GET .../grading-progress only.
 * Not the same as LabAssignmentStatus (Active / Archived) on LabAssignmentDto.
 */
export type LabAssignmentWorkflowStatus =
  | "Draft"
  | "TestcasesReady"
  | "Grading"
  | "Done";

export type LabHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "SOURCE";

export interface SemesterDto {
  id: string;
  name: string;
  code: string;
  startDate: string | null;
  endDate: string | null;
  labAssignmentCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface SemesterFormValues {
  name: string;
  code: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface LabAssignmentDto {
  id: string;
  semesterId: string | null;
  semesterName: string | null;
  title: string;
  description: string | null;
  status: LabAssignmentStatus;
  testCaseCount: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface LabAssignmentFormValues {
  title: string;
  description?: string | null;
  semesterId?: string | null;
}

export interface LabTestCaseDto {
  id: string;
  labAssignmentId: string;
  httpMethod: string;
  urlTemplate: string;
  description: string | null;
  inputJson: unknown;
  expectJson: unknown;
  expectedStatusCode: number;
  matchMode: LabMatchMode;
  score: number;
  status: LabTestCaseStatus;
  aiGenerated: boolean;
  order: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface LabTestCaseFormValues {
  httpMethod: string;
  urlTemplate: string;
  description?: string | null;
  inputJson?: unknown;
  expectJson?: unknown;
  expectedStatusCode?: number;
  matchMode?: LabMatchMode;
  score?: number;
  order?: number;
}

export interface LabSubmissionDto {
  id: string;
  labAssignmentId: string;
  studentCode: string;
  originalFileName: string;
  status: LabSubmissionStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface LabTestCaseResultDto {
  id: string;
  labTestCaseId: string;
  httpMethod: string;
  urlTemplate: string;
  passed: boolean;
  awardedScore: number;
  actualStatusCode: number | null;
  actualResponse: string | null;
  errorMessage: string | null;
  manualOverrideScore: number | null;
  overrideReason: string | null;
}

export interface LabSubmissionResultDto {
  submissionId: string;
  studentCode: string;
  submissionStatus: LabSubmissionStatus;
  latestJobId: string | null;
  jobStatus: LabJobStatus | null;
  totalScore: number | null;
  results: LabTestCaseResultDto[];
}

export interface LabAssignmentRosterItemDto {
  submissionId: string;
  studentCode: string;
  originalFileName: string;
  submissionStatus: LabSubmissionStatus;
  latestJobId: string | null;
  jobStatus: LabJobStatus | null;
  totalScore: number | null;
  maxScore: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface LabGradingProgressDto {
  assignmentId: string;
  assignmentStatus: LabAssignmentWorkflowStatus;
  runningSubmissionId: string | null;
  runningStudentCode: string | null;
  runningJobId: string | null;
  runningJobStatus: LabJobStatus | null;
  runningPercent: number;
  executedTestCaseCount: number;
  totalTestCaseCount: number;
  queuedSubmissionCount: number;
  completedSubmissionCount: number;
  isGradingActive: boolean;
}

export interface LabBulkUploadResult {
  created: LabSubmissionDto[];
  warnings: string[];
}

export interface LabApproveAllResult {
  approved: number;
  message: string;
}

export interface LabGradeResult {
  jobsCreated: number;
  message: string;
}

export interface LabAdjustRequest {
  resultId: string;
  score: number;
  reason: string;
}

export interface LabDeleteCountResult {
  deleted: number;
}

export interface LabPatchStatusRequest {
  status: LabTestCaseStatus;
}

export interface LabRegradeResult {
  message: string;
  queued: boolean;
}

export interface LabRegradeAllResult {
  queued: number;
}

export interface LabSyncSupabaseResult {
  syncedCount: number;
  message: string;
}

export interface LabSyncSupabaseRequest {
  labId?: string;
  className?: string;
  termId?: string;
  gradingSessionId?: string;
}

export interface LabSyncSupabaseGradeRequest {
  studentCode: string;
  className: string;
  labCode: string;
  termId: string;
  score: number;
  details: unknown;
  sourceUrl?: string | null;
  gradingSessionId?: string;
}

export interface LabSyncSupabaseGradeResult {
  classStudentId: string;
  gradingSessionId?: string;
  /** @deprecated Kept while the API migrates to gradingSessionId. */
  classLabId?: string;
  /** @deprecated Session submissions are always original. */
  itemType?: "original" | "late" | "resubmit";
  /** @deprecated The grading-session flow does not use resubmission requests. */
  fulfillsRequestId?: string | null;
}

export interface LabSyncSupabaseGradesSubmission {
  studentCode: string;
  score: number;
  details: unknown;
  sourceUrl?: string | null;
}

export interface LabSyncSupabaseGradesRequest {
  termId?: string;
  className: string;
  labCode: string;
  gradingSessionId?: string;
  submissions: LabSyncSupabaseGradesSubmission[];
}

export interface LabSyncSupabaseGradesSyncedItem {
  studentCode: string;
  classStudentId: string;
  gradingSessionId?: string;
  /** @deprecated Kept while the API migrates to gradingSessionId. */
  classLabId?: string;
  /** @deprecated Session submissions are always original. */
  itemType?: "original" | "late" | "resubmit";
  /** @deprecated The grading-session flow does not use resubmission requests. */
  fulfillsRequestId?: string | null;
}

export interface LabSyncSupabaseGradesFailedItem {
  studentCode: string;
  error?: string;
  /** @deprecated Legacy clients used message instead of the API's error field. */
  message?: string;
}

export interface LabSyncSupabaseGradesResult {
  total: number;
  syncedCount: number;
  failedCount: number;
  synced: LabSyncSupabaseGradesSyncedItem[];
  failed: LabSyncSupabaseGradesFailedItem[];
}

export interface LabSupabaseTermOption {
  id: string;
  code: string | null;
  name: string | null;
}

export interface LabSupabaseClassOption {
  name: string;
  termId: string | null;
  termCode: string | null;
  termName: string | null;
}

export interface LabSupabaseLabOption {
  code: string;
  title: string | null;
  className: string | null;
  termId: string | null;
  termCode: string | null;
  termName: string | null;
  deadline: string | null;
}

export interface LabSupabaseGradingSessionOption {
  id: string;
  name: string;
  status: "open" | "closed";
  deadline: string | null;
  className: string;
  labCode: string;
  termId: string;
}

export interface LabSupabaseDropdownOptions {
  terms: LabSupabaseTermOption[];
  classes: LabSupabaseClassOption[];
  labs: LabSupabaseLabOption[];
  /** Missing when connected to the legacy class_labs API. */
  sessions?: LabSupabaseGradingSessionOption[];
}

