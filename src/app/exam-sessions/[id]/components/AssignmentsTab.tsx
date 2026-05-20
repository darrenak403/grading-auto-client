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
              {a.description && (
                <p
                  style={{
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.875rem",
                    color: "#717171",
                    marginBottom: "12px",
                  }}
                >
                  {a.description}
                </p>
              )}
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
