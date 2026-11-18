import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function BuatLaporanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-7 w-36 rounded-full shrink-0" />
      </div>

      {/* Two Column Form Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Informasi Kerusakan (7 cols) */}
        <Card className="lg:col-span-7 rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>

          {/* Judul Input */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          {/* 2 Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Deskripsi Textarea */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Foto Bukti: Kamera & Galeri */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </Card>

        {/* Kolom Kanan: Peta GPS & Alamat (5 cols) */}
        <Card className="lg:col-span-5 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </div>

          {/* Peta Interactive */}
          <Skeleton className="h-48 w-full rounded-xl" />

          {/* Tombol GPS */}
          <Skeleton className="h-10 w-full rounded-xl" />

          {/* Alamat Textarea */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Koordinat Display */}
          <div className="space-y-1 pt-1">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}
