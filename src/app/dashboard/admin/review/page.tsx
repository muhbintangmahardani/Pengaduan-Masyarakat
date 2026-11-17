import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, AlertTriangle, ArrowRight, ExternalLink, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { AdminReviewDecision } from "@/components/admin/AdminReviewDecision";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { formatDateTime, formatDateTimeWithHours } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Tinjau Hasil Perbaikan",
};

export default async function AdminReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket } = await searchParams;
  const supabase = await createClient();

  // Ambil laporan yang berstatus 'under_review' atau 'resolved' atau yang pertama
  let query = supabase
    .from("complaints")
    .select(
      `
      *,
      profiles:user_id(full_name, email),
      assigned_officer:assigned_officer_id(full_name),
      complaint_timelines(
        id,
        status,
        note,
        created_at,
        actor:actor_id(full_name, role)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (ticket) {
    query = query.eq("ticket_number", ticket);
  }

  const { data: complaintsData } = await query;
  const complaints = (complaintsData as any[]) || [];

  // Cari yang under_review terlebih dahulu jika ada
  const current =
    complaints.find((c) => c.status === "under_review") || complaints[0];

  const pendingReviewCount = complaints.filter(
    (c) => c.status === "under_review"
  ).length;

  if (!current) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-16 p-8 space-y-3 rounded-xl border-slate-200/70 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Belum ada hasil perbaikan yang menunggu tinjauan.
          </h2>
          <p className="text-xs text-slate-400">
            Ketika petugas lapangan menyelesaikan perbaikan dan mengunggah foto bukti, laporan akan muncul di sini.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0c3b37] text-white text-xs font-semibold"
            >
              Kembali ke Laporan Masuk
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Tinjau Hasil Perbaikan Lapangan
          </h1>
          <p className="text-xs text-slate-500">
            Periksa dokumentasi bukti foto petugas sebelum menyetujui dan menutup laporan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={current.status} />
          <ExportButton
            complaints={[current]}
            filename={`tinjauan-${current.ticket_number}`}
            label="Export Data"
          />
        </div>
      </div>

      {/* Info Alert Box */}
      <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300">
            Hasil pekerjaan telah dikirim oleh{" "}
            {current.assigned_officer?.full_name || "Petugas Lapangan"}
          </h2>
          <p className="text-[11px] text-blue-700/80 dark:text-blue-400 mt-0.5">
            {current.completed_at
              ? `Dikirim ${formatDateTimeWithHours(current.completed_at)}`
              : "Menunggu persetujuan admin"}
          </p>
        </div>

        <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">
          {pendingReviewCount} hasil menunggu tinjauan
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Before-After Photo Comparison & Action (7 cols) */}
        <Card className="lg:col-span-7 rounded-xl p-5 sm:p-7 space-y-6 shadow-xs border-slate-200/70 dark:border-slate-800">
          {/* Header Info */}
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
              {current.ticket_number}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {current.title}
            </h2>
            <p className="text-xs text-slate-500">{current.address}</p>
            <div className="text-xs font-mono text-[#0c3b37] dark:text-emerald-400 pt-0.5">
              <span>
                {current.latitude && current.longitude
                  ? `${current.latitude.toFixed(4)}, ${current.longitude.toFixed(4)}`
                  : "-6.8915, 107.5965"}
              </span>{" "}
              •{" "}
              <a
                href={`https://www.google.com/maps?q=${current.latitude || -6.8915},${current.longitude || 107.5965}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Lihat lokasi ↗
              </a>
            </div>
          </div>

          {/* Side-by-side Photo Comparison with Lightbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foto SEBELUM (Foto pelapor) */}
            <div className="space-y-2">
              <ImageLightboxModal
                src={current.photo_url}
                alt="Kondisi Sebelum"
                label="Kondisi Sebelum Perbaikan"
                badgeText="SEBELUM"
                badgeColor="amber"
                heightClass="h-44 sm:h-52"
                caption={`Foto awal dilaporkan warga pada ${formatDateTime(current.created_at)}`}
              />
              <p className="text-[11px] text-slate-400">
                {formatDateTime(current.created_at)} • Foto pelapor (Klik untuk perbesar)
              </p>
            </div>

            {/* Foto SESUDAH (Foto petugas) */}
            <div className="space-y-2">
              <ImageLightboxModal
                src={current.completion_photo_url || current.photo_url}
                alt="Kondisi Sesudah"
                label="Kondisi Sesudah Perbaikan"
                badgeText="SESUDAH"
                badgeColor="emerald"
                heightClass="h-44 sm:h-52"
                caption={`Dokumentasi hasil perbaikan tim lapangan (${current.ticket_number})`}
              />
              <p className="text-[11px] text-slate-400">
                {current.completed_at
                  ? formatDateTime(current.completed_at)
                  : "Foto dokumentasi"}{" "}
                • Foto petugas (Klik untuk perbesar)
              </p>
            </div>
          </div>

          {/* Catatan Petugas */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Catatan petugas
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
              {current.completion_note ||
                "Lubang sudah ditambal dan permukaan jalan diratakan. Area perbaikan telah dibersihkan dan aman dilalui."}
            </p>
          </div>

          {/* Konfirmasi Hasil Pekerjaan */}
          <AdminReviewDecision complaintId={current.id} status={current.status} />
        </Card>

        {/* Kolom Kanan: Riwayat Penanganan (5 cols) */}
        <Card className="lg:col-span-5 rounded-xl p-5 sm:p-7 space-y-6 shadow-xs border-slate-200/70 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Riwayat Penanganan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Diperbarui secara transparan
            </p>
          </div>

          {/* Timeline Nodes */}
          <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {/* Step 1 */}
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Laporan diterima
                </div>
                <div className="text-[11px] text-slate-400">
                  {formatDateTime(current.created_at)}
                </div>
                <p className="text-xs text-slate-500">
                  {current.profiles?.full_name || "Pelapor"} mengirim foto dan lokasi.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Diverifikasi & ditugaskan
                </div>
                <div className="text-[11px] text-slate-400">
                  {current.verified_at
                    ? formatDateTime(current.verified_at)
                    : "14 Nov 2026 • 11.00"}
                </div>
                <p className="text-xs text-slate-500">
                  Admin menugaskan {current.assigned_officer?.full_name || "Tim Jalan 02"}.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Sedang dikerjakan
                </div>
                <div className="text-[11px] text-slate-400">
                  15 Nov 2026 • 08.30
                </div>
                <p className="text-xs text-slate-500">
                  {current.assigned_officer?.full_name?.split(" ")[0] || "Petugas"} memulai perbaikan jalan.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Hasil perbaikan dikirim
                </div>
                <div className="text-[11px] text-slate-400">
                  {current.completed_at
                    ? formatDateTime(current.completed_at)
                    : "16 Nov 2026 • 14.30"}
                </div>
                <p className="text-xs text-slate-500">
                  Foto hasil dikirim ke admin.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            {current.status === "resolved" ? (
              <div className="flex items-start gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>Perbaikan Selesai & Disetujui</span>
                    <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-800 border-emerald-300 py-0">
                      Tuntas
                    </Badge>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {current.updated_at ? formatDateTime(current.updated_at) : "Hari ini"} • Laporan Resmi Ditutup
                  </div>
                  <p className="text-xs text-slate-500">
                    Admin telah menyetujui hasil perbaikan. Laporan ditutup dan notifikasi konfirmasi dikirim ke warga.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-[#0c3b37] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold ring-4 ring-white dark:ring-slate-900 shadow-sm">
                  5
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Menunggu tinjauan admin
                  </div>
                  <div className="text-[11px] font-bold text-[#0c3b37] dark:text-emerald-400">
                    Tahap saat ini
                  </div>
                  <p className="text-xs text-slate-500">
                    Periksa bukti perbaikan dan klik setujui untuk menutup laporan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
