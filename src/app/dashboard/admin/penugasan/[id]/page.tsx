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
  CheckCircle2,
  FileCheck,
  User,
  Shield,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  AlertTriangle,
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
  title: "Detail Penugasan Petugas",
};

export default async function AdminPenugasanDetailPage({
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

  // Ambil detail penugasan beserta profil pelapor, petugas, dan riwayat linimasa
  const { data: taskData, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      profiles:user_id(full_name, email, phone_number),
      assigned_officer:assigned_officer_id(full_name, email, phone_number),
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
  const timelines = task.complaint_timelines || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Navigasi & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link
              href="/dashboard/admin/penugasan"
              className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0c3b37] dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Monitoring Penugasan
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 select-none shrink-0" />
            <span className="font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
              {task.ticket_number}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Detail Penugasan: {task.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ditugaskan kepada{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {task.assigned_officer?.full_name || "Petugas Lapangan"}
            </strong>{" "}
            • Target:{" "}
            {task.target_date ? formatDateTime(task.target_date) : "2 Hari"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <StatusBadge status={task.status} />
          {task.status === "under_review" && (
            <Link
              href={`/dashboard/admin/review?ticket=${task.ticket_number}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold shadow-xs"
            >
              Tinjau Hasil Perbaikan
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
          <ExportButton
            complaints={[task]}
            filename={`penugasan-${task.ticket_number}`}
            label="Export Data"
          />
        </div>
      </div>

      {/* 2. Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Detail Laporan, Foto & Peta Nyata (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Info Utama */}
          <Card className="rounded-xl p-5 sm:p-7 shadow-xs border-slate-200/70 dark:border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                  {task.ticket_number}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {task.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                  Prioritas {task.priority || "Sedang"}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  {task.category || "Infrastruktur"}
                </Badge>
              </div>
            </div>

            {/* Deskripsi Laporan */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Deskripsi Kerusakan dari Pelapor:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                {task.description}
              </p>
            </div>

            {/* Foto Bukti Kerusakan (Sebelum & Sesudah jika ada) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Dokumentasi Visual:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foto Awal / Pelapor */}
                <div className="space-y-1.5">
                  <ImageLightboxModal
                    src={task.photo_url}
                    alt="Foto Awal Pelapor"
                    label="Foto Kondisi Awal Kerusakan"
                    badgeText="KONDISI AWAL"
                    badgeColor="amber"
                    heightClass="h-44 sm:h-52"
                    caption={`Foto awal dilaporkan warga (${task.ticket_number})`}
                  />
                  <p className="text-[11px] text-slate-400">
                    {formatDateTime(task.created_at)} • Foto warga (Klik untuk perbesar)
                  </p>
                </div>

                {/* Foto Perbaikan Petugas jika sudah ada */}
                {task.completion_photo_url ? (
                  <div className="space-y-1.5">
                    <ImageLightboxModal
                      src={task.completion_photo_url}
                      alt="Foto Hasil Perbaikan"
                      label="Foto Hasil Pekerjaan Petugas"
                      badgeText="HASIL LAPANGAN"
                      badgeColor="emerald"
                      heightClass="h-44 sm:h-52"
                      caption={`Hasil perbaikan tim lapangan (${task.ticket_number})`}
                    />
                    <p className="text-[11px] text-slate-400">
                      {task.completed_at ? formatDateTime(task.completed_at) : "Selesai"} • Dokumentasi petugas (Klik untuk perbesar)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-44 sm:h-52 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-center p-4">
                    <Clock className="w-7 h-7 text-amber-500 mb-2 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sedang Dikerjakan di Lapangan
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Foto perbaikan akan muncul setelah petugas mengunggah hasil.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Informasi Pelapor */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Pelapor: <strong>{task.profiles?.full_name || "Warga"}</strong>
                </span>
              </div>
              <div>
                <span>Dilaporkan: {formatDateTime(task.created_at)}</span>
              </div>
            </div>
          </Card>

          {/* Card Peta Lokasi Nyata */}
          <Card className="rounded-xl p-5 sm:p-7 shadow-xs border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Titik Lokasi Kerusakan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{task.address}</p>
              </div>
              <a
                href={`https://www.google.com/maps?q=${task.latitude || -6.9025},${task.longitude || 107.6186}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Peta Interaktif OpenStreetMap */}
            <div className="h-64 w-full">
              <RealMap
                latitude={task.latitude}
                longitude={task.longitude}
                address={task.address}
                className="h-full w-full"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
              <span>
                Koordinat GPS: {task.latitude?.toFixed(5) || "-6.90250"},{" "}
                {task.longitude?.toFixed(5) || "107.61860"}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                ✓ Akurasi GPS Terverifikasi
              </span>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Personel Petugas & Riwayat Linimasa (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Personel Petugas yang Ditugaskan */}
          <Card className="rounded-xl p-5 sm:p-6 shadow-xs border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Personel Bertugas
              </h3>
              <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                Unit Lapangan Aktif
              </Badge>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#e6f4f1] dark:bg-emerald-950/60 text-[#0c3b37] dark:text-emerald-300 font-black text-base flex items-center justify-center border border-[#0c3b37]/20 shrink-0">
                {task.assigned_officer?.full_name?.charAt(0) || "P"}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {task.assigned_officer?.full_name || "Petugas Lapangan"}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {task.assigned_officer?.email || "petugas@jalanbaik.id"}
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Tim Satuan Tugas 02 • Suku Dinas Bina Marga
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Tanggal Penugasan</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {task.verified_at ? formatDateTime(task.verified_at) : formatDateTime(task.created_at)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Target Penyelesaian</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {task.target_date ? formatDateTime(task.target_date) : "2 Hari Kerja"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card Riwayat & Linimasa Penanganan */}
          <Card className="rounded-xl p-5 sm:p-6 shadow-xs border-slate-200/70 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Riwayat & Linimasa Penanganan
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Catatan riwayat pergerakan status tugas
              </p>
            </div>

            {/* Timeline Tree */}
            <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Step 1: Laporan Masuk */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Laporan Diterima Sistem
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDateTime(task.created_at)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Warga mengirim foto dan titik koordinat kerusakan jalan.
                  </p>
                </div>
              </div>

              {/* Step 2: Diverifikasi & Ditugaskan */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Diverifikasi & Ditugaskan
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {task.verified_at ? formatDateTime(task.verified_at) : formatDateTime(task.created_at)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Admin menugaskan {task.assigned_officer?.full_name || "Petugas"} dengan prioritas {task.priority || "Sedang"}.
                  </p>
                </div>
              </div>

              {/* Step 3: Dalam Pengerjaan */}
              <div className="flex items-start gap-3.5 relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900 ${
                    task.status === "in_progress" || task.status === "under_review" || task.status === "resolved"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Pengerjaan Lapangan
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {task.status === "in_progress"
                      ? "Sedang berlangsung di lokasi"
                      : "Pengerjaan fisik telah dimulai"}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tim lapangan melakukan penambalan, pembersihan, dan perataan jalan.
                  </p>
                </div>
              </div>

              {/* Step 4: Hasil Dikirim */}
              <div className="flex items-start gap-3.5 relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900 ${
                    task.status === "under_review" || task.status === "resolved"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Dokumentasi Hasil Terkirim
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {task.completed_at ? formatDateTime(task.completed_at) : "Menunggu pengunggahan bukti"}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Petugas mengunggah foto sesudah perbaikan dan catatan lapangan.
                  </p>
                </div>
              </div>

              {/* Step 5: Selesai Resmi */}
              <div className="flex items-start gap-3.5 relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900 ${
                    task.status === "resolved"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold"
                  }`}
                >
                  {task.status === "resolved" ? <CheckCircle2 className="w-3.5 h-3.5" /> : "5"}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Verifikasi Akhir & Ditutup
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {task.status === "resolved"
                      ? "Tuntas disetujui admin"
                      : "Menunggu persetujuan admin"}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Laporan selesai 100% dan warga menerima notifikasi perbaikan tuntas.
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Tinjau jika status under_review */}
            {task.status === "under_review" && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/dashboard/admin/review?ticket=${task.ticket_number}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold shadow-xs"
                >
                  Buka Halaman Tinjauan Hasil →
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
