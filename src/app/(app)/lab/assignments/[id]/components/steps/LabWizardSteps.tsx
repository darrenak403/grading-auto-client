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
        <div className="w-full rounded-2xl border border-[#ebebeb] bg-white p-8">
          <div className="mb-6">
            <h2 className="m-0 text-2xl font-semibold text-[#222222]">
              Test Cases
            </h2>
            <p className="mt-2 text-sm text-[#717171]">
              Import rubric test cases and approve them before grading.
            </p>
          </div>
          <TestCasesTab assignmentId={assignmentId} />
        </div>
      )}
      {currentStep === 3 && (
        <div className="w-full rounded-2xl border border-[#ebebeb] bg-white p-8">
          <div className="mb-6">
            <h2 className="m-0 text-2xl font-semibold text-[#222222]">
              Upload &amp; Grade
            </h2>
            <p className="mt-2 text-sm text-[#717171]">
              Upload student ZIP files, then run Grade All. Filename format:
              StudentCode_Name.zip
            </p>
          </div>
          <SubmissionsTab assignmentId={assignmentId} />
        </div>
      )}
      {currentStep === 4 && (
        <div className="w-full rounded-2xl border border-[#ebebeb] bg-white p-8">
          <div className="mb-6">
            <h2 className="m-0 text-2xl font-semibold text-[#222222]">
              Review Results
            </h2>
            <p className="mt-2 text-sm text-[#717171]">
              Review scores per submission and adjust individual test case points.
            </p>
          </div>
          <ResultsTab assignmentId={assignmentId} />
        </div>
      )}
    </>
  );
}
