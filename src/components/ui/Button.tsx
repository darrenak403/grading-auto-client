"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type ButtonVariant = "primary" | "dark" | "light" | "pill" | "overlay" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      fullWidth,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles shared across all button variants
    const base =
      "inline-flex items-center justify-center gap-2 font-[600] cursor-pointer transition-all duration-200 ease border";

    // Variant-specific styles (inline approach for consistency with inline navbar styles)
    const variantMap: Record<ButtonVariant, string> = {
      primary:
        "bg-[#f97316] text-white border-[#f97316] hover:bg-[#ea580c] hover:border-[#ea580c]",
      dark: "bg-[#222222] text-white border-[#222222] hover:bg-[#ebebeb] hover:text-[#222222] hover:border-[#ebebeb]",
      light: "bg-[#f4f4f5] text-[#3f3f46] border-[#ebebeb] hover:bg-[#ebebeb] hover:text-[#222222]",
      pill: "bg-white text-[#3f3f46] border-[#ebebeb] hover:bg-[#f4f4f5] rounded-[20px]",
      overlay: "bg-[rgba(34,34,34,0.5)] text-white border-transparent hover:bg-[#222222] rounded-[20px] backdrop-blur-sm",
      outline: "bg-transparent text-[#222222] border-[#ebebeb] hover:bg-[#f4f4f5] hover:border-[#ebebeb]",
    };

    const sizeMap: Record<ButtonSize, string> = {
      sm: "px-3 py-[6px] text-[0.875rem] rounded-[6px]",
      md: "px-4 py-[8px] text-[1rem] rounded-[6px]",
      lg: "px-6 py-5 text-[1rem] rounded-[6px]",
    };

    const classes = cn(
      base,
      variantMap[variant],
      sizeMap[size],
      fullWidth && "w-full",
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };