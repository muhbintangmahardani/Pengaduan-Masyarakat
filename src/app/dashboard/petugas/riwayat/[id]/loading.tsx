import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DetailRiwayatPetugasLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Navigasi & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-3">
          {/* Tombol Kembali Ber-shape Seragam */}
          <div>
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-7 sm:h-8 w-72 sm:w-96 max-w-full rounded-xl" />
            <Skeleton className="h-3.5 w-52 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* 2. Main Two-Column Layout (7 cols + 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7 cols): Dokumentasi Foto Before-After, Catatan, & Lokasi Peta */}
        <div className="lg:col-span-7 space-y-6">
          {/* Komparasi Foto Sebelum & Sesudah Perbaikan */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-44 rounded-md" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto Kondisi Awal */}
              <div className="space-y-2">
                <Skeleton className="h-48 sm:h-52 w-full rounded-xl" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>

              {/* Foto Bukti Hasil Perbaikan */}
              <div className="space-y-2">
                <Skeleton className="h-48 sm:h-52 w-full rounded-xl" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
          </Card>

          {/* Catatan Pekerjaan Petugas */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
            <Skeleton className="h-3 w-52 rounded-md" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </Card>

          {/* Lokasi & Peta Nyata Navigasi */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-44 rounded-md" />
                <Skeleton className="h-3.5 w-56 rounded-md" />
              </div>
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>

            <Skeleton className="h-52 w-full rounded-xl" />
          </Card>
        </div>

        {/* KOLOM KANAN (5 cols): Rincian Tiket (7 rows) & Timeline Alur Penugasan (3 steps) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Rincian Tugas (7 rows divide-y) */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-36 rounded-md" />

            <div className="divide-y divide-border text-xs pt-1">
              {[
                { labelW: "w-24", valW: "w-28" },
                { labelW: "w-28", valW: "w-32" },
                { labelW: "w-32", valW: "w-24" },
                { labelW: "w-36", valW: "w-28" },
                { labelW: "w-32", valW: "w-36" },
                { labelW: "w-28", valW: "w-24" },
                { labelW: "w-28", valW: "w-24" },
              ].map((row, i) => (
                <div key={i} className="py-2.5 flex justify-between items-center">
                  <Skeleton className={`h-3.5 ${row.labelW} rounded-md`} />
                  <Skeleton className={`h-4 ${row.valW} rounded-md`} />
                </div>
              ))}
            </div>
          </Card>

          {/* Card Alur Riwayat Penugasan (3 steps) */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="space-y-1 border-b border-border pb-3">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>

            <div className="space-y-5 pt-1">
              {[
                { titleW: "w-44", descW: "w-64" },
                { titleW: "w-48", descW: "w-64" },
                { titleW: "w-40", descW: "w-60" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
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
