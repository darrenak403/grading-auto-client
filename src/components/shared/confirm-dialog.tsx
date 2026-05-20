"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCancel?: boolean;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading,
  open,
  onOpenChange,
  showCancel = true,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <>
      {trigger && (
        <span onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isLoading) setIsOpen(false);
              }}
              className="absolute inset-0 bg-black/40"
            />

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-[#ebebeb] flex flex-col gap-4 z-10"
            >
              {/* Header */}
              <div className="flex gap-3">
                <div className={cn(
                   "p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0",
                   variant === "destructive" ? "bg-red-50 text-red-500" : "bg-orange-50 text-[#f97316]"
                )}>
                  {variant === "destructive" ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 justify-center">
                  <h3 className="text-base font-bold text-[#201515] leading-none">
                    {title}
                  </h3>
                  <p className="text-sm text-[#717171] leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 mt-2">
                {showCancel && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-[#717171] hover:text-[#201515] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed border border-[#ebebeb]"
                  >
                    {cancelLabel}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirm}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all cursor-pointer select-none active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
                    variant === "destructive"
                      ? "bg-red-600 hover:bg-red-700 shadow-red-500/10"
                      : "bg-[#f97316] hover:bg-[#ea580c] shadow-orange-500/10"
                  )}
                >
                  {isLoading ? "Processing..." : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
