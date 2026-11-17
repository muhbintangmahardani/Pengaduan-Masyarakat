import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotifikasiLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* List Skeletons */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
