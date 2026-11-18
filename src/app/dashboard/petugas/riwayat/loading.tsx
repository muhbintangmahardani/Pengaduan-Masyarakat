import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function PetugasRiwayatLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
      </div>

      {/* Completed Task Cards (3 Kolom Grid Sesuai Halaman Aslinya) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Photo Box with Badge */}
              <div className="relative w-full h-40 bg-muted">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-2.5 right-2.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-lg mt-1" />
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 pt-3 border-t border-border flex items-center justify-between">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
