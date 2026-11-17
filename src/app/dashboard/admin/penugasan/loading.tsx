import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPenugasanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
          >
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-7 w-12 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Task List / Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton className="h-6 w-44 rounded-lg" />
          <Skeleton className="h-10 w-64 rounded-xl" />
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
