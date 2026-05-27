"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib";
import type {
  ExamSession,
  Assignment,
  Participant,
  SessionSubmissionResult,
} from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DetailSubmissionDialog } from "@/components/shared/DetailSubmissionDialog";
import { AssignmentsTab } from "./components/AssignmentsTab";
import { ParticipantsTab } from "./components/ParticipantsTab";
import { ResultsTab } from "./components/ResultsTab";
import { ExportTab } from "./components/ExportTab";

type Tab = "assignments" | "participants" | "results" | "export";

export default function ExamSessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = React.useState<ExamSession | null>(null);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [results, setResults] = React.useState<SessionSubmissionResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<Tab>("assignments");

  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<string | null>(null);
  const [participantsError, setParticipantsError] = React.useState<string | null>(null);
  const [resultsError, setResultsError] = React.useState<string | null>(null);
  const [gradingRound, setGradingRound] = React.useState("Round 1");

  const loadSession = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getExamSessionById(sessionId);
      if (res.status && res.data) {
        setSession(res.data);
        if (res.data.assignments) {
          setAssignments(res.data.assignments);
        }
      } else {
        setError(res.message || "Failed to load exam session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

  const loadParticipants = React.useCallback(async () => {
    setParticipantsError(null);
    const res = await api.getExamSessionParticipants(sessionId);
    if (res.status && res.data) {
      setParticipants(res.data);
    } else {
      setParticipantsError(res.message || "Failed to load participants");
    }
  }, [sessionId]);

  const loadResults = React.useCallback(async () => {
    setResultsError(null);
    const res = await api.getExamSessionResults(sessionId, gradingRound);
    if (res.status && res.data) {
      setResults(res.data);
    } else {
      setResultsError(res.message || "Failed to load results");
    }
  }, [sessionId, gradingRound]);

  const handleTabChange = React.useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab === "participants") loadParticipants();
    if (tab === "results") loadResults();
  }, [loadParticipants, loadResults]);

  if (loading) {
    return (
      <div style={{ padding: "80px 24px" }}>
        <LoadingSpinner fullPage label="Loading exam session..." />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            color: "#dc2626",
          }}
        >
          {error || "Exam session not found"}
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "assignments", label: "Assignments" },
    { key: "participants", label: "Participants" },
    { key: "results", label: "Results" },
    { key: "export", label: "Export" },
  ];

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "0.875rem",
          color: "#717171",
          marginBottom: "16px",
        }}
      >
        <Link
          href="/exam-sessions"
          style={{ color: "#717171", textDecoration: "none" }}
        >
          Exam Sessions
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "#222222" }}>{session.title}</span>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: "40px" }}>
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
          02 / Exam Session
        </p>
        <h1
          style={{
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: "2.5rem",
            fontWeight: 500,
            lineHeight: 1.1,
            color: "#222222",
            margin: "0 0 8px 0",
          }}
        >
          {session.title}
        </h1>
        {session.description && (
          <p
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "1rem",
              color: "#3f3f46",
            }}
          >
            {session.description}
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: "0",
          borderBottom: "1px solid #ebebeb",
          marginBottom: "32px",
          overflowX: "auto",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 20px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "1rem",
              fontWeight: 500,
              color: activeTab === tab.key ? "#222222" : "#717171",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #f97316" : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.15s ease, border-color 0.15s ease",
              whiteSpace: "nowrap",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "assignments" && (
        <AssignmentsTab
          sessionId={sessionId}
          assignments={assignments}
          setAssignments={setAssignments}
          setError={setError}
        />
      )}

      {activeTab === "participants" && (
        <ParticipantsTab
          participants={participants}
          participantsError={participantsError}
        />
      )}

      {activeTab === "results" && (
        <ResultsTab
          results={results}
          resultsError={resultsError}
          gradingRound={gradingRound}
          setGradingRound={setGradingRound}
          loadResults={loadResults}
          setSelectedSubmissionId={setSelectedSubmissionId}
        />
      )}

      {activeTab === "export" && (
        <ExportTab
          sessionId={sessionId}
          gradingRound={gradingRound}
          setGradingRound={setGradingRound}
        />
      )}

      <DetailSubmissionDialog
        open={selectedSubmissionId !== null}
        submissionId={selectedSubmissionId}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmissionId(null);
        }}
        onRefresh={loadResults}
      />
    </div>
  );
}
