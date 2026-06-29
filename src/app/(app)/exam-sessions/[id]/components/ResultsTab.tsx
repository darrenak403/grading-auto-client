"use client";

import * as React from "react";
import type { SessionSubmissionResult } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ResultsTabProps {
  results: SessionSubmissionResult[];
  resultsError: string | null;
  gradingRound: string;
  setGradingRound: (round: string) => void;
  rounds: string[];
  loadResults: () => void;
  setSelectedSubmissionId: (id: string | null) => void;
}

export function ResultsTab({
  results,
  resultsError,
  gradingRound,
  setGradingRound,
  rounds,
  loadResults,
  setSelectedSubmissionId,
}: ResultsTabProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "16px",
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
          Results ({results.length} submissions)
        </h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={gradingRound}
            onChange={(e) => setGradingRound(e.target.value)}
            style={{
              padding: "8px 12px",
              backgroundColor: "#ffffff",
              color: "#222222",
              border: "1px solid #ebebeb",
              borderRadius: "12px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              outline: "none",
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
          <button
            onClick={loadResults}
            style={{
              padding: "8px 16px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#3f3f46",
              backgroundColor: "#f4f4f5",
              border: "1px solid #ebebeb",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Load
          </button>
        </div>
      </div>

      {resultsError && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626", marginBottom: "16px" }}>
          {resultsError}
        </div>
      )}

      {results.length === 0 && !resultsError ? (
        <EmptyState
          title="No results yet"
          description="Results will appear after grading is complete."
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table
            columns={[
              {
                key: "studentCode",
                header: "Student",
                render: (r: SessionSubmissionResult) => (
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#222222",
                      }}
                    >
                      {r.studentCode}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "#717171",
                      }}
                    >
                      {r.username}
                    </div>
                  </div>
                ),
              },
              {
                key: "assignmentCode",
                header: "Assignment",
                render: (r: SessionSubmissionResult) => (
                  <span
                    style={{
                      padding: "2px 8px",
                      backgroundColor: "#f4f4f5",
                      borderRadius: "12px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                  >
                    {r.assignmentCode}
                  </span>
                ),
              },
              {
                key: "totalScore",
                header: "Score",
                render: (r: SessionSubmissionResult) => (
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          r.totalScore / r.maxScore >= 0.5
                            ? "#166534"
                            : "#dc2626",
                      }}
                    >
                      {r.totalScore}
                    </span>
                    <span style={{ color: "#717171" }}>
                      {" "}
                      / {r.maxScore}
                    </span>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (r: SessionSubmissionResult) => <StatusBadge status={r.status} />,
              },
              {
                key: "notes",
                header: "Notes",
                render: (r: SessionSubmissionResult) => (
                  <span
                    style={{
                      color: "#717171",
                      fontSize: "0.8125rem",
                      maxWidth: "200px",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.notes || "-"}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                render: (r: SessionSubmissionResult) => (
                  <button
                    onClick={() => setSelectedSubmissionId(r.submissionId)}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#f97316",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    View
                  </button>
                ),
              },
            ]}
            data={results}
            keyExtractor={(r) => r.submissionId}
            emptyMessage="No results found"
          />
        </div>
      )}
    </div>
  );
}
