import { siteConfig } from "@/config/site";
import type {
  ApiResponse,
  Assignment,
  AssignmentSummary,
  Question,
  TestCase,
  Submission,
  GradingJob,
  QuestionResult,
  SessionSubmissionResult,
  Participant,
  ExportJob,
  BulkUploadResult,
  ImportParticipantsResult,
  ExamSession,
  CreateAssignmentRequest,
  CreateQuestionRequest,
  CreateTestCaseRequest,
  CreateExamSessionRequest,
  AdjustQuestionResultRequest,
  UpdateReviewNoteRequest,
  CreateExportRequest,
  SemesterDto,
  SemesterFormValues,
  LabAssignmentDto,
  LabAssignmentFormValues,
  LabTestCaseDto,
  LabTestCaseFormValues,
  LabTestCaseStatus,
  LabSubmissionDto,
  LabSubmissionResultDto,
  LabBulkUploadResult,
  LabApproveAllResult,
  LabGradeResult,
  LabAdjustRequest,
  LabDeleteCountResult,
  LabRegradeResult,
  LabRegradeAllResult,
  LabAssignmentRosterItemDto,
  LabGradingProgressDto,
  LabSyncSupabaseRequest,
  LabSyncSupabaseResult,
} from "@/types";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("auth_token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return {
          status: response.ok,
          message: "Success",
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          status: false,
          message: data.message || "An error occurred",
          errors: data.errors,
          traceId: data.traceId,
        };
      }

      return {
        status: true,
        message: data.message || "Success",
        data: data.data,
      };
    } catch (error) {
      return {
        status: false,
        message: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: false,
          message: data.message || "Upload failed",
          errors: data.errors,
        };
      }

      return {
        status: true,
        message: data.message || "Success",
        data: data.data,
      };
    } catch (error) {
      return {
        status: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  async uploadFileRaw<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: false,
          message: data.message || "Upload failed",
          errors: data.errors,
        };
      }

      return {
        status: true,
        message: data.message || "Success",
        data: data.data,
      };
    } catch (error) {
      return {
        status: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // ====== ExamSession Endpoints ======
  async createExamSession(
    req: CreateExamSessionRequest
  ): Promise<ApiResponse<ExamSession>> {
    return this.post<ExamSession>("/exam-sessions", req);
  }

  async getExamSessions(): Promise<ApiResponse<ExamSession[]>> {
    return this.get<ExamSession[]>("/exam-sessions");
  }

  async getExamSessionById(
    id: string
  ): Promise<ApiResponse<ExamSession>> {
    return this.get<ExamSession>(`/exam-sessions/${id}`);
  }

  async deleteExamSession(id: string): Promise<ApiResponse<ExamSession>> {
    return this.delete<ExamSession>(`/exam-sessions/${id}`);
  }

  async getExamSessionParticipants(
    sessionId: string,
    assignmentId?: string
  ): Promise<ApiResponse<Participant[]>> {
    const query = assignmentId
      ? `?assignmentId=${encodeURIComponent(assignmentId)}`
      : "";
    return this.get<Participant[]>(
      `/exam-sessions/${sessionId}/participants${query}`
    );
  }

  async getExamSessionResults(
    sessionId: string,
    gradingRound?: string,
    assignmentId?: string
  ): Promise<ApiResponse<SessionSubmissionResult[]>> {
    const params = new URLSearchParams();
    if (gradingRound) params.set("gradingRound", gradingRound);
    if (assignmentId) params.set("assignmentId", assignmentId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.get<SessionSubmissionResult[]>(
      `/exam-sessions/${sessionId}/results${query}`
    );
  }

  async getExamSessionRounds(
    sessionId: string,
    assignmentId?: string
  ): Promise<ApiResponse<string[]>> {
    const query = assignmentId
      ? `?assignmentId=${encodeURIComponent(assignmentId)}`
      : "";
    return this.get<string[]>(`/exam-sessions/${sessionId}/rounds${query}`);
  }

  async createExamSessionExport(
    sessionId: string,
    gradingRound?: string,
    assignmentId?: string
  ): Promise<ApiResponse<ExportJob>> {
    const body: { gradingRound?: string; assignmentId?: string } = {};
    if (gradingRound) body.gradingRound = gradingRound;
    if (assignmentId) body.assignmentId = assignmentId;
    return this.post<ExportJob>(`/exam-sessions/${sessionId}/exports`, body);
  }

  // ====== Assignment Endpoints ======
  async getAssignments(): Promise<ApiResponse<AssignmentSummary[]>> {
    return this.get<AssignmentSummary[]>("/assignments");
  }

  async getAssignmentById(id: string): Promise<ApiResponse<Assignment>> {
    return this.get<Assignment>(`/assignments/${id}`);
  }

  async createAssignment(
    req: CreateAssignmentRequest
  ): Promise<ApiResponse<Assignment>> {
    return this.post<Assignment>("/assignments", req);
  }

  async deleteAssignment(assignmentId: string): Promise<ApiResponse<Assignment>> {
    return this.delete<Assignment>(`/assignments/${assignmentId}`);
  }

  async updateAssignment(
    id: string,
    req: {
      code?: string;
      title?: string;
      description?: string;
      databaseSqlPath?: string;
      givenApiBaseUrl?: string;
    }
  ): Promise<ApiResponse<Assignment>> {
    return this.put<Assignment>(`/assignments/${id}`, req);
  }

  async uploadAssignmentResources(
    assignmentId: string,
    databaseSql: File | null,
    givenApiBaseUrl?: string,
    givenZip?: File | null
  ): Promise<ApiResponse<Assignment>> {
    const formData = new FormData();
    if (databaseSql) {
      formData.append("databaseSql", databaseSql);
    }
    if (givenApiBaseUrl) {
      formData.append("givenApiBaseUrl", givenApiBaseUrl);
    }
    if (givenZip) {
      formData.append("givenZip", givenZip);
    }
    return this.uploadFileRaw<Assignment>(
      `/assignments/${assignmentId}/resources`,
      formData
    );
  }

  async importParticipants(
    assignmentId: string,
    csvFile: File
  ): Promise<ApiResponse<ImportParticipantsResult>> {
    const formData = new FormData();
    formData.append("file", csvFile);
    return this.uploadFile<ImportParticipantsResult>(
      `/assignments/${assignmentId}/participants/import`,
      formData
    );
  }

  async getParticipants(
    assignmentId: string
  ): Promise<ApiResponse<Participant[]>> {
    return this.get<Participant[]>(
      `/assignments/${assignmentId}/participants`
    );
  }

  async bulkUpload(
    assignmentId: string,
    zipFile: File
  ): Promise<ApiResponse<BulkUploadResult>> {
    const formData = new FormData();
    formData.append("file", zipFile);
    return this.uploadFile<BulkUploadResult>(
      `/assignments/${assignmentId}/bulk-upload`,
      formData
    );
  }

  async createGradingRound(
    assignmentId: string,
    zipFile: File
  ): Promise<ApiResponse<BulkUploadResult>> {
    const formData = new FormData();
    formData.append("file", zipFile);
    return this.uploadFile<BulkUploadResult>(
      `/assignments/${assignmentId}/rounds`,
      formData
    );
  }

  async getAssignmentRounds(
    assignmentId: string
  ): Promise<ApiResponse<string[]>> {
    return this.get<string[]>(`/assignments/${assignmentId}/rounds`);
  }

  async triggerGrading(assignmentId: string, gradingRound?: string | null): Promise<ApiResponse<number>> {
    const query = gradingRound ? `?gradingRound=${encodeURIComponent(gradingRound)}` : "";
    return this.post<number>(`/assignments/${assignmentId}/grade${query}`);
  }

  async getSubmissionsByAssignment(
    assignmentId: string,
    studentCode?: string,
    gradingRound?: string
  ): Promise<ApiResponse<Submission[]>> {
    const params = new URLSearchParams();
    if (studentCode) params.set("studentCode", studentCode);
    if (gradingRound) params.set("gradingRound", gradingRound);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.get<Submission[]>(
      `/assignments/${assignmentId}/submissions${query}`
    );
  }

  // ====== Question Endpoints ======
  async getQuestionsByAssignment(
    assignmentId: string
  ): Promise<ApiResponse<Question[]>> {
    return this.get<Question[]>(`/assignments/${assignmentId}/questions`);
  }

  async createQuestions(
    assignmentId: string,
    reqs: CreateQuestionRequest[]
  ): Promise<ApiResponse<Question[]>> {
    return this.post<Question[]>(
      `/assignments/${assignmentId}/questions`,
      reqs
    );
  }

  async createQuestion(
    assignmentId: string,
    req: CreateQuestionRequest
  ): Promise<ApiResponse<Question>> {
    const res = await this.post<Question[]>(
      `/assignments/${assignmentId}/questions`,
      [req]
    );
    return {
      status: res.status,
      message: res.message,
      data: res.data?.[0] as Question | undefined,
      errors: res.errors,
      traceId: res.traceId,
    };
  }

  async deleteQuestion(questionId: string): Promise<ApiResponse<Question>> {
    return this.delete<Question>(`/questions/${questionId}`);
  }

  // ====== Test Case Endpoints ======
  async createTestCases(
    questionId: string,
    reqs: CreateTestCaseRequest[]
  ): Promise<ApiResponse<TestCase[]>> {
    return this.post<TestCase[]>(`/questions/${questionId}/test-cases`, reqs);
  }

  async getTestCasesByQuestion(
    questionId: string
  ): Promise<ApiResponse<TestCase[]>> {
    return this.get<TestCase[]>(`/questions/${questionId}/test-cases`);
  }

  async deleteTestCase(testCaseId: string): Promise<ApiResponse<TestCase>> {
    return this.delete<TestCase>(`/test-cases/${testCaseId}`);
  }

  async updateTestCase(
    testCaseId: string,
    req: CreateTestCaseRequest
  ): Promise<ApiResponse<TestCase>> {
    return this.put<TestCase>(`/test-cases/${testCaseId}`, req);
  }

  // ====== Submission Endpoints ======
  async getSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    return this.get<Submission>(`/submissions/${id}`);
  }

  async getSubmissionResults(
    submissionId: string
  ): Promise<ApiResponse<QuestionResult[]>> {
    return this.get<QuestionResult[]>(
      `/submissions/${submissionId}/question-results`
    );
  }

  async deleteSubmission(submissionId: string): Promise<ApiResponse<Submission>> {
    return this.delete<Submission>(`/submissions/${submissionId}`);
  }

  async addSubmissionNotes(
    submissionId: string,
    content: string,
    reviewedBy?: string
  ): Promise<ApiResponse<Submission>> {
    return this.put<Submission>(`/submissions/${submissionId}/notes`, {
      content,
      reviewedBy,
    });
  }

  // ====== Grading Endpoints ======
  async triggerGradingSubmission(
    submissionId: string
  ): Promise<ApiResponse<GradingJob>> {
    return this.post<GradingJob>(`/submissions/${submissionId}/grade`);
  }

  async getGradingJob(jobId: string): Promise<ApiResponse<GradingJob>> {
    return this.get<GradingJob>(`/grading-jobs/${jobId}`);
  }

  async getGradingJobsBySubmission(
    submissionId: string
  ): Promise<ApiResponse<GradingJob[]>> {
    return this.get<GradingJob[]>(
      `/submissions/${submissionId}/grading-jobs`
    );
  }

  // ====== Results Endpoints ======
  async getQuestionResultById(
    resultId: string
  ): Promise<ApiResponse<QuestionResult>> {
    return this.get<QuestionResult>(`/question-results/${resultId}`);
  }

  async adjustQuestionResult(
    resultId: string,
    req: AdjustQuestionResultRequest
  ): Promise<ApiResponse<QuestionResult>> {
    return this.put<QuestionResult>(
      `/question-results/${resultId}/adjust`,
      req
    );
  }

  async deleteQuestionResultAdjustment(
    resultId: string
  ): Promise<ApiResponse<QuestionResult>> {
    return this.delete<QuestionResult>(`/question-results/${resultId}/adjust`);
  }

  // ====== Export Endpoints ======
  async createExport(req: CreateExportRequest): Promise<ApiResponse<ExportJob>> {
    const res = await this.post<ExportJob>("/exports", req);
    // Track export job ID in localStorage
    if (res.status && res.data) {
      try {
        const ids = JSON.parse(localStorage.getItem("export_jobs") || "[]") as string[];
        if (!ids.includes(res.data.id)) {
          ids.unshift(res.data.id);
          localStorage.setItem("export_jobs", JSON.stringify(ids.slice(0, 50)));
        }
      } catch {
        // ignore localStorage errors
      }
    }
    return res;
  }

  async getExportJob(exportId: string): Promise<ApiResponse<ExportJob>> {
    return this.get<ExportJob>(`/exports/${exportId}`);
  }

  async downloadExport(exportId: string): Promise<Response> {
    const url = `${this.baseUrl}/exports/${exportId}/download`;
    return fetch(url, { headers: this.getAuthHeaders() });
  }

  // ====== Semester Endpoints ======
  async getSemesters(): Promise<ApiResponse<SemesterDto[]>> {
    return this.get<SemesterDto[]>("/semesters");
  }

  async getSemesterById(id: string): Promise<ApiResponse<SemesterDto>> {
    return this.get<SemesterDto>(`/semesters/${id}`);
  }

  async createSemester(
    body: SemesterFormValues
  ): Promise<ApiResponse<SemesterDto>> {
    return this.post<SemesterDto>("/semesters", body);
  }

  async updateSemester(
    id: string,
    body: SemesterFormValues
  ): Promise<ApiResponse<SemesterDto>> {
    return this.put<SemesterDto>(`/semesters/${id}`, body);
  }

  async deleteSemester(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/semesters/${id}`);
  }

  // ====== Lab Assignment Endpoints ======
  async getLabAssignments(): Promise<ApiResponse<LabAssignmentDto[]>> {
    return this.get<LabAssignmentDto[]>("/lab-assignments");
  }

  async getLabAssignmentById(
    id: string
  ): Promise<ApiResponse<LabAssignmentDto>> {
    return this.get<LabAssignmentDto>(`/lab-assignments/${id}`);
  }

  async createLabAssignment(
    body: LabAssignmentFormValues
  ): Promise<ApiResponse<LabAssignmentDto>> {
    return this.post<LabAssignmentDto>("/lab-assignments", body);
  }

  async updateLabAssignment(
    id: string,
    body: LabAssignmentFormValues
  ): Promise<ApiResponse<LabAssignmentDto>> {
    return this.put<LabAssignmentDto>(`/lab-assignments/${id}`, body);
  }

  async deleteLabAssignment(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/lab-assignments/${id}`);
  }

  async triggerLabGrading(id: string): Promise<ApiResponse<LabGradeResult>> {
    return this.post<LabGradeResult>(`/lab-assignments/${id}/grade-all`);
  }

  async createLabAssignmentExport(
    id: string
  ): Promise<ApiResponse<ExportJob>> {
    return this.post<ExportJob>(`/lab-assignments/${id}/exports`);
  }

  async syncLabAssignmentSupabase(
    id: string,
    body?: LabSyncSupabaseRequest
  ): Promise<ApiResponse<LabSyncSupabaseResult>> {
    return this.post<LabSyncSupabaseResult>(
      `/lab-assignments/${id}/sync-supabase`,
      body
    );
  }

  async getLabAssignmentRoster(
    assignmentId: string
  ): Promise<ApiResponse<LabAssignmentRosterItemDto[]>> {
    return this.get<LabAssignmentRosterItemDto[]>(
      `/lab-assignments/${assignmentId}/roster`
    );
  }

  async getLabGradingProgress(
    assignmentId: string
  ): Promise<ApiResponse<LabGradingProgressDto>> {
    return this.get<LabGradingProgressDto>(
      `/lab-assignments/${assignmentId}/grading-progress`
    );
  }

  async bulkUploadLabSubmissions(
    assignmentId: string,
    zipFile: File
  ): Promise<ApiResponse<LabBulkUploadResult>> {
    const formData = new FormData();
    formData.append("file", zipFile);
    return this.uploadFile<LabBulkUploadResult>(
      `/lab-assignments/${assignmentId}/bulk-upload`,
      formData
    );
  }

  // ====== Lab Test Case Endpoints ======
  async getLabTestCases(
    assignmentId: string
  ): Promise<ApiResponse<LabTestCaseDto[]>> {
    return this.get<LabTestCaseDto[]>(
      `/lab-assignments/${assignmentId}/testcases`
    );
  }

  async createLabTestCase(
    assignmentId: string,
    body: LabTestCaseFormValues
  ): Promise<ApiResponse<LabTestCaseDto>> {
    return this.post<LabTestCaseDto>(
      `/lab-assignments/${assignmentId}/testcases`,
      body
    );
  }

  async batchCreateLabTestCases(
    assignmentId: string,
    body: LabTestCaseFormValues[]
  ): Promise<ApiResponse<LabTestCaseDto[]>> {
    return this.post<LabTestCaseDto[]>(
      `/lab-assignments/${assignmentId}/testcases/batch`,
      body
    );
  }

  async deleteAllLabTestCases(
    assignmentId: string
  ): Promise<ApiResponse<LabDeleteCountResult>> {
    return this.delete<LabDeleteCountResult>(
      `/lab-assignments/${assignmentId}/testcases`
    );
  }

  async updateLabTestCase(
    tcId: string,
    body: LabTestCaseFormValues
  ): Promise<ApiResponse<LabTestCaseDto>> {
    return this.put<LabTestCaseDto>(`/lab-testcases/${tcId}`, body);
  }

  async deleteLabTestCase(tcId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/lab-testcases/${tcId}`);
  }

  async patchLabTestCaseStatus(
    tcId: string,
    status: LabTestCaseStatus
  ): Promise<ApiResponse<LabTestCaseDto>> {
    return this.patch<LabTestCaseDto>(`/lab-testcases/${tcId}/status`, {
      status,
    });
  }

  async approveAllLabTestCases(
    assignmentId: string
  ): Promise<ApiResponse<LabApproveAllResult>> {
    return this.patch<LabApproveAllResult>(
      `/lab-assignments/${assignmentId}/testcases/approve-all`
    );
  }

  // ====== Lab Submission Endpoints ======
  async getLabSubmissions(
    assignmentId: string
  ): Promise<ApiResponse<LabSubmissionDto[]>> {
    return this.get<LabSubmissionDto[]>(
      `/lab-submissions?assignmentId=${encodeURIComponent(assignmentId)}`
    );
  }

  async getLabSubmissionById(
    id: string
  ): Promise<ApiResponse<LabSubmissionDto>> {
    return this.get<LabSubmissionDto>(`/lab-submissions/${id}`);
  }

  async uploadLabSubmissions(
    assignmentId: string,
    files: File[]
  ): Promise<ApiResponse<LabBulkUploadResult>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    return this.uploadFile<LabBulkUploadResult>(
      `/lab-submissions?assignmentId=${encodeURIComponent(assignmentId)}`,
      formData
    );
  }

  async deleteLabSubmission(id: string): Promise<ApiResponse<unknown>> {
    return this.delete<unknown>(`/lab-submissions/${id}`);
  }

  async deleteAllLabSubmissions(
    assignmentId: string
  ): Promise<ApiResponse<LabDeleteCountResult>> {
    return this.delete<LabDeleteCountResult>(
      `/lab-submissions?assignmentId=${encodeURIComponent(assignmentId)}`
    );
  }

  async getLabSubmissionResults(
    submissionId: string
  ): Promise<ApiResponse<LabSubmissionResultDto>> {
    return this.get<LabSubmissionResultDto>(
      `/lab-submissions/${submissionId}/results`
    );
  }

  async regradeLabSubmission(
    submissionId: string
  ): Promise<ApiResponse<LabRegradeResult>> {
    return this.post<LabRegradeResult>(
      `/lab-submissions/${submissionId}/regrade`
    );
  }

  async regradeAllLabSubmissions(
    assignmentId: string
  ): Promise<ApiResponse<LabRegradeAllResult>> {
    return this.post<LabRegradeAllResult>(
      `/lab-submissions/regrade-all?assignmentId=${encodeURIComponent(assignmentId)}`
    );
  }

  async adjustLabSubmissionResult(
    submissionId: string,
    body: LabAdjustRequest
  ): Promise<ApiResponse<unknown>> {
    return this.put<unknown>(`/lab-submissions/${submissionId}/adjust`, body);
  }
}

export const api = new ApiClient(siteConfig.apiUrl);
