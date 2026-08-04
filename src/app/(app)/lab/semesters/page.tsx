"use client";

import * as React from "react";
import { api } from "@/lib";
import type { SemesterDto, SemesterFormValues } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";
import {
  TableSkeleton,
  PageError,
  PageShell,
  useConfirm,
  Button,
  Input,
  DatePicker,
  Modal,
  ModalActions,
} from "@/components/ui";

const emptyForm: SemesterFormValues = {
  name: "",
  code: "",
  startDate: null,
  endDate: null,
};

export default function LabSemestersPage() {
  const confirm = useConfirm();
  const [semesters, setSemesters] = React.useState<SemesterDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SemesterDto | null>(null);
  const [form, setForm] = React.useState<SemesterFormValues>(emptyForm);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getSemesters();
      if (res.status && res.data) {
        setSemesters(res.data);
        setError(null);
      } else {
        setError(res.message || "Failed to load semesters");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: SemesterDto) => {
    setEditing(s);
    setForm({
      name: s.name,
      code: s.code,
      startDate: s.startDate,
      endDate: s.endDate,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    setSaving(true);
    const body: SemesterFormValues = {
      name: form.name.trim(),
      code: form.code.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    const res = editing
      ? await api.updateSemester(editing.id, body)
      : await api.createSemester(body);
    setSaving(false);
    if (res.status && res.data) {
      setDialogOpen(false);
      await load();
    } else {
      setError(res.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete semester",
      description: "Are you sure you want to delete this semester?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    const res = await api.deleteSemester(id);
    if (res.status) await load();
    else setError(res.message || "Failed to delete");
  };

  const formatRange = (s: SemesterDto) => {
    if (!s.startDate && !s.endDate) return "—";
    return [s.startDate, s.endDate].filter(Boolean).join(" → ");
  };

  return (
    <PageShell
      eyebrow="Lab Grading / Semesters"
      title="Semesters"
      description="Organize lab assignments by semester and keep course periods easy to scan."
      actions={
        <Button type="button" onClick={openCreate}>
          + Add Semester
        </Button>
      }
    >

      {error && (
        <PageError>{error}</PageError>
      )}

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : semesters.length === 0 ? (
        <EmptyState
          title="No semesters yet"
          description="Create a semester before linking lab assignments."
          action={
            <Button type="button" onClick={openCreate}>
              + Add Semester
            </Button>
          }
        />
      ) : (
        <Table
          columns={[
            { key: "name", header: "Name", render: (s) => s.name },
            { key: "code", header: "Code", render: (s) => s.code },
            {
              key: "range",
              header: "Date range",
              render: (s) => formatRange(s),
            },
            {
              key: "count",
              header: "Labs",
              render: (s) => s.labAssignmentCount,
            },
            {
              key: "actions",
              header: "",
              render: (s) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(s)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!border-[#fecaca] !text-[#dc2626] hover:!bg-[#fef2f2]"
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={semesters}
          keyExtractor={(s) => s.id}
        />
      )}

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit semester" : "Add semester"}
        maxWidth={440}
        footer={
          <ModalActions
            onCancel={() => setDialogOpen(false)}
            onConfirm={handleSave}
            confirmLoading={saving}
            confirmDisabled={!form.name.trim() || !form.code.trim()}
          />
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Fall 2026"
          />
          <Input
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="FA26"
          />
          <DatePicker
            label="Start date"
            value={form.startDate}
            onChange={(v) => setForm({ ...form, startDate: v })}
            placeholder="Optional"
          />
          <DatePicker
            label="End date"
            value={form.endDate}
            onChange={(v) => setForm({ ...form, endDate: v })}
            placeholder="Optional"
          />
        </div>
      </Modal>
    </PageShell>
  );
}
