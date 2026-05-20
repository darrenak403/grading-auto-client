import * as React from 'react';
import Link from 'next/link';
import { useAssignmentWizard } from '../../context';

import { api } from '@/lib/api';

export function WizardFooter() {
  const { 
    assignmentId,
    currentStep, setDirection, setCurrentStep, savingSetup, hasParticipants, hasResources, 
    sqlFile, givenZipFile, givenApiBaseUrl, assignment,
    setAssignment, setSqlFile, setGivenZipFile, openConfirm, setSavingSetup, setSetupMessage
  } = useAssignmentWizard();

  if (!assignment) return null;

  return <footer className="h-20 border-t border-[#ebebeb] px-10 flex items-center justify-between bg-white relative z-10 shrink-0 select-none">
          {/* Segmented Progress Bar màu cam thương hiệu */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ebebeb] flex">
            {Array.from({ length: 5 }).map((_, idx) => {
              const stepNum = idx + 1;
              const isCompletedOrActive = currentStep >= stepNum;
              return (
                <div
                  key={idx}
                  className={`h-full flex-1 transition-all duration-300 ease-out border-r border-white last:border-r-0 ${isCompletedOrActive ? "bg-[#f97316]" : "bg-[#ebebeb]"
                    }`}
                />
              );
            })}
          </div>

          <div>
            {currentStep > 1 ? (
              <button
                onClick={() => {
                  setDirection(-1);
                  setCurrentStep(currentStep - 1);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#717171] hover:text-[#f97316] hover:bg-[#fff7ed] transition-all cursor-pointer active:scale-95 underline animate-none"
              >
                <span>Quay lại</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-5">
            <span className="text-xs text-[#717171] font-semibold">
              Bước {currentStep} trên 5
            </span>
            {currentStep < 5 ? (
              <button
                disabled={savingSetup}
                onClick={async () => {
                  if (currentStep === 1) {
                    if (!hasParticipants) {
                      openConfirm({
                        title: "Thiếu danh sách sinh viên",
                        description: "Vui lòng tải lên danh sách sinh viên ở Step 1 trước khi tiếp tục!",
                        confirmLabel: "Đồng ý",
                        showCancel: false,
                        onConfirm: () => { },
                      });
                      return;
                    }
                  } else if (currentStep === 2) {
                    const hasNewInputs = !!(sqlFile || givenZipFile || givenApiBaseUrl.trim());
                    if (!hasResources && !hasNewInputs) {
                      openConfirm({
                        title: "Thiếu tài nguyên đề thi",
                        description: "Vui lòng đính kèm ít nhất một tài nguyên đề thi (SQL, ZIP hoặc API Base URL) trước khi tiếp tục!",
                        confirmLabel: "Đồng ý",
                        showCancel: false,
                        onConfirm: () => { },
                      });
                      return;
                    }

                    if (hasNewInputs) {
                      try {
                        setSavingSetup(true);
                        setSetupMessage(null);
                        const res = await api.uploadAssignmentResources(
                          assignmentId,
                          sqlFile,
                          givenApiBaseUrl || undefined,
                          givenZipFile
                        );
                        if (res.status && res.data) {
                          setAssignment(res.data);
                          setSqlFile(null);
                          setGivenZipFile(null);
                        } else {
                          openConfirm({
                            title: "Lưu tài nguyên thất bại",
                            description: res.message || "Lưu tài nguyên thất bại. Vui lòng thử lại!",
                            confirmLabel: "Đồng ý",
                            showCancel: false,
                            onConfirm: () => { },
                          });
                          return;
                        }
                      } catch {
                        openConfirm({
                          title: "Lỗi hệ thống",
                          description: "Lỗi hệ thống khi lưu tài nguyên. Vui lòng kiểm tra lại!",
                          confirmLabel: "Đồng ý",
                          showCancel: false,
                          onConfirm: () => { },
                        });
                        return;
                      } finally {
                        setSavingSetup(false);
                      }
                    }
                  }

                  setDirection(1);
                  setCurrentStep(currentStep + 1);
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#f97316] rounded-lg text-sm font-semibold text-white hover:bg-[#ea580c] transition-all cursor-pointer active:scale-95 shadow-sm shadow-orange-500/15 disabled:bg-[#f7f7f7] disabled:text-[#b0b0b0] disabled:cursor-not-allowed"
              >
                <span>{currentStep === 2 && savingSetup ? "Đang lưu..." : "Tiếp tục"}</span>
              </button>
            ) : (
              <Link
                href={assignment.examSessionId ? `/exam-sessions/${assignment.examSessionId}` : "/exam-sessions"}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#f97316] rounded-lg text-sm font-semibold text-white hover:bg-[#ea580c] transition-all cursor-pointer active:scale-95 shadow-sm shadow-orange-500/15"
              >
                <span>Hoàn tất & Thoát</span>
              </Link>
            )}
          </div>
        </footer>;
}