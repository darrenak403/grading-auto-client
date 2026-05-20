"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Download,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion(Link);

// Ánh xạ icon tương ứng với từng href để hiển thị trực quan
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/exam-sessions": BookOpen,
  "/submissions": UploadCloud,
  "/exports": Download,
};

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navItems = siteConfig.navItems;

  const renderNavLinks = () => {
    return navItems.map((item) => {
      const IconComponent = iconMap[item.href] || LayoutDashboard;
      // Trạng thái active: nếu pathname trùng khớp hoàn toàn hoặc bắt đầu bằng item.href (ngoại trừ trường hợp dashboard)
      const isActive =
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

      return (
        <MotionLink
          key={item.href}
          href={item.href}
          onClick={closeSidebar}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 cursor-pointer ${isActive
              ? "bg-[#fef2e8] text-[#f97316] pl-3"
              : "text-[#717171] hover:bg-[#f4f4f5] hover:text-[#222222]"
            }`}
        >
          <IconComponent
            className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-[#f97316]" : "text-[#717171] group-hover:text-[#222222]"
              }`}
          />
          <span>{item.label}</span>
        </MotionLink>
      );
    });
  };

  const logoSection = (
    <Link
      href="/dashboard"
      onClick={closeSidebar}
      className="flex items-center gap-3 text-decoration-none group"
    >
      <div className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-sm shadow-[#f97316]/20 transition-transform duration-200 group-hover:scale-105">
        <GraduationCap size={20} className="stroke-[2]" />
      </div>
      <span className="font-semibold text-[#222222] text-base tracking-tight">
        PRN232 Auto Grader
      </span>
    </Link>
  );

  return (
    <>
      {/* ========================================
          MOBILE HEADER (Chỉ hiện thị trên màn hình < 768px)
          ======================================== */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-[#ebebeb]">
        {logoSection}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 text-[#222222] hover:bg-[#f4f4f5] rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* ========================================
          MOBILE BACKDROP (Lớp nền mờ khi mở Drawer)
          ======================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="md:hidden fixed inset-0 z-40 bg-black/35 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* ========================================
          MOBILE DRAWER SIDEBAR (Trượt ra trên Mobile)
          ======================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-[#fcfcfc] border-r border-[#ebebeb] p-6 flex flex-col justify-between shadow-2xl"
          >
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                {logoSection}
                <button
                  onClick={closeSidebar}
                  aria-label="Close menu"
                  className="p-2 text-[#222222] hover:bg-[#f4f4f5] rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1.5">{renderNavLinks()}</nav>
            </div>

            <div className="pt-4 border-t border-[#ebebeb] text-xs text-[#717171] font-sans">
              <p>© 2026 PRN232 Team</p>
              <p className="mt-1 font-mono">v1.0.0</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ========================================
          DESKTOP SIDEBAR (Cố định bên trái trên Desktop)
          ======================================== */}
      <aside className="hidden md:flex flex-col justify-between w-[260px] h-screen sticky top-0 bg-[#fcfcfc] border-r border-[#ebebeb] p-6 shrink-0">
        <div className="flex flex-col gap-10">
          <div className="py-2 px-1">{logoSection}</div>
          <nav className="flex flex-col gap-2">{renderNavLinks()}</nav>
        </div>

        <div className="pt-4 border-t border-[#ebebeb] text-xs text-[#717171] font-sans">
          <p className="font-medium text-[#222222]/75">PRN232 Auto Grader</p>
          <p className="mt-1">Automated Grading System</p>
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
            <span>VERSION 1.0.0</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}
