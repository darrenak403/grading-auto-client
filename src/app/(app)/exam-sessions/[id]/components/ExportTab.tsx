"use client";

import * as React from "react";
import { api } from "@/lib";
import type { ExportJob } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ExportTabProps {
  sessionId: string;
  assignmentId: string;
  gradingRound: string;
  setGradingRound: (round: string) => void;
  rounds: string[];
}

export function ExportTab({
  sessionId,
  assignmentId,
  gradingRound,
  setGradingRound,
  rounds,
}: ExportTabProps) {
  const [exportJob, setExportJob] = React.useState<ExportJob | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCreateExport = React.useCallback(async () => {
    try {
      setExporting(true);
      setExportError(null);
      const res = await api.createExamSessionExport(sessionId, gradingRound, assignmentId || undefined);
      if (res.status && res.data) {
        setExportJob(res.data);
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          const r = await api.getExportJob(res.data!.id);
          if (r.status && r.data) {
            setExportJob(r.data);
            if (r.data.status === "Done" || r.data.status === "Failed") {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
            }
          }
        }, 2000);
      } else {
        setExportError(res.message || "Failed to create export");
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Error exporting");
    } finally {
      setExporting(false);
    }
  }, [sessionId, gradingRound, assignmentId]);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const handleDownloadExport = React.useCallback(async () => {
    if (!exportJob) return;
    try {
      const response = await api.downloadExport(exportJob.id);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          exportJob.assignmentCode || `session-${sessionId}-export.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      setExportError("Download failed");
    }
  }, [exportJob, sessionId]);

  return (
    <div>
      <h2
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#222222",
          marginBottom: "8px",
        }}
      >
        Export Session Results
      </h2>
      <p
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "0.9375rem",
          color: "#717171",
          marginBottom: "32px",
        }}
      >
        Export all assignment results into a single Excel file with one sheet
        per assignment.
      </p>

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #ebebeb",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "500px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#3f3f46",
              marginBottom: "8px",
            }}
          >
            Grading Round
          </label>
          <select
            value={gradingRound}
            onChange={(e) => setGradingRound(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              color: "#222222",
              border: "1px solid #ebebeb",
              borderRadius: "12px",
              padding: "10px 14px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "1rem",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#f97316";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ebebeb";
            }}
          >
            {rounds.length === 0 && (
              <option value={gradingRound}>{gradingRound}</option>
            )}
            {rounds.map((round) => (
              <option key={round} value={round}>
                {round}
              </option>
            ))}
          </select>
        </div>

        {exportError && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              color: "#dc2626",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              marginBottom: "16px",
            }}
          >
            {exportError}
          </div>
        )}

        {exportJob && (
          <div
            style={{
              padding: "16px",
              backgroundColor:
                exportJob.status === "Done"
                  ? "#f0fdf4"
                  : exportJob.status === "Failed"
                    ? "#fef2f2"
                    : "#fff8f0",
              border: `1px solid ${exportJob.status === "Done"
                  ? "#bbf7d0"
                  : exportJob.status === "Failed"
                    ? "#fecaca"
                    : "#f97316"
                }`,
              borderRadius: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#222222",
                    marginBottom: "4px",
                  }}
                >
                  Export Status: <StatusBadge status={exportJob.status} />
                </p>
                {exportJob.errorMessage && (
                  <p
                    style={{
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.8125rem",
                      color: "#dc2626",
                    }}
                  >
                    {exportJob.errorMessage}
                  </p>
                )}
              </div>
              {exportJob.status === "Done" && (
                <button
                  onClick={handleDownloadExport}
                  style={{
                    padding: "8px 16px",
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#f97316",
                    border: "1px solid #f97316",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  Download
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleCreateExport}
          disabled={exporting || exportJob?.status === "Running"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 20px",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: "#f97316",
            border: "1px solid #f97316",
            borderRadius: "12px",
            cursor:
              exporting || exportJob?.status === "Running"
                ? "not-allowed"
                : "pointer",
            opacity:
              exporting || exportJob?.status === "Running" ? 0.6 : 1,
          }}
        >
          {exporting
            ? "Creating export..."
            : exportJob?.status === "Running"
              ? "Exporting..."
              : "Create Export"}
        </button>
      </div>
    </div>
  );
}
