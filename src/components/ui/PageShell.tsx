"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-10 font-sans">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#717171]">
              {eyebrow}
            </p>
          )}
          <h1 className="m-0 text-4xl font-medium leading-tight text-[#222222]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#717171]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function PageError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[#dc2626]">
      {children}
    </div>
  );
}

export function TableSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#ebebeb] bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}
