"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, FileText, Clock, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { api } from "@/lib";
import type {
  Submission,
  QuestionResult,
  GradingJob,
} from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdjustResultCard } from "@/components/ui/AdjustResultCard";

interface ExtendedSubmission extends Submission {
  notes?: string;
  reviewedBy?: string;
}

interface DetailSubmissionDialogProps {
  open: boolean;
  submissionId: string | null;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

type Tab = "results" | "review";

export function DetailSubmissionDialog({
  open,
  submissionId,
  onOpenChange,
  onRefresh,
}: DetailSubmissionDialogProps) {
  const [submission, setSubmission] = React.useState<ExtendedSubmission | null>(null);
  const [results, setResults] = React.useState<QuestionResult[]>([]);
  const [gradingJobs, setGradingJobs] = React.useState<GradingJob[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<Tab>("results");

  // Review notes state
  const [notes, setNotes] = React.useState("");
  const [reviewedBy, setReviewedBy] = React.useState("");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [notesMessage, setNotesMessage] = React.useState<string | null>(null);

  const loadSubmission = React.useCallback(async () => {
    if (!submissionId) return;
    try {
      setLoading(true);
      setError(null);
      const [subRes, resultsRes, jobsRes] = await Promise.all([
        api.getSubmissionById(submissionId),
        api.getSubmissionResults(submissionId),
        api.getGradingJobsBySubmission(submissionId),
      ]);

      if (subRes.status && subRes.data) {
        const subData = subRes.data as ExtendedSubmission;
        setSubmission(subData);
        setNotes(subData.notes || "");
        setReviewedBy(subData.reviewedBy || "");
      } else {
        setError(subRes.message || "Failed to load submission details");
      }

      if (resultsRes.status && resultsRes.data) {
        setResults(resultsRes.data);
      }

      if (jobsRes.status && jobsRes.data) {
        setGradingJobs(jobsRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while loading data");
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  React.useEffect(() => {
    if (open && submissionId) {
      loadSubmission();
      setActiveTab("results");
      setNotesMessage(null);
    } else {
      setSubmission(null);
      setResults([]);
      setGradingJobs([]);
    }
  }, [open, submissionId, loadSubmission]);

  const handleSaveNotes = React.useCallback(async () => {
    if (!submissionId) return;
    try {
      setSavingNotes(true);
      setNotesMessage(null);
      const res = await api.addSubmissionNotes(
        submissionId,
        notes,
        reviewedBy || undefined
      );
      if (res.status) {
        setNotesMessage("Comments saved successfully");
        if (onRefresh) onRefresh();
      } else {
        setNotesMessage(res.message || "Failed to save comments");
      }
    } catch {
      setNotesMessage("An error occurred while saving comments");
    } finally {
      setSavingNotes(false);
    }
  }, [submissionId, notes, reviewedBy, onRefresh]);

  // Callback khi điểm số được điều chỉnh
  const handleScoreAdjusted = React.useCallback(async () => {
    // Tải lại dữ liệu chi tiết bài nộp để cập nhật điểm số tổng
    if (submissionId) {
      const [subRes, resultsRes] = await Promise.all([
        api.getSubmissionById(submissionId),
        api.getSubmissionResults(submissionId),
      ]);
      if (subRes.status && subRes.data) {
        setSubmission(subRes.data);
      }
      if (resultsRes.status && resultsRes.data) {
        setResults(resultsRes.data);
      }
    }
    // Thông báo cho component cha (Submissions list) cập nhật lại danh sách bài nộp
    if (onRefresh) {
      onRefresh();
    }
  }, [submissionId, onRefresh]);

  const totalScore = results.reduce((sum, r) => sum + r.finalScore, 0);
  const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0);
  const passCount = results.filter((r) => r.passed).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "results", label: "Grading Results" },
    { key: "review", label: "Review & Adjust Scores" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative w-full max-w-5xl h-[88vh] md:h-[90vh] bg-white rounded-2xl border border-[#ebebeb] shadow-2xl overflow-hidden flex flex-col z-10 font-sans"
          >
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-5 right-5 text-[#717171] hover:text-[#222222] transition-colors p-2 rounded-full hover:bg-[#f4f4f5] cursor-pointer z-20 active:scale-95"
              title="Close"
            >
              <X size={18} className="stroke-[2]" />
            </button>

            {loading && !submission ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <LoadingSpinner label="Loading submission details..." />
              </div>
            ) : error || !submission ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-white border border-[#ebebeb] rounded-2xl p-8 text-center shadow-sm">
                  <AlertCircle className="w-12 h-12 text-[#f97316] mx-auto mb-4 stroke-[1.5]" />
                  <h2 className="text-lg font-semibold text-[#222222] mb-2">An error occurred</h2>
                  <p className="text-sm text-[#717171] mb-6">{error || "This submission details could not be found."}</p>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="px-6 pt-7 pb-5 md:px-8 border-b border-[#ebebeb] shrink-0 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status={submission.status} />
                    <h2 className="text-2xl font-semibold text-[#222222] tracking-tight">
                      Submission Details: {submission.studentCode}
                    </h2>
                  </div>

                  {/* Badges Grid Info */}
                  <div className="flex gap-3 flex-wrap">
                    <span className="px-3 py-1.5 bg-[#f4f4f5] border border-[#ebebeb] rounded-xl text-xs font-semibold text-[#3f3f46] flex items-center gap-1.5 select-none">
                      <FileText size={13} className="text-[#717171]" />
                      Artifact:{" "}
                      <strong className={submission.hasArtifact ? "text-emerald-600" : "text-red-500"}>
                        {submission.hasArtifact ? "Attached" : "None"}
                      </strong>
                    </span>

                    <span className="px-3 py-1.5 bg-[#f4f4f5] border border-[#ebebeb] rounded-xl text-xs font-semibold text-[#3f3f46] flex items-center gap-1.5 select-none">
                      <Award size={13} className="text-[#717171]" />
                      Total Score:{" "}
                      <strong className="text-[#222222]">
                        {submission.totalScore !== undefined
                          ? `${submission.totalScore} / ${submission.maxScore}`
                          : `${totalScore} / ${maxScore}`}
                      </strong>
                    </span>

                    <span className="px-3 py-1.5 bg-[#f4f4f5] border border-[#ebebeb] rounded-xl text-xs font-semibold text-[#3f3f46] flex items-center gap-1.5 select-none">
                      <Award size={13} className="text-[#717171]" />
                      Passed Questions:{" "}
                      <strong className="text-[#222222]">
                        {passCount} / {results.length}
                      </strong>
                    </span>

                    <span className="px-3 py-1.5 bg-[#f4f4f5] border border-[#ebebeb] rounded-xl text-xs font-semibold text-[#3f3f46] flex items-center gap-1.5 select-none">
                      <Clock size={13} className="text-[#717171]" />
                      Submitted At:{" "}
                      <strong className="text-[#222222]">
                        {new Date(submission.createdAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Tab Controls */}
                <div className="px-6 md:px-8 border-b border-[#ebebeb] bg-[#fcfcfc] shrink-0 flex justify-between items-center">
                  <div className="flex gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-3.5 text-sm font-semibold transition-all relative border-b-2 -mb-[2px] transition-all cursor-pointer ${activeTab === tab.key
                          ? "border-[#f97316] text-[#f97316]"
                          : "border-transparent text-[#717171] hover:text-[#222222]"
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={loadSubmission}
                    className="p-2 text-[#717171] hover:text-[#f97316] hover:bg-[#f4f4f5] rounded-lg transition-colors cursor-pointer select-none active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
                    title="Reload Data"
                  >
                    <RefreshCw size={12} />
                    Reload
                  </button>
                </div>

                {/* Modal Body Contents */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
                  {/* ===== RESULTS TAB ===== */}
                  {activeTab === "results" && (
                    <div className="space-y-6">
                      {/* Grading History */}
                      {gradingJobs.length > 0 && (
                        <div className="bg-[#fcfcfc] border border-[#ebebeb] rounded-2xl p-5 shadow-sm shadow-black/5">
                          <h3 className="text-[10px] font-semibold text-[#717171] uppercase tracking-wider mb-3">
                            Grading History
                          </h3>
                          <div className="space-y-2">
                            {gradingJobs.map((job) => (
                              <div
                                key={job.id}
                                className="flex items-center gap-3 text-xs font-medium text-[#222222]"
                              >
                                <StatusBadge status={job.status} />
                                <span>
                                  {job.startedAt
                                    ? new Date(job.startedAt).toLocaleString("en-US")
                                    : "Waiting for grading..."}
                                </span>
                                {job.errorMessage && (
                                  <span className="text-red-500 font-semibold">{job.errorMessage}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Question Results */}
                      {results.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-[#ebebeb] rounded-2xl bg-[#fcfcfc]">
                          <p className="text-sm font-semibold text-[#717171]">
                            No grading results for this submission yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {results.map((result) => (
                            <div
                              key={result.id}
                              className="border border-[#ebebeb] rounded-2xl bg-white shadow-sm shadow-black/5 overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-black/5"
                            >
                              {/* Question Header */}
                              <div className="px-6 py-4.5 border-b border-[#ebebeb] flex justify-between items-center bg-white">
                                <div>
                                  <h3 className="text-base font-semibold text-[#222222] mb-1">
                                    {result.questionTitle || `Question ${result.questionId}`}
                                  </h3>
                                  <span className="text-[11px] text-[#717171] font-semibold">
                                    Student Code: {result.studentCode}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div
                                    className={`text-xl font-bold font-sans ${result.finalScore / result.maxScore >= 0.5
                                      ? "text-emerald-600"
                                      : "text-[#f97316]"
                                      }`}
                                  >
                                    {result.finalScore}
                                    <span className="text-xs text-[#717171] font-normal">
                                      {" "}
                                      / {result.maxScore}
                                    </span>
                                  </div>
                                  {result.adjustedScore !== undefined && (
                                    <span className="inline-block mt-1 bg-orange-50 border border-orange-100 text-[#f97316] text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
                                      Score Adjusted
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Test Cases Summary bar */}
                              <div className="px-6 py-3 bg-[#fcfcfc] flex justify-between items-center text-xs font-semibold text-[#717171] border-b border-[#ebebeb]">
                                <span>
                                  Passed Test Cases:{" "}
                                  <strong className="text-[#222222]">
                                    {result.passedTestCases ?? result.testCaseResults?.filter(tc => tc.pass).length ?? 0} / {result.totalTestCases ?? result.testCaseResults?.length ?? 0}
                                  </strong>
                                </span>
                                {result.adjustReason && (
                                  <span className="text-[#f97316] max-w-xs truncate" title={result.adjustReason}>
                                    Adjustment Reason: {result.adjustReason}
                                  </span>
                                )}
                              </div>

                              {/* Test Case Expandable Details */}
                              {result.testCaseResults && result.testCaseResults.length > 0 && (
                                <details className="group border-none">
                                  <summary className="px-6 py-3 bg-[#fcfcfc] hover:bg-gray-50/50 text-xs font-bold text-[#717171] hover:text-[#222222] cursor-pointer transition-all list-none flex items-center gap-1.5 focus:outline-none select-none border-none">
                                    <ChevronRight size={14} className="transition-transform duration-200 group-open:rotate-90 mr-1 shrink-0 text-[#717171]" />
                                    Test Case Details ({result.testCaseResults.length} cases)
                                  </summary>
                                  <div className="border-t border-[#ebebeb] divide-y divide-[#ebebeb] bg-white">
                                    {result.testCaseResults.map((tc, idx) => (
                                      <div
                                        key={tc.testCaseId || idx}
                                        className={`px-6 py-4.5 flex flex-col gap-3 transition-colors ${tc.pass ? "bg-[#f0fdf4]/25 hover:bg-[#f0fdf4]/40" : "bg-[#fef2f2]/25 hover:bg-[#fef2f2]/40"
                                          }`}
                                      >
                                        {/* Test case header row */}
                                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                                          {/* Pass/Fail Circle */}
                                          <span
                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 select-none ${tc.pass ? "bg-emerald-500" : "bg-red-500"
                                              }`}
                                          >
                                            {tc.pass ? "✓" : "✗"}
                                          </span>

                                          {/* HTTP Method Badge */}
                                          <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold select-none shrink-0 ${tc.httpMethod === "GET"
                                              ? "bg-sky-50 border border-sky-100 text-sky-700"
                                              : tc.httpMethod === "POST"
                                                ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                                                : tc.httpMethod === "PUT"
                                                  ? "bg-amber-50 border border-amber-100 text-amber-700"
                                                  : "bg-red-50 border border-red-100 text-red-700"
                                              }`}
                                          >
                                            {tc.httpMethod}
                                          </span>

                                          {/* URL and Name */}
                                          <code className="font-mono text-xs text-[#222222] bg-white px-2.5 py-1 rounded border border-[#ebebeb] select-all truncate max-w-sm md:max-w-md shrink-0">
                                            {tc.url}
                                          </code>

                                          {tc.name && (
                                            <span className="text-xs text-[#717171] font-medium shrink-0">
                                              {tc.name}
                                            </span>
                                          )}

                                          {/* Awarded Score */}
                                          <span
                                            className={`text-xs font-semibold ml-auto shrink-0 ${tc.pass ? "text-[#166534]" : "text-[#dc2626]"
                                              }`}
                                          >
                                            +{tc.awardedScore} pts
                                          </span>
                                        </div>

                                        {/* HTTP Response status & body on failure */}
                                        {!tc.pass && (tc.actualStatus !== undefined || tc.actualBody) && (
                                          <div className="ml-8 flex gap-3 flex-wrap items-center text-[11px] text-[#717171]">
                                            {tc.actualStatus !== undefined && (
                                              <span>
                                                Error Code: <strong className="text-[#dc2626] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-mono text-[10px]">{tc.actualStatus}</strong>
                                              </span>
                                            )}
                                            {tc.actualBody && (
                                              <span className="flex items-center gap-1.5">
                                                Body:{" "}
                                                <code
                                                  className="font-mono text-[10px] text-[#222222] bg-white border border-[#ebebeb] px-2 py-0.5 rounded max-w-md truncate block"
                                                  title={tc.actualBody}
                                                >
                                                  {tc.actualBody}
                                                </code>
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        {/* Fail reason */}
                                        {tc.failReason && (
                                          <div className="ml-8 p-3 bg-red-50 border border-red-100 rounded-xl font-mono text-xs text-red-800 leading-relaxed whitespace-pre-wrap select-text">
                                            {tc.failReason}
                                          </div>
                                        )}

                                        {/* Screenshots */}
                                        {tc.screenshotBase64 && (
                                          <details className="ml-8 mt-1 group/screenshot">
                                            <summary className="font-semibold text-xs text-[#717171] hover:text-[#222222] cursor-pointer transition-all list-none flex items-center gap-1 select-none focus:outline-none">
                                              <ChevronRight size={14} className="transition-transform duration-200 group-open/screenshot:rotate-90 mr-1 shrink-0 text-[#717171]" />
                                              View screenshot of failure
                                            </summary>
                                            <div className="mt-3 max-w-2xl bg-white border border-[#ebebeb] rounded-xl overflow-hidden p-1 shadow-sm">
                                              <img
                                                src={`data:image/png;base64,${tc.screenshotBase64}`}
                                                alt="Test case screenshot"
                                                className="max-w-full h-auto rounded-lg"
                                              />
                                            </div>
                                          </details>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== REVIEW TAB ===== */}
                  {activeTab === "review" && (
                    <div className="space-y-8">
                      {/* Ghi chú chung */}
                      <div className="bg-white border border-[#ebebeb] rounded-2xl p-6 shadow-sm shadow-black/5">
                        <h3 className="text-base font-semibold text-[#222222] mb-5">
                          Instructor's Comments
                        </h3>

                        {notesMessage && (
                          <div
                            className={`p-3 border rounded-xl text-xs font-semibold mb-4 animate-in fade-in slide-in-from-top-1 duration-200 ${notesMessage.includes("successfully")
                              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                              : "bg-red-50 border-red-100 text-red-800"
                              }`}
                          >
                            {notesMessage}
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#717171] uppercase tracking-wider mb-2">
                              Comments
                            </label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={5}
                              placeholder="Enter comments and overall evaluation of the student's submission..."
                              className="w-full bg-white border border-[#ebebeb] text-[#222222] rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 placeholder:text-[#a1a1aa] hover:border-[#d4d4d8] font-medium resize-vertical"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#717171] uppercase tracking-wider mb-2">
                              Reviewer
                            </label>
                            <input
                              type="text"
                              value={reviewedBy}
                              onChange={(e) => setReviewedBy(e.target.value)}
                              placeholder="e.g. instructor's name or email..."
                              className="w-full bg-white border border-[#ebebeb] text-[#222222] rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 placeholder:text-[#a1a1aa] hover:border-[#d4d4d8] font-medium h-[38px]"
                            />
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={handleSaveNotes}
                              disabled={savingNotes}
                              className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-[#f97316]/10 select-none"
                            >
                              {savingNotes ? "Saving..." : "Save Comments"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Chỉnh điểm từng câu hỏi */}
                      {results.length > 0 && (
                        <div>
                          <h3 className="text-base font-semibold text-[#222222] mb-4">
                            Adjust Score for Each Question
                          </h3>
                          <div className="space-y-3">
                            {results.map((result) => (
                              <AdjustResultCard
                                key={result.id}
                                result={result}
                                onAdjusted={handleScoreAdjusted}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
