"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Button } from "./Button";

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    variant: "danger" | "primary" | "warning";
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        title: options.title || "Confirm Action",
        description: options.description,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
        resolve,
      });
    });
  };

  const handleClose = () => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  };

  const handleConfirm = () => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && state.isOpen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={handleClose}
        >
          <div 
            className="w-full max-w-[400px] bg-white border border-[#ebebeb] p-6 shadow-xl animate-in fade-in zoom-in duration-200"
            style={{ borderRadius: "6px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#222222] mb-2">
              {state.title}
            </h3>
            <p className="text-sm text-[#717171] leading-relaxed mb-6">
              {state.description}
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="light" 
                onClick={handleClose}
                className="rounded-[6px] py-[6px] px-4 font-semibold text-sm h-9 cursor-pointer"
              >
                {state.cancelText}
              </Button>
              <Button 
                variant={state.variant === "danger" ? "primary" : "dark"}
                onClick={handleConfirm}
                className="rounded-[6px] py-[6px] px-4 font-semibold text-sm h-9 cursor-pointer"
                style={
                  state.variant === "danger" 
                    ? { backgroundColor: "#dc2626", borderColor: "#dc2626" } 
                    : {}
                }
              >
                {state.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}
