import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function CitizenDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Dashboard Welcome Hero Skeleton */}
      <Card className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6 lg:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-xl">
            <Skeleton className="h-7 sm:h-8 w-60 rounded-xl" />
            <Skeleton className="h-4 w-full max-w-md rounded-md" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl shrink-0" />
        </div>
      </Card>

      {/* 2. 4 Metric Cards Skeleton (Sesuai DashboardMetricCard) */}
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

      {/* 3. Analytical Row: Left 8-cols (Grafik Statistik) + Right 4-cols (Linimasa Aktivitas) - 100% Sejajar Presisi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <Card className="p-4 sm:p-5 rounded-xl border border-border bg-card h-full flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div className="space-y-1">
                <Skeleton className="h-5 w-52 rounded-md" />
                <Skeleton className="h-3.5 w-72 rounded-md" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full shrink-0" />
            </div>
            <div className="flex items-center gap-4 text-xs pt-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <Skeleton className="h-[250px] w-full rounded-xl flex-1 mt-3" />
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <Card className="rounded-xl border border-border bg-card h-full flex flex-col justify-between overflow-hidden">
            <div className="p-4 sm:p-5 pb-3 border-b border-border space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
            <div className="p-4 sm:p-5 space-y-3.5 flex-1 my-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-3.5 w-28 rounded-md" />
                      <Skeleton className="h-4 w-14 rounded-full shrink-0" />
                    </div>
                    <Skeleton className="h-3 w-40 rounded-md" />
                    <Skeleton className="h-2.5 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3.5 sm:p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Citizen Complaints List Skeleton (Sesuai CitizenComplaintsList) */}
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
          {[1, 2, 3, 4].map((i) => (
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
