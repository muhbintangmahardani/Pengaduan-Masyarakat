import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function AdminRingkasanLoading() {
  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in-50 duration-200">
      {/* 1. Dashboard Welcome Hero Skeleton */}
      <Card className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6 lg:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-xl">
            <Skeleton className="h-7 sm:h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-full max-w-md rounded-md" />
          </div>
          <Skeleton className="h-10 w-48 rounded-xl shrink-0" />
        </div>
      </Card>

      {/* 2. 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-4 w-4 rounded-md" />
            </div>
            <div className="mt-2.5 space-y-1">
              <Skeleton className="h-8 w-14 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Antrean Laporan & Penugasan Terbaru Skeleton (Full Width) */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <Skeleton className="h-5 w-56 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Personel Petugas Lapangan Siaga (3 cols grid) */}
      <Card className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-1">
            <Skeleton className="h-5 w-56 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
              <Skeleton className="h-5 w-18 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
