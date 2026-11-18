import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminLaporanMasukLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* 2. 3 Minimalist Stat Cards in a row (3 kolom ringkas sama persis admin/page.tsx) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3 sm:p-4 rounded-xl border border-border/80 bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <Skeleton className="h-3 w-16 sm:w-20 rounded-md" />
              <Skeleton className="h-3.5 w-3.5 rounded-md" />
            </div>
            <div className="mt-1 sm:mt-2">
              <Skeleton className="h-7 sm:h-9 w-10 sm:w-14 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Master-Detail Two Column Layout (AdminIncomingReports) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (5 cols): Tabs + Search + Complaints List */}
        <Card className="lg:col-span-5 rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>

          <Skeleton className="h-10 w-full rounded-lg" />

          <div className="space-y-2.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-border space-y-2"
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
        </Card>

        {/* Kolom Kanan (7 cols): Detail Verifikasi & Form Penugasan */}
        <Card className="lg:col-span-7 rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-6 w-56 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Foto Before/After & Deskripsi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>

          {/* Form Assign Petugas */}
          <div className="space-y-3.5 pt-3 border-t border-border">
            <Skeleton className="h-4 w-36 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}
