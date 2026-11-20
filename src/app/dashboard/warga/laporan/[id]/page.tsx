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
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  User,
  AlertCircle,
  FileText,
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
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Detail Laporan Warga",
};

// Helper kontras tinggi untuk badge tingkat kerusakan & prioritas
function DamageLevelBadge({ level }: { level?: string }) {
  const norm = (level || "Sedang").toLowerCase();
  if (norm.includes("ringan")) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/80 shadow-2xs">
        Ringan
      </span>
    );
  }
  if (norm.includes("berat")) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700/80 shadow-2xs">
        Berat
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80 shadow-2xs">
      Sedang
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const norm = (priority || "Sedang").toLowerCase();
  if (norm.includes("darurat") || norm.includes("tinggi")) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700/80 shadow-2xs">
        {priority || "Tinggi"}
      </span>
    );
  }
  if (norm.includes("rendah")) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-2xs">
        Rendah
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80 shadow-2xs">
      Sedang
    </span>
  );
}

export default async function WargaLaporanDetailPage({
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

  // Ambil detail pengaduan beserta data profil petugas
  const { data: complaintData, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
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

  if (error || !complaintData) {
    notFound();
  }

  const complaint = complaintData as any;

  return (
    <div className="space-y-6">
      {/* 1. Header Navigasi & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-3">
          {/* Tombol Kembali dengan Shape Pill Modern & Jarak Nyaman */}
          <div>
            <Link
              href="/dashboard/warga/laporan"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-muted/80 hover:text-[#0c3b37] dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {complaint.title}
            </h1>
            <p className="text-xs text-slate-400">
              Dilaporkan pada {formatDateTimeWithHours(complaint.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={complaint.status} />
          <ExportButton
            complaints={[complaint]}
            filename={`laporan-${complaint.ticket_number}`}
            label="Export Laporan"
          />
        </div>
      </div>

      {/* Banner Informasi Jika Laporan Ditolak / Tidak Valid */}
      {complaint.status === "rejected" && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 animate-in fade-in-50 duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Laporan Tidak Dapat Diproses / Ditolak
            </h3>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed whitespace-pre-line">
              {complaint.completion_note || "Laporan tidak memenuhi kriteria penanganan (kondisi jalan normal, foto tidak sesuai lokasi, atau laporan tidak valid)."}
            </p>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7 cols): Dokumentasi Foto, Peta, & Deskripsi */}
        <div className="lg:col-span-7 space-y-6">
          {/* Komparasi Foto Sebelum & Sesudah */}
          <Card className="rounded-xl p-5 sm:p-6 shadow-xs border border-border bg-card space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Dokumentasi Foto Lapangan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto Kondisi Awal */}
              <div className="space-y-2">
                <ImageLightboxModal
                  src={complaint.photo_url}
                  alt={complaint.title}
                  label="Foto Kondisi Awal Kerusakan"
                  badgeText="KONDISI AWAL"
                  badgeColor="amber"
                  heightClass="h-48 sm:h-52"
                  caption={`Foto bukti saat dilaporkan warga (${complaint.ticket_number})`}
                />
                <div className="text-[11px] text-slate-400">
                  Foto bukti saat dilaporkan warga (Klik untuk perbesar)
                </div>
              </div>

              {/* Foto Hasil Perbaikan */}
              <div className="space-y-2">
                {complaint.completion_photo_url ? (
                  <ImageLightboxModal
                    src={complaint.completion_photo_url}
                    alt="Hasil Perbaikan Jalan"
                    label="Foto Hasil Pekerjaan Perbaikan"
                    badgeText="SELESAI DIPERBAIKI"
                    badgeColor="emerald"
                    heightClass="h-48 sm:h-52"
                    caption={`Dokumentasi perbaikan selesai oleh tim dinas (${complaint.ticket_number})`}
                  />
                ) : (
                  <div className="w-full h-48 sm:h-52 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4 text-center">
                    <Clock className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Foto perbaikan belum tersedia
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Petugas akan mengunggah foto setelah pengerjaan selesai di lokasi.
                    </p>
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  {complaint.completed_at
                    ? `Selesai ${formatDateTime(complaint.completed_at)}`
                    : "Dokumentasi penyelesaian pekerjaan"}
                </div>
              </div>
            </div>
          </Card>

          {/* Lokasi & Peta Nyata */}
          <Card className="rounded-xl p-5 sm:p-6 shadow-xs border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#0c3b37] dark:text-emerald-400" />
                  <span>Lokasi Kejadian</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                  {complaint.address}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps?q=${complaint.latitude || -6.8915},${complaint.longitude || 107.5965}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Buka Peta ↗
              </a>
            </div>

            <RealMap
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              className="w-full h-52"
            />
          </Card>

          {/* Deskripsi & Catatan Petugas */}
          <Card className="rounded-xl p-5 sm:p-6 shadow-xs border border-border bg-card space-y-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Deskripsi Kerusakan dari Warga
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-border">
                {complaint.description}
              </p>
            </div>

            {complaint.completion_note && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${complaint.status === "rejected" ? "text-rose-700 dark:text-rose-400" : "text-emerald-800 dark:text-emerald-400"}`}>
                  {complaint.status === "rejected" ? "Catatan Penolakan Admin" : "Catatan Pengerjaan Petugas Lapangan"}
                </span>
                <p className={`text-xs leading-relaxed whitespace-pre-line p-3.5 rounded-lg border ${complaint.status === "rejected" ? "bg-rose-50/70 text-rose-950 dark:bg-rose-950/30 dark:text-rose-200 border-rose-200 dark:border-rose-800/50" : "bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800/50"}`}>
                  {complaint.completion_note}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* KOLOM KANAN (5 cols): Rincian Tiket & Timeline Status Alur */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Rincian Penanganan */}
          <Card className="rounded-xl p-5 sm:p-6 shadow-xs border border-border bg-card space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Rincian Penanganan
            </h2>

            <div className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Nomor Tiket:</span>
                <span className="font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                  {complaint.ticket_number}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Jenis Kerusakan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {complaint.damage_type || complaint.category}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Tingkat Kerusakan:</span>
                <DamageLevelBadge level={complaint.damage_level} />
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Prioritas Penanganan:</span>
                <PriorityBadge priority={complaint.priority} />
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Petugas Ditugaskan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {complaint.assigned_officer?.full_name || (complaint.status === "rejected" ? "Tidak Ditugaskan (Ditolak)" : "Menunggu Penugasan")}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Target Penyelesaian:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {complaint.status === "rejected" ? "-" : complaint.target_date ? formatDateTime(complaint.target_date) : "2-3 Hari"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card Alur Timeline Transparan */}
          <Card className="rounded-xl p-5 sm:p-6 shadow-xs border border-border bg-card space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Alur Penanganan Transparan
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Setiap tahapan penanganan tercatat secara otomatis.
              </p>
            </div>

            <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-1">
              {/* Step 1: Diterima */}
              <div className="flex items-start gap-3.5 relative">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Laporan Diterima Sistem
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {formatDateTimeWithHours(complaint.created_at)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Laporan berhasil dikirim dan masuk ke antrean verifikasi dinas.
                  </p>
                </div>
              </div>

              {/* Step 2: Diverifikasi atau Ditolak */}
              <div className="flex items-start gap-3.5 relative">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ring-4 ring-white dark:ring-slate-900 ${
                    complaint.status === "rejected"
                      ? "bg-rose-600 text-white"
                      : complaint.status !== "pending"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {complaint.status === "rejected" ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div
                    className={`text-xs font-bold ${
                      complaint.status === "rejected"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {complaint.status === "rejected"
                      ? "Laporan Ditolak Admin"
                      : "Diverifikasi & Ditugaskan"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {complaint.verified_at
                      ? formatDateTimeWithHours(complaint.verified_at)
                      : complaint.status === "rejected"
                      ? "Diverifikasi & ditolak oleh admin"
                      : complaint.status !== "pending"
                      ? "Admin memverifikasi bukti foto"
                      : "Menunggu verifikasi admin"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {complaint.status === "rejected"
                      ? complaint.completion_note || "Laporan tidak valid atau tidak ditemukan kerusakan di lapangan."
                      : complaint.assigned_officer?.full_name
                      ? `Ditugaskan kepada ${complaint.assigned_officer.full_name} (Tim Lapangan)`
                      : "Admin memeriksa keabsahan foto dan koordinat jalan."}
                  </p>
                </div>
              </div>

              {/* Step 3: Pengerjaan */}
              <div className="flex items-start gap-3.5 relative">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ring-4 ring-white dark:ring-slate-900 ${
                    complaint.status === "rejected"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                      : complaint.status === "in_progress" ||
                        complaint.status === "under_review" ||
                        complaint.status === "resolved"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  <Wrench className="w-3 h-3" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Pengerjaan di Lapangan
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {complaint.status === "rejected"
                      ? "Dibatalkan"
                      : complaint.status === "in_progress"
                      ? "Sedang dikerjakan sekarang"
                      : complaint.status === "under_review" || complaint.status === "resolved"
                      ? "Pekerjaan lapangan selesai"
                      : "Menunggu penanganan petugas"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {complaint.status === "rejected"
                      ? "Pengerjaan tidak dilakukan karena laporan ditolak."
                      : "Petugas satgas dinas PU melakukan penambalan dan perataan aspal di lokasi."}
                  </p>
                </div>
              </div>

              {/* Step 4: Finalisasi */}
              <div className="flex items-start gap-3.5 relative">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ring-4 ring-white dark:ring-slate-900 ${
                    complaint.status === "resolved"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {complaint.status === "rejected" ? "Selesai Ditolak" : "Perbaikan Selesai & Ditutup"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {complaint.status === "rejected"
                      ? "Tiket ditutup"
                      : complaint.completed_at
                      ? formatDateTimeWithHours(complaint.completed_at)
                      : "Tahap finalisasi"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {complaint.status === "rejected"
                      ? "Laporan ditutup oleh admin sistem."
                      : "Dokumentasi perbaikan telah disetujui admin dan jalan kembali aman dilalui."}
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
