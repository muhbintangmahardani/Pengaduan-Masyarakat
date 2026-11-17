import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Navigation, ArrowRight, ExternalLink, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/common/StatusBadge";
import { OfficerWorkSubmission } from "@/components/officer/OfficerWorkSubmission";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Tugas Lapangan",
};

export default async function PetugasDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const officerName = profile?.full_name || "Petugas Lapangan";

  // Ambil laporan yang ditugaskan ke petugas ini atau semua in_progress/under_review
  let query = supabase
    .from("complaints")
    .select(
      `
      *,
      profiles:user_id(full_name, email)
    `
    )
    .in("status", ["in_progress", "verified", "under_review", "pending"])
    .order("created_at", { ascending: false });

  if (ticket) {
    query = query.eq("ticket_number", ticket);
  }

  const { data: tasksData } = await query;
  const tasks = (tasksData as any[]) || [];

  // Ambil tugas yang aktif
  const currentTask =
    tasks.find(
      (t) => t.assigned_officer_id === user.id || t.status === "in_progress"
    ) || tasks[0];

  if (!currentTask) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-16 p-8 space-y-3 rounded-xl border-slate-200/70 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Tidak ada tugas lapangan yang aktif saat ini.
          </h2>
          <p className="text-xs text-slate-400">
            Ketika admin menugaskan perbaikan jalan baru, detail tugas akan muncul di sini secara otomatis.
          </p>
        </Card>
      </div>
    );
  }

  const isAlreadySubmitted = currentTask.status === "under_review" || currentTask.status === "resolved";

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          {/* Breadcrumb Matching Mockup 4 */}
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
            <Link href="/dashboard/petugas" className="hover:text-[#0c3b37] transition-colors">
              Tugas saya
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 select-none shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono">
              {currentTask.ticket_number}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Tuntaskan Perbaikan, Kirim Buktinya
          </h1>
          <p className="text-xs text-slate-500">
            Pastikan hasil pekerjaan terdokumentasi dengan jelas sebelum dikirim ke admin.
          </p>
        </div>

        <StatusBadge status={currentTask.status} />
      </div>

      {/* Horizontal Workflow Stepper Bar matching Image 4 */}
      <Card className="rounded-xl p-4 sm:p-5 shadow-xs border-slate-200/70 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between text-xs font-semibold gap-4 min-w-[550px]">
          {/* Step 1 */}
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Ditugaskan</span>
          </div>

          <span className="text-slate-300">→</span>

          {/* Step 2 */}
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Diterima petugas</span>
          </div>

          <span className="text-slate-300">→</span>

          {/* Step 3 (Active) */}
          <div
            className={`flex items-center gap-2 ${
              currentTask.status === "in_progress"
                ? "text-[#0c3b37] dark:text-emerald-300 font-bold"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#0c3b37] text-white flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Pengerjaan</span>
          </div>

          <span className="text-slate-300">→</span>

          {/* Step 4 */}
          <div
            className={`flex items-center gap-2 ${
              currentTask.status === "under_review"
                ? "text-[#0c3b37] dark:text-emerald-300 font-bold"
                : "text-slate-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">
              4
            </span>
            <span>Tinjauan admin</span>
          </div>

          <span className="text-slate-300">→</span>

          {/* Step 5 */}
          <div
            className={`flex items-center gap-2 ${
              currentTask.status === "resolved"
                ? "text-emerald-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">
              5
            </span>
            <span>Selesai</span>
          </div>
        </div>
      </Card>

      {/* Main Two Columns matching Image 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Info Tugas & Lokasi (5 cols) */}
        <Card className="lg:col-span-5 rounded-xl p-5 sm:p-7 space-y-6 shadow-xs border-slate-200/70 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
              {currentTask.ticket_number}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {currentTask.title}
            </h2>
            <p className="text-xs text-slate-400">
              Ditugaskan oleh Admin Dinas PU
            </p>
          </div>

          {/* Foto Kondisi Awal with Lightbox */}
          <div className="space-y-1.5">
            <ImageLightboxModal
              src={currentTask.photo_url}
              alt="Kondisi Awal"
              label="Foto Kondisi Awal Kerusakan"
              badgeText="KONDISI AWAL"
              badgeColor="amber"
              heightClass="h-48"
              caption={`Foto kondisi jalan saat pertama dilaporkan warga (${currentTask.ticket_number})`}
            />
            <p className="text-[11px] text-slate-400">
              Klik foto untuk melihat ukuran penuh
            </p>
          </div>

          {/* Lokasi Perbaikan & Navigasi */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              LOKASI PERBAIKAN
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {currentTask.address}
            </p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${currentTask.latitude || -6.8915},${currentTask.longitude || 107.5965}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline pt-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              Buka navigasi GPS ↗
            </a>
          </div>

          {/* Rincian Penugasan */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Target selesai</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentTask.target_date
                  ? formatDateTime(currentTask.target_date)
                  : "16 November 2026"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Prioritas</span>
              <Badge variant="outline" className="font-semibold text-amber-700 bg-amber-50">
                {currentTask.priority || "Sedang"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Petugas</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {officerName}
              </span>
            </div>
          </div>
        </Card>

        {/* Kolom Kanan: Form Kirim Bukti Hasil Pekerjaan (7 cols) */}
        <div className="lg:col-span-7">
          <OfficerWorkSubmission
            complaintId={currentTask.id}
            isAlreadySubmitted={isAlreadySubmitted}
            existingPhotoUrl={currentTask.completion_photo_url}
            existingNote={currentTask.completion_note}
          />
        </div>
      </div>
    </div>
  );
}
