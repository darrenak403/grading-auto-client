"use client";

import * as React from "react";
import { api } from "@/lib";
import type {
  LabTestCaseDto,
  LabTestCaseFormValues,
  LabTestCaseStatus,
} from "@/types";
import {
  useConfirm,
  useToast,
  Button,
  FormSelect,
  Modal,
  ModalActions,
  Textarea,
  TableSkeleton,
} from "@/components/ui";
import { Table } from "@/components/ui/Table";
import { useLabWizard } from "../context";

const STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

interface TestCasesTabProps {
  assignmentId: string;
}

export function TestCasesTab({ assignmentId }: TestCasesTabProps) {
  const confirm = useConfirm();
  const { toast } = useToast();
  const { registerStepSave, reloadAssignment } = useLabWizard();
  const [cases, setCases] = React.useState<LabTestCaseDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importJson, setImportJson] = React.useState("");
  const [importError, setImportError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const validate = React.useCallback(async (): Promise<boolean> => {
    if (cases.length === 0) {
      setError(
        "Please add at least one test case before continuing. Use 'Import JSON' on this step."
      );
      return false;
    }
    const approvedCount = cases.filter((c) => c.status === "Approved").length;
    if (approvedCount === 0) {
      setError(
        "Please approve at least one test case before continuing (use 'Approve All' or update status per row)."
      );
      return false;
    }
    setError(null);
    return true;
  }, [cases]);

  React.useEffect(() => {
    registerStepSave(2, validate);
    return () => registerStepSave(2, null);
  }, [registerStepSave, validate]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await api.getLabTestCases(assignmentId);
    if (res.status && res.data) {
      setCases(res.data.sort((a, b) => a.order - b.order));
      setError(null);
    }
    setLoading(false);
  }, [assignmentId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(() => {
    const draft = cases.filter((c) => c.status === "Draft").length;
    const approved = cases.filter((c) => c.status === "Approved").length;
    const rejected = cases.filter((c) => c.status === "Rejected").length;
    return { draft, approved, rejected, total: cases.length };
  }, [cases]);

  const handleStatusChange = async (tcId: string, status: LabTestCaseStatus) => {
    const res = await api.patchLabTestCaseStatus(tcId, status);
    if (res.status && res.data) {
      setCases((prev) =>
        prev.map((c) => (c.id === tcId ? res.data! : c))
      );
    } else {
      toast(res.message || "Failed to update status", "error");
    }
  };

  const handleApproveAll = async () => {
    const res = await api.approveAllLabTestCases(assignmentId);
    if (res.status && res.data) {
      toast(res.data.message || `Approved ${res.data.approved} test case(s)`);
      await load();
    } else {
      toast(res.message || "Approve failed", "error");
    }
  };

  const handleDeleteAll = async () => {
    const ok = await confirm({
      title: "Delete all test cases",
      description: "This also removes related grading results.",
      confirmText: "Delete all",
      variant: "danger",
    });
    if (!ok) return;
    const res = await api.deleteAllLabTestCases(assignmentId);
    if (res.status) {
      toast(`Deleted ${res.data?.deleted ?? 0} test case(s)`);
      await load();
      void reloadAssignment();
    } else {
      toast(res.message || "Delete failed", "error");
    }
  };

  const handleDeleteOne = async (tcId: string) => {
    const ok = await confirm({
      title: "Delete test case",
      description: "Remove this test case?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    const res = await api.deleteLabTestCase(tcId);
    if (res.status) {
      setCases((prev) => prev.filter((c) => c.id !== tcId));
      void reloadAssignment();
    } else {
      toast(res.message || "Delete failed", "error");
    }
  };

  const handleImport = async () => {
    setImportError(null);
    let parsed: LabTestCaseFormValues[];
    try {
      parsed = JSON.parse(importJson) as LabTestCaseFormValues[];
    } catch (primaryError) {
      try {
        let cleanedJson = importJson.trim();
        cleanedJson = cleanedJson.replace(
          /"(inputJson|expectJson)"\s*:\s*"\s*(\{[\s\S]*?\})\s*"\s*(?=\s*,|\s*\})/g,
          '"$1": $2'
        );
        parsed = JSON.parse(cleanedJson) as LabTestCaseFormValues[];
      } catch (secondaryError) {
        setImportError(primaryError instanceof Error ? primaryError.message : "Invalid JSON");
        return;
      }
    }
    if (!Array.isArray(parsed)) {
      setImportError("JSON must be an array");
      return;
    }
    const res = await api.batchCreateLabTestCases(assignmentId, parsed);
    if (res.status) {
      toast(`Imported ${res.data?.length ?? 0} test case(s)`);
      setImportOpen(false);
      setImportJson("");
      await load();
      void reloadAssignment();
    } else {
      setImportError(
        res.errors?.length
          ? [res.message, ...res.errors].join("\n")
          : res.message || "Import failed"
      );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden flex-1">
      {error && (
        <div className="mb-6 rounded-xl bg-[#fef2f2] border border-[#fca5a5] px-4 py-3 text-sm text-[#dc2626] font-semibold flex items-center gap-2 shrink-0">
          <span>⚠️ {error}</span>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-sm text-[#717171]">
          Total {counts.total} · Approved {counts.approved} · Draft {counts.draft}{" "}
          · Rejected {counts.rejected}
        </span>
        <div className="flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          Import JSON
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleApproveAll}
          disabled={counts.draft === 0}
        >
          Approve All
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="!border-[#fecaca] !text-[#dc2626] hover:!bg-[#fef2f2]"
          onClick={handleDeleteAll}
        >
          Delete All
        </Button>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        {loading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : cases.length === 0 ? (
          <p className="text-sm text-[#717171]">
            No test cases yet. Import a JSON array from your rubric.
          </p>
        ) : (
          <Table
            columns={[
              { key: "order", header: "#", width: "40px", render: (c) => c.order },
              {
                key: "method",
                header: "Method",
                width: "90px",
                render: (c) => (
                  <code
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      c.httpMethod === "SOURCE"
                        ? "bg-[#ede9fe] text-[#6d28d9]"
                        : "bg-[#f4f4f5] text-[#222222]"
                    }`}
                  >
                    {c.httpMethod}
                  </code>
                ),
              },
              {
                key: "url",
                header: "URL / Rule",
                width: "35%",
                render: (c) => (
                  <span className="font-mono text-xs break-all whitespace-normal block">{c.urlTemplate}</span>
                ),
              },
              {
                key: "desc",
                header: "Description",
                width: "30%",
                render: (c) => (
                  <span className="text-xs break-words whitespace-normal block">{c.description || "—"}</span>
                ),
              },
              { key: "mode", header: "Match", width: "100px", render: (c) => c.matchMode },
              { key: "score", header: "Score", width: "70px", render: (c) => c.score },
              {
                key: "status",
                header: "Status",
                width: "140px",
                render: (c) => (
                  <FormSelect
                    value={c.status}
                    onValueChange={(v) =>
                      handleStatusChange(c.id, v as LabTestCaseStatus)
                    }
                    options={STATUS_OPTIONS}
                    className="w-full"
                    triggerClassName="h-9 text-xs"
                  />
                ),
              },
              {
                key: "actions",
                header: "",
                width: "80px",
                render: (c) => (
                  <button
                    type="button"
                    onClick={() => handleDeleteOne(c.id)}
                    className="cursor-pointer border-none bg-transparent text-sm font-medium text-[#dc2626] hover:underline"
                  >
                    Delete
                  </button>
                ),
              },
            ]}
            data={cases}
            keyExtractor={(c) => c.id}
            maxHeight="100%"
          />
        )}
      </div>

      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import test cases"
        description="Paste a JSON array of test case objects."
        maxWidth={640}
        footer={
          <ModalActions
            onCancel={() => setImportOpen(false)}
            onConfirm={handleImport}
            confirmLabel="Import"
          />
        }
      >
        <Textarea
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          rows={12}
          placeholder='[{"httpMethod":"GET","urlTemplate":"/api/products",...}]'
          className="font-mono text-xs"
        />
        {importError && (
          <pre className="mt-3 whitespace-pre-wrap text-xs text-[#dc2626]">
            {importError}
          </pre>
        )}
      </Modal>
    </div>
  );
}
