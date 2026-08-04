"use client";

import * as React from "react";
import { CircleHelp } from "lucide-react";
import type { DriveStep, Driver } from "driver.js";
import { useLabWizard } from "../context";

const TOUR_STORAGE_KEY = "prn232-lab-workflow-tour-v1";

function moveToWizardStep(
  tour: Driver,
  goToStep: (step: number, direction: number) => void,
  step: number
) {
  goToStep(step, 1);
  window.setTimeout(() => tour.moveNext(), 250);
}

export function LabWorkflowTour() {
  const { goToStep } = useLabWizard();

  const startTour = React.useCallback(async () => {
    goToStep(1, -1);
    const { driver } = await import("driver.js");
    const steps: DriveStep[] = [
      {
        element: "[data-tour='lab-workflow-steps']",
        popover: {
          title: "Quy trình chấm Lab",
          description:
            "Hoàn thành lần lượt 4 bước: cấu hình Lab, import test case, tải và chấm bài, sau đó kiểm tra kết quả.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "[data-tour='lab-setup-form']",
        popover: {
          title: "1. Cấu hình session chấm",
          description:
            "Kiểm tra tên Lab, mô tả và học kỳ. Nhấn Save Changes nếu bạn chỉnh sửa thông tin.",
          side: "bottom",
          align: "start",
          onNextClick: () => moveToWizardStep(tour, goToStep, 2),
        },
      },
      {
        element: "[data-tour='testcase-import']",
        waitForElement: 1200,
        popover: {
          title: "2. Import test case",
          description:
            "Nhấn Import JSON, dán một mảng JSON test case từ rubric rồi xác nhận Import.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "[data-tour='testcase-approve']",
        popover: {
          title: "Duyệt test case",
          description:
            "Kiểm tra dữ liệu vừa import và nhấn Approve All. Phải có ít nhất một test case Approved mới có thể tiếp tục chấm.",
          side: "bottom",
          align: "end",
          onNextClick: () => moveToWizardStep(tour, goToStep, 3),
        },
      },
      {
        element: "[data-tour='submission-upload']",
        waitForElement: 1200,
        popover: {
          title: "3. Import bài chấm",
          description:
            "Nhấn Upload ZIP/RAR. Chọn Student files để tải nhiều file Lab(x)_StudentCode.zip, hoặc Bulk archive cho một file chứa nhiều bài.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "[data-tour='grade-all']",
        popover: {
          title: "Chạy chấm tự động",
          description:
            "Sau khi upload thành công, nhấn Grade All và chờ trạng thái chấm hoàn tất. Bạn cũng có thể Grade/Regrade từng sinh viên.",
          side: "bottom",
          align: "start",
          onNextClick: () => moveToWizardStep(tour, goToStep, 4),
        },
      },
      {
        element: "[data-tour='lab-results']",
        waitForElement: 1200,
        popover: {
          title: "4. Kiểm tra kết quả",
          description:
            "Chọn sinh viên ở cột trái để xem điểm từng test case. Hãy kiểm tra và điều chỉnh điểm trước khi đồng bộ.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "[data-tour='sync-supabase']",
        popover: {
          title: "Đồng bộ lên Supabase",
          description:
            "Nhấn Sync Supabase sau khi các bài đã chấm xong. Chỉ submission trạng thái hoàn tất mới được gửi đi.",
          side: "bottom",
          align: "end",
          onNextClick: () => {
            const button = document.querySelector<HTMLButtonElement>(
              "[data-tour='sync-supabase']"
            );
            button?.click();
            window.setTimeout(() => tour.moveNext(), 300);
          },
        },
      },
      {
        element: "[data-tour='sync-supabase-form']",
        waitForElement: 1500,
        popover: {
          title: "Chọn đích đồng bộ",
          description:
            "Chọn theo thứ tự Term → Class → Lab → Grading session rồi nhấn Start sync. Grading session phải được tạo và để trạng thái Open trên Supabase trước; màn hình này chỉ chọn session có sẵn.",
          side: "left",
          align: "center",
        },
      },
    ];

    const tour = driver({
      animate: false,
      allowClose: true,
      allowKeyboardControl: true,
      disableActiveInteraction: true,
      overlayColor: "#222222",
      overlayOpacity: 0.62,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "prn232-driver-popover",
      showProgress: true,
      progressText: "Bước {{current}} / {{total}}",
      nextBtnText: "Tiếp theo",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      skipMissingElement: true,
      steps,
      onDestroyed: () => {
        window.localStorage.setItem(TOUR_STORAGE_KEY, "seen");
      },
    });

    window.setTimeout(() => tour.drive(), 150);
  }, [goToStep]);

  React.useEffect(() => {
    if (window.localStorage.getItem(TOUR_STORAGE_KEY)) return;
    const timer = window.setTimeout(() => void startTour(), 700);
    return () => window.clearTimeout(timer);
  }, [startTour]);

  return (
    <button
      type="button"
      onClick={() => void startTour()}
      className="inline-flex items-center gap-2 rounded-full border border-[#f97316] bg-white px-3 py-2.5 text-sm font-semibold text-[#c2410c] transition-colors duration-200 hover:bg-[#fff7ed] md:px-4"
      aria-label="Mở hướng dẫn quy trình chấm Lab"
    >
      <CircleHelp className="size-5" aria-hidden />
      <span className="hidden lg:inline">Hướng dẫn quy trình</span>
    </button>
  );
}
