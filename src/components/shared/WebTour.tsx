"use client";

import * as React from "react";
import { CircleHelp } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Config, DriveStep } from "driver.js";

const TOUR_STORAGE_KEY = "prn232-web-tour-v1";

function getTourSteps(isDesktop: boolean, pathname: string): DriveStep[] {
  if (pathname === "/lab/assignments") {
    return [
      {
        popover: {
          title: "Bắt đầu quy trình chấm Lab",
          description:
            "Trước tiên hãy tạo một Lab Assignment. Đây là workspace dùng để import test case, bài nộp và lưu kết quả chấm.",
        },
      },
      {
        element: "[data-tour='create-lab-assignment']",
        popover: {
          title: "Tạo session chấm",
          description:
            "Nhấn + New Lab Assignment để mở biểu mẫu tạo session chấm mới.",
          side: "bottom",
          align: "end",
        },
        disableActiveInteraction: false,
        advanceOnClick: true,
      },
      {
        element: "[data-tour='create-lab-form']",
        waitForElement: 3000,
        skipMissingElement: true,
        popover: {
          title: "Nhập thông tin Lab",
          description:
            "Nhập tên, mô tả, chọn học kỳ rồi nhấn Create & open. Sau khi tạo, tour quy trình chi tiết sẽ hướng dẫn các bước tiếp theo.",
          side: "left",
          align: "center",
        },
      },
    ];
  }

  const navigationSelector = isDesktop
    ? "[data-tour='desktop-navigation']"
    : "[data-tour='mobile-navigation']";

  return [
    {
      popover: {
        title: "Chào mừng đến PRN232 Auto Grader",
        description:
          "Tour ngắn này sẽ giới thiệu các khu vực chính để bạn bắt đầu chấm bài nhanh hơn.",
      },
    },
    {
      element: navigationSelector,
      popover: {
        title: isDesktop ? "Thanh điều hướng" : "Menu điều hướng",
        description: isDesktop
          ? "Truy cập Dashboard và các quy trình chấm PE Exam hoặc Lab từ thanh bên này."
          : "Nhấn nút menu để truy cập Dashboard và các quy trình chấm bài.",
        side: isDesktop ? "right" : "bottom",
        align: "start",
      },
    },
    {
      element: "[data-tour='grading-workspace']",
      popover: {
        title: "Không gian làm việc",
        description:
          "Nội dung của từng bước — thiết lập, tải bài, xem kết quả và xuất điểm — sẽ hiển thị tại đây.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "[data-tour='help-button']",
      popover: {
        title: "Mở lại hướng dẫn",
        description:
          "Bạn có thể nhấn nút Hướng dẫn bất kỳ lúc nào để xem lại tour này.",
        side: "top",
        align: "end",
      },
    },
  ];
}

async function createTour(pathname: string) {
  const { driver } = await import("driver.js");

  const config: Config = {
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
    steps: getTourSteps(
      window.matchMedia("(min-width: 768px)").matches,
      pathname
    ),
    onDestroyed: () => {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "seen");
    },
  };

  return driver(config);
}

export function WebTour() {
  const pathname = usePathname();
  const isLabWorkflow = /^\/lab\/assignments\/[^/]+$/.test(pathname);
  const startTour = React.useCallback(async () => {
    const tour = await createTour(pathname);
    tour.drive();
  }, [pathname]);

  React.useEffect(() => {
    if (isLabWorkflow || window.localStorage.getItem(TOUR_STORAGE_KEY)) return;

    const timer = window.setTimeout(() => {
      void startTour();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [isLabWorkflow, startTour]);

  if (isLabWorkflow) return null;

  return (
    <button
      type="button"
      onClick={() => void startTour()}
      data-tour="help-button"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 inline-flex items-center gap-2 rounded-xl border border-[#f97316] bg-white px-3 py-2.5 text-sm font-semibold text-[#c2410c] shadow-md transition-colors duration-200 hover:bg-[#fff7ed] sm:right-6 sm:px-4"
      aria-label="Mở hướng dẫn sử dụng"
    >
      <CircleHelp className="size-5" aria-hidden />
      <span>Hướng dẫn</span>
    </button>
  );
}
