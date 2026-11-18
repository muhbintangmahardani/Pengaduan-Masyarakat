import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminPenugasanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      {/* Task List Table Skeleton (Sesuai Layout Tabel Penugasan Asli) */}
      <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4"><Skeleton className="h-3 w-16 rounded" /></th>
                <th className="py-3 px-4"><Skeleton className="h-3 w-32 rounded" /></th>
                <th className="py-3 px-4"><Skeleton className="h-3 w-28 rounded" /></th>
                <th className="py-3 px-4"><Skeleton className="h-3 w-20 rounded" /></th>
                <th className="py-3 px-4"><Skeleton className="h-3 w-16 rounded" /></th>
                <th className="py-3 px-4"><Skeleton className="h-3 w-16 rounded" /></th>
                <th className="py-3 px-4 text-right"><Skeleton className="h-3 w-16 rounded ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </td>
                  <td className="py-3.5 px-4 min-w-[240px]">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-44 rounded-md" />
                      <Skeleton className="h-3 w-56 rounded-md" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Skeleton className="h-4 w-20 rounded-md ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
