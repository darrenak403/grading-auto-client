"use client";

import * as React from "react";
import { api } from "@/lib";
import type { LabAssignmentRosterItemDto, LabSubmissionDto } from "@/types";
import { rosterBySubmissionId } from "@/lib/lab-utils";
import { useConfirm, useToast, Button } from "@/components/ui";
import { Table } from "@/components/ui/Table";
import { useLabGradingProgress } from "../context";
import { RosterScoreCell } from "./GradingPlaceholderProgress";

interface SubmissionsTabProps {
  assignmentId: string;
}

export function SubmissionsTab({ assignmentId }: SubmissionsTabProps) {
  const confirm = useConfirm();
  const { toast } = useToast();
  const {
    progress,
    isPolling,
    startPolling,
    registerOnProgressUpdate,
  } = useLabGradingProgress();
  const [submissions, setSubmissions] = React.useState<LabSubmissionDto[]>([]);
  const [roster, setRoster] = React.useState<LabAssignmentRosterItemDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const completionToastShownRef = React.useRef(false);
  const wasGradingActiveRef = React.useRef(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const rosterMap = React.useMemo(() => rosterBySubmissionId(roster), [roster]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const loadSubmissions = React.useCallback(async () => {
    const res = await api.getLabSubmissions(assignmentId);
    if (res.status && res.data) {
      setSubmissions(res.data);
      return res.data;
    }
    return [];
  }, [assignmentId]);

  const loadRoster = React.useCallback(async () => {
    const res = await api.getLabAssignmentRoster(assignmentId);
    if (res.status && res.data) {
      setRoster(res.data);
      return res.data;
    }
    return [];
  }, [assignmentId]);

  const refreshTableData = React.useCallback(async () => {
    await Promise.all([loadSubmissions(), loadRoster()]);
  }, [loadSubmissions, loadRoster]);

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
    } else {
      toast(res.message || "Upload failed", "error");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGradeAll = async () => {
    const res = await api.triggerLabGrading(assignmentId);
    if (res.status && res.data) {
      if (res.data.jobsCreated === 0) {
        toast(res.data.message || "No submissions need grading", "info");
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
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setRoster((prev) => prev.filter((r) => r.submissionId !== id));
    } else {
      toast(res.message || "Delete failed", "error");
    }
  };

  const handleRegrade = async (id: string) => {
    const res = await api.regradeLabSubmission(id);
    if (res.status) {
      toast(res.data?.message || "Regrade job created");
      completionToastShownRef.current = false;
      startPolling();
      await refreshTableData();
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
      completionToastShownRef.current = false;
      startPolling();
      await refreshTableData();
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
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-3">
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
          </div>
          <p className="mt-1 text-xs text-[#a1a1aa]">
            Filename: StudentCode_Name.zip
          </p>
        </div>
        <Button type="button" onClick={handleGradeAll}>
          Grade All
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submissions.length === 0}
          onClick={handleRegradeAll}
        >
          Regrade All
        </Button>
        {gradingHint && (
          <span className="text-sm font-semibold text-[#1d4ed8]">{gradingHint}</span>
        )}
      </div>

      {warnings.length > 0 && (
        <ul className="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-xs text-[#92400e]">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      {loading ? (
        <p className="text-sm text-[#717171]">Loading…</p>
      ) : submissions.length === 0 ? (
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
              render: (s) => {
                const row = rosterMap.get(s.id);
                if (!row) {
                  return <span className="text-sm text-[#717171]">—</span>;
                }
                return <RosterScoreCell item={row} />;
              },
            },
            {
              key: "status",
              header: "Status",
              render: (s) => statusStyle(s.status),
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
                <div className="flex gap-2">
                  {(s.status === "BuildFailed" || s.status === "Error") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegrade(s.id)}
                    >
                      Regrade
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!border-[#fecaca] !text-[#dc2626]"
                    onClick={() => handleDeleteOne(s.id)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={submissions}
          keyExtractor={(s) => s.id}
        />
      )}
    </div>
  );
}
