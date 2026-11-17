import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface DashboardMetricCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  variant?: "slate" | "amber" | "blue" | "emerald" | "orange";
  description?: string;
  href: string;
  linkText?: string;
}

export function DashboardMetricCard({
  label,
  count,
  icon: Icon,
  variant = "slate",
  description,
  href,
  linkText = "Lihat Detail",
}: DashboardMetricCardProps) {
  const variantStyles = {
    slate: {
      iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      numberColor: "text-slate-900 dark:text-slate-100",
      hoverBorder: "hover:border-slate-300 dark:hover:border-slate-700",
    },
    amber: {
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60",
      numberColor: "text-amber-600 dark:text-amber-400",
      hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
    },
    blue: {
      iconBg: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60",
      numberColor: "text-sky-600 dark:text-sky-400",
      hoverBorder: "hover:border-sky-300 dark:hover:border-sky-800",
    },
    emerald: {
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60",
      numberColor: "text-emerald-600 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
    },
    orange: {
      iconBg: "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60",
      numberColor: "text-orange-600 dark:text-orange-400",
      hoverBorder: "hover:border-orange-300 dark:hover:border-orange-800",
    },
  };

  const style = variantStyles[variant] || variantStyles.slate;

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3 transition-all duration-200 hover:-translate-y-0.5 ${style.hoverBorder} flex flex-col justify-between`}
    >
      <div className="space-y-2">
        {/* Top: Label + Icon Container */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          <div className={`p-2 rounded-xl shrink-0 ${style.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Counter Big & Bold */}
        <div className={`text-2xl sm:text-3xl font-black tracking-tight ${style.numberColor}`}>
          {String(count).padStart(2, "0")}
        </div>

        {description && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
            {description}
          </p>
        )}
      </div>

      {/* Bottom Link (View All → style from mockup) */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
        <Link
          href={href}
          className="text-xs font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center justify-between group"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
