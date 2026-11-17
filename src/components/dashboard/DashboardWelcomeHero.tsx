"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Complaint, ComplaintStatus, UserRole } from "@/types";

interface DashboardWelcomeHeroProps {
  userName: string;
  role: UserRole;
  ctaText?: string;
  ctaHref?: string;
  latestComplaint?: Complaint | null;
  totalPending?: number;
  totalResolved?: number;
}

export function DashboardWelcomeHero({
  userName,
  role,
  ctaText,
  ctaHref = "/dashboard/warga/buat",
  latestComplaint,
  totalPending = 0,
  totalResolved = 0,
}: DashboardWelcomeHeroProps) {
  const firstName = userName ? userName.split(" ")[0] : "Pengguna";

  const getDefaultCta = () => {
    if (role === "admin") {
      return { text: "Tinjau Laporan Masuk", href: "/dashboard/admin" };
    }
    if (role === "officer") {
      return { text: "Buka Tugas Lapangan", href: "/dashboard/petugas" };
    }
    return { text: "Buat Laporan Baru", href: "/dashboard/warga/buat" };
  };

  const defaultCta = getDefaultCta();
  const buttonText = ctaText || defaultCta.text;
  const buttonHref = ctaHref || defaultCta.href;

  const getSubHeadline = () => {
    if (role === "admin") {
      return "Kendali terpadu verifikasi laporan warga, penugasan petugas lapangan, dan monitoring SLA perbaikan jalan kota.";
    }
    if (role === "officer") {
      return "Daftar penugasan perbaikan jalan aktif, panduan rute GPS lokasi, dan pelaporan hasil foto penyelesaian tugas.";
    }
    return "Satu wadah transparansi penanganan jalan rusak: laporkan jalan berlubang, pantau status pengerjaan, dan kawal hasilnya.";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
      {/* 1. Panel Kiri (8 cols): Hero Welcome Banner Elegan */}
      <div className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-[#0c3b37] via-[#0f4b45] to-[#165a52] text-white p-6 sm:p-7 shadow-sm border border-emerald-900/40 relative overflow-hidden flex flex-col justify-between min-h-[230px]">
        {/* Glow & subtle abstract wave */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 w-60 h-60 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-[10px] uppercase font-bold tracking-wider border border-white/10">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>Platform Transparansi Jalan • Terpadu</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Selamat datang, {firstName}.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50/85 leading-relaxed font-normal">
              {getSubHeadline()}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 z-10">
          <Link
            href={buttonHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0c3b37] text-xs font-bold transition-all shadow-md active:scale-95 group cursor-pointer"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 2. Panel Kanan (4 cols): Quick Status & Indikator Kinerja (Relevan, Bebas QRCode) */}
      <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[230px]">
        {/* Header Widget */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {role === "citizen" ? "STATUS LAPORAN TERAKHIR" : "STATUS KESIAPAN DINAS"}
            </span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {role === "citizen" ? "Pemantauan Real-Time" : "Responsivitas Tim Lapangan"}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Aktif
          </span>
        </div>

        {/* Body Widget: Bervariasi sesuai role dan data terkini */}
        <div className="py-3 my-auto">
          {role === "citizen" && latestComplaint ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#0c3b37] dark:text-emerald-400 bg-[#e6f4f1] dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                  {latestComplaint.ticket_number}
                </span>
                <StatusBadge status={latestComplaint.status as ComplaintStatus} />
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {latestComplaint.title}
              </div>

              {/* Progress Mini Stepper */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Progres Penanganan</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {latestComplaint.status === "resolved"
                      ? "100% Selesai"
                      : latestComplaint.status === "under_review"
                      ? "80% Tinjauan"
                      : latestComplaint.status === "in_progress" || latestComplaint.status === "verified"
                      ? "50% Pengerjaan"
                      : "20% Terkirim"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      latestComplaint.status === "resolved"
                        ? "bg-emerald-500 w-full"
                        : latestComplaint.status === "under_review"
                        ? "bg-orange-500 w-4/5"
                        : latestComplaint.status === "in_progress" || latestComplaint.status === "verified"
                        ? "bg-sky-500 w-1/2"
                        : "bg-amber-500 w-1/5"
                    }`}
                  />
                </div>
              </div>
            </div>
          ) : role === "citizen" ? (
            <div className="space-y-1.5 py-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Belum Ada Aduan Baru</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Jalan di sekitar Anda rusak atau berlubang? Kirim laporan dengan foto dan koordinat GPS.
              </p>
            </div>
          ) : (
            // Admin / Officer Status Summary
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Antrean Verifikasi:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {totalPending} Tiket
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Tuntas Diperbaiki:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {totalResolved} Laporan
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">SLA Tanggap:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  &lt; 24 Jam
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Link Widget */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={
              role === "citizen" && latestComplaint
                ? `/dashboard/warga/laporan/${latestComplaint.id}`
                : role === "citizen"
                ? "/dashboard/warga/buat"
                : role === "admin"
                ? "/dashboard/admin"
                : "/dashboard/petugas"
            }
            className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center justify-between group"
          >
            <span>
              {role === "citizen" && latestComplaint
                ? "Lacak Progres Tiket Ini"
                : role === "citizen"
                ? "Laporkan Jalan Rusak"
                : "Buka Antrean Kerja"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
