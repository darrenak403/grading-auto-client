"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig, type NavGroup, type NavItem } from "@/config/site";
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Download,
  Menu,
  X,
  GraduationCap,
  LogOut,
  ChevronDown,
  Calendar,
  FlaskConical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/lib/auth/constants";

const MotionLink = motion(Link);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/exam-sessions": BookOpen,
  "/submissions": UploadCloud,
  "/exports": Download,
  "/lab/semesters": Calendar,
  "/lab/assignments": FlaskConical,
};

const USER_NAV_HREFS = new Set(["/dashboard", "/submissions"]);

function filterNavGroups(
  groups: NavGroup[],
  role: UserRole | undefined
): NavGroup[] {
  if (role === "admin") return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => USER_NAV_HREFS.has(item.href)),
    }))
    .filter((group) => group.items.length > 0);
}

function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  return pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        siteConfig.navGroups.map((g) => [g.label, g.defaultOpen])
      )
  );

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navGroups = filterNavGroups(siteConfig.navGroups, user?.role);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSignOut = () => {
    closeSidebar();
    logout();
    router.replace("/login");
  };

  const footerBlock = (
    <>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-[#717171] transition-colors hover:bg-[#f4f4f5] hover:text-[#222222] cursor-pointer"
      >
        <LogOut className="h-5 w-5" aria-hidden />
        Sign out
      </button>
      <div className="pt-4 border-t border-[#ebebeb] text-xs text-[#717171] font-sans">
        <p>© 2026 PRN232 Team</p>
        <p className="mt-1 font-mono">v1.0.0</p>
      </div>
    </>
  );

  const desktopFooterBlock = (
    <>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#717171] transition-colors hover:bg-[#f4f4f5] hover:text-[#222222] cursor-pointer"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </button>
      <div className="pt-4 border-t border-[#ebebeb] text-xs text-[#717171] font-sans">
        <p className="font-medium text-[#222222]/75">PRN232 Auto Grader</p>
        <p className="mt-1">Automated Grading System</p>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
          <span>VERSION 1.0.0</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </>
  );

  const renderNavItem = (item: NavItem, compact?: boolean) => {
    const IconComponent = iconMap[item.href] || LayoutDashboard;
    const isActive = isNavItemActive(pathname, item.href);

    return (
      <MotionLink
        key={item.href}
        href={item.href}
        onClick={closeSidebar}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
          compact ? "px-3 py-2.5 text-sm" : "px-4 py-3 text-base"
        } ${
          isActive
            ? "bg-[#fef2e8] text-[#f97316] pl-3"
            : "text-[#717171] hover:bg-[#f4f4f5] hover:text-[#222222]"
        }`}
      >
        <IconComponent
          className={`transition-colors duration-200 ${
            compact ? "w-4 h-4" : "w-5 h-5"
          } ${isActive ? "text-[#f97316]" : "text-[#717171]"}`}
        />
        <span>{item.label}</span>
      </MotionLink>
    );
  };

  const renderNavGroups = (compact?: boolean) =>
    navGroups.map((group) => {
      const isGroupOpen = openGroups[group.label] ?? group.defaultOpen;

      return (
        <div key={group.label} className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => toggleGroup(group.label)}
            className={`flex w-full items-center justify-between rounded-lg font-semibold text-[#222222] transition-colors hover:bg-[#f4f4f5] cursor-pointer ${
              compact
                ? "px-2 py-2 text-xs uppercase tracking-wide"
                : "px-2 py-2.5 text-sm"
            }`}
            aria-expanded={isGroupOpen}
          >
            <span>{group.label}</span>
            <ChevronDown
              className={`h-4 w-4 text-[#717171] transition-transform duration-200 ${
                isGroupOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </button>
          <AnimatePresence initial={false}>
            {isGroupOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex flex-col gap-1 pl-1"
              >
                {group.items.map((item) => renderNavItem(item, compact))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });

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
              <nav className="flex flex-col gap-4">
                {siteConfig.standaloneItems && (
                  <div className="flex flex-col gap-1">
                    {siteConfig.standaloneItems.map((item) => renderNavItem(item, false))}
                  </div>
                )}
                {renderNavGroups()}
              </nav>
            </div>
            <div>{footerBlock}</div>
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex flex-col justify-between w-[260px] h-screen sticky top-0 bg-[#fcfcfc] border-r border-[#ebebeb] p-6 shrink-0">
        <div className="flex flex-col gap-10">
          <div className="py-2 px-1">{logoSection}</div>
          <nav className="flex flex-col gap-4">
            {siteConfig.standaloneItems && (
              <div className="flex flex-col gap-1">
                {siteConfig.standaloneItems.map((item) => renderNavItem(item, true))}
              </div>
            )}
            {renderNavGroups(true)}
          </nav>
        </div>
        <div>{desktopFooterBlock}</div>
      </aside>
    </>
  );
}
