import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useLabWizard } from "../../context";
import { LabWorkflowStatusBadge } from "./LabWorkflowStatusBadge";

export function LabWizardHeader() {
  const { assignment, currentStep } = useLabWizard();

  if (!assignment) return null;

  const stepMeta: Record<number, { title: string; desc: string }> = {
    1: {
      title: "Lab Setup",
      desc: "Configure title, description, and semester.",
    },
    2: {
      title: "Test Cases",
      desc: "Import rubric test cases and approve them before grading.",
    },
    3: {
      title: "Upload & Grade",
      desc: "Upload student ZIP files and run Grade All.",
    },
    4: {
      title: "Review Results",
      desc: "Review scores per submission and adjust individual test case points.",
    },
  };

  const { title: stepTitle, desc: stepDesc } = stepMeta[currentStep] || {
    title: "Lab Assignment Wizard",
    desc: "Configure lab assignment",
  };

  return (
    <header className="h-20 border-b border-[#ebebeb] px-10 flex items-center justify-between bg-white z-10 shrink-0">
      <div className="flex items-center gap-3 md:hidden">
        {/* Trên Mobile: Logo hiển thị ở Header */}
        <div className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-sm shadow-[#f97316]/20">
          <GraduationCap size={20} className="stroke-[2]" />
        </div>
        <span className="font-semibold text-[#222222] text-base tracking-tight">
          PRN232 Auto Grader
        </span>
      </div>

      {/* Tiêu đề & mô tả động của Step hiện tại hiển thị cực kỳ sang trọng */}
      <div className="hidden md:flex flex-col gap-1 justify-center">
        <h1 className="m-0 text-base font-extrabold text-[#222222] tracking-tight leading-none">
          {stepTitle}
        </h1>
        <p className="m-0 text-[11px] text-[#717171] font-medium leading-none">
          {stepDesc}
        </p>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <LabWorkflowStatusBadge />
        {/* Badge ngữ cảnh hiển thị mã/tên bài tập */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#fff7ed] border border-[#ffedd5] rounded-full text-xs font-semibold text-[#ea580c]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
          <span>Configuring: {assignment.title}</span>
        </div>

        <Link
          href="/lab/assignments"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#dddddd] rounded-full text-sm font-semibold text-[#222222] bg-white hover:border-[#f97316] hover:bg-[#fff7ed] hover:text-[#ea580c] transition-all cursor-pointer active:scale-95"
        >
          <span>Save and Exit</span>
        </Link>
      </div>
    </header>
  );
}
