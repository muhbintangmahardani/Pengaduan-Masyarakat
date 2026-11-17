import React from "react";
import { type ComplaintStatus } from "@/types";
import { formatStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles: Record<ComplaintStatus, string> = {
    pending:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700/70 border", // Amber pill (Menunggu verifikasi)
    verified:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700/70 border", // Sky pill (Diverifikasi)
    in_progress:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700/70 border", // Indigo pill (Sedang dikerjakan)
    under_review:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700/70 border", // Warm Orange pill (Menunggu tinjauan)
    resolved:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700/70 border", // Mint Green pill (Selesai diperbaiki)
    rejected:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700/70 border", // Red pill (Ditolak)
  };

  const badgeStyle = styles[status] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs whitespace-nowrap ${badgeStyle} ${className}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
