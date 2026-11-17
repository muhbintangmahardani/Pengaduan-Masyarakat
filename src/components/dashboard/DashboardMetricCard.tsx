import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
      iconBg: "bg-muted text-muted-foreground",
      numberColor: "text-foreground",
      borderHover: "hover:border-foreground/20",
    },
    amber: {
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      numberColor: "text-amber-600 dark:text-amber-400",
      borderHover: "hover:border-amber-500/30",
    },
    blue: {
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      numberColor: "text-sky-600 dark:text-sky-400",
      borderHover: "hover:border-sky-500/30",
    },
    emerald: {
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      numberColor: "text-emerald-600 dark:text-emerald-400",
      borderHover: "hover:border-emerald-500/30",
    },
    orange: {
      iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      numberColor: "text-orange-600 dark:text-orange-400",
      borderHover: "hover:border-orange-500/30",
    },
  };

  const style = variantStyles[variant] || variantStyles.slate;

  return (
    <Card className={`rounded-xl border border-border bg-card shadow-xs transition-all duration-200 ${style.borderHover}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5">
        <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </CardTitle>
        <div className={`p-2 rounded-lg shrink-0 ${style.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
        <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${style.numberColor}`}>
          {String(count).padStart(2, "0")}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}
        <div className="pt-2 border-t border-border/60">
          <Link
            href={href}
            className="text-xs font-medium text-foreground/80 hover:text-foreground flex items-center justify-between group"
          >
            <span>{linkText}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-muted-foreground" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
