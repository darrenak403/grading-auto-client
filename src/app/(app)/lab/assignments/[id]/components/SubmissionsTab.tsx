"use client";

import * as React from "react";
import { api } from "@/lib";
import type { LabAssignmentRosterItemDto } from "@/types";
import {
  useConfirm,
  useToast,
  Button,
  Modal,
  TableSkeleton,
} from "@/components/ui";
import { Table } from "@/components/ui/Table";
import { useLabGradingProgress, useLabWizard } from "../context";
import { RosterScoreCell } from "./GradingPlaceholderProgress";

interface SubmissionsTabProps {
  assignmentId: string;
}

export function SubmissionsTab({ assignmentId }: SubmissionsTabProps) {
  const confirm = useConfirm();
  const { toast } = useToast();
  const { assignment, reloadAssignment } = useLabWizard();
  const {
    progress,
    isPolling,
    startPolling,
    registerOnProgressUpdate,
  } = useLabGradingProgress();
  const [roster, setRoster] = React.useState<LabAssignmentRosterItemDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [uploadMode, setUploadMode] = React.useState<"student" | "bulk">(
    "student"
  );
  const [dragActive, setDragActive] = React.useState(false);
  const completionToastShownRef = React.useRef(false);
  const wasGradingActiveRef = React.useRef(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bulkFileInputRef = React.useRef<HTMLInputElement>(null);

  const loadRoster = React.useCallback(async () => {
    const res = await api.getLabAssignmentRoster(assignmentId);
    if (res.status && res.data) {
      setRoster(res.data);
      return res.data;
    }
    return [];
  }, [assignmentId]);

  const refreshTableData = React.useCallback(async () => {
    await loadRoster();
  }, [loadRoster]);

  React.useEffect(() => {
    setLoading(true);
    refreshTableData().finally(() => setLoading(false));
  }, [refreshTableData]);

  React.useEffect(() => {
    return registerOnProgressUpdate((p) => {
      void refreshTableData();
      if (wasGradingActiveRef.current && !p.isGradingActive) {
        if (!completionToastShownRef.current) {
          completionToastShownRef.current = true;
          toast(
            `Grading finished (${p.completedSubmissionCount} completed${p.queuedSubmissionCount ? `, ${p.queuedSubmissionCount} were queued` : ""})`
          );
        }
      }
      wasGradingActiveRef.current = p.isGradingActive;
    });
  }, [registerOnProgressUpdate, refreshTableData, toast]);

  React.useEffect(() => {
    if (progress?.isGradingActive) {
      wasGradingActiveRef.current = true;
      completionToastShownRef.current = false;
    }
  }, [progress?.isGradingActive]);

  const uploadStudentFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    setWarnings([]);
    const res = await api.uploadLabSubmissions(
      assignmentId,
      files
    );
    setUploading(false);
    if (res.status && res.data) {
      toast(`Uploaded ${res.data.created.length} submission(s)`);
      if (res.data.warnings.length) setWarnings(res.data.warnings);
      await refreshTableData();
      void reloadAssignment();
      setUploadDialogOpen(false);
    } else {
      toast(res.message || "Upload failed", "error");
    }
  };

  const uploadBulkArchive = async (file: File) => {
    setUploading(true);
    setWarnings([]);
    const res = await api.bulkUploadLabSubmissions(assignmentId, file);
    setUploading(false);
    if (res.status && res.data) {
      toast(`Bulk uploaded ${res.data.created.length} submission(s)`);
      if (res.data.warnings.length) setWarnings(res.data.warnings);
      await refreshTableData();
      void reloadAssignment();
      setUploadDialogOpen(false);
    } else {
      toast(res.message || "Bulk upload failed", "error");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    await uploadStudentFiles(Array.from(selectedFiles));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    await uploadBulkArchive(selectedFiles[0]);
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      /\.(zip|rar)$/i.test(file.name)
    );
    if (files.length === 0) {
      toast("Drop ZIP or RAR files only", "error");
      return;
    }
    if (uploadMode === "bulk") {
      await uploadBulkArchive(files[0]);
      return;
    }
    await uploadStudentFiles(files);
  };

  const handleGradeAll = async () => {
    const res = await api.triggerLabGrading(assignmentId);
    if (res.status && res.data) {
      if (res.data.jobsCreated === 0) {
        toast(res.data.message || "No submissions need grading", "info");
        await refreshTableData();
      } else {
        toast(res.data.message || `Created ${res.data.jobsCreated} grading job(s)`);
        completionToastShownRef.current = false;
        startPolling();
        await refreshTableData();
      }
    } else {
      toast(res.message || "Grading failed", "error");
    }
  };

  const handleDeleteAll = async () => {
    const ok = await confirm({
      title: "Delete all submissions",
      description: "Removes all files and database records for this lab.",
      confirmText: "Delete all",
      variant: "danger",
    });
    if (!ok) return;
    const res = await api.deleteAllLabSubmissions(assignmentId);
    if (res.status) {
      toast(`Deleted ${res.data?.deleted ?? 0} submission(s)`);
      await refreshTableData();
      void reloadAssignment();
    }
  };

  const handleDeleteOne = async (id: string) => {
    const ok = await confirm({
      title: "Delete submission",
      description: "Remove this submission and its file from disk?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    const res = await api.deleteLabSubmission(id);
    if (res.status) {
      setRoster((prev) => prev.filter((r) => r.submissionId !== id));
      void reloadAssignment();
    } else {
      toast(res.message || "Delete failed", "error");
    }
  };

  const handleRegrade = async (id: string) => {
    const res = await api.regradeLabSubmission(id);
    if (res.status) {
      toast(res.data?.message || "Regrade job created");
      await refreshTableData();
      if (res.data?.queued) {
        completionToastShownRef.current = false;
        startPolling();
      }
    } else {
      toast(res.message || "Regrade failed", "error");
    }
  };

  const handleRegradeAll = async () => {
    const ok = await confirm({
      title: "Regrade all submissions",
      description: "Clear previous scores and queue all submissions for regrading?",
      confirmText: "Regrade all",
      variant: "danger",
    });
    if (!ok) return;

    const res = await api.regradeAllLabSubmissions(assignmentId);
    if (res.status && res.data) {
      toast(`Queued ${res.data.queued} submission(s) for regrading`);
      await refreshTableData();
      if (res.data.queued > 0) {
        completionToastShownRef.current = false;
        startPolling();
      }
    } else {
      toast(res.message || "Regrade all failed", "error");
    }
  };

  const statusStyle = (status: string) => {
    const map: Record<string, string> = {
      Pending: "bg-[#fef3c7] text-[#b45309]",
      Grading: "bg-[#dbeafe] text-[#1d4ed8]",
      Done: "bg-[#ecfdf5] text-[#047857]",
      BuildFailed: "bg-[#fef2f2] text-[#dc2626]",
      Error: "bg-[#fef2f2] text-[#991b1b]",
    };
    return (
      <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? "bg-[#f4f4f5] text-[#717171]"}`}
      >
        {status}
      </span>
    );
  };

  const gradingHint =
    isPolling && progress?.runningStudentCode
      ? `Grading ${progress.runningStudentCode}…`
      : isPolling
        ? "Grading…"
        : null;
  const hasTestCases = (assignment?.testCaseCount ?? 0) > 0;
  const hasSubmissions = roster.length > 0;
  const gradeBlockedReason = !hasTestCases
    ? "Import and approve test cases before grading."
    : !hasSubmissions
      ? "Upload submissions before grading."
      : null;

  return (
    <div className="flex flex-col h-full overflow-hidden flex-1">
      <div className="mb-5 flex flex-wrap items-start gap-3 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => setUploadDialogOpen(true)}
          disabled={uploading}
          className="min-h-10"
        >
          {uploading ? "Uploading…" : "Upload ZIP/RAR"}
        </Button>

        <div className="flex min-h-[58px] flex-col gap-1">
          <Button
            type="button"
            onClick={handleGradeAll}
            disabled={uploading || isPolling || gradeBlockedReason != null}
            title={gradeBlockedReason ?? undefined}
          >
            {isPolling ? "Grading…" : "Grade All"}
          </Button>
          {gradeBlockedReason && (
            <span className="max-w-[260px] text-xs font-medium text-[#b45309]">
              {gradeBlockedReason}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={roster.length === 0 || isPolling}
          onClick={handleRegradeAll}
          className="min-h-10"
        >
          Regrade All
        </Button>
        {gradingHint && (
          <span className="text-sm font-semibold text-[#1d4ed8]">{gradingHint}</span>
        )}
      </div>

      {warnings.length > 0 && (
        <ul className="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-xs text-[#92400e] shrink-0">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <div className="flex-1 overflow-hidden min-h-0">
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : roster.length === 0 ? (
          <p className="text-sm text-[#717171]">No submissions yet.</p>
        ) : (
          <Table
            columns={[
              { key: "code", header: "Student", render: (s) => s.studentCode },
              {
                key: "file",
                header: "File",
                render: (s) => s.originalFileName,
              },
              {
                key: "score",
                header: "Score",
                render: (s) => <RosterScoreCell item={s} />,
              },
              {
                key: "status",
                header: "Status",
                render: (s) => statusStyle(s.submissionStatus),
              },
              {
                key: "at",
                header: "Uploaded",
                render: (s) =>
                  new Date(s.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
              },
              {
                key: "grade",
                header: "Grade",
                render: (s) => {
                  const isGrading = s.submissionStatus === "Grading";
                  const isPending = s.submissionStatus === "Pending";

                  if (isPending) {
                    return (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleRegrade(s.submissionId)}
                        disabled={isGrading}
                      >
                        Grade
                      </Button>
                    );
                  }

                  return (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegrade(s.submissionId)}
                      disabled={isGrading}
                    >
                      {isGrading ? "Grading…" : "Regrade"}
                    </Button>
                  );
                },
              },
              {
                key: "actions",
                header: (
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    className="cursor-pointer border-none bg-transparent text-sm font-semibold text-[#dc2626] hover:underline"
                  >
                    Delete All
                  </button>
                ),
                render: (s) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!border-[#fecaca] !text-[#dc2626] hover:!bg-[#fef2f2]"
                    onClick={() => handleDeleteOne(s.submissionId)}
                  >
                    Delete
                  </Button>
                ),
              },
            ]}
            data={roster}
            keyExtractor={(s) => s.submissionId}
            maxHeight="100%"
          />
        )}
      </div>

      <Modal
        open={uploadDialogOpen}
        onClose={() => {
          if (!uploading) setUploadDialogOpen(false);
        }}
        title="Upload submissions"
        description="Drag ZIP/RAR files here or choose them from your computer."
        maxWidth={560}
        footer={
          <Button
            type="button"
            variant="light"
            onClick={() => setUploadDialogOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
        }
      >
        <div className="mb-4 inline-flex rounded-xl border border-[#ebebeb] bg-[#f4f4f5] p-1">
          <button
            type="button"
            onClick={() => setUploadMode("student")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              uploadMode === "student"
                ? "bg-white text-[#222222] shadow-sm"
                : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            Student files
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("bulk")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              uploadMode === "bulk"
                ? "bg-white text-[#222222] shadow-sm"
                : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            Bulk archive
          </button>
        </div>

        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
          className={`flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
            dragActive
              ? "border-[#f97316] bg-[#fff7ed]"
              : "border-[#d4d4d8] bg-[#fcfcfc]"
          }`}
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#ebebeb] bg-white text-lg font-bold text-[#f97316]">
            ZIP
          </div>
          <p className="text-sm font-semibold text-[#222222]">
            {uploadMode === "student"
              ? "Drop one or many student ZIP/RAR files"
              : "Drop one bulk ZIP/RAR archive"}
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#717171]">
            {uploadMode === "student"
              ? "Use Lab(x)_StudentCode.zip when uploading individual submissions."
              : "Use a single archive that contains multiple student submissions."}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {uploadMode === "student" ? (
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Choose student files
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => bulkFileInputRef.current?.click()}
                disabled={uploading}
              >
                Choose bulk archive
              </Button>
            )}
          </div>
          {uploading && (
            <p className="mt-4 text-xs font-semibold text-[#f97316]">
              Uploading files…
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.rar"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={bulkFileInputRef}
          type="file"
          accept=".zip,.rar"
          onChange={handleBulkFileChange}
          className="hidden"
        />
      </Modal>
    </div>
  );
}
