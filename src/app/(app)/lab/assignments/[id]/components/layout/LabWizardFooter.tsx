"use client";

import * as React from "react";
import Link from "next/link";
import { useLabWizard } from "../../context";

const TOTAL_STEPS = 4;

export function LabWizardFooter() {
  const {
    assignmentId,
    currentStep,
    runStepSave,
    goToStep,
  } = useLabWizard();
  const [busy, setBusy] = React.useState(false);

  const handleContinue = async () => {
    setBusy(true);
    try {
      const saved = await runStepSave(currentStep);
      if (!saved) return;

      goToStep(currentStep + 1, 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="h-20 border-t border-[#ebebeb] px-10 flex items-center justify-between bg-white relative z-10 shrink-0 select-none">
      {/* Segmented Progress Bar màu cam thương hiệu */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#ebebeb] flex">
        {Array.from({ length: TOTAL_STEPS }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCompletedOrActive = currentStep >= stepNum;
          return (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ease-out border-r border-white last:border-r-0 ${
                isCompletedOrActive ? "bg-[#f97316]" : "bg-[#ebebeb]"
              }`}
            />
          );
        })}
      </div>

      <div>
        <div />
      </div>

      <div className="flex items-center gap-5">
        <span className="text-xs text-[#717171] font-semibold">
          Step {currentStep} of {TOTAL_STEPS}
        </span>
        {currentStep > 1 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => goToStep(currentStep - 1, -1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-[#ebebeb] bg-white rounded-lg text-sm font-semibold text-[#717171] hover:bg-[#f4f4f5] transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed"
          >
            <span>Back</span>
          </button>
        )}
        {currentStep < TOTAL_STEPS ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleContinue}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#f97316] rounded-lg text-sm font-semibold text-white hover:bg-[#ea580c] transition-all cursor-pointer active:scale-95 shadow-sm shadow-orange-500/15 disabled:bg-[#f7f7f7] disabled:text-[#b0b0b0] disabled:cursor-not-allowed"
          >
            <span>{busy ? "Saving…" : "Continue"}</span>
          </button>
        ) : (
          <Link
            href="/lab/assignments"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#f97316] rounded-lg text-sm font-semibold text-white hover:bg-[#ea580c] transition-all cursor-pointer active:scale-95 shadow-sm shadow-orange-500/15"
          >
            <span>Finish and Exit</span>
          </Link>
        )}
      </div>
    </footer>
  );
}
