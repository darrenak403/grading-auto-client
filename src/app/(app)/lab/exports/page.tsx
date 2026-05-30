"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { api } from "@/lib";
import type { ExportJob } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";
import { TableSkeleton } from "@/components/ui";

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
      // ignore
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
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#717171",
              marginBottom: "8px",
            }}
          >
            LAB GRADING / Exports
          </p>
          <h1
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "2.5rem",
              fontWeight: 500,
              lineHeight: 1.1,
              color: "#222222",
              margin: 0,
            }}
          >
            Lab Export Jobs
          </h1>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "5px",
            color: "#dc2626",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No export jobs"
          description="Create exports from the lab assignment workflow pages."
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
    </div>
  );
}
