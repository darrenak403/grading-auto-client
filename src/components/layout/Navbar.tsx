"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { GraduationCap } from "lucide-react";

const navItems = siteConfig.navItems;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #ebebeb",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
          className="group"
        >
          <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-sm shadow-[#f97316]/20 transition-transform duration-200 group-hover:scale-105">
            <GraduationCap size={18} className="stroke-[2]" />
          </div>
          <span
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#222222",
              fontFamily: "Inter, Helvetica, Arial, sans-serif",
            }}
          >
            PRN232 Auto Grader
          </span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hidden md:flex"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  fontFamily: "Inter, Helvetica, Arial, sans-serif",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: isActive ? "#f97316" : "#717171",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textDecoration: "none",
                  boxShadow: isActive
                    ? "rgb(249, 115, 22) 0px -4px 0px 0px inset"
                    : "transparent 0px -4px 0px 0px inset",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.boxShadow =
                      "rgb(235, 235, 235) 0px -4px 0px 0px inset";
                    e.currentTarget.style.color = "#222222";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.boxShadow =
                      "transparent 0px -4px 0px 0px inset";
                    e.currentTarget.style.color = "#717171";
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center" }} />
      </div>
    </header>
  );
}
