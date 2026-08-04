"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseYmd(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string | null | undefined): string {
  const date = parseYmd(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export interface DatePickerProps {
  label?: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  clearable = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selected = parseYmd(value);
  const [view, setView] = React.useState(() => selected ?? new Date());

  React.useEffect(() => {
    if (selected) setView(selected);
  }, [value]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const days = buildCalendarDays(year, month);
  const todayYmd = toYmd(new Date());

  const pick = (date: Date) => {
    onChange(toYmd(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-[#222222]">
          {label}
        </span>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-xl border border-[#ebebeb] bg-white px-3.5 text-left text-sm font-medium shadow-sm transition-colors",
          "hover:border-[#d4d4d8] focus-visible:outline-none focus-visible:border-[#f97316] focus-visible:ring-2 focus-visible:ring-[#f97316]/15",
          disabled && "cursor-not-allowed opacity-50",
          !value && "text-[#a1a1aa]"
        )}
      >
        <Calendar className="h-4 w-4 shrink-0 text-[#f97316]" aria-hidden />
        <span className="flex-1 truncate">
          {value ? formatDisplay(value) : placeholder}
        </span>
        {clearable && value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange(null);
              }
            }}
            className="rounded-md p-0.5 text-[#717171] hover:bg-[#f4f4f5] hover:text-[#222222]"
            aria-label="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+6px)] z-[100] w-[280px] rounded-2xl border border-[#ebebeb] bg-white p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setView(new Date(year, month - 1, 1))}
                className="rounded-lg p-1.5 text-[#717171] hover:bg-[#f4f4f5] hover:text-[#222222]"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-[#222222]">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="rounded-lg p-1.5 text-[#717171] hover:bg-[#f4f4f5] hover:text-[#222222]"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#a1a1aa]"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="h-9" />;
                }
                const ymd = toYmd(date);
                const isSelected = value === ymd;
                const isToday = ymd === todayYmd;
                return (
                  <button
                    key={ymd}
                    type="button"
                    onClick={() => pick(date)}
                    className={cn(
                      "h-9 rounded-lg text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-[#f97316] text-white shadow-sm"
                        : "text-[#222222] hover:bg-[#fef2e8] hover:text-[#ea580c]",
                      isToday && !isSelected && "ring-1 ring-[#f97316]/40"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => pick(new Date())}
              className="mt-3 w-full rounded-lg py-1.5 text-xs font-semibold text-[#f97316] hover:bg-[#fef2e8]"
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
