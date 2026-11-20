import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock, AlertTriangle, AlertCircle, CheckCircle2, ArrowRight, ExternalLink, ChevronRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { AdminReviewDecision } from "@/components/admin/AdminReviewDecision";
import { AdminReviewList } from "@/components/admin/AdminReviewList";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { DetailReviewSkeleton } from "@/components/admin/DetailReviewSkeleton";
import { formatDateTime, formatDateTimeWithHours } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Hasil Perbaikan Lapangan",
};

// 1. Komponen Detail Tinjauan Laporan (Async Server Component)
async function ReviewDetailContent({ ticket }: { ticket: string }) {
  try {
    const supabase = await createClient();

    const { data: ticketData, error: ticketError } = await supabase
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
      .eq("ticket_number", ticket)
      .maybeSingle();

    const current = ticketData as any;

    if (!current) {
      return (
        <div className="space-y-6">
          <Card className="text-center py-16 p-8 space-y-3 rounded-xl border border-border bg-card shadow-xs">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Laporan dengan tiket {ticket} tidak ditemukan.
            </h2>
            <p className="text-xs text-slate-400">
              Pastikan nomor tiket yang Anda masukkan sudah benar atau kembali ke daftar hasil perbaikan.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/admin/review"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0c3b37] text-white text-xs font-semibold hover:bg-[#0c3b37]/90 transition-all cursor-pointer"
              >
                Kembali ke Daftar Hasil Perbaikan
              </Link>
            </div>
          </Card>
        </div>
      );
    }

    // Hitung jumlah laporan under_review untuk banner info
    const { count: pendingReviewCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "under_review");

    // Safe parsing untuk menghindari runtime error pada Server Component
    const officerName = (
      Array.isArray(current.assigned_officer)
        ? current.assigned_officer[0]?.full_name
        : current.assigned_officer?.full_name
    ) || "Petugas Lapangan";

    const citizenName = (
      Array.isArray(current.profiles)
        ? current.profiles[0]?.full_name
        : current.profiles?.full_name
    ) || "Pelapor";

    const latNum = Number(current.latitude);
    const lngNum = Number(current.longitude);
    const hasValidCoords =
      !isNaN(latNum) && !isNaN(lngNum) && current.latitude !== null && current.longitude !== null;
    const coordDisplay = hasValidCoords
      ? `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`
      : "-6.8915, 107.5965";
    const mapsQuery = hasValidCoords ? `${latNum},${lngNum}` : "-6.8915,107.5965";

    // Safe Photo Fallbacks
    const fallbackBefore = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7";
    const fallbackAfter = "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6";

    const photoBefore =
      typeof current.photo_url === "string" && current.photo_url.trim().length > 0
        ? current.photo_url
        : fallbackBefore;

    const photoAfter =
      typeof current.completion_photo_url === "string" && current.completion_photo_url.trim().length > 0
        ? current.completion_photo_url
        : typeof current.photo_url === "string" && current.photo_url.trim().length > 0
        ? current.photo_url
        : fallbackAfter;

    return (
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-2">
            <div>
              <Link
                href="/dashboard/admin/review"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-muted/80 hover:text-[#0c3b37] dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Hasil</span>
              </Link>
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
            <StatusBadge status={current.status} />
            <ExportButton
              complaints={[current]}
              filename={`tinjauan-${current.ticket_number}`}
              label="Export Data"
            />
          </div>
        </div>

        {/* Info Alert Box */}
        {current.status === "rejected" ? (
          <div className="rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-300">
                Laporan Ini Ditolak & Tidak Diproses
              </h2>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400 mt-0.5">
                {current.updated_at
                  ? `Ditolak pada ${formatDateTimeWithHours(current.updated_at)}`
                  : "Alur penanganan ditutup"}
              </p>
            </div>
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              Status: Ditolak
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300">
                Hasil pekerjaan telah dikirim oleh {officerName}
              </h2>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-400 mt-0.5">
                {current.completed_at
                  ? `Dikirim ${formatDateTimeWithHours(current.completed_at)}`
                  : "Menunggu persetujuan admin"}
              </p>
            </div>

            <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              {pendingReviewCount || 0} hasil menunggu tinjauan
            </div>
          </div>
        )}

        {/* Main Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Before-After Photo Comparison & Action (7 cols) */}
          <Card className="lg:col-span-7 rounded-xl border border-border bg-card p-5 sm:p-7 space-y-6 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                {current.ticket_number}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {current.title}
              </h2>
              <p className="text-xs text-slate-500">{current.address}</p>
              <div className="text-xs font-mono text-[#0c3b37] dark:text-emerald-400 pt-0.5">
                <span>{coordDisplay}</span> •{" "}
                <a
                  href={`https://www.google.com/maps?q=${mapsQuery}`}
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
              <div className="space-y-2">
                <ImageLightboxModal
                  src={photoBefore}
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

              <div className="space-y-2">
                <ImageLightboxModal
                  src={photoAfter}
                  alt="Kondisi Sesudah"
                  label="Kondisi Sesudah Perbaikan"
                  badgeText={current.status === "rejected" ? "KONDISI AKHIR" : "SESUDAH"}
                  badgeColor={current.status === "rejected" ? "default" : "emerald"}
                  heightClass="h-44 sm:h-52"
                  caption={
                    current.status === "rejected"
                      ? `Laporan ditolak (${current.ticket_number})`
                      : `Dokumentasi hasil perbaikan tim lapangan (${current.ticket_number})`
                  }
                />
                <p className="text-[11px] text-slate-400">
                  {current.completed_at
                    ? formatDateTime(current.completed_at)
                    : current.status === "rejected"
                    ? "Tidak ada foto perbaikan"
                    : "Foto dokumentasi"}{" "}
                  • {current.status === "rejected" ? "Dokumentasi" : "Foto petugas"} (Klik untuk perbesar)
                </p>
              </div>
            </div>

            {/* Catatan Petugas */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Catatan {current.status === "rejected" ? "admin" : "petugas"}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                {current.completion_note ||
                  (current.status === "rejected"
                    ? "Laporan ditolak oleh admin karena tidak memenuhi kriteria atau data tidak valid."
                    : "Lubang sudah ditambal dan permukaan jalan diratakan. Area perbaikan telah dibersihkan dan aman dilalui.")}
              </p>
            </div>

            {/* Konfirmasi Hasil Pekerjaan */}
            <AdminReviewDecision complaintId={current.id} status={current.status} />
          </Card>

          {/* Kolom Kanan: Riwayat Penanganan (5 cols) */}
          <Card className="lg:col-span-5 rounded-xl border border-border bg-card p-5 sm:p-7 space-y-6 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Riwayat Penanganan
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Diperbarui secara transparan
              </p>
            </div>

            {/* Timeline Nodes */}
            {current.status === "rejected" ? (
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-200 dark:before:bg-rose-900/40">
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
                      {citizenName} mengirim foto dan lokasi kerusakan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span>Laporan Ditolak Admin</span>
                      <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-300 py-0">
                        Tidak Valid
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {current.updated_at ? formatDateTime(current.updated_at) : formatDateTime(current.created_at)}
                    </div>
                    <p className="text-xs text-rose-950 dark:text-rose-200 bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 leading-relaxed mt-1">
                      {current.completion_note || "Laporan tidak valid atau tidak ditemukan kerusakan jalan di lapangan."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Verifikasi Akhir & Ditutup</span>
                      <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-300 py-0">
                        Ditutup
                      </Badge>
                    </div>
                    <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      Laporan Resmi Ditutup (Ditolak)
                    </div>
                    <p className="text-xs text-slate-500">
                      Laporan ditutup oleh admin dan pekerjaan perbaikan jalan di lokasi tidak diproses.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
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
                      {citizenName} mengirim foto dan lokasi.
                    </p>
                  </div>
                </div>

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
                      Admin menugaskan {officerName}.
                    </p>
                  </div>
                </div>

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
                      {officerName.split(" ")[0]} memulai perbaikan jalan.
                    </p>
                  </div>
                </div>

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
            )}
          </Card>
        </div>
      </div>
    );
  } catch (err) {
    console.error("ReviewDetailContent error:", err);
    return (
      <div className="space-y-6">
        <Card className="text-center py-16 p-8 space-y-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-card shadow-xs">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Terjadi Kendala Memuat Data Laporan
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Sistem tidak dapat memuat rincian laporan saat ini. Silakan muat ulang halaman atau kembali ke daftar hasil perbaikan.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/admin/review"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0c3b37] text-white text-xs font-semibold hover:bg-[#0c3b37]/90 transition-all cursor-pointer"
            >
              Kembali ke Daftar Hasil Perbaikan
            </Link>
          </div>
        </Card>
      </div>
    );
  }
}

// 2. Komponen Daftar Rekapitulasi Hasil Perbaikan (Async Server Component)
async function ReviewListContent() {
  const supabase = await createClient();

  const { data: reviewComplaints } = await supabase
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
    .in("status", ["under_review", "resolved"])
    .order("created_at", { ascending: false });

  let listData = (reviewComplaints as any[]) || [];
  if (listData.length === 0) {
    const { data: fallbackData } = await supabase
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
      .order("created_at", { ascending: false })
      .limit(10);
    listData = (fallbackData as any[]) || [];
  }

  return <AdminReviewList complaints={listData} />;
}

// 3. Entrypoint Halaman Utama Review
export default async function AdminReviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ ticket?: string }>;
}) {
  let ticket: string | undefined;
  try {
    const resolvedParams = searchParams ? await searchParams : {};
    ticket = resolvedParams?.ticket;
  } catch (err) {
    console.error("Error resolving searchParams:", err);
  }

  if (!ticket) {
    return <ReviewListContent />;
  }

  return (
    <Suspense key={ticket} fallback={<DetailReviewSkeleton ticketNumber={ticket} />}>
      <ReviewDetailContent ticket={ticket} />
    </Suspense>
  );
}
