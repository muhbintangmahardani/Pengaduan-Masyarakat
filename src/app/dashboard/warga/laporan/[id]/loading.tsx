import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DetailLaporanWargaLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Detail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-7 w-80 max-w-full rounded-xl" />
          <Skeleton className="h-3.5 w-52 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Foto Before-After & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <Skeleton className="h-5 w-44 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>

        {/* Kolom Kanan: Detail & Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="space-y-4 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
