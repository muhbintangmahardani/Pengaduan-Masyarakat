import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-4 w-4 rounded-md" />
            </div>
            <div className="mt-2.5 space-y-1">
              <Skeleton className="h-8 w-14 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* Content Body Skeleton */}
      <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <div className="space-y-3 pt-1">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </Card>
    </div>
  );
}
