"use client";

import * as React from "react";
import { api } from "@/lib";
import type { ExportJob } from "@/types";
import { useToast, Button } from "@/components/ui";

interface ExportTabProps {
  assignmentId: string;
}

export function ExportTab({ assignmentId }: ExportTabProps) {
  const { toast } = useToast();
  const [exportJob, setExportJob] = React.useState<ExportJob | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCreateExport = React.useCallback(async () => {
    try {
      setExporting(true);
      setExportError(null);
      const res = await api.createLabAssignmentExport(assignmentId);
      if (res.status && res.data) {
        // Tracker job in localstorage for Lab Exports list
        try {
          const stored = JSON.parse(localStorage.getItem("lab_export_jobs") || "[]") as string[];
          if (!stored.includes(res.data.id)) {
            stored.push(res.data.id);
            localStorage.setItem("lab_export_jobs", JSON.stringify(stored));
          }
        } catch (e) {
          // ignore
        }

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
        }, 3000);
      } else {
        setExportError(res.message || "Failed to create export");
        setExporting(false);
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Error exporting");
      setExporting(false);
    }
  }, [assignmentId]);

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
        a.download = exportJob.labAssignmentTitle
          ? `${exportJob.labAssignmentTitle}.xlsx`
          : `lab-${assignmentId}-export.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        toast("Download failed", "error");
      }
    } catch {
      toast("Download failed", "error");
    }
  }, [exportJob, assignmentId, toast]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <h2
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#222222",
          marginBottom: "8px",
        }}
      >
        Export Assignment Results
      </h2>
      <p
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "0.9375rem",
          color: "#717171",
          marginBottom: "32px",
        }}
      >
        Export the lab assignment results into an Excel file.
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
          {!exportJob || exportJob.status === "Failed" ? (
            <Button
              type="button"
              onClick={handleCreateExport}
              disabled={exporting}
              className="w-full justify-center"
            >
              {exporting ? "Starting export..." : "Start Export Job"}
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#222222]">
                  Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    exportJob.status === "Done"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#fef9c3] text-[#ca8a04]"
                  }`}
                >
                  {exportJob.status}
                </span>
              </div>
              {exportJob.status === "Pending" && (
                <p className="text-xs text-[#717171]">
                  Generating file, please wait...
                </p>
              )}
              {exportJob.status === "Done" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadExport}
                  className="w-full justify-center"
                >
                  Download Excel File
                </Button>
              )}
            </div>
          )}
        </div>
        {exportError && (
          <p className="text-sm text-red-600 rounded-lg bg-red-50 px-4 py-3">
            {exportError}
          </p>
        )}
        {exportJob?.errorMessage && exportJob.status === "Failed" && (
          <p className="text-sm text-red-600 rounded-lg bg-red-50 px-4 py-3 mt-4">
            {exportJob.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
