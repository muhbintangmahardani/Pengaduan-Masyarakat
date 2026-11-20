"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface DetailReviewSkeletonProps {
  ticketNumber?: string;
  onBack?: () => void;
}

export function DetailReviewSkeleton({ ticketNumber, onBack }: DetailReviewSkeletonProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Info & Tombol Kembali */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-2">
          {/* Tombol Kembali Ber-shape Seragam */}
          <div>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-muted/80 hover:text-[#0c3b37] dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Hasil</span>
              </button>
            ) : (
              <Link
                href="/dashboard/admin/review"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-muted/80 hover:text-[#0c3b37] dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Hasil</span>
              </Link>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Tinjau Hasil Perbaikan Lapangan
            </h1>
            <p className="text-xs text-slate-500">
              Periksa dokumentasi bukti foto petugas sebelum menyetujui dan menutup laporan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 2. Info Alert Box (Matching blue notice banner) */}
      <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-64 rounded-md" />
          <Skeleton className="h-3 w-44 rounded-md" />
        </div>
        <Skeleton className="h-4 w-36 rounded-md" />
      </div>

      {/* 3. Two Column Review Layout (7 cols + 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Side-by-side Before/After Photo & Decision (7 cols) */}
        <Card className="lg:col-span-7 rounded-xl border border-border bg-card p-5 sm:p-7 space-y-6 shadow-xs">
          <div className="space-y-1.5 pb-2 border-b border-border">
            {ticketNumber ? (
              <span className="text-xs font-mono font-bold text-[#0c3b37] dark:text-emerald-400 block">
                {ticketNumber}
              </span>
            ) : (
              <Skeleton className="h-3.5 w-24 rounded-md" />
            )}
            <Skeleton className="h-6 w-64 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>

          {/* Two Side-by-Side Photos (SEBELUM vs SESUDAH) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border">
                <Skeleton className="h-full w-full" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                  SEBELUM
                </span>
              </div>
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border">
                <Skeleton className="h-full w-full" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                  SESUDAH
                </span>
              </div>
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </div>

          {/* Catatan Petugas */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>

          {/* Action Decision Buttons (Setujui vs Minta Perbaikan Ulang) */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
            <Skeleton className="h-11 w-full sm:w-44 rounded-xl" />
            <Skeleton className="h-11 w-full sm:w-56 rounded-xl" />
          </div>
        </Card>

        {/* Kolom Kanan: Riwayat Penanganan (5 cols) */}
        <Card className="lg:col-span-5 rounded-xl border border-border bg-card p-5 sm:p-7 space-y-6 shadow-xs">
          <div className="space-y-1 border-b border-border pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Riwayat Penanganan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Diperbarui secara transparan
            </p>
          </div>

          <div className="space-y-6 pt-1">
            {[
              { titleW: "w-32", descW: "w-56" },
              { titleW: "w-44", descW: "w-48" },
              { titleW: "w-36", descW: "w-52" },
              { titleW: "w-40", descW: "w-44" },
              { titleW: "w-48", descW: "w-60" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1 min-w-0">
                  <Skeleton className={`h-3.5 ${step.titleW} rounded-md`} />
                  <Skeleton className="h-2.5 w-24 rounded-md" />
                  <Skeleton className={`h-3 ${step.descW} rounded-md`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
