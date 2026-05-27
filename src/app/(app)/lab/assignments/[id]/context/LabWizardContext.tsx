"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib";
import type { LabAssignmentDto } from "@/types";
import type { LabWizardContextValue } from "../types";

const LabWizardContext = React.createContext<LabWizardContextValue | null>(null);

export function LabWizardProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const assignmentId = params.id as string;
  const [assignment, setAssignment] = React.useState<LabAssignmentDto | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stepState, setStepState] = React.useState({ step: 1, direction: 0 });

  const currentStep = stepState.step;
  const direction = stepState.direction;

  const setCurrentStep = React.useCallback((step: number) => {
    setStepState((prev) => ({ ...prev, step }));
  }, []);

  const setDirection = React.useCallback((direction: number) => {
    setStepState((prev) => ({ ...prev, direction }));
  }, []);

  const goToStep = React.useCallback((step: number, direction: number) => {
    setStepState({ step, direction });
  }, []);
  const stepSaveHandlers = React.useRef<
    Record<number, () => Promise<boolean>>
  >({});

  const registerStepSave = React.useCallback(
    (step: number, handler: (() => Promise<boolean>) | null) => {
      if (handler) {
        stepSaveHandlers.current[step] = handler;
      } else {
        delete stepSaveHandlers.current[step];
      }
    },
    []
  );

  const runStepSave = React.useCallback(async (step: number) => {
    const handler = stepSaveHandlers.current[step];
    if (!handler) return true;
    return handler();
  }, []);

  const reloadAssignment = React.useCallback(async () => {
    setLoading(true);
    const res = await api.getLabAssignmentById(assignmentId);
    if (res.status && res.data) {
      setAssignment(res.data);
      setError(null);
    } else {
      setError(res.message || "Failed to load lab assignment");
      setAssignment(null);
    }
    setLoading(false);
  }, [assignmentId]);

  React.useEffect(() => {
    reloadAssignment();
  }, [reloadAssignment]);

  const value: LabWizardContextValue = {
    assignmentId,
    assignment,
    setAssignment,
    loading,
    error,
    currentStep,
    direction,
    setCurrentStep,
    setDirection,
    goToStep,
    reloadAssignment,
    registerStepSave,
    runStepSave,
  };

  return (
    <LabWizardContext.Provider value={value}>{children}</LabWizardContext.Provider>
  );
}

export function useLabWizard() {
  const ctx = React.useContext(LabWizardContext);
  if (!ctx) throw new Error("useLabWizard must be used within LabWizardProvider");
  return ctx;
}
