import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { TestCaseFormItem } from "../../types";
import { TestCaseFormGrid } from "./TestCaseFormGrid";

export function TestCaseDialog({
  isOpen,
  onClose,
  onSave,
  initialItems,
  questionType,
  isSaving
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: TestCaseFormItem[]) => void;
  initialItems: TestCaseFormItem[];
  questionType: number;
  isSaving: boolean;
}) {
  const [activeTab, setActiveTab] = React.useState<"form" | "json">("form");
  const [items, setItems] = React.useState<TestCaseFormItem[]>([]);
  const [jsonInput, setJsonInput] = React.useState("");
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setItems(initialItems || []);
      setJsonInput(JSON.stringify(initialItems || [], null, 2));
      setJsonError(null);
      setActiveTab("form");
    }
  }, [isOpen, initialItems]);

  const handleTabChange = (tab: "form" | "json") => {
    if (tab === "json" && activeTab === "form") {
      const jsonFriendlyItems = items.map(item => {
        const newItem: any = { ...item };
        if (newItem.input && typeof newItem.input === "string") {
          try { newItem.input = JSON.parse(newItem.input); } catch { }
        }
        if (newItem.expectedBody && typeof newItem.expectedBody === "string") {
          try { newItem.expectedBody = JSON.parse(newItem.expectedBody); } catch { }
        }
        return newItem;
      });
      setJsonInput(JSON.stringify(jsonFriendlyItems, null, 2));
    } else if (tab === "form" && activeTab === "json") {
      try {
        const parsed = JSON.parse(jsonInput);
        if (Array.isArray(parsed)) {
          const formFriendlyItems = parsed.map(item => {
            const newItem = { ...item };
            if (newItem.input && typeof newItem.input !== "string") {
              newItem.input = JSON.stringify(newItem.input, null, 2);
            }
            if (newItem.expectedBody && typeof newItem.expectedBody !== "string") {
              newItem.expectedBody = JSON.stringify(newItem.expectedBody, null, 2);
            }
            if (!newItem.id) newItem.id = Date.now().toString() + Math.random().toString();
            return newItem;
          });
          setItems(formFriendlyItems);
          setJsonError(null);
        } else {
          setJsonError("JSON must be an array (Array).");
          return;
        }
      } catch (err) {
        setJsonError("JSON syntax error.");
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleSave = () => {
    if (activeTab === "json") {
      try {
        const parsed = JSON.parse(jsonInput);
        if (Array.isArray(parsed)) {
          onSave(parsed);
        } else {
          setJsonError("JSON must be an array (Array).");
        }
      } catch (err) {
        setJsonError("JSON syntax error.");
      }
    } else {
      onSave(items);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden z-10"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#ebebeb]">
              <h3 className="text-base font-bold text-[#222222]">Configure Test Cases</h3>
              <button onClick={onClose} className="text-[#717171] hover:text-[#222222] transition-colors"><X size={20} /></button>
            </div>

            <div className="p-4 border-b border-[#ebebeb] flex gap-2">
              <button
                onClick={() => handleTabChange("form")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "form" ? "bg-[#fff7ed] text-[#f97316]" : "text-[#717171] hover:bg-[#f7f7f7]"}`}
              >
                Form Input
              </button>
              <button
                onClick={() => handleTabChange("json")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "json" ? "bg-[#fff7ed] text-[#f97316]" : "text-[#717171] hover:bg-[#f7f7f7]"}`}
              >
                Raw JSON
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#fafafa]">
              {activeTab === "form" && (
                <div className="flex flex-col gap-4">
                  {items.map((tc, idx) => (
                    <TestCaseFormGrid
                      key={tc.id || idx.toString()}
                      item={tc}
                      type={questionType}
                      isRemovable={true}
                      onChange={(field, val) => {
                        const newItems = [...items];
                        newItems[idx] = { ...newItems[idx], [field]: val };
                        setItems(newItems);
                      }}
                      onRemove={() => {
                        setItems(items.filter((_, i) => i !== idx));
                      }}
                    />
                  ))}
                  <button
                    onClick={() => setItems([...items, { id: Date.now().toString(), name: "", httpMethod: "GET", urlTemplate: "", expectedStatus: 200, score: 1, order: items.length + 1 }])}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f97316] hover:text-[#ea580c] self-start"
                  >
                    <Plus size={14} /> Add Test Case
                  </button>
                </div>
              )}
              {activeTab === "json" && (
                <div className="flex flex-col gap-2 h-full min-h-[300px]">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#717171]">
                      {questionType === 0
                        ? 'Example: [{"name": "Get Items", "urlTemplate": "/api/items", "score": 2}]'
                        : 'Example: [{"name": "Check title", "value": "Home", "selector": "title"}]'}
                    </span>
                  </div>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      setJsonError(null);
                    }}
                    className="w-full flex-1 min-h-[300px] bg-white border border-[#dddddd] rounded-lg p-3 text-xs font-mono outline-none focus:border-[#f97316]"
                  />
                  {jsonError && <span className="text-[11px] text-red-500 font-semibold">{jsonError}</span>}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#ebebeb] flex justify-end gap-3 bg-white">
              <button onClick={onClose} className="px-5 py-2.5 text-xs font-semibold text-[#717171] hover:bg-[#f7f7f7] rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2">
                {isSaving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

