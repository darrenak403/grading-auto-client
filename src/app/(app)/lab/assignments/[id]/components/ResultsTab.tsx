"use client";

import * as React from "react";
import { api } from "@/lib";
import type {
  LabAssignmentRosterItemDto,
  LabSubmissionResultDto,
  LabTestCaseDto,
} from "@/types";
import {
  effectiveScore,
  isRosterScorePending,
  sumEffectiveScores,
} from "@/lib/lab-utils";
import { useToast, Button, Input, Textarea, Modal, ModalActions } from "@/components/ui";
import { useLabGradingProgress } from "../context";
import { RosterScoreCell } from "./GradingPlaceholderProgress";

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
      startPolling();
      await loadRoster();
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

  return (
    <div className="flex flex-wrap gap-6">
      <div className="min-w-[240px] shrink-0">
        <h3 className="mb-3 text-base font-semibold text-[#222222]">Submissions</h3>
        {loadingList ? (
          <p className="text-sm text-[#717171]">Loading…</p>
        ) : roster.length === 0 ? (
          <p className="text-sm text-[#717171]">No submissions yet.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {roster.map((row) => {
              const isSelected = selectedId === row.submissionId;
              const isRunning = runningId === row.submissionId;
              return (
                <li key={row.submissionId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.submissionId)}
                    className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-[#fef2e8] font-semibold text-[#f97316]"
                        : isRunning
                          ? "bg-[#dbeafe] text-[#222222] hover:bg-[#bfdbfe]"
                          : "text-[#222222] hover:bg-[#f4f4f5]"
                    }`}
                  >
                    <span className="block">{row.studentCode}</span>
                    <span className="mt-1 block">
                      <RosterScoreCell item={row} />
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-[#717171]">
                      {row.submissionStatus}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="min-w-[280px] flex-1">
        {!selectedId ? (
          <p className="text-sm text-[#717171]">
            Select a submission to view results.
          </p>
        ) : loadingDetail ? (
          <p className="text-sm text-[#717171]">Loading results…</p>
        ) : !results ? (
          <p className="text-sm text-[#717171]">No results available.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
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

            <div className="overflow-x-auto rounded-xl border border-[#ebebeb]">
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

            {results.results.some((r) => r.actualResponse) && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold text-[#222222]">
                  Response details
                </h4>
                {results.results
                  .filter((r) => r.actualResponse)
                  .map((r) => (
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
