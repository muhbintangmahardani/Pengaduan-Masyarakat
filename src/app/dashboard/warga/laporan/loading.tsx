import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function LaporanSayaLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl shrink-0" />
      </div>

      {/* Card CitizenComplaintsList Skeleton */}
      <Card className="rounded-xl border border-border bg-card shadow-xs">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>

          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <div className="flex gap-1 p-1 bg-muted/80 rounded-xl">
              <Skeleton className="h-7 w-18 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-18 rounded-lg" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
