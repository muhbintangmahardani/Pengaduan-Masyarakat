import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DetailPenugasanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Navigasi & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-2">
          {/* Tombol Kembali Ber-shape Seragam */}
          <div>
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-7 sm:h-8 w-72 sm:w-96 max-w-full rounded-xl" />
            <Skeleton className="h-3.5 w-60 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 2. Main Two Columns Layout (7 cols + 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Detail Laporan, Foto & Peta (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Info Utama */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-6 w-60 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>

            {/* Deskripsi Laporan */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-48 rounded-md" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>

            {/* Foto Bukti Kerusakan (Grid 2 Foto Before-After) */}
            <div className="space-y-3 pt-2">
              <Skeleton className="h-3.5 w-36 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-44 sm:h-52 w-full rounded-xl" />
                  <Skeleton className="h-3 w-44 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-44 sm:h-52 w-full rounded-xl" />
                  <Skeleton className="h-3 w-44 rounded-md" />
                </div>
              </div>
            </div>

            {/* Informasi Pelapor di bagian bawah Card Utama */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
                <Skeleton className="h-3.5 w-32 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-36 rounded-md" />
            </div>
          </Card>

          {/* Card Peta Lokasi Nyata */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-52 rounded-md" />
              </div>
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>

            <Skeleton className="h-64 w-full rounded-xl" />

            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-36 rounded-md" />
              <Skeleton className="h-3 w-40 rounded-md" />
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Personel Bertugas & Linimasa 5 Langkah (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Personel Petugas yang Ditugaskan */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>

            <div className="flex items-center gap-3.5">
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </Card>

          {/* Card Riwayat & Linimasa Penanganan (5 Steps sesuai UI riil) */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="space-y-1 border-b border-border pb-3">
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-3 w-44 rounded-md" />
            </div>

            <div className="space-y-5 pt-1">
              {[
                { titleW: "w-36", descW: "w-60" },
                { titleW: "w-40", descW: "w-64" },
                { titleW: "w-36", descW: "w-56" },
                { titleW: "w-44", descW: "w-60" },
                { titleW: "w-40", descW: "w-52" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <Skeleton className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1 min-w-0">
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
    </div>
  );
}
