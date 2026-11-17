import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLaporanMasukLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* 2. 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-7 w-12 rounded-lg" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Master-Detail Two Column Layout (Persis AdminIncomingReports) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (5 cols): Tabs + Search + Complaints List */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>

          <Skeleton className="h-10 w-full rounded-lg" />

          <div className="space-y-2.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan (7 cols): Detail Laporan Terpilih & Form Penugasan */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <Skeleton className="h-6 w-56 rounded-lg" />
              <Skeleton className="h-3.5 w-40 rounded-md" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Foto Bukti */}
          <Skeleton className="h-56 w-full rounded-xl" />

          {/* Rincian Aduan */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>

          {/* Form Disposisi Petugas */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <Skeleton className="h-4 w-40 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
