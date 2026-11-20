"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveClockBadgeProps {
  className?: string;
  variant?: "badge" | "hero" | "subtle";
}

export function LiveClockBadge({
  className = "",
  variant = "badge",
}: LiveClockBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      // Format hari & tanggal Bahasa Indonesia: e.g. "Jumat, 20 Nov 2026"
      const dateFormatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now);

      // Format jam real-time WIB: e.g. "23:45:10 WIB"
      const timeFormatted =
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
          .format(now)
          .replace(/\./g, ":") + " WIB";

      setDateStr(dateFormatted);
      setTimeStr(timeFormatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-xs opacity-70",
          className
        )}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Memuat waktu...</span>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-2xs shrink-0 select-none",
          className
        )}
      >
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>{dateStr}</span>
        </span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="font-semibold">{timeStr}</span>
        </span>
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 text-xs text-muted-foreground select-none",
          className
        )}
      >
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#0c3b37] dark:text-emerald-400 shrink-0" />
          <span>{dateStr}</span>
        </span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1 font-mono font-medium text-foreground">
          <Clock className="w-3.5 h-3.5 text-[#0c3b37] dark:text-emerald-400 shrink-0" />
          <span>{timeStr}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card/90 text-foreground text-xs shadow-2xs select-none",
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
        <Calendar className="w-3.5 h-3.5 text-[#0c3b37] dark:text-emerald-400 shrink-0" />
        <span>{dateStr}</span>
      </span>
      <span className="text-border">|</span>
      <span className="flex items-center gap-1.5 font-mono font-bold text-foreground">
        <Clock className="w-3.5 h-3.5 text-[#0c3b37] dark:text-emerald-400 shrink-0" />
        <span>{timeStr}</span>
      </span>
    </div>
  );
}
