import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DashboardMetricCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  variant?: "slate" | "amber" | "blue" | "emerald" | "orange";
  description?: string;
  href?: string;
  linkText?: string;
}

export function DashboardMetricCard({
  label,
  count,
  icon: Icon,
  variant = "slate",
  description,
  href,
}: DashboardMetricCardProps) {
  const accentColors = {
    slate: "text-foreground group-hover:text-[#0c3b37] dark:group-hover:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  const numberColor = accentColors[variant] || accentColors.slate;

  const cardContent = (
    <Card className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-muted/30 transition-all duration-150 group cursor-pointer h-full flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground tracking-tight truncate">
          {label}
        </span>
        <Icon className="w-4 h-4 text-muted-foreground/70 group-hover:text-foreground transition-colors shrink-0" />
      </div>

      <div className="mt-2.5">
        <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans transition-colors ${numberColor}`}>
          {String(count).padStart(2, "0")}
        </div>
        {description && (
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground truncate font-normal">
            {description}
          </p>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
