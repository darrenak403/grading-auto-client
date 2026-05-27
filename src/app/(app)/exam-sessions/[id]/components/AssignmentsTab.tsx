"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib";
import type { Assignment } from "@/types";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateAssignmentDialog } from "@/components/shared/CreateAssignmentDialog";

interface AssignmentsTabProps {
  sessionId: string;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  setError: (error: string | null) => void;
}

export function AssignmentsTab({
  sessionId,
  assignments,
  setAssignments,
  setError,
}: AssignmentsTabProps) {
  const confirm = useConfirm();
  const [showCreateAssignment, setShowCreateAssignment] = React.useState(false);
  const [metadata, setMetadata] = React.useState<Record<string, { questions: number; submissions: number }>>({});

  React.useEffect(() => {
    if (assignments.length === 0) return;
    
    const fetchMetadata = async () => {
      const data: Record<string, { questions: number; submissions: number }> = {};
      await Promise.all(
        assignments.map(async (a) => {
          try {
            const [qRes, sRes] = await Promise.all([
              api.getQuestionsByAssignment(a.id),
              api.getSubmissionsByAssignment(a.id),
            ]);
            data[a.id] = {
              questions: qRes.status && qRes.data ? qRes.data.length : 0,
              submissions: sRes.status && sRes.data ? sRes.data.length : 0,
            };
          } catch {
            data[a.id] = { questions: 0, submissions: 0 };
          }
        })
      );
      setMetadata(data);
    };

    fetchMetadata();
  }, [assignments]);

  const handleDeleteAssignment = React.useCallback(async (assignmentId: string) => {
    const confirmed = await confirm({
      title: "Confirm Assignment Deletion",
      description: "Are you sure you want to delete this assignment? All associated questions, test cases, and submissions will also be permanently deleted.",
      confirmText: "Delete Assignment",
      variant: "danger",
    });
    if (!confirmed) return;
    const res = await api.deleteAssignment(assignmentId);
    if (res.status) {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    }
  }, [confirm, setAssignments]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#222222",
            margin: 0,
          }}
        >
          Assignments ({assignments.length})
        </h2>
        <button
          onClick={() => setShowCreateAssignment(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
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
          + New Assignment
        </button>
      </div>

      <CreateAssignmentDialog
        open={showCreateAssignment}
        onOpenChange={setShowCreateAssignment}
        sessionId={sessionId}
        onSuccess={(newAss) => {
          setAssignments((prev) => [...prev, newAss]);
        }}
      />

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create assignments for this exam session."
          action={
            <button
              onClick={() => setShowCreateAssignment(true)}
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
              + New Assignment
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {assignments.map((a) => (
            <div
              key={a.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #ebebeb",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      backgroundColor: "#f4f4f5",
                      borderRadius: "12px",
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#3f3f46",
                      marginBottom: "6px",
                    }}
                  >
                    {a.code}
                  </span>
                  <h3
                    style={{
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "#222222",
                      margin: 0,
                    }}
                  >
                    {a.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteAssignment(a.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
              </div>
              {a.description ? (
                <p
                  style={{
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.875rem",
                    color: "#717171",
                    marginBottom: "8px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: "40px",
                  }}
                >
                  {a.description}
                </p>
              ) : (
                <p
                  style={{
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.875rem",
                    color: "#a1a1aa",
                    fontStyle: "italic",
                    marginBottom: "8px",
                    minHeight: "40px",
                  }}
                >
                  No description
                </p>
              )}
              
              {/* Thống kê questions và submissions tương tự Lab */}
              <div
                style={{
                  marginTop: "8px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "Inter, Arial, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#a1a1aa",
                }}
              >
                <span>{metadata[a.id]?.questions ?? 0} questions</span>
                <span>·</span>
                <span>{metadata[a.id]?.submissions ?? 0} submissions</span>
              </div>
              <Link
                href={`/assignments/${a.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 14px",
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
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
