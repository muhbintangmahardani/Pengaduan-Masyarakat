import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuatLaporanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-7 w-32 rounded-full" />
      </div>

      {/* Two Column Form Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Informasi Kerusakan (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>

          {/* Judul Input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          {/* 2 Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Deskripsi Textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* 2 Opsi Foto Bukti: Kamera & Galeri */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
        </div>

        {/* Kolom Kanan: Peta GPS & Alamat (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>

          {/* Map box */}
          <Skeleton className="h-48 w-full rounded-xl" />

          {/* Tombol GPS */}
          <Skeleton className="h-11 w-full rounded-xl" />

          {/* Alamat Textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Koordinat Display */}
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
