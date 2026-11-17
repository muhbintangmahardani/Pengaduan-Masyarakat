import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PetugasRiwayatLoading() {
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

      {/* Search Bar */}
      <Skeleton className="h-11 w-full rounded-xl" />

      {/* Completed Task Cards */}
      <div className="space-y-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-44 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
