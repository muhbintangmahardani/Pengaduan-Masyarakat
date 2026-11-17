import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReviewLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-40 rounded-full" />
      </div>

      {/* Two Column Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Side-by-side Before/After Photo & Decision (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-6 w-64 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>

          {/* Two Side-by-Side Photos (SEBELUM vs SESUDAH) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>

          {/* Catatan Petugas */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>

          {/* Action Decision Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
        </div>

        {/* Kolom Kanan: Rincian Tiket & Petugas (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <Skeleton className="h-5 w-40 rounded-md" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
