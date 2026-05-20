"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib";
import type { ExamSession, AssignmentSummary } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/components/ui";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

interface DashboardStats {
  totalSessions: number;
  totalAssignments: number;
  recentSessions: ExamSession[];
  recentAssignments: AssignmentSummary[];
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [sessionsRes, assignmentsRes] = await Promise.all([
        api.getExamSessions(),
        api.getAssignments(),
      ]);

      if (sessionsRes.status && assignmentsRes.status) {
        setStats({
          totalSessions: sessionsRes.data?.length ?? 0,
          totalAssignments: assignmentsRes.data?.length ?? 0,
          recentSessions: (sessionsRes.data ?? []).slice(0, 5),
          recentAssignments: (assignmentsRes.data ?? []).slice(0, 5),
        });
      } else {
        setError(sessionsRes.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "5px",
            color: "#dc2626",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "48px" }}>
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
          01 / Dashboard
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
          Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          marginBottom: "48px",
        }}
        className="stats-grid"
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ y: -4, borderColor: "#f97316", boxShadow: "0 12px 20px -8px rgba(34, 34, 34, 0.08)" }}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #ebebeb",
            borderRadius: "5px",
            padding: "32px",
            cursor: "pointer",
            transition: "border-color 0.15s ease",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#717171",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Exam Sessions
          </p>
          <p
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "3rem",
              fontWeight: 500,
              lineHeight: 1,
              color: "#222222",
            }}
          >
            {stats?.totalSessions ?? 0}
          </p>
          <Link
            href="/exam-sessions"
            style={{
              display: "inline-block",
              marginTop: "16px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#f97316",
              textDecoration: "none",
            }}
          >
            View all &rarr;
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          whileHover={{ y: -4, borderColor: "#f97316", boxShadow: "0 12px 20px -8px rgba(34, 34, 34, 0.08)" }}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #ebebeb",
            borderRadius: "5px",
            padding: "32px",
            cursor: "pointer",
            transition: "border-color 0.15s ease",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#717171",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Assignments
          </p>
          <p
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "3rem",
              fontWeight: 500,
              lineHeight: 1,
              color: "#222222",
            }}
          >
            {stats?.totalAssignments ?? 0}
          </p>
          <Link
            href="/exam-sessions"
            style={{
              display: "inline-block",
              marginTop: "16px",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#f97316",
              textDecoration: "none",
            }}
          >
            View all &rarr;
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "48px",
          flexWrap: "wrap",
        }}
      >
        <MotionLink
          href="/exam-sessions?create=true"
          whileHover={{ y: -1, scale: 1.01, backgroundColor: "#ea580c" }}
          whileTap={{ scale: 0.97 }}
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
            borderRadius: "4px",
            textDecoration: "none",
            transition: "border-color 0.15s ease",
          }}
        >
          + New Exam Session
        </MotionLink>
        <MotionLink
          href="/submissions"
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 24px",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#3f3f46",
            backgroundColor: "#f4f4f5",
            border: "1px solid #ebebeb",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "background-color 0.15s ease",
          }}
        >
          View Submissions
        </MotionLink>
        <MotionLink
          href="/exports"
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 24px",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#3f3f46",
            backgroundColor: "#f4f4f5",
            border: "1px solid #ebebeb",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "background-color 0.15s ease",
          }}
        >
          Export Results
        </MotionLink>
      </div>

      {/* Recent Exam Sessions */}
      <div style={{ marginBottom: "48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.48px",
              color: "#222222",
              margin: 0,
            }}
          >
            Recent Exam Sessions
          </h2>
          <Link
            href="/exam-sessions"
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#f97316",
              textDecoration: "none",
            }}
          >
            View all
          </Link>
        </div>

        {stats?.recentSessions && stats.recentSessions.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {stats.recentSessions.map((session, index) => (
              <MotionLink
                key={session.id}
                href={`/exam-sessions/${session.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 + index * 0.06, ease: "easeOut" }}
                whileHover={{ y: -4, borderColor: "#f97316", boxShadow: "0 12px 20px -8px rgba(34, 34, 34, 0.08)" }}
                whileTap={{ scale: 0.99 }}
                style={{
                  display: "block",
                  backgroundColor: "#ffffff",
                  border: "1px solid #ebebeb",
                  borderRadius: "5px",
                  padding: "20px",
                  textDecoration: "none",
                  transition: "border-color 0.15s ease",
                }}
              >
                <div
                  style={{
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "#222222",
                    marginBottom: "4px",
                  }}
                >
                  {session.title}
                </div>
                {session.description && (
                  <p
                    style={{
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: "0.875rem",
                      color: "#717171",
                      marginBottom: "12px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {session.description}
                  </p>
                )}
                <div
                  style={{
                    fontFamily: "Inter, Arial, sans-serif",
                    fontSize: "0.8125rem",
                    color: "#717171",
                  }}
                >
                  {new Date(session.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </MotionLink>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No exam sessions yet"
            description="Create your first exam session to start organizing assignments and grading."
            action={
              <Link
                href="/exam-sessions?create=true"
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
                  borderRadius: "4px",
                  textDecoration: "none",
                }}
              >
                + New Exam Session
              </Link>
            }
          />
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}