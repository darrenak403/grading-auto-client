"use client";

import * as React from "react";
import { api } from "@/lib";
import type { LabAssignmentDto, LabAssignmentFormValues, SemesterDto } from "@/types";
import { Button, Input, Textarea, FormSelect } from "@/components/ui";

interface SetupTabProps {
  assignment: LabAssignmentDto;
  onUpdated: (a: LabAssignmentDto) => void;
}

export function SetupTab({ assignment, onUpdated }: SetupTabProps) {
  const [editing, setEditing] = React.useState(false);
  const [semesters, setSemesters] = React.useState<SemesterDto[]>([]);
  const [form, setForm] = React.useState<LabAssignmentFormValues>({
    title: assignment.title,
    description: assignment.description,
    semesterId: assignment.semesterId,
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    api.getSemesters().then((res) => {
      if (res.status && res.data) setSemesters(res.data);
    });
  }, []);

  React.useEffect(() => {
    setForm({
      title: assignment.title,
      description: assignment.description,
      semesterId: assignment.semesterId,
    });
  }, [assignment]);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.updateLabAssignment(assignment.id, {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      semesterId: form.semesterId || null,
    });
    setSaving(false);
    if (res.status && res.data) {
      onUpdated(res.data);
      setEditing(false);
      setError(null);
    } else {
      setError(res.message || "Failed to save");
    }
  };

  if (!editing) {
    return (
      <div className="rounded-2xl border border-[#ebebeb] bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-xl font-semibold text-[#222222]">Lab details</h2>
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-[140px_1fr] gap-3 text-sm">
          <dt className="font-medium text-[#717171]">Title</dt>
          <dd className="text-[#222222]">{assignment.title}</dd>
          <dt className="font-medium text-[#717171]">Description</dt>
          <dd className="text-[#222222]">{assignment.description || "—"}</dd>
          <dt className="font-medium text-[#717171]">Semester</dt>
          <dd className="text-[#222222]">{assignment.semesterName || "—"}</dd>
          <dt className="font-medium text-[#717171]">Status</dt>
          <dd className="text-[#222222]">{assignment.status}</dd>
          <dt className="font-medium text-[#717171]">Test cases</dt>
          <dd className="text-[#222222]">{assignment.testCaseCount}</dd>
          <dt className="font-medium text-[#717171]">Submissions</dt>
          <dd className="text-[#222222]">{assignment.submissionCount}</dd>
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-[#222222]">Edit lab</h2>
      {error && (
        <p className="mb-3 text-sm text-[#dc2626]">{error}</p>
      )}
      <div className="flex max-w-lg flex-col gap-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          label="Description"
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />
        <FormSelect
          label="Semester"
          value={form.semesterId ?? ""}
          onValueChange={(v) => setForm({ ...form, semesterId: v || null })}
          options={[
            { value: "", label: "None" },
            ...semesters.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </div>
      <div className="mt-5 flex gap-2">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="light"
          onClick={() => {
            setEditing(false);
            setForm({
              title: assignment.title,
              description: assignment.description,
              semesterId: assignment.semesterId,
            });
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
