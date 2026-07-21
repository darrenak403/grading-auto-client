"use client";

import * as React from "react";
import { api } from "@/lib";
import type {
  ApiResponse,
  LabAssignmentRosterItemDto,
  LabSubmissionResultDto,
  LabSupabaseGradingSessionOption,
  LabTestCaseDto,
  LabSyncSupabaseGradesResult,
} from "@/types";
import {
  effectiveScore,
  isRosterScorePending,
  sumEffectiveScores,
} from "@/lib/lab-utils";
import { useToast, Button, FormSelect, Input, Textarea, Modal, ModalActions, Skeleton, TableSkeleton, Badge } from "@/components/ui";
import { useLabGradingProgress } from "../context";
import { RosterScoreCell } from "./GradingPlaceholderProgress";
import { Search, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";


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

const formatApiError = (res: ApiResponse<unknown>, fallback: string) => {
  const detail = res.errors?.find(Boolean);
  return [res.message || fallback, detail, res.traceId ? `Trace: ${res.traceId}` : null]
    .filter(Boolean)
    .join(" ");
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
  const [syncTermId, setSyncTermId] = React.useState("");
  const [syncLabId, setSyncLabId] = React.useState("");
  const [syncClassName, setSyncClassName] = React.useState("");
  const [syncGradingSessionId, setSyncGradingSessionId] = React.useState("");
  const [syncTerms, setSyncTerms] = React.useState<
    { id: string; code: string | null; name: string | null }[]
  >([]);
  const [syncClasses, setSyncClasses] = React.useState<{ name: string }[]>([]);
  const [syncLabs, setSyncLabs] = React.useState<
    { code: string; title: string | null; className: string | null; deadline: string | null }[]
  >([]);
  const [syncSessions, setSyncSessions] = React.useState<
    LabSupabaseGradingSessionOption[]
  >([]);
  const [syncSessionsSupported, setSyncSessionsSupported] =
    React.useState(false);
  const [syncOptionsLoading, setSyncOptionsLoading] = React.useState(false);
  const [syncOptionsError, setSyncOptionsError] = React.useState<string | null>(null);
  const syncOptionsRequestRef = React.useRef(0);
  const [syncResult, setSyncResult] = React.useState<LabSyncSupabaseGradesResult | null>(null);

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
  const syncableRoster = React.useMemo(
    () => roster.filter((row) => !isRosterScorePending(row)),
    [roster]
  );

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

  const loadSyncOptions = React.useCallback(
    async ({
      termId,
      className,
      labCode,
      replaceTerms = false,
      replaceClasses = false,
    }: {
      termId?: string;
      className?: string;
      labCode?: string;
      replaceTerms?: boolean;
      replaceClasses?: boolean;
    } = {}) => {
      const requestId = syncOptionsRequestRef.current + 1;
      syncOptionsRequestRef.current = requestId;
      setSyncOptionsLoading(true);
      setSyncOptionsError(null);

      try {
        const res = await api.getLabSupabaseDropdownOptions({
          termId,
          className,
          labCode,
        });
        if (syncOptionsRequestRef.current !== requestId) return;

        if (res.status && res.data) {
          if (replaceTerms) setSyncTerms(res.data.terms);
          if (replaceClasses) setSyncClasses(res.data.classes);
          setSyncLabs(res.data.labs);
          setSyncSessions(res.data.sessions ?? []);
          setSyncSessionsSupported(Array.isArray(res.data.sessions));
        } else {
          if (replaceTerms) setSyncTerms([]);
          if (replaceClasses) setSyncClasses([]);
          setSyncLabs([]);
          setSyncSessions([]);
          setSyncOptionsError(
            formatApiError(
              res,
              "Failed to load Supabase term, class, and lab options."
            )
          );
        }
      } catch (error) {
        if (syncOptionsRequestRef.current !== requestId) return;
        if (replaceTerms) setSyncTerms([]);
        if (replaceClasses) setSyncClasses([]);
        setSyncLabs([]);
        setSyncSessions([]);
        setSyncOptionsError(
          error instanceof Error
            ? error.message
            : "Error loading Supabase term, class, and lab options."
        );
      } finally {
        if (syncOptionsRequestRef.current === requestId) {
          setSyncOptionsLoading(false);
        }
      }
    },
    []
  );

  React.useEffect(() => {
    if (!syncDialogOpen) return;
    void loadSyncOptions({ replaceTerms: true, replaceClasses: true });
  }, [syncDialogOpen, loadSyncOptions]);

  const handleSyncTermChange = (value: string) => {
    setSyncTermId(value);
    setSyncClassName("");
    setSyncLabId("");
    setSyncGradingSessionId("");
    setSyncClasses([]);
    setSyncLabs([]);
    setSyncSessions([]);
    if (value) void loadSyncOptions({ termId: value, replaceClasses: true });
  };

  const handleSyncClassChange = (value: string) => {
    setSyncClassName(value);
    setSyncLabId("");
    setSyncGradingSessionId("");
    setSyncLabs([]);
    setSyncSessions([]);
    if (syncTermId && value) {
      void loadSyncOptions({ termId: syncTermId, className: value });
    }
  };

  const handleSyncLabChange = (value: string) => {
    setSyncLabId(value);
    setSyncGradingSessionId("");
    if (syncTermId && syncClassName && value) {
      void loadSyncOptions({
        termId: syncTermId,
        className: syncClassName,
        labCode: value,
      });
    }
  };

  const handleSyncSupabase = async () => {
    const termId = syncTermId.trim();
    const labId = syncLabId.trim();
    const className = syncClassName.trim();
    if (!termId || !className || !labId) {
      toast("Select a Supabase term, class, and lab before syncing.", "error");
      return;
    }
    if (syncSessionsSupported && !syncGradingSessionId.trim()) {
      toast("Select an open grading session before syncing.", "error");
      return;
    }
    if (syncableRoster.length === 0) {
      toast("No completed submissions are ready to sync.", "error");
      return;
    }

    try {
      setSyncing(true);
      const detailResponses = await Promise.all(
        syncableRoster.map(async (row) => ({
          rosterItem: row,
          response: await api.getLabSubmissionResults(row.submissionId),
        }))
      );
      const failedLoads = detailResponses.filter(
        (item) => !item.response.status || !item.response.data
      );
      if (failedLoads.length > 0) {
        toast(`Could not load ${failedLoads.length} submission result(s).`, "error");
        return;
      }

      const submissions = detailResponses
        .map((item) => item.response.data!)
        .map((result) => ({
          studentCode: result.studentCode.trim().toUpperCase(),
          score: sumEffectiveScores(result.results),
          details: result,
        }));

      const res = await api.syncLabSupabaseGrades({
        termId,
        className,
        labCode: labId,
        ...(syncGradingSessionId
          ? { gradingSessionId: syncGradingSessionId }
          : {}),
        submissions,
      });
      if (res.status) {
        const syncedCount = res.data?.syncedCount ?? submissions.length;
        const failedCount = res.data?.failedCount ?? 0;
        setSyncResult(
          res.data ?? {
            total: submissions.length,
            syncedCount,
            failedCount,
            synced: [],
            failed: [],
          }
        );
        toast(
          failedCount > 0
            ? `Synced ${syncedCount}; ${failedCount} failed.`
            : `Successfully synced ${syncedCount} submissions to Supabase.`,
          (failedCount > 0 ? "error" : "success") as "error" | "success"
        );
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
      syncOptionsRequestRef.current += 1;
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const syncTermOptions = React.useMemo(
    () =>
      syncTerms.map((item) => ({
        value: item.id,
        label: item.code
          ? item.name
            ? `${item.code} · ${item.name}`
            : item.code
          : item.name || item.id,
      })),
    [syncTerms]
  );

  const syncClassOptions = React.useMemo(
    () =>
      Array.from(new Set(syncClasses.map((item) => item.name)))
        .filter(Boolean)
        .map((name) => ({ value: name, label: name })),
    [syncClasses]
  );

  const syncLabOptions = React.useMemo(
    () => {
      const uniqueLabs = new Map<string, (typeof syncLabs)[number]>();
      for (const item of syncLabs) {
        if (!item.code || uniqueLabs.has(item.code)) continue;
        uniqueLabs.set(item.code, item);
      }

      return Array.from(uniqueLabs.values()).map((item) => ({
        value: item.code,
        label: item.deadline
          ? `${item.code} · due ${new Date(item.deadline).toLocaleDateString()}`
          : item.code,
      }));
    },
    [syncLabs]
  );

  const matchingSyncSessions = React.useMemo(() => {
    const termId = syncTermId.trim().toLowerCase();
    const className = syncClassName.trim().toLowerCase();
    const labCode = syncLabId.trim().toLowerCase();

    return syncSessions.filter(
      (session) =>
        session.status.toLowerCase() === "open" &&
        session.termId.toLowerCase() === termId &&
        session.className.toLowerCase() === className &&
        session.labCode.toLowerCase() === labCode
    );
  }, [syncClassName, syncLabId, syncSessions, syncTermId]);

  const syncSessionOptions = React.useMemo(
    () =>
      matchingSyncSessions.map((session) => ({
        value: session.id,
        label: session.deadline
          ? `${session.name} · due ${new Date(session.deadline).toLocaleString()}`
          : `${session.name} · no deadline`,
      })),
    [matchingSyncSessions]
  );

  React.useEffect(() => {
    if (!syncSessionsSupported || !syncLabId) return;

    setSyncGradingSessionId((current) => {
      if (matchingSyncSessions.some((session) => session.id === current)) {
        return current;
      }
      return matchingSyncSessions.length === 1
        ? matchingSyncSessions[0].id
        : "";
    });
  }, [matchingSyncSessions, syncLabId, syncSessionsSupported]);

  const syncConfirmDisabled =
    syncing ||
    syncOptionsLoading ||
    syncOptionsError != null ||
    !syncTermId.trim() ||
    !syncClassName.trim() ||
    !syncLabId.trim() ||
    (syncSessionsSupported && !syncGradingSessionId.trim()) ||
    syncableRoster.length === 0;

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full w-full overflow-hidden flex-1">
      {/* Cột 1: Submissions Sidebar - Ghim cố định & tự cuộn độc lập */}
      <div
        className="w-full md:w-[260px] shrink-0 flex flex-col h-full border-b md:border-b-0 md:border-r border-[#ebebeb] pb-4 md:pb-0 md:pr-4 overflow-hidden"
        data-tour="lab-results"
      >
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
              data-tour="sync-supabase"
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
          if (!syncing) {
            setSyncDialogOpen(false);
            setSyncResult(null);
          }
        }}
        title={syncResult ? "Sync Results" : "Sync Supabase"}
        description={
          syncResult
            ? "Summary of the Supabase sync operation."
            : "Choose the target term, class, lab, and grading session before syncing completed submissions."
        }
        maxWidth={480}
        footer={
          syncResult ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setSyncDialogOpen(false);
                setSyncResult(null);
              }}
              className="w-full"
            >
              Close
            </Button>
          ) : (
            <ModalActions
              onCancel={() => {
                if (!syncing) {
                  setSyncDialogOpen(false);
                  setSyncResult(null);
                }
              }}
              onConfirm={handleSyncSupabase}
              cancelLabel="Close"
              confirmLabel="Start sync"
              confirmDisabled={syncConfirmDisabled}
              confirmLoading={syncing}
            />
          )
        }
      >
        {syncResult ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#ebebeb] bg-[#fcfcfc] p-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#222222]">Sync Summary</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-[#f4f4f5] p-2">
                    <span className="block text-xs text-[#717171]">Total</span>
                    <span className="text-base font-bold text-[#222222]">{syncResult.total}</span>
                  </div>
                  <div className="rounded-lg bg-[#ecfdf5] p-2">
                    <span className="block text-xs text-[#047857]">Success</span>
                    <span className="text-base font-bold text-[#047857]">{syncResult.syncedCount}</span>
                  </div>
                  <div className="rounded-lg bg-[#fef2f2] p-2">
                    <span className="block text-xs text-[#dc2626]">Failed</span>
                    <span className="text-base font-bold text-[#dc2626]">{syncResult.failedCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {syncResult.failedCount > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#dc2626]">
                  <AlertCircle size={16} />
                  <span>Failed Submissions ({syncResult.failedCount})</span>
                </div>
                <div className="max-h-60 overflow-y-auto border border-[#fecaca] bg-[#fef2f2] rounded-xl p-3 flex flex-col gap-2.5">
                  {syncResult.failed.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#991b1b] border-b border-[#fee2e2] last:border-0 pb-2 last:pb-0"
                    >
                      <strong className="block text-sm">{item.studentCode}</strong>
                      <span className="block mt-1 leading-relaxed text-[#b91c1c] bg-white/50 rounded px-2 py-1 border border-[#fee2e2] font-mono">
                        {item.error || item.message || "Unknown sync error"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syncResult.failedCount === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 size={40} className="text-[#16a34a] mb-2" />
                <p className="text-sm font-semibold text-[#222222]">All Submissions Synced</p>
                <p className="text-xs text-[#717171] mt-1">
                  All {syncResult.syncedCount} completed submissions have been successfully uploaded to Supabase.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4" data-tour="sync-supabase-form">
            <FormSelect
              label="Term"
              value={syncTermId}
              onValueChange={handleSyncTermChange}
              options={syncTermOptions}
              placeholder={syncOptionsLoading ? "Loading terms..." : "Select term"}
              disabled={syncing || syncOptionsLoading || syncTermOptions.length === 0}
            />
            <FormSelect
              label="Class"
              value={syncClassName}
              onValueChange={handleSyncClassChange}
              options={syncClassOptions}
              placeholder={
                !syncTermId
                  ? "Select term first"
                  : syncOptionsLoading
                    ? "Loading classes..."
                    : "Select class"
              }
              disabled={
                syncing ||
                syncOptionsLoading ||
                !syncTermId ||
                syncClassOptions.length === 0
              }
            />
            <FormSelect
              label="Lab"
              value={syncLabId}
              onValueChange={handleSyncLabChange}
              options={syncLabOptions}
              placeholder={
                !syncTermId
                  ? "Select term first"
                  : !syncClassName
                  ? "Select class first"
                  : syncOptionsLoading
                    ? "Loading labs..."
                    : "Select lab"
              }
              disabled={
                syncing ||
                syncOptionsLoading ||
                !syncTermId ||
                !syncClassName ||
                syncLabOptions.length === 0
              }
            />
            {syncSessionsSupported && (
              <FormSelect
                label="Grading session"
                value={syncGradingSessionId}
                onValueChange={setSyncGradingSessionId}
                options={syncSessionOptions}
                placeholder={
                  !syncLabId
                    ? "Select lab first"
                    : syncOptionsLoading
                      ? "Loading grading sessions..."
                      : "Select grading session"
                }
                disabled={
                  syncing ||
                  syncOptionsLoading ||
                  !syncLabId ||
                  syncSessionOptions.length === 0
                }
              />
            )}
            {syncOptionsError ? (
              <p className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm font-medium text-[#b91c1c]">
                {syncOptionsError}
              </p>
            ) : syncTermId && !syncOptionsLoading && syncClassOptions.length === 0 ? (
              <p className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-sm font-medium text-[#9a3412]">
                No classes are assigned to the selected term.
              </p>
            ) : syncClassName && !syncOptionsLoading && syncLabOptions.length === 0 ? (
              <p className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-sm font-medium text-[#9a3412]">
                No labs are assigned to {syncClassName}.
              </p>
            ) : syncSessionsSupported &&
              syncLabId &&
              !syncOptionsLoading &&
              syncSessionOptions.length === 0 ? (
              <p className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-sm font-medium text-[#9a3412]">
                No open grading session is available for {syncLabId} in {syncClassName}.
              </p>
            ) : (
              <p className="text-sm text-[#717171]">
                Sync will send {syncableRoster.length} completed submission
                {syncableRoster.length === 1 ? "" : "s"} for the selected term,
                class, lab{syncSessionsSupported ? ", and grading session" : ""}.
              </p>
            )}
          </div>
        )}
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
