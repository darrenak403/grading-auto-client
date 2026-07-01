"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { api } from "@/lib";
import type { ExportJob } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";
import { Button, PageError, PageShell, TableSkeleton } from "@/components/ui";

export default function LabExportsPage() {
  const [jobs, setJobs] = React.useState<ExportJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    loadJobs();
  }, []);

  React.useEffect(() => {
    const hasRunning = jobs.some(
      (j) => j.status === "Pending" || j.status === "Running"
    );

    if (hasRunning && !pollRef.current) {
      pollRef.current = setInterval(loadJobs, 3000);
    } else if (!hasRunning && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [jobs]);

  const loadJobs = async () => {
    try {
      const storedIds = JSON.parse(
        localStorage.getItem("lab_export_jobs") || "[]"
      ) as string[];
      const loadedJobs: ExportJob[] = [];
      for (const id of storedIds) {
        const res = await api.getExportJob(id);
        if (res.status && res.data) {
          loadedJobs.push(res.data);
        }
      }
      loadedJobs.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      setJobs(loadedJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lab export jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (job: ExportJob) => {
    try {
      setDownloading(job.id);
      const response = await api.downloadExport(job.id);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = job.labAssignmentTitle
          ? `${job.labAssignmentTitle}-results.xlsx`
          : `lab-export-${job.id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // ignore
    } finally {
      setDownloading(null);
    }
  };

  return (
    <PageShell
      eyebrow="Lab Grading / Exports"
      title="Lab Export Jobs"
      description="Download Lab gradebook exports created from the assignment workflow."
      actions={
        <Button href="/lab/assignments" variant="outline">
          Go to Lab Assignments
        </Button>
      }
    >

      {error && (
        <PageError>{error}</PageError>
      )}

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No export jobs"
          description="Create exports from the lab assignment workflow pages."
          action={
            <Button href="/lab/assignments" variant="outline">
              Open Lab Assignments
            </Button>
          }
        />
      ) : (
        <Table
          keyExtractor={(j) => j.id}
          columns={[
            {
              key: "labAssignmentTitle",
              header: "Lab Assignment",
              render: (j) => (
                <div>
                  <span style={{ color: "#222222", fontWeight: 500 }}>
                    {j.labAssignmentTitle || "-"}
                  </span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (j) => <StatusBadge status={j.status} />,
            },
            {
              key: "createdAt",
              header: "Created",
              render: (j) => (
                <span style={{ color: "#717171", fontSize: "0.875rem" }}>
                  {j.createdAt
                    ? new Date(j.createdAt).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (j) =>
                j.status === "Done" ? (
                  <motion.button
                    onClick={() => handleDownload(j)}
                    disabled={downloading === j.id}
                    whileHover={
                      downloading === j.id
                        ? {}
                        : {
                            scale: 1.05,
                            backgroundColor: "#ea580c",
                            borderColor: "#ea580c",
                          }
                    }
                    whileTap={downloading === j.id ? {} : { scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    style={{
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#ffffff",
                      backgroundColor: "#f97316",
                      border: "1px solid #f97316",
                      borderRadius: "4px",
                      padding: "4px 12px",
                      cursor: downloading === j.id ? "not-allowed" : "pointer",
                      opacity: downloading === j.id ? 0.6 : 1,
                    }}
                  >
                    {downloading === j.id ? "..." : "Download"}
                  </motion.button>
                ) : (
                  <span style={{ color: "#717171", fontSize: "0.8125rem" }}>
                    -
                  </span>
                ),
            },
          ]}
          data={jobs}
        />
      )}
    </PageShell>
  );
}
