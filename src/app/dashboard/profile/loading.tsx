import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <Skeleton className="h-8 w-44 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md mt-1" />
      </div>

      {/* Two Column Profile Layout (Sesuai Layout ProfileEditForm 4-cols / 8-cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Ringkasan Kartu Identitas (4 cols) */}
        <Card className="lg:col-span-4 rounded-xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <div className="flex flex-col items-center text-center space-y-3">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="space-y-1.5 flex flex-col items-center">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-20 rounded-md" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-28 rounded-md" />
            </div>
          </div>

          <Skeleton className="h-16 w-full rounded-xl" />
        </Card>

        {/* Kolom Kanan: Form Data Pribadi & Keamanan (8 cols) */}
        <Card className="lg:col-span-8 rounded-xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-border pb-4 space-y-1">
            <Skeleton className="h-6 w-56 rounded-lg" />
            <Skeleton className="h-3.5 w-80 rounded-md" />
          </div>

          {/* Section 1: Data Diri */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-28 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Section 2: Keamanan / Sandi */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-36 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 border-t border-border flex justify-end">
            <Skeleton className="h-10 w-48 rounded-xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}
