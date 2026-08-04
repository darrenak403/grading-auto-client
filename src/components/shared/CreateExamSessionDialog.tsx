"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { api } from "@/lib";
import type { CreateExamSessionRequest } from "@/types";

interface CreateExamSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateExamSessionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateExamSessionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<CreateExamSessionRequest>({
    title: "",
    description: "",
  });

  // Reset form khi Dialog được mở
  React.useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
      });
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.createExamSession(formData);
      if (res.status && res.data) {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
        router.push(`/exam-sessions/${res.data.id}`);
      } else {
        setError(res.message || "Failed to create exam session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating exam session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!loading) onOpenChange(false);
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative w-full max-w-lg bg-white rounded-2xl border border-[#ebebeb] shadow-2xl overflow-hidden flex flex-col z-10 font-sans"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                if (!loading) onOpenChange(false);
              }}
              className="absolute top-5 right-5 text-[#717171] hover:text-[#222222] transition-colors p-2 rounded-full hover:bg-[#f4f4f5] cursor-pointer z-20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Close"
              disabled={loading}
            >
              <X size={18} className="stroke-[2]" />
            </button>

            {/* Modal Header */}
            <div className="px-6 pt-7 pb-5 md:px-8 border-b border-[#ebebeb] shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-[#f97316] rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5 justify-center">
                  <h2 className="text-xl font-bold text-[#222222] tracking-tight">
                    New Exam Session
                  </h2>
                  <p className="text-xs text-[#717171]">
                    Create a new session to organize assignments and grading.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-800 mb-6 animate-in fade-in slide-in-from-top-1 duration-200">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. PE PRN232 – Spring 2026"
                    className="w-full bg-white border border-[#ebebeb] text-[#222222] rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 placeholder:text-[#a1a1aa] hover:border-[#d4d4d8] font-medium"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the exam session..."
                    rows={4}
                    className="w-full bg-white border border-[#ebebeb] text-[#222222] rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 placeholder:text-[#a1a1aa] hover:border-[#d4d4d8] font-medium resize-none"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 mt-8 border-t border-[#ebebeb] pt-5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onOpenChange(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#717171] hover:text-[#222222] hover:bg-[#f4f4f5] rounded-xl transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed border border-[#ebebeb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#f97316] hover:bg-[#ea580c] shadow-sm shadow-orange-500/10 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none"
                >
                  {loading ? "Creating..." : "Create Exam Session"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
