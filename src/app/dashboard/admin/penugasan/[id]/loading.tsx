import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DetailPenugasanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-8 w-72 max-w-full rounded-xl" />
          <Skeleton className="h-3.5 w-52 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Detail Tugas, Foto & Peta (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-6 w-56 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>

            {/* Foto Bukti */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            </div>
          </Card>

          {/* Card Lokasi & Peta */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3.5 w-52 rounded-md" />
              </div>
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <Skeleton className="h-52 w-full rounded-xl" />
          </Card>
        </div>

        {/* Kolom Kanan: Personel Petugas, Pelapor & Linimasa (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Petugas Card */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-border">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          </Card>

          {/* Pelapor Card */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <Skeleton className="h-4 w-28 rounded-md" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
            </div>
          </Card>

          {/* Linimasa Card */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="space-y-4 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-44 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
