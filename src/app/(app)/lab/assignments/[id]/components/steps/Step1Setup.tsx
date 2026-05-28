"use client";

import * as React from "react";
import { api } from "@/lib";
import type { LabAssignmentFormValues, SemesterDto } from "@/types";
import { Button, Input, Textarea, FormSelect } from "@/components/ui";
import { useLabWizard } from "../../context";

export function Step1Setup() {
  const { assignment, setAssignment, registerStepSave } = useLabWizard();
  const [semesters, setSemesters] = React.useState<SemesterDto[]>([]);
  const [form, setForm] = React.useState<LabAssignmentFormValues>({
    title: "",
    description: "",
    semesterId: null,
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    api.getSemesters().then((res) => {
      if (res.status && res.data) setSemesters(res.data);
    });
  }, []);

  React.useEffect(() => {
    if (!assignment) return;
    setForm({
      title: assignment.title,
      description: assignment.description,
      semesterId: assignment.semesterId,
    });
  }, [assignment]);

  const save = React.useCallback(async (): Promise<boolean> => {
    if (!assignment) return false;
    if (!form.title.trim()) {
      setError("Title is required");
      return false;
    }
    setSaving(true);
    setError(null);
    const res = await api.updateLabAssignment(assignment.id, {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      semesterId: form.semesterId || null,
    });
    setSaving(false);
    if (res.status && res.data) {
      setAssignment(res.data);
      return true;
    }
    setError(res.message || "Failed to save");
    return false;
  }, [assignment, form, setAssignment]);

  React.useEffect(() => {
    registerStepSave(1, save);
    return () => registerStepSave(1, null);
  }, [registerStepSave, save]);

  if (!assignment) return null;

  return (
    <div className="w-full rounded-2xl border border-[#ebebeb] bg-white p-8">
      {error && (
        <p className="mb-6 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]">
          {error}
        </p>
      )}

      {/* Grid 2 Cột Chuyên Nghiệp */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cột trái: Form nhập liệu (chiếm 2 phần) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="PRN232 - Lab 1"
          />
          <Textarea
            label="Description"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Optional instructions for students"
          />
          <FormSelect
            label="Semester"
            value={form.semesterId ?? ""}
            onValueChange={(v) => setForm({ ...form, semesterId: v || null })}
            placeholder="None"
            options={[
              { value: "", label: "None" },
              ...semesters.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>

        {/* Cột phải: Thẻ Status & Thống kê thông số (chiếm 1 phần) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#ebebeb] bg-[#fafafa] p-6 lg:h-fit shadow-xs">
          <div className="flex flex-col gap-4">
            <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-[#717171] border-b border-[#ebebeb] pb-3">
              Lab Status & Info
            </h3>
            
            <div className="flex items-center justify-between py-2 border-b border-[#ebebeb] last:border-0">
              <span className="text-sm font-semibold text-[#717171]">Status</span>
              <span className="inline-flex items-center rounded-full bg-[#f4f4f5] px-3 py-1 text-xs font-bold text-[#222222]">
                {assignment.status}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#ebebeb] last:border-0">
              <span className="text-sm font-semibold text-[#717171]">Test cases</span>
              <span className="text-lg font-extrabold text-[#222222]">
                {assignment.testCaseCount}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 last:border-0">
              <span className="text-sm font-semibold text-[#717171]">Submissions</span>
              <span className="text-lg font-extrabold text-[#222222]">
                {assignment.submissionCount}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#ebebeb]">
            <Button
              type="button"
              onClick={save}
              disabled={saving}
              fullWidth
              className="h-11 shadow-sm font-semibold text-base"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
