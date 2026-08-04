"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Radix Select disallows empty string item values — map "" through this sentinel. */
const EMPTY_OPTION_VALUE = "__form_select_empty__";

function toItemValue(value: string): string {
  return value === "" ? EMPTY_OPTION_VALUE : value;
}

function fromItemValue(value: string): string {
  return value === EMPTY_OPTION_VALUE ? "" : value;
}

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  triggerClassName,
  id,
}: FormSelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-semibold text-[#222222]"
        >
          {label}
        </label>
      )}
      <Select
        value={toItemValue(value)}
        onValueChange={(v) => onValueChange(fromItemValue(v))}
        disabled={disabled}
      >
        <SelectTrigger
          id={selectId}
          className={cn(
            "h-11 w-full rounded-xl border-[#d4d4d8] bg-white px-3.5 text-sm font-medium text-[#222222] shadow-sm transition-all duration-200",
            "hover:border-[#a1a1aa] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15",
            "data-[placeholder]:text-[#a1a1aa]",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-[#ebebeb] shadow-lg">
          {options.map((opt) => {
            const itemValue = toItemValue(opt.value);
            return (
              <SelectItem
                key={itemValue}
                value={itemValue}
                disabled={opt.disabled}
                className="rounded-lg"
              >
                {opt.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
