"use client";

import * as React from "react";
import { api } from "@/lib";
import type { LabAssignmentRosterItemDto } from "@/types";
import { useConfirm, useToast, Button, TableSkeleton } from "@/components/ui";
import { Table } from "@/components/ui/Table";
import { useLabGradingProgress, useLabWizard } from "../context";
import { RosterScoreCell } from "./GradingPlaceholderProgress";

interface SubmissionsTabProps {
  assignmentId: string;
}

export function SubmissionsTab({ assignmentId }: SubmissionsTabProps) {
  const confirm = useConfirm();
  const { toast } = useToast();
  const { reloadAssignment } = useLabWizard();
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
  const completionToastShownRef = React.useRef(false);
  const wasGradingActiveRef = React.useRef(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bulkFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleBulkButtonClick = () => {
    bulkFileInputRef.current?.click();
  };

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setWarnings([]);
    const res = await api.uploadLabSubmissions(
      assignmentId,
      Array.from(selectedFiles)
    );
    setUploading(false);
    if (res.status && res.data) {
      toast(`Uploaded ${res.data.created.length} submission(s)`);
      if (res.data.warnings.length) setWarnings(res.data.warnings);
      await refreshTableData();
      void reloadAssignment();
    } else {
      toast(res.message || "Upload failed", "error");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setWarnings([]);
    const res = await api.bulkUploadLabSubmissions(
      assignmentId,
      selectedFiles[0]
    );
    setUploading(false);
    if (res.status && res.data) {
      toast(`Bulk uploaded ${res.data.created.length} submission(s)`);
      if (res.data.warnings.length) setWarnings(res.data.warnings);
      await refreshTableData();
      void reloadAssignment();
    } else {
      toast(res.message || "Bulk upload failed", "error");
    }

    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
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

  return (
    <div className="flex flex-col h-full overflow-hidden flex-1">
      <div className="mb-5 flex flex-wrap items-end gap-3 shrink-0">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#222222]">
            Upload ZIP/RAR
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".zip,.rar"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="light"
              onClick={handleButtonClick}
              className="!border-[#ebebeb] px-3 py-1.5 text-xs font-semibold rounded-lg h-9"
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Choose Files"}
            </Button>
            <input
              ref={bulkFileInputRef}
              type="file"
              accept=".zip,.rar"
              onChange={handleBulkFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleBulkButtonClick}
              className="h-9 px-3 py-1.5 text-xs font-semibold rounded-lg"
              disabled={uploading}
              title="Upload a single ZIP/RAR containing multiple submissions"
            >
              {uploading ? "Uploading…" : "Bulk ZIP/RAR Upload"}
            </Button>
          </div>
          <p className="mt-1 text-xs text-[#a1a1aa]">
            Filename: Lab(x)_StudentCode.zip or single Bulk ZIP/RAR
          </p>
        </div>
        <Button type="button" onClick={handleGradeAll}>
          Grade All
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={roster.length === 0}
          onClick={handleRegradeAll}
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
    </div>
  );
}
