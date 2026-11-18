import React from "react";
import { Badge } from "@/components/ui/badge";
import { type ComplaintStatus } from "@/types";
import { formatStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles: Record<ComplaintStatus, string> = {
    pending:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700/70 border",
    verified:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700/70 border",
    in_progress:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700/70 border",
    under_review:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700/70 border",
    resolved:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700/70 border",
    rejected:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700/70 border",
  };

  const badgeStyle =
    styles[status] ||
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs whitespace-nowrap shrink-0 ${badgeStyle} ${className}`}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
