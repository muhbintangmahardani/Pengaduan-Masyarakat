import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function PetugasTugasSayaLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full shrink-0" />
      </div>

      {/* 2. Horizontal Workflow Stepper Bar */}
      <Card className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between gap-4 min-w-[550px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-3.5 w-20 rounded-md" />
              </div>
              {i < 5 && <Skeleton className="h-3 w-4 rounded" />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* 3. Two Columns: Detail Tugas (5 cols) + Form Unggah Bukti (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Info Tugas & Foto Kondisi Awal (5 cols) */}
        <Card className="lg:col-span-5 rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1.5 pb-2 border-b border-border">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-6 w-52 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-3 w-44 rounded-md" />
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl mt-2" />
          </div>
        </Card>

        {/* Kolom Kanan: Form Hasil Pekerjaan & Kamera (7 cols) */}
        <Card className="lg:col-span-7 rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1 pb-2 border-b border-border">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>

          {/* Opsi Kamera & Galeri */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>

          {/* Catatan Pekerjaan */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}
