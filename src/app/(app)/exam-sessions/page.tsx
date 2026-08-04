"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib";
import type { ExamSession } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";
import {
  Button,
  PageError,
  PageShell,
  TableSkeleton,
  useConfirm,
} from "@/components/ui";
import { motion } from "framer-motion";
import { CreateExamSessionDialog } from "@/components/shared/CreateExamSessionDialog";

const MotionLink = motion(Link);

export default function ExamSessionsPage() {
  const confirm = useConfirm();
  const [sessions, setSessions] = React.useState<ExamSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  React.useEffect(() => {
    loadSessions();
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("create") === "true") {
        setIsCreateOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getExamSessions();
      if (res.status && res.data) {
        setSessions(res.data);
      } else {
        setError(res.message || "Failed to load exam sessions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    const confirmed = await confirm({
      title: "Confirm Session Deletion",
      description: "Are you sure you want to delete this exam session? The associated assignments and submissions will still be retained in the system.",
      confirmText: "Delete Session",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      setDeleting(sessionId);
      const res = await api.deleteExamSession(sessionId);
      if (res.status) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
      } else {
        setError(res.message || "Failed to delete");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setDeleting(null);
    }
  };


  return (
    <PageShell
      eyebrow="PE Exam Grading / Sessions"
      title="Exam Sessions"
      description="Create PE sessions, group assignments, and open the grading workflow."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          + New Exam Session
        </Button>
      }
    >

      {error && (
        <PageError>{error}</PageError>
      )}

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No exam sessions yet"
          description="Create your first exam session to start organizing assignments and grading."
          action={
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              + New Exam Session
            </Button>
          }
        />
      ) : (
        <Table
          columns={[
            {
              key: "title",
              header: "Title",
              render: (s) => (
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#222222",
                      fontSize: "1rem",
                    }}
                  >
                    {s.title}
                  </div>
                  {s.description && (
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "#717171",
                        marginTop: "2px",
                        maxWidth: "400px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "code",
              header: "Session Code",
              render: (s) => (
                <span
                  style={{
                    padding: "2px 8px",
                    backgroundColor: "#f4f4f5",
                    borderRadius: "12px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#3f3f46",
                  }}
                >
                  {s.code || s.id.slice(0, 8)}
                </span>
              ),
            },
            {
              key: "assignments",
              header: "Assignments",
              render: (s) => (
                <span style={{ color: "#3f3f46", fontWeight: 500 }}>
                  {s.assignments?.length ?? 0}
                </span>
              ),
            },
            {
              key: "createdAt",
              header: "Created",
              render: (s) => (
                <span style={{ color: "#717171", fontSize: "0.875rem" }}>
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (s) => (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <MotionLink
                    href={`/exam-sessions/${s.id}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: "6px 12px",
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#ffffff",
                      backgroundColor: "#f97316",
                      border: "1px solid #f97316",
                      borderRadius: "12px",
                      textDecoration: "none",
                    }}
                  >
                    Manage
                  </MotionLink>
                  <motion.button
                    onClick={() => handleDelete(s.id)}
                    disabled={deleting === s.id}
                    whileHover={deleting === s.id ? {} : { scale: 1.03 }}
                    whileTap={deleting === s.id ? {} : { scale: 0.96 }}
                    style={{
                      padding: "6px 12px",
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#dc2626",
                      backgroundColor: "transparent",
                      border: "1px solid #ebebeb",
                      borderRadius: "12px",
                      cursor: deleting === s.id ? "not-allowed" : "pointer",
                      opacity: deleting === s.id ? 0.6 : 1,
                    }}
                  >
                    {deleting === s.id ? "..." : "Delete"}
                  </motion.button>
                </div>
              ),
            },
          ]}
          data={sessions}
          keyExtractor={(s) => s.id}
          emptyMessage="No exam sessions found"
        />
      )}

      <CreateExamSessionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={loadSessions}
      />
    </PageShell>
  );
}
