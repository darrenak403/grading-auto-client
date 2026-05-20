import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestCase } from "@/types";

export function TestCaseDetailDialog({
  isOpen,
  onClose,
  tc,
  qType
}: {
  isOpen: boolean;
  onClose: () => void;
  tc: TestCase | null;
  qType: number;
}) {
  if (!tc) return null;
  
  const formatJson = (val: any) => {
    if (!val) return "None";
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch {
      return String(val);
    }
  };

  const method = tc.httpMethod?.toUpperCase() || "GET";
  let methodBadgeColor = "bg-[#61affe] text-white border-[#61affe]";
  if (method === "POST") methodBadgeColor = "bg-[#49cc90] text-white border-[#49cc90]";
  if (method === "PUT") methodBadgeColor = "bg-[#fca130] text-white border-[#fca130]";
  if (method === "DELETE") methodBadgeColor = "bg-[#f93e3e] text-white border-[#f93e3e]";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden z-10"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#ebebeb]">
              <h3 className="text-base font-bold text-[#222222]">Test Case Detail: {tc.name}</h3>
              <button onClick={onClose} className="text-[#717171] hover:text-[#222222] transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-auto p-5 flex flex-col gap-5 bg-[#fafafa]">
              <div className="bg-white border border-[#ebebeb] p-4 rounded-xl shadow-sm flex flex-col gap-4">
                {qType === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Method</span>
                      <span className={cn("px-2 py-0.5 border rounded text-[10px] font-bold inline-block", methodBadgeColor)}>
                        {method}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">URL Template</span>
                      <span className="text-sm font-medium text-[#222222] break-all">{tc.urlTemplate || "None"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Expected Status</span>
                      <span className="text-sm font-medium text-[#222222]">{tc.expectedStatus || 200}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Score weight</span>
                      <span className="text-sm font-medium text-[#222222]">{tc.score} pts</span>
                    </div>
                  </div>
                )}
                
                {qType === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Selector</span>
                      <span className="text-sm font-medium text-[#222222] break-all">{tc.selector || "None"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Value</span>
                      <span className="text-sm font-medium text-[#222222]">{tc.value || "None"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Element ID</span>
                      <span className="text-sm font-medium text-[#222222]">{tc.elementId || "None"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Element Text</span>
                      <span className="text-sm font-medium text-[#222222]">{tc.elementText || "None"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Score weight</span>
                      <span className="text-sm font-medium text-[#222222]">{tc.score} pts</span>
                    </div>
                  </div>
                )}
              </div>
              
              {qType === 0 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Body Input</span>
                    <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl text-xs font-mono overflow-auto max-h-[200px] border border-[#333]">
                      {formatJson(tc.input)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block mb-1">Expected Body</span>
                    <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl text-xs font-mono overflow-auto max-h-[200px] border border-[#333]">
                      {formatJson(tc.expectedBody)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#ebebeb] flex justify-end bg-white">
              <button onClick={onClose} className="px-5 py-2.5 text-xs font-semibold bg-[#f5f5f5] text-[#222222] hover:bg-[#ebebeb] rounded-lg transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

