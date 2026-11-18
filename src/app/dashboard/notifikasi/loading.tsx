import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function NotifikasiLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-36 rounded-xl" />
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Skeleton className="h-8 w-24 rounded-xl shrink-0" />
        <Skeleton className="h-8 w-32 rounded-xl shrink-0" />
        <Skeleton className="h-8 w-36 rounded-xl shrink-0" />
        <Skeleton className="h-8 w-24 rounded-xl shrink-0" />
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card
            key={i}
            className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4/5 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-xl shrink-0 hidden sm:block" />
          </Card>
        ))}
      </div>
    </div>
  );
}
