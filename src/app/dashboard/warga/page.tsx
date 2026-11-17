import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileText,
  Camera,
  MapPin,
  BellRing,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CitizenComplaintsList } from "@/components/citizen/CitizenComplaintsList";
import { ComplaintStatsChart } from "@/components/dashboard/ComplaintStatsChart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard Masyarakat",
};

export default async function WargaDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Optimasi: Ambil data profil & daftar laporan warga secara paralel
  const [profileRes, complaintsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("complaints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const firstName = profileRes.data?.full_name?.split(" ")[0] || "Warga";
  const complaints = (complaintsRes.data as Complaint[]) || [];

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "in_progress" || c.status === "under_review" || c.status === "verified"
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Sambutan & Tombol Buat Laporan Cepat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Selamat datang, {firstName}.
            </h1>
            <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-[#0c3b37] dark:text-emerald-300 border-0 text-[10px] font-bold">
              WARGA AKTIF
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Setiap laporanmu berarti untuk perjalanan warga yang lebih aman dan nyaman.
          </p>
        </div>

        <Link
          href="/dashboard/warga/buat"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0c3b37] hover:bg-[#082825] text-white font-semibold text-xs transition-all shadow-xs self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </Link>
      </div>

      {/* 2. Hero Banner (Refined with Subtle Border Radius, matching Mockup 1) */}
      <Card className="rounded-xl bg-[#0c3b37] border-0 text-white p-6 sm:p-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-md overflow-hidden relative">
        {/* Glow & subtle pattern accent */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="space-y-2 max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-emerald-300 text-[10px] uppercase font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Layanan Siaga 24 Jam
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Peduli jalannya. Bantu perubahan nyatanya.
          </h2>
          <p className="text-xs text-[#d1fae5]/85 leading-relaxed font-normal">
            Temukan jalan rusak di sekitarmu? Sertakan foto dan lokasi, petugas segera menindaklanjuti secara transparan.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-4 sm:p-5 min-w-[210px] z-10 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-[#d1fae5] tracking-widest uppercase">
            DI LINGKUNGAN KITA
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black text-white">128</span>
            <span className="text-xs text-[#d1fae5]/90 font-medium">
              jalan telah diperbaiki
            </span>
          </div>
          <div className="text-[10px] text-white/70 mt-0.5">
            Bersama warga sepanjang 2026
          </div>
        </div>
      </Card>

      {/* 3. 4 Stat Cards Minimalis & Elegan (Shadcn Card) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total */}
        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Total laporan</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {String(totalCount).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-slate-400">Semua laporan yang kamu kirim</div>
        </Card>

        {/* Card 2: Menunggu */}
        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1 hover:border-amber-200 dark:hover:border-amber-900 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Menunggu verifikasi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {String(pendingCount).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-slate-400">Sedang ditinjau oleh admin</div>
        </Card>

        {/* Card 3: Pengerjaan */}
        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Sedang dikerjakan</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {String(inProgressCount).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-slate-400">Petugas menangani di lapangan</div>
        </Card>

        {/* Card 4: Selesai */}
        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Selesai diperbaiki</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {String(resolvedCount).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-slate-400">Jalan kembali aman dilalui</div>
        </Card>
      </div>

      {/* 4. Edukasi Alur: 3 Langkah Mudah Lapor Jalan (Menarik & Edukatif) */}
      <Card className="p-5 sm:p-6 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Alur Penanganan Cepat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tiga langkah mudah membantu perbaikan jalan di kota Anda.
            </p>
          </div>
          <Link
            href="/dashboard/warga/buat"
            className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Mulai Lapor <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-[#e6f4f1] dark:bg-emerald-950/60 text-[#0c3b37] dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                1. Foto Kerusakan Jalan
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Ambil foto lubang, retakan, atau amblas secara jelas dari perangkat Anda.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-[#e6f4f1] dark:bg-emerald-950/60 text-[#0c3b37] dark:text-emerald-300 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                2. Lokasi Otomatis GPS
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Titik koordinat dan alamat terdeteksi instan via GPS saat tombol ditekan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-[#e6f4f1] dark:bg-emerald-950/60 text-[#0c3b37] dark:text-emerald-300 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                3. Pantau Real-time
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Notifikasi instan otomatis masuk saat petugas mulai dan menyelesaikan tugas.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Grafik Statistik Bulan Ini (Realtime Shadcn Chart) */}
      <ComplaintStatsChart />

      {/* 6. Daftar Laporan Saya Interaktif */}
      <CitizenComplaintsList initialComplaints={complaints} />
    </div>
  );
}
