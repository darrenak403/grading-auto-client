"use client";

import * as React from "react";
import { api } from "@/lib";
import type { QuestionResult } from "@/types";

interface AdjustResultCardProps {
  result: QuestionResult;
  onAdjusted?: () => void;
}

export function AdjustResultCard({ result, onAdjusted }: AdjustResultCardProps) {
  const [adjustedScore, setAdjustedScore] = React.useState(
    result.adjustedScore ?? result.score
  );
  const [adjustReason, setAdjustReason] = React.useState(
    result.adjustReason || ""
  );
  const [adjustedBy, setAdjustedBy] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAdjustedScore(result.adjustedScore ?? result.score);
    setAdjustReason(result.adjustReason || "");
  }, [result]);

  const handleAdjust = React.useCallback(async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.adjustQuestionResult(result.id, {
        adjustedScore: Number(adjustedScore),
        adjustReason,
        adjustedBy: adjustedBy || undefined,
      });
      if (res.status) {
        setMessage("Score updated successfully");
        if (onAdjusted) {
          onAdjusted();
        }
      } else {
        setMessage(res.message || "Failed to update score");
      }
    } catch {
      setMessage("Server connection error occurred");
    } finally {
      setSaving(false);
    }
  }, [result.id, adjustedScore, adjustReason, adjustedBy, onAdjusted]);

  const handleRemoveAdjustment = React.useCallback(async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.deleteQuestionResultAdjustment(result.id);
      if (res.status) {
        setAdjustedScore(result.score);
        setAdjustReason("");
        setMessage("Score adjustment deleted");
        if (onAdjusted) {
          onAdjusted();
        }
      } else {
        setMessage(res.message || "Failed to delete score adjustment");
      }
    } catch {
      setMessage("Server connection error occurred");
    } finally {
      setSaving(false);
    }
  }, [result.id, result.score, onAdjusted]);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-2xl p-5 mb-4 shadow-sm shadow-black/5 transition-all hover:shadow-md hover:shadow-black/5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-[#222222]">
          {result.questionTitle || `Question ${result.questionId}`}
        </h4>
        <div className="text-xs font-semibold text-[#717171]">
          Original score: <span className="text-[#222222]">{result.score} / {result.maxScore}</span>
          {result.adjustedScore !== undefined && (
            <span className="ml-2 pl-2 border-l border-gray-200 text-[#f97316]">
              Currently adjusting: {result.adjustedScore}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3">
          <label className="block text-[10px] font-semibold text-[#717171] uppercase tracking-wider mb-2">
            New Score
          </label>
          <input
            type="number"
            min={0}
            max={result.maxScore}
            step={0.5}
            value={adjustedScore}
            onChange={(e) => setAdjustedScore(Number(e.target.value))}
            className="w-full bg-white border border-[#ebebeb] text-[#222222] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 placeholder:text-[#a1a1aa] hover:border-[#d4d4d8] font-medium h-[38px]"
          />
        </div>
        <div className="md:col-span-6">
          <label className="block text-[10px] font-semibold text-[#717171] uppercase tracking-wider mb-2">
            Adjustment Reason
          </label>
          <input
            type="text"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Enter reason for score change..."
            className="w-full bg-white border border-[#ebebeb] text-[#222222] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 placeholder:text-[#a1a1aa] hover:border-[#d4d4d8] font-medium h-[38px]"
          />
        </div>
        <div className="flex gap-2 md:col-span-3 w-full">
          <button
            onClick={handleAdjust}
            disabled={saving}
            className="flex-1 w-full px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:pointer-events-none h-[38px] flex items-center justify-center select-none"
          >
            {saving ? "Saving..." : "Update"}
          </button>
          {result.adjustedScore !== undefined && (
            <button
              onClick={handleRemoveAdjustment}
              disabled={saving}
              className="flex-1 w-full px-4 py-2 bg-transparent hover:bg-red-50 text-red-600 border border-[#ebebeb] hover:border-red-100 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:pointer-events-none h-[38px] flex items-center justify-center select-none"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}