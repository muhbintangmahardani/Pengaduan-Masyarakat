"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface JalanBaikLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "stacked";
  inverted?: boolean; // true for light text on dark backgrounds
  href?: string;
  subtext?: string;
}

export function JalanBaikLogo({
  className,
  size = "md",
  variant = "full",
  inverted = false,
  href,
  subtext = "Layanan Pengaduan Jalan",
}: JalanBaikLogoProps) {
  // Size map for the icon container
  const iconSizeClasses = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-11 h-11 rounded-xl",
    xl: "w-14 h-14 rounded-2xl",
  };

  const titleSizeClasses = {
    sm: "text-base tracking-tight leading-none",
    md: "text-lg tracking-tight leading-none",
    lg: "text-xl tracking-tight leading-tight",
    xl: "text-2xl tracking-tight leading-tight",
  };

  const subtextSizeClasses = {
    sm: "text-[7.5px] tracking-wide",
    md: "text-[8.5px] tracking-wide",
    lg: "text-[9.5px] tracking-wide",
    xl: "text-[11px] tracking-wide",
  };

  // Modern, high-end SVG logo: Sleek perspective highway + horizon waypoint star in emerald badge
  const LogoIcon = (
    <div
      className={cn(
        "flex items-center justify-center relative overflow-hidden shadow-xs shrink-0 select-none transition-transform group-hover:scale-105",
        iconSizeClasses[size],
        inverted
          ? "bg-white/15 text-white border border-white/25 backdrop-blur-md"
          : "bg-gradient-to-br from-[#0c3b37] via-[#0f4944] to-[#082824] text-emerald-300 dark:from-emerald-900 dark:via-[#0c3b37] dark:to-emerald-950 dark:text-emerald-300 border border-emerald-600/30 dark:border-emerald-500/40"
      )}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1.5"
      >
        {/* Modern converging highway road plane */}
        <path
          d="M8 33L16.5 13.5C16.8 12.8 17.5 12.5 18.2 12.5H21.8C22.5 12.5 23.2 12.8 23.5 13.5L32 33H26L21 21H19L14 33H8Z"
          fill="currentColor"
          fillOpacity={inverted ? "0.95" : "0.92"}
        />
        {/* Center glowing lane markers */}
        <line
          x1="20"
          y1="23"
          x2="20"
          y2="26"
          stroke={inverted ? "#a7f3d0" : "#ffffff"}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="29"
          x2="20"
          y2="33"
          stroke={inverted ? "#a7f3d0" : "#ffffff"}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Horizon Waypoint / Star Diamond Symbol */}
        <path
          d="M20 7L21.4 10.2L24.5 11.5L21.4 12.8L20 16L18.6 12.8L15.5 11.5L18.6 10.2L20 7Z"
          fill={inverted ? "#34d399" : "#10b981"}
        />
      </svg>
    </div>
  );

  const LogoText = (
    <div className="flex flex-col justify-center min-w-0">
      <div className="flex items-center gap-1 leading-none">
        <span
          className={cn(
            "font-black tracking-tight",
            titleSizeClasses[size],
            inverted ? "text-white" : "text-[#0c3b37] dark:text-emerald-400"
          )}
        >
          jalanbaik
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      </div>
      {subtext && (
        <span
          className={cn(
            "font-semibold whitespace-nowrap mt-0.5",
            subtextSizeClasses[size],
            inverted ? "text-emerald-200/90" : "text-slate-500 dark:text-slate-400"
          )}
        >
          {subtext}
        </span>
      )}
    </div>
  );

  const content = (
    <div
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-95 group",
        variant === "stacked" && "flex-col items-start gap-1.5",
        className
      )}
    >
      {LogoIcon}
      {variant !== "icon" && LogoText}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
