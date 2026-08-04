"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  LabGradingProgressProvider,
  LabWizardProvider,
  useLabWizard,
} from "./context";
import { LabWizardSidebar } from "./components/layout/LabWizardSidebar";
import { LabWizardHeader } from "./components/layout/LabWizardHeader";
import { LabWizardFooter } from "./components/layout/LabWizardFooter";
import { LabWizardSteps } from "./components/steps/LabWizardSteps";

function Content() {
  const { loading, assignment, error, assignmentId } =
    useLabWizard();

  if (loading && !assignment) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <LoadingSpinner fullPage label="Loading lab assignment..." />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#ebebeb] rounded-2xl p-8 text-center shadow-lg shadow-black/5">
          <AlertCircle className="w-12 h-12 text-[#f97316] mx-auto mb-4 stroke-[1.5]" />
          <h2 className="text-xl font-semibold text-[#222222] mb-2">Unable to load assignment</h2>
          <p className="text-sm text-[#717171] mb-6">{error || "Assignment not found"}</p>
          <Link
            href="/lab/assignments"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-[0.98]"
          >
            Back to lab assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LabGradingProgressProvider assignmentId={assignmentId}>
      <div className="fixed inset-0 z-[9999] bg-white flex font-sans overflow-hidden select-none">
        <LabWizardSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-white">
          <LabWizardHeader />
          <main className="flex-1 overflow-y-auto px-2 py-2 md:px-6 md:py-4 relative flex flex-col items-center">
            <div className="max-w-[1600px] w-full flex flex-col">
              <div className="w-full flex flex-col">
                <LabWizardSteps />
              </div>
            </div>
          </main>
          <LabWizardFooter />
        </div>
      </div>
    </LabGradingProgressProvider>
  );
}

export default function LabAssignmentDetailPage() {
  return (
    <LabWizardProvider>
      <Content />
    </LabWizardProvider>
  );
}
