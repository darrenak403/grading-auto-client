"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib";
import type {
  LabAssignmentDto,
  LabAssignmentFormValues,
  SemesterDto,
} from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useConfirm,
  Button,
  PageError,
  PageShell,
  Input,
  Textarea,
  FormSelect,
  Modal,
  ModalActions,
} from "@/components/ui";

const MotionLink = motion(Link);

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#ebebeb] bg-white p-6">
      <div className="mb-3 h-4 w-24 rounded bg-[#f4f4f5]" />
      <div className="mb-2 h-6 w-3/4 rounded bg-[#f4f4f5]" />
      <div className="mb-6 h-4 w-full rounded bg-[#f4f4f5]" />
      <div className="flex gap-3">
        <div className="h-4 w-16 rounded bg-[#f4f4f5]" />
        <div className="h-4 w-16 rounded bg-[#f4f4f5]" />
      </div>
    </div>
  );
}

export default function LabAssignmentsPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const [assignments, setAssignments] = React.useState<LabAssignmentDto[]>([]);
  const [semesters, setSemesters] = React.useState<SemesterDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<LabAssignmentFormValues>({
    title: "",
    description: "",
    semesterId: null,
  });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const [aRes, sRes] = await Promise.all([
        api.getLabAssignments(),
        api.getSemesters(),
      ]);
      if (aRes.status && aRes.data) {
        setAssignments(aRes.data);
        setError(null);
      } else {
        setError(aRes.message || "Failed to load lab assignments");
      }
      if (sRes.status && sRes.data) setSemesters(sRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = assignments.filter((a) => {
    if (semesterFilter !== "all" && a.semesterId !== semesterFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const res = await api.createLabAssignment({
      title: form.title.trim(),
      description: form.description?.trim() || null,
      semesterId: form.semesterId || null,
    });
    setSaving(false);
    if (res.status && res.data) {
      setDialogOpen(false);
      setForm({ title: "", description: "", semesterId: null });
      router.push(`/lab/assignments/${res.data.id}`);
      return;
    }
    setError(res.message || "Failed to create lab assignment");
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete lab assignment",
      description:
        "This removes the lab and related test cases and submissions.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    const res = await api.deleteLabAssignment(id);
    if (res.status) await load();
    else setError(res.message || "Failed to delete");
  };

  const semesterOptions = [
    { value: "all", label: "All semesters" },
    ...semesters.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
  ];

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "Active", label: "Active" },
    { value: "Archived", label: "Archived" },
  ];

  return (
    <PageShell
      eyebrow="Lab Grading / Assignments"
      title="Lab Assignments"
      description="Create, filter, and manage lab grading workflows."
      actions={
        <Button type="button" onClick={() => setDialogOpen(true)}>
          + New Lab Assignment
        </Button>
      }
    >

      <div className="mb-6 flex flex-wrap gap-3">
        <FormSelect
          value={semesterFilter}
          onValueChange={setSemesterFilter}
          options={semesterOptions}
          className="w-[220px]"
          triggerClassName="h-10"
        />
        <FormSelect
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={statusOptions}
          className="w-[180px]"
          triggerClassName="h-10"
        />
      </div>

      {error && (
        <PageError>{error}</PageError>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No lab assignments yet"
          description="Create a lab to import test cases and grade submissions."
          action={
            <Button type="button" onClick={() => setDialogOpen(true)}>
              + New Lab Assignment
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, index) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="flex flex-col rounded-2xl border border-[#ebebeb] bg-white p-6 transition-all hover:border-[#f97316]/40 hover:shadow-xs"
            >
              {/* Dòng trên cùng: Badge Học kỳ bên trái và nút Delete bên phải */}
              <div className="mb-4 flex items-center justify-between">
                {a.semesterName ? (
                  <span className="rounded-xl bg-[#f4f4f5] px-2.5 py-0.5 text-xs font-semibold text-[#717171]">
                    {a.semesterName}
                  </span>
                ) : (
                  <span className="rounded-xl bg-[#f4f4f5] px-2.5 py-0.5 text-xs font-semibold text-[#717171]">
                    No Semester
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="cursor-pointer rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-[#717171] transition-colors hover:border-[#fecaca] hover:bg-[#fef2f2] hover:text-[#dc2626]"
                >
                  Delete
                </button>
              </div>

              {/* Phần giữa: Tiêu đề lớn, Mô tả và Thống kê */}
              <div className="mb-5">
                <h2 className="m-0 text-xl font-bold text-[#222222] truncate">
                  {a.title}
                </h2>
                {a.description ? (
                  <p className="mt-1 text-sm text-[#717171] line-clamp-2">
                    {a.description}
                  </p>
                ) : (
                  <p className="mt-1 text-sm italic text-[#a1a1aa]">
                    No description
                  </p>
                )}
                
                {/* Thông tin thống kê bổ sung cho Lab */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#a1a1aa]">
                  <span>{a.testCaseCount} test cases</span>
                  <span>·</span>
                  <span>{a.submissionCount} submissions</span>
                  <span>·</span>
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#ea580c]">
                    {a.status}
                  </span>
                </div>
              </div>

              {/* Phần dưới: Nút Manage đồng bộ rounded-xl (12px) */}
              <div className="mt-auto pt-2">
                <MotionLink
                  href={`/lab/assignments/${a.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-xl bg-[#f97316] px-5 py-2 text-xs font-bold text-white no-underline hover:bg-[#ea580c]"
                >
                  Manage
                </MotionLink>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New lab assignment"
        maxWidth={480}
        footer={
          <ModalActions
            onCancel={() => setDialogOpen(false)}
            onConfirm={handleCreate}
            confirmLabel="Create & open"
            confirmLoading={saving}
            confirmDisabled={!form.title.trim()}
          />
        }
      >
        {semesters.length === 0 && (
          <p className="mb-4 text-sm text-[#717171]">
            No semesters yet — you can create a lab without one, or{" "}
            <Link href="/lab/semesters" className="font-medium text-[#f97316]">
              create a semester first
            </Link>
            .
          </p>
        )}
        <div className="flex flex-col gap-4">
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
            rows={3}
          />
          <FormSelect
            label="Semester"
            value={form.semesterId ?? ""}
            onValueChange={(v) =>
              setForm({ ...form, semesterId: v || null })
            }
            placeholder="None"
            options={[
              { value: "", label: "None" },
              ...semesters.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>
      </Modal>
    </PageShell>
  );
}
