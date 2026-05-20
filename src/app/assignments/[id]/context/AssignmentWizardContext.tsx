"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib";
import type { Assignment, Question, Submission, ExportJob, TestCase, CreateTestCaseRequest } from "@/types";
import { TestCaseFormItem, FormQuestionItem } from "../types";

export const AssignmentWizardContext = React.createContext<any>(null);

export function AssignmentWizardProvider({ children }: { children: React.ReactNode }) {

  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = React.useState<Assignment | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fullscreen Wizard State
  const [currentStep, setCurrentStep] = React.useState(1);
  const [direction, setDirection] = React.useState(0);

  // Setup tab state
  const [sqlFile, setSqlFile] = React.useState<File | null>(null);
  const [givenZipFile, setGivenZipFile] = React.useState<File | null>(null);
  const [givenApiBaseUrl, setGivenApiBaseUrl] = React.useState("");
  const [savingSetup, setSavingSetup] = React.useState(false);
  const [setupMessage, setSetupMessage] = React.useState<string | null>(null);

  // Questions tab state
  const [showCreateQuestion, setShowCreateQuestion] = React.useState(false);

  interface FormQuestionItem {
    id: string;
    title: string;
    type: "0" | "1";
    maxScore: number;
    artifactFolderName: string;
    testCases: TestCaseFormItem[];
    showTestCasesConfig?: boolean;
  }

  const [questionsFormList, setQuestionsFormList] = React.useState<FormQuestionItem[]>([
    { id: "init-1", title: "", type: "0", maxScore: 10, artifactFolderName: "", testCases: [], showTestCasesConfig: false }
  ]);

  // States for ConfirmDialog
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmConfig, setConfirmConfig] = React.useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
    showCancel?: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    title: "",
    description: "",
    onConfirm: () => { },
  });

  const openConfirm = React.useCallback((config: typeof confirmConfig) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  }, []);

  const [creatingQuestion, setCreatingQuestion] = React.useState(false);

  const mapFormItemToRequest = (item: TestCaseFormItem): CreateTestCaseRequest => {
    let parsedInput: any = undefined;
    if (item.input) {
      if (typeof item.input === "string") {
        if (item.input.trim()) {
          try { parsedInput = JSON.parse(item.input); } catch { parsedInput = item.input; }
        }
      } else {
        parsedInput = item.input;
      }
    }
    
    let parsedExpectedBody: any = undefined;
    if (item.expectedBody) {
      if (typeof item.expectedBody === "string") {
        if (item.expectedBody.trim()) {
          try { parsedExpectedBody = JSON.parse(item.expectedBody); } catch { parsedExpectedBody = item.expectedBody; }
        }
      } else {
        parsedExpectedBody = item.expectedBody;
      }
    }

    return {
      name: item.name || "Test Case",
      httpMethod: item.httpMethod || "GET",
      urlTemplate: item.urlTemplate || "",
      expectedStatus: Number(item.expectedStatus) || 200,
      input: parsedInput,
      expectedBody: parsedExpectedBody,
      score: Number(item.score) || 1,
      elementId: item.elementId,
      elementText: item.elementText,
      selector: item.selector,
      selectorText: item.selectorText,
      selectorMinCount: item.selectorMinCount ? Number(item.selectorMinCount) : undefined,
      order: Number(item.order) || 0,
    };
  };

  // Test Case Dialog State
  const [tcDialogConfig, setTcDialogConfig] = React.useState<{
    isOpen: boolean;
    context: "new" | "existing";
    targetId: string; // questionId if existing, form itemId if new
    qType: number;
    initialItems: TestCaseFormItem[];
  }>({
    isOpen: false,
    context: "new",
    targetId: "",
    qType: 0,
    initialItems: []
  });
  const [tcDialogSaving, setTcDialogSaving] = React.useState(false);

  // Test Case Detail Dialog State
  const [tcDetailDialog, setTcDetailDialog] = React.useState<{
    isOpen: boolean;
    tc: TestCase | null;
    qType: number;
  }>({
    isOpen: false,
    tc: null,
    qType: 0,
  });

  const handleSaveTestCases = async (items: TestCaseFormItem[]) => {
    if (tcDialogConfig.context === "new") {
      setQuestionsFormList(prev => prev.map(q => q.id === tcDialogConfig.targetId ? { ...q, testCases: items } : q));
      setTcDialogConfig(prev => ({ ...prev, isOpen: false }));
    } else {
      if (items.length === 0) {
        setTcDialogConfig(prev => ({ ...prev, isOpen: false }));
        return;
      }
      setTcDialogSaving(true);
      try {
        const requests = items.map(tc => mapFormItemToRequest(tc));
        const res = await api.createTestCases(tcDialogConfig.targetId, requests);
        if (res.status) {
          const tcRes = await api.getTestCasesByQuestion(tcDialogConfig.targetId);
          if (tcRes.status && tcRes.data) {
            setQuestionTestCases((prev) => ({ ...prev, [tcDialogConfig.targetId]: tcRes.data || [] }));
          }
          openConfirm({
            title: "Thành công",
            description: `Đã lưu thành công ${requests.length} Test Cases!`,
            showCancel: false,
            onConfirm: () => { },
          });
          setTcDialogConfig(prev => ({ ...prev, isOpen: false }));
        } else {
          openConfirm({
            title: "Lỗi",
            description: res.message || "Không thể lưu test cases.",
            showCancel: false,
            onConfirm: () => { },
          });
        }
      } catch (err) {
        console.error(err);
        openConfirm({
          title: "Lỗi",
          description: "Lỗi hệ thống khi lưu Test Cases.",
          showCancel: false,
          onConfirm: () => { },
        });
      } finally {
        setTcDialogSaving(false);
      }
    }
  };

  // States for expanding details and loading test cases in place
  const [expandedQuestions, setExpandedQuestions] = React.useState<Record<string, boolean>>({});
  const [questionTestCases, setQuestionTestCases] = React.useState<Record<string, TestCase[]>>({});
  const [loadingTestCases, setLoadingTestCases] = React.useState<Record<string, boolean>>({});

  // Submissions tab state
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = React.useState(false);
  const [triggering, setTriggering] = React.useState<string | null>(null);

  // Export tab state
  const [exportJob, setExportJob] = React.useState<ExportJob | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [gradingRound, setGradingRound] = React.useState("Lan 1");

  // Participants
  const [participants, setParticipants] = React.useState<
    { id: string; username: string; studentCode: string }[]
  >([]);
  const [bulkFile, setBulkFile] = React.useState<File | null>(null);
  const [bulkResult, setBulkResult] = React.useState<string | null>(null);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importResult, setImportResult] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [showUploadForm, setShowUploadForm] = React.useState(false);

  // Polling
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const hasParticipants = participants.length > 0;
  const hasResources = !!(assignment?.databaseSqlPath || assignment?.givenApiBaseUrl || assignment?.hasGivenZip);
  const hasQuestions = questions.length > 0;

  React.useEffect(() => {
    loadAssignment();
    loadParticipants();
    loadQuestions();
    loadSubmissions();
  }, [assignmentId]);

  // Load data based on current step
  React.useEffect(() => {
    if (currentStep === 1) loadParticipants();
    if (currentStep === 2) loadAssignment();
    if (currentStep === 3) loadQuestions();
    if (currentStep === 4) loadSubmissions();
  }, [currentStep]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const res = await api.getAssignmentById(assignmentId);
      if (res.status && res.data) {
        setAssignment(res.data);
        setGivenApiBaseUrl(res.data.givenApiBaseUrl || "");
      } else {
        setError(res.message || "Failed to load assignment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    const res = await api.getQuestionsByAssignment(assignmentId);
    if (res.status && res.data) {
      setQuestions(res.data);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const res = await api.getSubmissionsByAssignment(assignmentId);
      if (res.status && res.data) {
        setSubmissions(res.data);
      }
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadParticipants = async () => {
    const res = await api.getParticipants(assignmentId);
    if (res.status && res.data) {
      setParticipants(res.data);
    }
  };

  // --- Setup handlers ---
  const handleSaveSetup = React.useCallback(async () => {
    if (!sqlFile && !givenApiBaseUrl && !givenZipFile) {
      setSetupMessage("Vui lòng chọn ít nhất 1 trong 3: file SQL, Given API URL, hoặc given.zip");
      return;
    }
    try {
      setSavingSetup(true);
      setSetupMessage(null);
      const res = await api.uploadAssignmentResources(
        assignmentId,
        sqlFile,
        givenApiBaseUrl || undefined,
        givenZipFile
      );
      if (res.status && res.data) {
        setAssignment(res.data);
        setSetupMessage("Tài nguyên đã được tải lên thành công!");
        setSqlFile(null);
        setGivenZipFile(null);
      } else {
        setSetupMessage(res.message || "Lưu tài nguyên thất bại");
      }
    } catch {
      setSetupMessage("Lỗi hệ thống khi lưu tài nguyên");
    } finally {
      setSavingSetup(false);
    }
  }, [assignmentId, sqlFile, givenApiBaseUrl, givenZipFile]);

  const handleTriggerGrading = React.useCallback(async () => {
    try {
      setExporting(true);
      setExportError(null);
      const res = await api.triggerGrading(assignmentId, gradingRound);
      if (res.status) {
        setExportError("Đã kích hoạt Worker chấm điểm hàng loạt thành công!");
        setExportJob(null);
        await loadSubmissions();
      } else {
        setExportError(res.message || "Không thể kích hoạt chấm điểm");
      }
    } catch {
      setExportError("Lỗi kết nối khi kích hoạt chấm điểm");
    } finally {
      setExporting(false);
    }
  }, [assignmentId, gradingRound]);

  const startPolling = (jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const res = await api.getExportJob(jobId);
      if (res.status && res.data) {
        setExportJob(res.data);
        if (res.data.status === "Done" || res.data.status === "Failed") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }
    }, 2000);
  };

  // --- Question handlers ---
  const handleAddFormRow = React.useCallback(() => {
    setQuestionsFormList((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(),
        title: "",
        type: "0",
        maxScore: 10,
        artifactFolderName: "",
        testCases: [],
        showTestCasesConfig: false,
      },
    ]);
  }, []);

  const handleRemoveFormRow = React.useCallback((id: string) => {
    setQuestionsFormList((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleUpdateFormRow = React.useCallback((id: string, field: keyof FormQuestionItem, value: any) => {
    setQuestionsFormList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }, []);

  const handleToggleDetail = async (qid: string) => {
    const isExpanded = !expandedQuestions[qid];
    setExpandedQuestions((prev) => ({ ...prev, [qid]: isExpanded }));

    if (isExpanded && !questionTestCases[qid]) {
      try {
        setLoadingTestCases((prev) => ({ ...prev, [qid]: true }));
        const res = await api.getTestCasesByQuestion(qid);
        if (res.status && res.data) {
          setQuestionTestCases((prev) => ({ ...prev, [qid]: res.data || [] }));
        }
      } catch {
        // Lỗi load testcases
      } finally {
        setLoadingTestCases((prev) => ({ ...prev, [qid]: false }));
      }
    }
  };

  const handleCreateQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validRows = questionsFormList.filter(
      (q) => q.title.trim() && q.artifactFolderName.trim()
    );
    if (validRows.length === 0) return;

    try {
      setCreatingQuestion(true);
      const newCreatedQuestions: Question[] = [];

      for (const q of validRows) {
        const res = await api.createQuestion(assignmentId, {
          title: q.title.trim(),
          type: q.type === "0" ? 0 : 1,
          maxScore: Number(q.maxScore),
          artifactFolderName: q.artifactFolderName.trim(),
        });

        if (res.status && res.data) {
          const createdQ = res.data;
          newCreatedQuestions.push(createdQ);

          // Bổ sung luồng tạo test case nếu có
          if (q.testCases && q.testCases.length > 0) {
            try {
              const requests: CreateTestCaseRequest[] = q.testCases.map(tc => mapFormItemToRequest(tc));
              if (requests.length > 0) {
                await api.createTestCases(createdQ.id, requests);
              }
            } catch (err) {
              console.error("Lỗi gửi test cases cho câu hỏi " + q.title, err);
              openConfirm({
                title: "Lỗi tạo Test Cases",
                description: `Câu hỏi "${q.title}" được tạo thành công, nhưng Test Cases gặp lỗi khi lưu. Vui lòng kiểm tra lại.`,
                showCancel: false,
                onConfirm: () => { },
              });
            }
          }
        }
      }

      if (newCreatedQuestions.length > 0) {
        setQuestions((prev) => [...prev, ...newCreatedQuestions]);
        setShowCreateQuestion(false);
        setQuestionsFormList([
          { id: "init-1", title: "", type: "0", maxScore: 10, artifactFolderName: "", testCases: [], showTestCasesConfig: false }
        ]);
        // Tải lại test case của các câu hỏi mới tạo
        for (const newQ of newCreatedQuestions) {
          try {
            const tcRes = await api.getTestCasesByQuestion(newQ.id);
            if (tcRes.status && tcRes.data) {
              setQuestionTestCases((prev) => ({ ...prev, [newQ.id]: tcRes.data || [] }));
            }
          } catch { }
        }
      }
    } catch (err) {
      console.error("Lỗi khi tạo câu hỏi hàng loạt", err);
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = React.useCallback((questionId: string) => {
    openConfirm({
      title: "Xác nhận xóa câu hỏi",
      description: "Bạn có chắc chắn muốn xóa câu hỏi này không? Thao tác này cũng sẽ xóa toàn bộ test cases liên quan.",
      variant: "destructive",
      onConfirm: async () => {
        const res = await api.deleteQuestion(questionId);
        if (res.status) {
          setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        }
      },
    });
  }, [openConfirm]);

  // --- Submission handlers ---
  const handleDeleteSubmission = React.useCallback((submissionId: string) => {
    openConfirm({
      title: "Xác nhận xóa bài nộp",
      description: "Bạn có chắc chắn muốn xóa bài nộp này không?",
      variant: "destructive",
      onConfirm: async () => {
        const res = await api.deleteSubmission(submissionId);
        if (res.status) {
          setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
        }
      },
    });
  }, [openConfirm]);

  const handleTriggerGradingForSubmission = React.useCallback(async (submissionId: string) => {
    try {
      setTriggering(submissionId);
      const res = await api.triggerGradingSubmission(submissionId);
      if (res.status) {
        openConfirm({
          title: "Thông báo",
          description: "Đã gửi yêu cầu chấm điểm bài làm này thành công!",
          showCancel: false,
          onConfirm: () => { },
        });
        loadSubmissions();
      }
    } finally {
      setTriggering(null);
    }
  }, [openConfirm]);

  const handleDeleteTestCaseInline = React.useCallback((questionId: string, testCaseId: string) => {
    openConfirm({
      title: "Xác nhận xóa Test Case",
      description: "Bạn có chắc chắn muốn xóa Test Case này khỏi câu hỏi không?",
      variant: "destructive",
      onConfirm: async () => {
        const res = await api.deleteTestCase(testCaseId);
        if (res.status) {
          // Tải lại test case của câu hỏi để cập nhật UI ngay lập tức
          try {
            const tcRes = await api.getTestCasesByQuestion(questionId);
            if (tcRes.status && tcRes.data) {
              setQuestionTestCases((prev) => ({ ...prev, [questionId]: tcRes.data || [] }));
            }
          } catch { }
        }
      },
    });
  }, [openConfirm]);


  const handleBulkUpload = async (fileInput?: File) => {
    const fileToUpload = fileInput || bulkFile;
    if (!fileToUpload) return;
    try {
      setUploading(true);
      setBulkResult(null);
      const res = await api.bulkUpload(assignmentId, fileToUpload, gradingRound || undefined);
      if (res.status && res.data) {
        setBulkResult(`Đã tạo: ${res.data.created}, Đã phân tích: ${res.data.parsed}, Thiếu thông tin: ${res.data.missing}`);
        loadSubmissions();
        setBulkFile(null);
      } else {
        setBulkResult(res.message || "Tải lên tệp zip thất bại");
      }
    } catch {
      setBulkResult("Lỗi trong quá trình upload tệp zip bài làm");
    } finally {
      setUploading(false);
    }
  };

  const handleImportParticipants = async (fileInput?: File) => {
    const fileToUpload = fileInput || importFile;
    if (!fileToUpload) return;
    try {
      setUploading(true);
      setImportResult(null);
      const res = await api.importParticipants(assignmentId, fileToUpload);
      if (res.status && res.data) {
        setImportResult(`Đã import thành công: ${res.data.created} học viên (Bỏ qua: ${res.data.skipped})`);
        await loadParticipants();
        setImportFile(null);
        setShowUploadForm(false);
      } else {
        setImportResult(res.message || "Import danh sách thất bại");
      }
    } catch {
      setImportResult("Lỗi hệ thống khi import danh sách");
    } finally {
      setUploading(false);
    }
  };

  // --- Export ---
  const handleCreateExport = async () => {
    try {
      setExporting(true);
      setExportError(null);
      const res = await api.createExport({ assignmentId, gradingRound });
      if (res.status && res.data) {
        setExportJob(res.data);
        startPolling(res.data.id);
      } else {
        setExportError(res.message || "Tạo xuất dữ liệu thất bại");
      }
    } catch {
      setExportError("Lỗi hệ thống khi tạo yêu cầu xuất Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadExport = async () => {
    if (!exportJob) return;
    try {
      const response = await api.downloadExport(exportJob.id);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = exportJob.assignmentCode || `assignment-${assignmentId}-export.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      setExportError("Tải xuống Excel thất bại");
    }
  };

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  

  return (
    <AssignmentWizardContext.Provider value={{
      assignmentId, assignment, setAssignment, questions, setQuestions, loading, setLoading, error, setError,
      currentStep, setCurrentStep, direction, setDirection,
      sqlFile, setSqlFile, givenZipFile, setGivenZipFile, givenApiBaseUrl, setGivenApiBaseUrl,
      savingSetup, setSavingSetup, setupMessage, setSetupMessage, handleSaveSetup, handleTriggerGrading,
      showCreateQuestion, setShowCreateQuestion, questionsFormList, setQuestionsFormList,
      confirmOpen, setConfirmOpen, confirmConfig, openConfirm,
      creatingQuestion, setCreatingQuestion, handleCreateQuestion, handleDeleteQuestion,
      handleAddFormRow, handleRemoveFormRow, handleUpdateFormRow,
      tcDialogConfig, setTcDialogConfig, tcDialogSaving, tcDetailDialog, setTcDetailDialog,
      handleSaveTestCases, expandedQuestions, handleToggleDetail,
      questionTestCases, setQuestionTestCases, loadingTestCases,
      submissions, setSubmissions, loadingSubmissions, triggering, handleDeleteSubmission, handleTriggerGradingForSubmission, handleDeleteTestCaseInline,
      exportJob, exporting, exportError, gradingRound, setGradingRound, handleCreateExport, handleDownloadExport,
      participants, setParticipants, bulkFile, setBulkFile, bulkResult, setBulkResult,
      importFile, setImportFile, importResult, setImportResult,
      uploading, showUploadForm, setShowUploadForm, handleBulkUpload, handleImportParticipants,
      hasParticipants, hasResources, hasQuestions,
      loadAssignment, loadParticipants, loadQuestions, loadSubmissions
    }}>
      {children}
    </AssignmentWizardContext.Provider>
  );
}

export const useAssignmentWizard = () => React.useContext(AssignmentWizardContext);
