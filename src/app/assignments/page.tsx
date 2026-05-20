"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib";
import type { AssignmentSummary } from "@/types";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const confirm = useConfirm();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.getAssignments();
      if (res.status && res.data) {
        setAssignments(res.data);
      } else {
        setError(res.message || "Failed to load");
      }
    } catch (err) {
      setError("Error loading assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    const confirmed = await confirm({
      title: "Confirm Assignment Deletion",
      description: "Are you sure you want to delete this assignment? All associated questions, test cases, and submissions will also be permanently deleted. This action cannot be undone.",
      confirmText: "Delete Assignment",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setDeleting(assignmentId);
      const res = await api.deleteAssignment(assignmentId);
      if (res.status) {
        setAssignments(assignments.filter((a) => a.id !== assignmentId));
      } else {
        setError(res.message || "Failed to delete assignment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting assignment");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
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
            02 / Assignments
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
            Assignments
          </h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/submissions"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 18px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#222222",
              backgroundColor: "#f4f4f5",
              border: "1px solid #ebebeb",
              borderRadius: "6px",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ebebeb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f4f4f5";
            }}
          >
            📤 My Submissions
          </Link>
          <Link
            href="/assignments/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 18px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: "#f97316",
              border: "1px solid #f97316",
              borderRadius: "6px",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ea580c";
              e.currentTarget.style.borderColor = "#ea580c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f97316";
              e.currentTarget.style.borderColor = "#f97316";
            }}
          >
            ➕ New Assignment
          </Link>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "40px 0", color: "#717171", fontFamily: "Inter, Arial, sans-serif" }}>
          Loading assignments...
        </div>
      )}
      
      {error && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#dc2626",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: "0.875rem",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      {!loading && assignments.length === 0 && (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            border: "1px dashed #ebebeb",
            borderRadius: "6px",
            backgroundColor: "#fcfcfc",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          <p style={{ fontSize: "1rem", color: "#717171", margin: 0 }}>No assignments created yet.</p>
        </div>
      )}

      {!loading && assignments.length > 0 && (
        <div style={{ display: "grid", gap: "16px" }}>
          {assignments.map((a) => (
            <div
              key={a.id}
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "6px",
                border: "1px solid #ebebeb",
                transition: "all 0.2s ease",
              }}
              className="hover:border-[#d4d4d8]"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "#222222",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {a.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.9375rem",
                      color: "#717171",
                      margin: 0,
                      lineHeight: "1.5",
                    }}
                  >
                    {a.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAssignment(a.id)}
                  disabled={deleting === a.id}
                  style={{
                    marginLeft: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#dc2626",
                    backgroundColor: "transparent",
                    border: "1px solid transparent",
                    borderRadius: "6px",
                    cursor: deleting === a.id ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (deleting !== a.id) {
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                      e.currentTarget.style.borderColor = "#fecaca";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  {deleting === a.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <Link
                  href={`/assignments/${a.id}`}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 16px",
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#222222",
                    backgroundColor: "#f4f4f5",
                    border: "1px solid #ebebeb",
                    borderRadius: "6px",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ebebeb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f4f4f5";
                  }}
                >
                  📋 Details
                </Link>
                <Link
                  href={`/assignments/${a.id}/submit`}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 16px",
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#10b981",
                    border: "1px solid #10b981",
                    borderRadius: "6px",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669";
                    e.currentTarget.style.borderColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#10b981";
                    e.currentTarget.style.borderColor = "#10b981";
                  }}
                >
                  📤 Submit Work
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
