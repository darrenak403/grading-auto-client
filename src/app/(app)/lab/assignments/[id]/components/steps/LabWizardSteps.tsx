"use client";

import * as React from "react";
import { useLabWizard } from "../../context";
import { Step1Setup } from "./Step1Setup";
import { TestCasesTab } from "../TestCasesTab";
import { SubmissionsTab } from "../SubmissionsTab";
import { ResultsTab } from "../ResultsTab";

export function LabWizardSteps() {
  const { currentStep, assignmentId } = useLabWizard();

  return (
    <>
      {currentStep === 1 && <Step1Setup />}
      {currentStep === 2 && (
        <div className="w-full rounded-2xl border border-[#ebebeb] bg-white p-8 flex flex-col h-[calc(100vh-210px)] overflow-hidden">
          <TestCasesTab assignmentId={assignmentId} />
        </div>
      )}
      {currentStep === 3 && (
        <div className="w-full rounded-2xl border border-[#ebebeb] bg-white p-8 flex flex-col h-[calc(100vh-210px)] overflow-hidden">
          <SubmissionsTab assignmentId={assignmentId} />
        </div>
      )}
      {currentStep === 4 && (
        <div className="w-full rounded-2xl border border-[#ebebeb] bg-white p-8 flex flex-col h-[calc(100vh-210px)] overflow-hidden">
          <ResultsTab assignmentId={assignmentId} />
        </div>
      )}
    </>
  );
}
