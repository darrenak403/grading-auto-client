"use client";

import * as React from "react";
import { useLabGradingProgressPoll } from "@/hooks/useLabGradingProgressPoll";
import type { LabProgressUpdateHandler } from "@/hooks/useLabGradingProgressPoll";
import type { LabGradingProgressDto } from "@/types";

type LabGradingProgressContextValue = {
  progress: LabGradingProgressDto | null;
  isPolling: boolean;
  error: string | null;
  startPolling: () => void;
  stopPolling: () => void;
  refreshProgress: () => Promise<LabGradingProgressDto | null>;
  registerOnProgressUpdate: (handler: LabProgressUpdateHandler) => () => void;
};

const LabGradingProgressContext =
  React.createContext<LabGradingProgressContextValue | null>(null);

export function LabGradingProgressProvider({
  assignmentId,
  children,
}: {
  assignmentId: string;
  children: React.ReactNode;
}) {
  const value = useLabGradingProgressPoll(assignmentId);
  return (
    <LabGradingProgressContext.Provider value={value}>
      {children}
    </LabGradingProgressContext.Provider>
  );
}

export function useLabGradingProgress() {
  const ctx = React.useContext(LabGradingProgressContext);
  if (!ctx) {
    throw new Error(
      "useLabGradingProgress must be used within LabGradingProgressProvider"
    );
  }
  return ctx;
}
