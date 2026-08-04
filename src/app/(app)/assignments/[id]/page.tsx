"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { AssignmentWizardProvider, useAssignmentWizard } from "./context";
import { WizardSidebar } from "./components/layout/WizardSidebar";
import { WizardHeader } from "./components/layout/WizardHeader";
import { WizardFooter } from "./components/layout/WizardFooter";
import { Step1, Step2, Step3, Step4, Step5 } from "./components/steps/WizardSteps";
import { TestCaseDialog } from "./components/dialogs/TestCaseDialog";
import { TestCaseDetailDialog } from "./components/dialogs/TestCaseDetailDialog";
import { DetailSubmissionDialog } from "@/components/shared/DetailSubmissionDialog";

const slideVariants = {
  initial: (dir: number) => ({
    x: dir > 0 ? 50 : -50,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 50 : -50,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  }),
};

function AssignmentWizardContent() {
  const {
    loading,
    assignment,
    error,
    currentStep,
    direction,
    
    confirmOpen,
    setConfirmOpen,
    confirmConfig,
    tcDialogConfig,
    setTcDialogConfig,
    handleSaveTestCases,
    tcDialogSaving,
    tcDetailDialog,
    setTcDetailDialog,
    selectedSubmissionId,
    setSelectedSubmissionId,
    loadSubmissions
  } = useAssignmentWizard();

  if (loading && !assignment) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <LoadingSpinner fullPage label="Loading assignment data..." />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#ebebeb] rounded-2xl p-8 text-center shadow-lg shadow-black/5">
          <AlertCircle className="w-12 h-12 text-[#f97316] mx-auto mb-4 stroke-[1.5]" />
          <h2 className="text-xl font-semibold text-[#222222] mb-2">An Error Occurred</h2>
          <p className="text-sm text-[#717171] mb-6">{error || "Could not find information for this assignment."}</p>
          <Link
            href="/exam-sessions"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-[0.98]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex font-sans overflow-hidden select-none">
      <WizardSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-white">
        <WizardHeader />

        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-12 relative flex flex-col items-center">
          <div className="max-w-6xl w-full flex flex-col">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex flex-col"
              >
                <Step1 />
                <Step2 />
                <Step3 />
                <Step4 />
                <Step5 />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <WizardFooter />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel={confirmConfig.confirmLabel}
        cancelLabel={confirmConfig.cancelLabel}
        variant={confirmConfig.variant}
        showCancel={confirmConfig.showCancel}
        onConfirm={confirmConfig.onConfirm}
      />

      <TestCaseDialog
        isOpen={tcDialogConfig.isOpen}
        onClose={() => setTcDialogConfig((prev: any) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveTestCases}
        initialItems={tcDialogConfig.initialItems}
        questionType={tcDialogConfig.qType}
        isSaving={tcDialogSaving}
      />

      <TestCaseDetailDialog
        isOpen={tcDetailDialog.isOpen}
        onClose={() => setTcDetailDialog((prev: any) => ({ ...prev, isOpen: false }))}
        tc={tcDetailDialog.tc}
        qType={tcDetailDialog.qType}
      />

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

export default function AssignmentDetailPage() {
  return (
    <AssignmentWizardProvider>
      <AssignmentWizardContent />
    </AssignmentWizardProvider>
  );
}
