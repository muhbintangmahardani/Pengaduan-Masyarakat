import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PetugasTugasSayaLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Stepper Penanganan */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        {/* 5 Stepper items */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-md hidden sm:block" />
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Detail Tugas (5 cols) + Form Unggah Bukti (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Info Tugas & Foto Kondisi Awal (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>

          <Skeleton className="h-48 w-full rounded-xl" />

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>
        </div>

        {/* Kolom Kanan: Form Hasil Pekerjaan & Kamera (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>

          {/* Opsi Kamera & Galeri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>

          {/* Catatan Pekerjaan */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
