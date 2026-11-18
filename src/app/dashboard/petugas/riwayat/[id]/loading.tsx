import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DetailRiwayatPetugasLoading() {
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
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Foto Before-After, Catatan & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Foto Before & After */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <Skeleton className="h-5 w-44 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
          </Card>

          {/* Catatan Petugas */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <Skeleton className="h-3.5 w-56 rounded-md" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </Card>

          {/* Lokasi & Map */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-3.5 w-52 rounded-md" />
              </div>
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <Skeleton className="h-52 w-full rounded-xl" />
          </Card>
        </div>

        {/* Kolom Kanan: Rincian, Pelapor & Linimasa (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Rincian Tugas */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="space-y-2.5 pt-1">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </Card>

          {/* Card Pelapor */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
            </div>
          </Card>

          {/* Card Linimasa */}
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
