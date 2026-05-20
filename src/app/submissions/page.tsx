"use client";

import * as React from "react";
import { Trash2, Eye, Filter } from "lucide-react";
import { api } from "@/lib";
import type { Submission } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton, useConfirm } from "@/components/ui";
import { Table } from "@/components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailSubmissionDialog } from "@/components/shared/DetailSubmissionDialog";

export default function SubmissionsPage() {
  const confirm = useConfirm();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filterAssignmentId, setFilterAssignmentId] = React.useState("");
  const [assignments, setAssignments] = React.useState<
    { id: string; code: string }[]
  >([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<string | null>(null);

  const loadAssignments = React.useCallback(async () => {
    const res = await api.getAssignments();
    if (res.status && res.data) {
      setAssignments(res.data.map((a) => ({ id: a.id, code: a.code })));
    }
  }, []);

  const loadSubmissions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (filterAssignmentId) {
        const res = await api.getSubmissionsByAssignment(filterAssignmentId);
        if (res.status && res.data) {
          setSubmissions(res.data);
        } else {
          setError(res.message || "Failed to load");
        }
      } else {
        // Load from all assignments — fetch each assignment's submissions
        const allSubs: Submission[] = [];
        const assRes = await api.getAssignments();
        if (assRes.status && assRes.data) {
          await Promise.all(
            assRes.data.map(async (a) => {
              const res = await api.getSubmissionsByAssignment(a.id);
              if (res.status && res.data) {
                allSubs.push(...res.data);
              }
            })
          );
          // Sort by createdAt desc
          allSubs.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );
          setSubmissions(allSubs);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading");
    } finally {
      setLoading(false);
    }
  }, [filterAssignmentId]);

  React.useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  React.useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleDelete = async (submissionId: string) => {
    const confirmed = await confirm({
      title: "Confirm Submission Deletion",
      description:
        "Are you sure you want to delete this submission? This action is permanent and cannot be undone.",
      confirmText: "Delete Submission",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await api.deleteSubmission(submissionId);
      if (res.status) {
        setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      }
    } catch {
      // ignore
    }
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (s: Submission) => (
        <div>
          <div className="font-semibold text-[#222222]">{s.studentCode}</div>
          <div className="text-[10px] text-[#717171]">{s.username}</div>
        </div>
      ),
    },
    {
      key: "assignment",
      header: "Assignment",
      render: (s: Submission) => {
        const assignmentObj = assignments.find((a) => a.id === s.assignmentId);
        const code = assignmentObj ? assignmentObj.code : s.assignmentId.slice(0, 8);
        return (
          <span className="px-2.5 py-1 bg-[#f4f4f5] border border-[#ebebeb] rounded-md text-xs font-semibold text-[#3f3f46]">
            {code}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (s: Submission) => <StatusBadge status={s.status} />,
    },
    {
      key: "artifact",
      header: "Artifact",
      render: (s: Submission) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${s.hasArtifact
            ? "bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]"
            : "bg-red-50 text-red-600 border-red-100"
            }`}
        >
          {s.hasArtifact ? "Attached" : "None"}
        </span>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (s: Submission) =>
        s.totalScore !== undefined ? (
          <span
            className={`font-semibold ${(s.totalScore ?? 0) / (s.maxScore ?? 1) >= 0.5
              ? "text-emerald-600"
              : "text-[#f97316]"
              }`}
          >
            {s.totalScore} / {s.maxScore}
          </span>
        ) : (
          <span className="text-[#717171]">-</span>
        ),
    },
    {
      key: "submitted",
      header: "Submitted At",
      render: (s: Submission) => (
        <span className="text-xs text-[#717171]">
          {new Date(s.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (s: Submission) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedSubmissionId(s.id)}
            className="px-2.5 py-1.5 bg-white border border-[#dddddd] hover:border-[#f97316] text-[10px] font-semibold text-[#222222] rounded-md transition-all select-none cursor-pointer hover:bg-[#fff7ed] hover:text-[#ea580c] flex items-center gap-1.5"
          >
            View
          </button>
          <button
            onClick={() => handleDelete(s.id)}
            className="p-1.5 text-[#717171] hover:text-[#f97316] hover:bg-[#fff7ed] rounded-full transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            title="Delete Submission"
          >
            <Trash2 size={13} className="stroke-[1.5]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto w-full font-sans select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">
            03 / Submissions
          </p>
          <h1 className="text-3xl font-semibold text-[#222222] tracking-tight">
            Student Submissions
          </h1>
          <p className="text-sm text-[#717171] mt-1.5 leading-relaxed">
            Manage and view detailed progress and grading results of student submissions.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <Select
          value={filterAssignmentId || "all"}
          onValueChange={(val) => {
            setFilterAssignmentId(val === "all" ? "" : val);
          }}
        >
          <SelectTrigger className="w-[180px] bg-white border border-[#ebebeb] text-[#222222] rounded-xl px-4 py-2.5 text-xs outline-none transition-all focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] cursor-pointer hover:border-[#d4d4d8] font-semibold">
            <SelectValue placeholder="Filter by assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            {assignments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-4">
          <TableSkeleton rows={5} columns={7} />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          title="No Submissions Yet"
          description={
            filterAssignmentId
              ? "No student has submitted work for this assignment yet."
              : "Please upload submissions from the submissions tab in assignment details."
          }
        />
      ) : (
        <div className="border border-[#ebebeb] rounded-2xl overflow-hidden bg-white shadow-sm shadow-black/5">
          <Table
            columns={columns}
            data={submissions}
            maxHeight={550}
            keyExtractor={(s: Submission) => s.id}
            emptyMessage="No submissions found."
            borderless={true}
          />
        </div>
      )}

      <DetailSubmissionDialog
        open={selectedSubmissionId !== null}
        submissionId={selectedSubmissionId}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmissionId(null);
        }}
        onRefresh={loadSubmissions}
      />
    </div>
  );
}