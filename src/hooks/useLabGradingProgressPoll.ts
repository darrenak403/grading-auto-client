"use client";

import * as React from "react";
import { api } from "@/lib";
import type { LabGradingProgressDto } from "@/types";

const DEFAULT_INTERVAL_MS = 2000;

export type LabProgressUpdateHandler = (progress: LabGradingProgressDto) => void;

export function useLabGradingProgressPoll(
  assignmentId: string,
  options?: { intervalMs?: number }
) {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const [progress, setProgress] = React.useState<LabGradingProgressDto | null>(
    null
  );
  const [isPolling, setIsPolling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const callbacksRef = React.useRef<Set<LabProgressUpdateHandler>>(new Set());
  const assignmentIdRef = React.useRef(assignmentId);
  const inFlightRef = React.useRef(false);

  assignmentIdRef.current = assignmentId;

  const notify = React.useCallback((data: LabGradingProgressDto) => {
    for (const cb of callbacksRef.current) {
      cb(data);
    }
  }, []);

  const refreshProgress = React.useCallback(async () => {
    const id = assignmentIdRef.current;
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    try {
      const res = await api.getLabGradingProgress(id);
      if (id !== assignmentIdRef.current) return null;
      if (res.status && res.data) {
        if (res.data.assignmentId !== assignmentIdRef.current) return null;
        setProgress(res.data);
        setError(null);
        notify(res.data);
        return res.data;
      }
      setError(res.message || "Failed to load grading progress");
      return null;
    } finally {
      inFlightRef.current = false;
    }
  }, [notify]);

  const stopPolling = React.useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = React.useCallback(() => {
    stopPolling();
    setIsPolling(true);

    void refreshProgress().then((data) => {
      if (!data?.isGradingActive) {
        setIsPolling(false);
        return;
      }

      pollRef.current = setInterval(() => {
        void refreshProgress().then((next) => {
          if (next && !next.isGradingActive) {
            stopPolling();
          }
        });
      }, intervalMs);
    });
  }, [intervalMs, refreshProgress, stopPolling]);

  const registerOnProgressUpdate = React.useCallback(
    (handler: LabProgressUpdateHandler) => {
      callbacksRef.current.add(handler);
      return () => {
        callbacksRef.current.delete(handler);
      };
    },
    []
  );

  React.useEffect(() => {
    setProgress(null);
    setError(null);
    void refreshProgress().then((data) => {
      if (data?.isGradingActive) {
        startPolling();
      }
    });
    return () => stopPolling();
  }, [assignmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    progress,
    isPolling,
    error,
    startPolling,
    stopPolling,
    refreshProgress,
    registerOnProgressUpdate,
  };
}
