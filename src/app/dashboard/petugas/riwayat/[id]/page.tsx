import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  FileCheck,
  Wrench,
  User,
  Shield,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/common/StatusBadge";
import { RealMap } from "@/components/common/RealMap";
import { ExportButton } from "@/components/common/ExportButton";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { formatDateTime, formatDateTimeWithHours } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Detail Riwayat Tugas Petugas",
};

export default async function PetugasRiwayatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Ambil detail tugas beserta profil pelapor dan riwayat
  const { data: taskData, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      profiles:user_id(full_name, email, phone_number),
      complaint_timelines(
        id,
        status,
        note,
        created_at,
        actor:actor_id(full_name, role)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !taskData) {
    notFound();
  }

  const task = taskData as any;

  return (
    <div className="space-y-6">
      {/* 1. Header Navigasi & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-3">
          {/* Tombol Kembali dengan Shape Pill Modern & Jarak Nyaman */}
          <div>
            <Link
              href="/dashboard/petugas/riwayat"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-muted/80 hover:text-[#0c3b37] dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Dokumentasi Perbaikan: {task.title}
            </h1>
            <p className="text-xs text-slate-400">
              {task.completed_at
                ? `Tuntas dikerjakan pada ${formatDateTimeWithHours(task.completed_at)}`
                : `Status: ${task.status}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} />
          <ExportButton
            complaints={[task]}
            filename={`bukti-tugas-${task.ticket_number}`}
            label="Export Bukti Tugas"
          />
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7 cols): Dokumentasi Foto Before-After, Peta, & Catatan */}
        <div className="lg:col-span-7 space-y-6">
          {/* Komparasi Foto Sebelum & Sesudah Perbaikan */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Dokumentasi Hasil Lapangan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto Kondisi Awal */}
              <div className="space-y-2">
                <ImageLightboxModal
                  src={task.photo_url}
                  alt={task.title}
                  label="Kondisi Awal Dilaporkan Warga"
                  badgeText="KONDISI AWAL (PELAPOR)"
                  badgeColor="amber"
                  heightClass="h-48 sm:h-52"
                  caption={`Foto awal dilaporkan warga (${task.ticket_number})`}
                />
                <div className="text-[11px] text-slate-400">
                  {formatDateTime(task.created_at)} • Foto warga (Klik untuk perbesar)
                </div>
              </div>

              {/* Foto Bukti Hasil Perbaikan */}
              <div className="space-y-2">
                <ImageLightboxModal
                  src={task.completion_photo_url || task.photo_url}
                  alt="Hasil Perbaikan Petugas"
                  label="Bukti Perbaikan Selesai Petugas"
                  badgeText="BUKTI PERBAIKAN PETUGAS"
                  badgeColor="emerald"
                  heightClass="h-48 sm:h-52"
                  caption={`Bukti hasil pekerjaan selesai (${task.ticket_number})`}
                />
                <div className="text-[11px] text-slate-400">
                  {task.completed_at
                    ? `${formatDateTime(task.completed_at)} • Selesai`
                    : "Dokumentasi penyelesaian"} (Klik untuk perbesar)
                </div>
              </div>
            </div>
          </Card>

          {/* Catatan Pekerjaan Petugas */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
              Catatan Pengerjaan Yang Telah Anda Kirim
            </span>
            <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50">
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic">
                &quot;{task.completion_note || "Lubang sudah ditambal dan permukaan jalan diratakan. Area perbaikan telah dibersihkan dan aman dilalui."}&quot;
              </p>
            </div>
          </Card>

          {/* Lokasi & Peta Nyata Navigasi */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#0c3b37] dark:text-emerald-400" />
                  <span>Lokasi Pekerjaan Lapangan</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                  {task.address}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude || -6.8915},${task.longitude || 107.5965}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigasi GPS ↗
              </a>
            </div>

            <RealMap
              latitude={task.latitude}
              longitude={task.longitude}
              className="w-full h-52"
            />
          </Card>
        </div>

        {/* KOLOM KANAN (5 cols): Rincian Tiket & Timeline Persetujuan Admin */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Rincian Tugas */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Informasi Penugasan
            </h2>

            <div className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Nomor Tiket:</span>
                <span className="font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                  {task.ticket_number}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Nama Pelapor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.profiles?.full_name || "Masyarakat"}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Jenis Kerusakan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.damage_type || task.category}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Tingkat / Prioritas:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80">
                    {task.damage_level || "Sedang"}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/80">
                    {task.priority || "Sedang"}
                  </span>
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Tanggal Ditugaskan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.verified_at ? formatDateTime(task.verified_at) : formatDateTime(task.created_at)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Target Selesai:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.target_date ? formatDateTime(task.target_date) : "Tepat Waktu"}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Tanggal Selesai:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {task.completed_at ? formatDateTime(task.completed_at) : "Sudah Selesai"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card Alur Riwayat Penugasan */}
          <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Alur Riwayat Penugasan
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Rekam jejak pengerjaan perbaikan jalan ini.
              </p>
            </div>

            <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border pl-1">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Laporan Diverifikasi Admin
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {task.verified_at ? formatDateTimeWithHours(task.verified_at) : formatDateTime(task.created_at)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Admin menugaskan lokasi jalan ini kepada Anda untuk penanganan lapangan.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs ring-4 ring-white dark:ring-slate-900">
                  <Wrench className="w-3 h-3" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Pengerjaan di Lapangan Tuntas
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {task.completed_at ? formatDateTimeWithHours(task.completed_at) : "Pekerjaan Selesai"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Anda telah mengunggah foto bukti perbaikan dan catatan penyelesaian pekerjaan.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 relative">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ring-4 ring-white dark:ring-slate-900 ${
                    task.status === "resolved"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  <FileCheck className="w-3 h-3" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {task.status === "resolved"
                      ? "Disetujui Admin & Ditutup"
                      : "Menunggu Tinjauan Admin"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {task.status === "resolved"
                      ? "Laporan telah resmi ditutup"
                      : "Sedang dalam verifikasi akhir admin"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {task.status === "resolved"
                      ? "Hasil pekerjaan telah diverifikasi dinas dan dinilai memenuhi standar kualitas perbaikan jalan."
                      : "Admin dinas sedang memeriksa dokumentasi sebelum menutup tiket."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
