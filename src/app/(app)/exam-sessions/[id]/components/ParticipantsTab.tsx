"use client";

import * as React from "react";
import type { Participant } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";

interface ParticipantsTabProps {
  participants: Participant[];
  participantsError: string | null;
}

export function ParticipantsTab({
  participants,
  participantsError,
}: ParticipantsTabProps) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#222222",
          marginBottom: "20px",
        }}
      >
        Participants ({participants.length})
      </h2>

      {participantsError && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626", marginBottom: "16px" }}>
          {participantsError}
        </div>
      )}

      {participants.length === 0 && !participantsError ? (
        <EmptyState
          title="No participants imported"
          description="Import participants via CSV from each assignment's setup page."
        />
      ) : (
        <Table
          columns={[
            { key: "studentCode", header: "Student Code" },
            { key: "username", header: "Username" },
            {
              key: "assignmentCode",
              header: "Mã đề",
              render: (p: Participant) => (
                <span
                  style={{
                    padding: "2px 8px",
                    backgroundColor: "#f4f4f5",
                    borderRadius: "12px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  {p.assignmentCode || "-"}
                </span>
              ),
            },
          ]}
          maxHeight={550}
          data={participants}
          keyExtractor={(p) => p.id}
          emptyMessage="No participants found"
        />
      )}
    </div>
  );
}
