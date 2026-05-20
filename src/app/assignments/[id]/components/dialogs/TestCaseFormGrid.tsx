import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { TestCase } from "@/types";
import { TestCaseFormItem } from "../../types";

export function TestCaseFormGrid({
  item,
  type,
  onChange,
  onRemove,
  isRemovable
}: {
  item: TestCaseFormItem;
  type: number; // 0 or 1
  onChange: (field: keyof TestCaseFormItem, value: any) => void;
  onRemove: () => void;
  isRemovable: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 p-3 bg-[#fdfdfd] border border-[#ebebeb] rounded-lg relative group">
      {isRemovable && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-[#ebebeb] rounded-full flex items-center justify-center text-[#717171] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm z-10"
        >
          <Trash2 size={12} />
        </button>
      )}
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-12 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Order</label>
          <input type="number" value={item.order.toString()} onChange={(e) => onChange("order", e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]" />
        </div>
        <div className="col-span-12 md:col-span-3 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Tên TC <span className="text-[#f97316]">*</span></label>
          <input type="text" value={item.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Ví dụ: TC 1" className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316]" />
        </div>
        <div className="col-span-12 md:col-span-2 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Method</label>
          <Select value={item.httpMethod} onValueChange={(val: string) => onChange("httpMethod", val)}>
            <SelectTrigger className="w-full h-[34px] px-2 text-xs border-[#dddddd] rounded-lg font-semibold focus:ring-0 focus:ring-offset-0 focus:border-[#f97316]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET"><StatusBadge status="GET" variant="method-get" /></SelectItem>
              <SelectItem value="POST"><StatusBadge status="POST" variant="method-post" /></SelectItem>
              <SelectItem value="PUT"><StatusBadge status="PUT" variant="method-put" /></SelectItem>
              <SelectItem value="DELETE"><StatusBadge status="DELETE" variant="method-delete" /></SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">URL <span className="text-[#f97316]">*</span></label>
          <input type="text" value={item.urlTemplate} onChange={(e) => onChange("urlTemplate", e.target.value)} placeholder="/api/users" className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316]" />
        </div>
        <div className="col-span-12 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Status</label>
          <input type="number" value={item.expectedStatus.toString()} onChange={(e) => onChange("expectedStatus", e.target.value === "" ? 200 : Number(e.target.value))} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]" />
        </div>
        <div className="col-span-12 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Điểm</label>
          <input type="number" value={item.score.toString()} onChange={(e) => onChange("score", e.target.value === "" ? 1 : Number(e.target.value))} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]" />
        </div>
      </div>

      {type === 0 && (
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Body Input (JSON String)</label>
            <textarea value={item.input || ""} onChange={(e) => onChange("input", e.target.value)} rows={4} placeholder='{"key": "value"}' className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-[11px] font-mono text-[#222222] outline-none focus:border-[#f97316]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Expected Body (JSON String)</label>
            <textarea value={item.expectedBody || ""} onChange={(e) => onChange("expectedBody", e.target.value)} rows={4} placeholder='{"success": true}' className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-[11px] font-mono text-[#222222] outline-none focus:border-[#f97316]" />
          </div>
        </div>
      )}

      {type === 1 && (
        <div className="grid grid-cols-12 gap-3 mt-1">
          <div className="col-span-12 md:col-span-3 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Element ID</label>
            <input type="text" value={item.elementId || ""} onChange={(e) => onChange("elementId", e.target.value)} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316]" />
          </div>
          <div className="col-span-12 md:col-span-3 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Element Text</label>
            <input type="text" value={item.elementText || ""} onChange={(e) => onChange("elementText", e.target.value)} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316]" />
          </div>
          <div className="col-span-12 md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Selector</label>
            <input type="text" value={item.selector || ""} onChange={(e) => onChange("selector", e.target.value)} placeholder="table tbody tr" className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316]" />
          </div>
          <div className="col-span-12 md:col-span-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Min Count</label>
            <input type="number" value={item.selectorMinCount?.toString() ?? ""} onChange={(e) => onChange("selectorMinCount", e.target.value === "" ? undefined : Number(e.target.value))} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]" />
          </div>
          <div className="col-span-12 md:col-span-3 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Selector Text</label>
            <input type="text" value={item.selectorText || ""} onChange={(e) => onChange("selectorText", e.target.value)} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-xs text-[#222222] outline-none focus:border-[#f97316]" />
          </div>
          <div className="col-span-12 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Input (JSON/Text cho POST)</label>
            <textarea value={item.input || ""} onChange={(e) => onChange("input", e.target.value)} rows={3} className="w-full bg-white border border-[#dddddd] rounded-lg px-2 py-1.5 text-[11px] font-mono text-[#222222] outline-none focus:border-[#f97316]" />
          </div>
        </div>
      )}
    </div>
  );
}

