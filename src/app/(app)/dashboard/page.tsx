"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib";
import type { ExamSession, LabAssignmentDto } from "@/types";
import { DashboardSkeleton } from "@/components/ui";
import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Calendar, ArrowRight, Plus, UploadCloud, Download } from "lucide-react";

const MotionLink = motion(Link);

interface DashboardStats {
  totalSessions: number;
  totalAssignments: number;
  totalSemesters: number;
  totalLabAssignments: number;
  recentSessions: ExamSession[];
  recentLabAssignments: LabAssignmentDto[];
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
      const [sessionsRes, assignmentsRes, semestersRes, labAssignmentsRes] = await Promise.all([
        api.getExamSessions(),
        api.getAssignments(),
        api.getSemesters(),
        api.getLabAssignments(),
      ]);

      if (
        sessionsRes.status &&
        assignmentsRes.status &&
        semestersRes.status &&
        labAssignmentsRes.status
      ) {
        setStats({
          totalSessions: sessionsRes.data?.length ?? 0,
          totalAssignments: assignmentsRes.data?.length ?? 0,
          totalSemesters: semestersRes.data?.length ?? 0,
          totalLabAssignments: labAssignmentsRes.data?.length ?? 0,
          recentSessions: (sessionsRes.data ?? []).slice(0, 4),
          recentLabAssignments: (labAssignmentsRes.data ?? []).slice(0, 4),
        });
      } else {
        setError(sessionsRes.message || "Failed to load dashboard statistics");
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
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-[#dc2626]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#717171]">
          Grading System
        </p>
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-[#222222]">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-[#717171]">
          Unified overview and management of PE Exam Grading and Lab Assignment Grading systems.
        </p>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* PE Exam Grading Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col justify-between rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-xs hover:border-[#f97316]/40 transition-colors"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#f97316]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="m-0 text-lg font-bold text-[#222222]">PE Exam Grading</h2>
            </div>
            <p className="text-sm text-[#717171] mb-6 min-h-[40px]">
              Manage practical exam sessions, review auto-graded submissions, and export final score spreadsheets.
            </p>

            {/* Metrics Rows */}
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 text-center">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#717171]">Sessions</dt>
                <dd className="mt-2 text-3xl font-extrabold text-[#222222] font-mono">
                  {stats?.totalSessions ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#717171]">Assignments</dt>
                <dd className="mt-2 text-3xl font-extrabold text-[#222222] font-mono">
                  {stats?.totalAssignments ?? 0}
                </dd>
              </div>
            </div>
          </div>

          {/* PE Actions */}
          <div className="flex flex-col gap-2 border-t border-[#ebebeb] pt-4">
            <div className="flex flex-wrap gap-2">
              <MotionLink
                href="/exam-sessions?create=true"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#ea580c]"
              >
                <Plus className="h-4 w-4" />
                New PE Session
              </MotionLink>
              <Link
                href="/submissions"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#ebebeb] bg-[#f4f4f5] px-4 py-2.5 text-xs font-bold text-[#3f3f46] hover:bg-[#ebebeb] hover:text-[#222222]"
              >
                <UploadCloud className="h-4 w-4" />
                Submissions
              </Link>
              <Link
                href="/exports"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ebebeb] bg-[#f4f4f5] px-4 py-2.5 text-xs font-bold text-[#3f3f46] hover:bg-[#ebebeb] hover:text-[#222222]"
              >
                <Download className="h-4 w-4" />
                Exports
              </Link>
            </div>
            <Link
              href="/exam-sessions"
              className="inline-flex items-center justify-end gap-1 text-xs font-semibold text-[#f97316] hover:underline self-end mt-1"
            >
              Go to PE Sessions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Lab Grading Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: "easeOut" }}
          className="flex flex-col justify-between rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-xs hover:border-[#f97316]/40 transition-colors"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#f97316]">
                <FlaskConical className="h-5 w-5" />
              </div>
              <h2 className="m-0 text-lg font-bold text-[#222222]">Lab Grading</h2>
            </div>
            <p className="text-sm text-[#717171] mb-6 min-h-[40px]">
              Track semesters, manage auto-graded lab programming assignments, configure test cases, and grade zip uploads.
            </p>

            {/* Metrics Rows */}
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 text-center">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#717171]">Semesters</dt>
                <dd className="mt-2 text-3xl font-extrabold text-[#222222] font-mono">
                  {stats?.totalSemesters ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#717171]">Lab Assignments</dt>
                <dd className="mt-2 text-3xl font-extrabold text-[#222222] font-mono">
                  {stats?.totalLabAssignments ?? 0}
                </dd>
              </div>
            </div>
          </div>

          {/* Lab Actions */}
          <div className="flex flex-col gap-2 border-t border-[#ebebeb] pt-4">
            <div className="flex flex-wrap gap-2">
              <MotionLink
                href="/lab/assignments"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#ea580c]"
              >
                <Plus className="h-4 w-4" />
                New Lab Assignment
              </MotionLink>
              <Link
                href="/lab/semesters"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#ebebeb] bg-[#f4f4f5] px-4 py-2.5 text-xs font-bold text-[#3f3f46] hover:bg-[#ebebeb] hover:text-[#222222]"
              >
                <Calendar className="h-4 w-4" />
                Manage Semesters
              </Link>
            </div>
            <Link
              href="/lab/assignments"
              className="inline-flex items-center justify-end gap-1 text-xs font-semibold text-[#f97316] hover:underline self-end mt-1"
            >
              Go to Lab Assignments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Side-by-Side Recent Activities columns */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Column 1: Recent Exam Sessions */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-lg font-bold text-[#222222]">
              Recent PE Sessions
            </h2>
            <Link
              href="/exam-sessions"
              className="text-xs font-semibold text-[#f97316] hover:underline"
            >
              View all
            </Link>
          </div>

          {stats?.recentSessions && stats.recentSessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {stats.recentSessions.map((session, index) => (
                <MotionLink
                  key={session.id}
                  href={`/exam-sessions/${session.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                  className="block rounded-xl border border-[#ebebeb] bg-white p-4 hover:border-[#f97316]/40 hover:shadow-xs transition-colors"
                >
                  <div className="font-semibold text-sm text-[#222222] truncate">
                    {session.title}
                  </div>
                  {session.description && (
                    <p className="mt-1 text-xs text-[#717171] line-clamp-1">
                      {session.description}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    {new Date(session.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </MotionLink>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#ebebeb] p-8 text-center text-xs text-[#717171]">
              No practical exam sessions yet.
            </div>
          )}
        </div>

        {/* Column 2: Recent Lab Assignments */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-lg font-bold text-[#222222]">
              Recent Lab Assignments
            </h2>
            <Link
              href="/lab/assignments"
              className="text-xs font-semibold text-[#f97316] hover:underline"
            >
              View all
            </Link>
          </div>

          {stats?.recentLabAssignments && stats.recentLabAssignments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {stats.recentLabAssignments.map((lab, index) => (
                <MotionLink
                  key={lab.id}
                  href={`/lab/assignments/${lab.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                  className="block rounded-xl border border-[#ebebeb] bg-white p-4 hover:border-[#f97316]/40 hover:shadow-xs transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-[#222222] truncate">
                      {lab.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-[#f4f4f5] px-2 py-0.5 text-[10px] font-bold text-[#717171]">
                      {lab.status}
                    </span>
                  </div>
                  {lab.semesterName && (
                    <p className="mt-1 text-xs text-[#717171]">
                      Semester: {lab.semesterName}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    {lab.testCaseCount} test cases · {lab.submissionCount} submissions
                  </div>
                </MotionLink>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#ebebeb] p-8 text-center text-xs text-[#717171]">
              No lab assignments yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
