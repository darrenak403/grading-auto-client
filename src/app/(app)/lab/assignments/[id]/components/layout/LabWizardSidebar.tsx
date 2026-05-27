import { Check, GraduationCap } from "lucide-react";
import { useLabWizard } from "../../context";
import { LabWorkflowStatusBadge } from "./LabWorkflowStatusBadge";

export function LabWizardSidebar() {
  const { currentStep, setCurrentStep, setDirection, assignment } = useLabWizard();

  const steps = [
    { id: 1, label: "Lab Setup", desc: "Configure title and semester", done: !!assignment },
    { id: 2, label: "Test Cases", desc: "Import and approve test cases", done: !!(assignment && assignment.testCaseCount > 0) },
    { id: 3, label: "Upload & Grade", desc: "Upload submissions and grade", done: !!(assignment && assignment.submissionCount > 0) },
    { id: 4, label: "Review Results", desc: "Review and adjust scores", done: false },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-[#fcfcfc] border-r border-[#ebebeb] shrink-0 select-none h-full">
      {/* Logo ở góc trên cùng của Sidebar */}
      <div className="h-20 px-8 flex items-center gap-3 border-b border-[#ebebeb] shrink-0">
        <div className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-sm shadow-[#f97316]/20">
          <GraduationCap size={20} className="stroke-[2]" />
        </div>
        <span className="font-semibold text-[#222222] text-base tracking-tight">
          PRN232 Auto Grader
        </span>
      </div>

      <div className="px-8 pt-4 pb-2 shrink-0">
        <LabWorkflowStatusBadge className="inline-flex" />
      </div>

      {/* Stepper dọc tinh tế */}
      <div className="flex-1 flex flex-col justify-center px-8 overflow-y-auto">
        <div className="flex flex-col gap-14 relative">
          {/* Đường kẻ nối dọc các chấm tròn - CĂN GIỮA HOÀN HẢO */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-[#ebebeb] z-0" />

          {steps.map((step) => {
            const stepNum = step.id;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum || step.done;

            return (
              <div
                key={stepNum}
                onClick={() => {
                  // Chỉ cho phép nhảy bước trực tiếp nếu bước đó đã xong hoặc đã qua
                  const canNavigate =
                    isCompleted ||
                    stepNum <= currentStep ||
                    stepNum === 1 ||
                    (stepNum === 2 && assignment) ||
                    (stepNum === 3 && assignment && assignment.testCaseCount > 0) ||
                    (stepNum === 4 && assignment && assignment.submissionCount > 0);

                  if (canNavigate) {
                    setDirection(stepNum > currentStep ? 1 : -1);
                    setCurrentStep(stepNum);
                  }
                }}
                className="flex items-start gap-4 z-10 cursor-pointer group transition-all duration-200"
              >
                {/* Chỉ báo trạng thái hình tròn w-8 h-8 */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-sm shadow-[#f97316]/20 transition-all duration-300">
                      <Check size={16} className="stroke-[3]" />
                    </div>
                  ) : isActive ? (
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-[#f97316] flex items-center justify-center font-bold text-[#f97316] shadow-sm transition-all duration-300">
                      <span className="text-sm font-semibold">{stepNum}</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white border border-[#dddddd] flex items-center justify-center text-[#717171] text-sm font-medium transition-all duration-300">
                      {stepNum}
                    </div>
                  )}
                </div>

                {/* Nhãn chữ mô tả bước */}
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <span
                    className={`text-xs font-semibold transition-colors duration-200 ${
                      isActive
                        ? "text-[#f97316]"
                        : isCompleted
                        ? "text-[#222222]"
                        : "text-[#717171] group-hover:text-[#222222]"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`text-[10px] leading-snug transition-colors duration-200 ${
                      isActive ? "text-[#ea580c]/80 font-medium" : "text-[#717171]"
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
