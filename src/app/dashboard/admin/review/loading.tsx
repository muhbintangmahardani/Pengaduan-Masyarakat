import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminReviewLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-3.5 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 2. Ringkasan 3 Metrik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Baris Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-72 rounded-xl" />
      </div>

      {/* 4. Grid Cards Hasil Perbaikan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            {/* Header Item */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-5 w-48 rounded-md" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Lokasi */}
            <Skeleton className="h-3 w-64 rounded-md" />

            {/* Before-After Photo Skeletons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-2.5 w-24 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-2.5 w-24 rounded-md" />
              </div>
            </div>

            {/* Catatan Petugas */}
            <Skeleton className="h-12 w-full rounded-lg" />

            {/* Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <Skeleton className="h-3 w-32 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
