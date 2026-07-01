"use client";

import * as React from "react";
import { api } from "@/lib";
import type {
  LabAssignmentRosterItemDto,
  LabSubmissionResultDto,
  LabSyncSupabaseRequest,
  LabTestCaseDto,
} from "@/types";
import {
  effectiveScore,
  isRosterScorePending,
  sumEffectiveScores,
} from "@/lib/lab-utils";
import { useToast, Button, Input, Textarea, Modal, ModalActions, Skeleton, TableSkeleton, Badge } from "@/components/ui";
import { useLabGradingProgress } from "../context";
import { RosterScoreCell } from "./GradingPlaceholderProgress";
import { Search, X, RefreshCw } from "lucide-react";


interface ResultsTabProps {
  assignmentId: string;
}

const formatResponse = (resp: string | null) => {
  if (!resp) return "—";
  try {
    const parsed = JSON.parse(resp);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return resp;
  }
};

export function ResultsTab({ assignmentId }: ResultsTabProps) {
  const { toast } = useToast();
  const { progress, startPolling, registerOnProgressUpdate } =
    useLabGradingProgress();
  const [roster, setRoster] = React.useState<LabAssignmentRosterItemDto[]>([]);
  const [testCases, setTestCases] = React.useState<LabTestCaseDto[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<LabSubmissionResultDto | null>(
    null
  );
  const [loadingList, setLoadingList] = React.useState(true);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [adjustResultId, setAdjustResultId] = React.useState("");
  const [adjustScore, setAdjustScore] = React.useState("");
  const [adjustReason, setAdjustReason] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [syncing, setSyncing] = React.useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = React.useState(false);
  const [syncLabId, setSyncLabId] = React.useState("");
  const [syncClassName, setSyncClassName] = React.useState("");

  const filteredRoster = React.useMemo(() => {
    return roster.filter((row) =>
      row.studentCode.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [roster, searchTerm]);

  const loadRoster = React.useCallback(async () => {
    const res = await api.getLabAssignmentRoster(assignmentId);
    if (res.status && res.data) {
      setRoster(res.data);
      return res.data;
    }
    return [];
  }, [assignmentId]);

  React.useEffect(() => {
    setLoadingList(true);
    Promise.all([loadRoster(), api.getLabTestCases(assignmentId)]).then(
      ([rosterData, tcRes]) => {
        if (rosterData.length) {
          setSelectedId((prev) => prev ?? rosterData[0].submissionId);
        }
        if (tcRes.status && tcRes.data) setTestCases(tcRes.data);
        setLoadingList(false);
      }
    );
  }, [assignmentId, loadRoster]);

  const loadResults = React.useCallback(async (submissionId: string) => {
    setLoadingDetail(true);
    const res = await api.getLabSubmissionResults(submissionId);
    if (res.status && res.data) setResults(res.data);
    else setResults(null);
    setLoadingDetail(false);
  }, []);

  React.useEffect(() => {
    if (selectedId) loadResults(selectedId);
  }, [selectedId, loadResults]);

  React.useEffect(() => {
    return registerOnProgressUpdate((p) => {
      void loadRoster();
      if (selectedId && (p.runningSubmissionId === selectedId || !p.isGradingActive)) {
        void loadResults(selectedId);
      }
    });
  }, [registerOnProgressUpdate, loadRoster, loadResults, selectedId]);

  const selectedRosterItem = roster.find((r) => r.submissionId === selectedId);

  const maxScoreByTcId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const tc of testCases) map.set(tc.id, tc.score);
    return map;
  }, [testCases]);

  const handleRegrade = async () => {
    if (!selectedId) return;
    const res = await api.regradeLabSubmission(selectedId);
    if (res.status) {
      toast(res.data?.message || "Regrade job created");
      await loadRoster();
      if (res.data?.queued) {
        startPolling();
      }
    } else {
      toast(res.message || "Regrade failed", "error");
    }
  };

  const openAdjust = (resultId: string, current: number) => {
    setAdjustResultId(resultId);
    setAdjustScore(String(current));
    setAdjustReason("");
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    if (!selectedId || !adjustReason.trim()) return;
    const score = parseFloat(adjustScore);
    if (Number.isNaN(score) || score < 0) return;
    const res = await api.adjustLabSubmissionResult(selectedId, {
      resultId: adjustResultId,
      score,
      reason: adjustReason.trim(),
    });
    if (res.status) {
      toast("Score adjusted");
      setAdjustOpen(false);
      await loadResults(selectedId);
      await loadRoster();
    } else {
      toast(res.message || "Adjust failed", "error");
    }
  };

  const detailScorePending =
    selectedRosterItem != null && isRosterScorePending(selectedRosterItem);

  const displayTotal =
    results && !detailScorePending ? sumEffectiveScores(results.results) : null;
  const adjustTcId = results?.results.find((r) => r.id === adjustResultId)
    ?.labTestCaseId;

  const runningId = progress?.runningSubmissionId;

  const [exporting, setExporting] = React.useState(false);
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.createLabAssignmentExport(assignmentId);
      if (res.status && res.data) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          const r = await api.getExportJob(res.data!.id);
          if (r.status && r.data) {
            if (r.data.status === "Done" || r.data.status === "Failed") {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
              setExporting(false);
              if (r.data.status === "Done") {
                const downloadRes = await api.downloadExport(r.data.id);
                if (downloadRes.ok) {
                  const blob = await downloadRes.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = r.data.labAssignmentTitle
                    ? `${r.data.labAssignmentTitle}.xlsx`
                    : `lab-${assignmentId}-export.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } else {
                  toast("Download failed", "error");
                }
              } else {
                toast(r.data.errorMessage || "Export failed", "error");
              }
            }
          }
        }, 3000);
      } else {
        setExporting(false);
        toast(res.message || "Failed to start export", "error");
      }
    } catch (error) {
      setExporting(false);
      toast(error instanceof Error ? error.message : "Error exporting", "error");
    }
  };

  const handleSyncSupabase = async () => {
    const labId = syncLabId.trim();
    const className = syncClassName.trim();
    const payload: LabSyncSupabaseRequest | undefined =
      labId || className
        ? {
            ...(labId ? { labId } : {}),
            ...(className ? { className } : {}),
          }
        : undefined;

    try {
      setSyncing(true);
      const res = await api.syncLabAssignmentSupabase(assignmentId, payload);
      if (res.status) {
        const successMsg =
          res.data?.message || res.message || "Successfully synced to Supabase.";
        toast(successMsg, "success");
        setSyncDialogOpen(false);
      } else {
        toast(res.message || "Failed to sync to Supabase", "error");
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Error syncing to Supabase", "error");
    } finally {
      setSyncing(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full w-full overflow-hidden flex-1">
      {/* Cột 1: Submissions Sidebar - Ghim cố định & tự cuộn độc lập */}
      <div className="w-full md:w-[260px] shrink-0 flex flex-col h-full border-b md:border-b-0 md:border-r border-[#ebebeb] pb-4 md:pb-0 md:pr-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap">
          <h3 className="text-base font-semibold text-[#222222]">Submissions</h3>
          {!loadingList && (
            <Badge variant="default" className="!rounded-full px-2 py-0.5 text-[10px] font-bold">
              {searchTerm.trim() ? `${filteredRoster.length}/${roster.length}` : roster.length}
            </Badge>
          )}
          <div className="ml-auto flex gap-1.5">
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={handleExport}
              disabled={exporting || syncing || loadingList || roster.length === 0}
            >
              {exporting ? "Exporting..." : "Export Excel"}
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={() => setSyncDialogOpen(true)}
              disabled={exporting || syncing || loadingList || roster.length === 0}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Supabase"}
            </Button>
          </div>
        </div>

        {/* Thanh tìm kiếm đẹp mắt */}
        {!loadingList && roster.length > 0 && (
          <div className="relative mb-3 shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={14} className="text-[#a1a1aa]" />
            </div>
            <input
              type="text"
              placeholder="Search student code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#ebebeb] bg-white pl-9 pr-8 py-1.5 text-xs text-[#222222] placeholder-[#a1a1aa] focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#a1a1aa] hover:text-[#717171] focus:outline-none"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1">
          {loadingList ? (
            <div className="flex flex-col gap-2">
              <Skeleton height={40} className="w-full" />
              <Skeleton height={40} className="w-full" />
              <Skeleton height={40} className="w-full" />
            </div>
          ) : roster.length === 0 ? (
            <p className="text-sm text-[#717171]">No submissions yet.</p>
          ) : filteredRoster.length === 0 ? (
            <p className="text-sm text-[#717171] py-4 text-center">No matching students found.</p>
          ) : (
            <ul className="m-0 list-none pt-1.5 px-1 pb-2 flex flex-col gap-2.5">
              {filteredRoster.map((row) => {
                const isSelected = selectedId === row.submissionId;
                const isRunning = runningId === row.submissionId;
                return (
                  <li key={row.submissionId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.submissionId)}
                      className={`w-full rounded-xl p-3 text-left text-sm transition-all duration-200 border relative overflow-hidden ${
                        isSelected
                          ? "bg-[#fff7ed] border-[#f97316] shadow-sm shadow-[#f97316]/5 -translate-y-[1px]"
                          : isRunning
                            ? "bg-[#eff6ff] border-[#bfdbfe] text-[#222222] shadow-sm"
                            : "bg-white border-[#ebebeb] text-[#222222] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:-translate-y-[1px]"
                      }`}
                    >
                      <span className={`block font-semibold ${isSelected ? "text-[#ea580c]" : "text-[#222222]"}`}>
                        {row.studentCode}
                      </span>
                      <span className="mt-1 block">
                        <RosterScoreCell item={row} />
                      </span>
                      <span className={`mt-0.5 block text-xs font-normal ${
                        row.submissionStatus === "BuildFailed" || row.submissionStatus === "Error"
                          ? "text-[#dc2626] font-medium"
                          : row.submissionStatus === "Done"
                            ? "text-[#16a34a]"
                            : row.submissionStatus === "Grading"
                              ? "text-[#3b82f6] font-medium"
                              : "text-[#717171]"
                      }`}>
                        {row.submissionStatus}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Cột 2: Detail Results - Cuộn dọc độc lập và lọt hoàn hảo bên trên Footer */}
      <div className="min-w-[280px] flex-1 flex flex-col h-full overflow-y-auto pr-1">
        {!selectedId ? (
          <p className="text-sm text-[#717171]">
            Select a submission to view results.
          </p>
        ) : loadingDetail ? (
          <TableSkeleton rows={5} columns={7} />
        ) : !results ? (
          <p className="text-sm text-[#717171]">No results available.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 shrink-0">
              <div>
                <h3 className="m-0 text-lg font-semibold">{results.studentCode}</h3>
                <p className="mt-1 text-sm text-[#717171]">
                  Status: {results.submissionStatus} · Total:{" "}
                  {detailScorePending ? (
                    <strong className="text-[#1d4ed8]">Grading…</strong>
                  ) : (
                    <strong className="text-[#222222]">
                      {displayTotal != null ? displayTotal.toFixed(2) : "—"}
                      {selectedRosterItem
                        ? ` / ${selectedRosterItem.maxScore}`
                        : ""}
                    </strong>
                  )}
                </p>
                {results.submissionStatus === "BuildFailed" && (
                  <p className="mt-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-sm text-[#b45309]">
                    Docker build failed — SOURCE architecture checks may still
                    have awarded points.
                  </p>
                )}
              </div>
              <Button type="button" size="sm" onClick={handleRegrade}>
                Regrade
              </Button>
            </div>

            <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[#ebebeb] shrink-0">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#ebebeb] bg-[#fcfcfc]">
                    {[
                      "Method",
                      "URL / Rule",
                      "Pass",
                      "Awarded",
                      "Effective",
                      "HTTP",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-semibold text-[#717171]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((row) => {
                    const eff = effectiveScore(row);
                    const isSource = row.httpMethod === "SOURCE";
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-[#f4f4f5] last:border-0"
                      >
                        <td className="px-3 py-2">
                          <code
                            className={`rounded px-1.5 py-0.5 text-xs ${
                              isSource
                                ? "bg-[#ede9fe] text-[#6d28d9]"
                                : "bg-[#f4f4f5]"
                            }`}
                            title={
                              isSource
                                ? "Source architecture check (runs before Docker)"
                                : undefined
                            }
                          >
                            {row.httpMethod}
                          </code>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {row.urlTemplate}
                        </td>
                        <td className="px-3 py-2">{row.passed ? "✓" : "✗"}</td>
                        <td className="px-3 py-2">{row.awardedScore}</td>
                        <td
                          className={`px-3 py-2 ${
                            row.manualOverrideScore != null
                              ? "font-semibold text-[#f97316]"
                              : ""
                          }`}
                        >
                          {eff}
                          {row.manualOverrideScore != null && " *"}
                        </td>
                        <td className="px-3 py-2">
                          {row.actualStatusCode ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openAdjust(row.id, eff)}
                          >
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {results.results.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold text-[#222222]">
                  Response details
                </h4>
                {results.results.map((r) => (
                  <div key={r.id} className="mb-3">
                    <p className="text-xs text-[#717171]">
                      {r.httpMethod} {r.urlTemplate}
                    </p>
                    <pre className="mt-1 max-h-[300px] overflow-auto rounded-lg bg-[#f4f4f5] p-3 text-xs font-mono whitespace-pre-wrap break-all">
                      {formatResponse(r.actualResponse)}
                    </pre>
                    {r.errorMessage && (
                      <p className="mt-1 text-xs text-[#dc2626]">
                        {r.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={syncDialogOpen}
        onClose={() => {
          if (!syncing) setSyncDialogOpen(false);
        }}
        title="Sync Supabase"
        description="Optionally override labId and className before syncing."
        maxWidth={480}
        footer={
          <ModalActions
            onCancel={() => {
              if (!syncing) setSyncDialogOpen(false);
            }}
            onConfirm={handleSyncSupabase}
            cancelLabel="Close"
            confirmLabel="Start sync"
            confirmLoading={syncing}
          />
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Lab ID"
            value={syncLabId}
            onChange={(e) => setSyncLabId(e.target.value)}
            placeholder="Leave blank to use assignment title"
            helperText="Maps to request body field labId."
          />
          <Input
            label="Class name"
            value={syncClassName}
            onChange={(e) => setSyncClassName(e.target.value)}
            placeholder="Leave blank to let backend resolve by student_id"
            helperText="Maps to request body field className."
          />
        </div>
      </Modal>

      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust score"
        maxWidth={400}
        footer={
          <ModalActions
            onCancel={() => setAdjustOpen(false)}
            onConfirm={handleAdjust}
            confirmLabel="Save"
            confirmDisabled={!adjustReason.trim()}
          />
        }
      >
        <p className="mb-4 text-sm text-[#717171]">
          Max for this test case:{" "}
          {adjustTcId
            ? (maxScoreByTcId.get(adjustTcId) ?? "—")
            : "—"}
        </p>
        <div className="flex flex-col gap-4">
          <Input
            label="New score"
            type="number"
            min={0}
            step={0.1}
            value={adjustScore}
            onChange={(e) => setAdjustScore(e.target.value)}
          />
          <Textarea
            label="Reason"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            rows={3}
            placeholder="Required"
          />
        </div>
      </Modal>
    </div>
  );
}
