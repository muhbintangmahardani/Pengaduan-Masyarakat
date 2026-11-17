import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplaintStatsChart } from "@/components/dashboard/ComplaintStatsChart";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { formatDateTime } from "@/lib/utils";
import type { Complaint, Profile } from "@/types";

export const metadata: Metadata = {
  title: "Ringkasan Eksekutif",
};

export default async function AdminRingkasanPage() {
  const supabase = await createClient();

  const [complaintsRes, officersRes] = await Promise.all([
    supabase
      .from("complaints")
      .select("*, profiles:user_id(full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "officer"),
  ]);

  const complaints = (complaintsRes.data as Complaint[]) || [];
  const officers = (officersRes.data as Profile[]) || [];

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const inProgress = complaints.filter(
    (c) => c.status === "in_progress" || c.status === "verified"
  ).length;
  const underReview = complaints.filter((c) => c.status === "under_review").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ringkasan Eksekutif Pengaduan
          </h1>
          <p className="text-xs text-slate-500">
            Metrik operasional pemeliharaan jalan, penugasan petugas, dan waktu penyelesaian.
          </p>
        </div>

        <ExportButton
          complaints={complaints}
          filename="ringkasan-eksekutif-admin"
          label="Export Ringkasan"
        />
      </div>

      {/* 4 Minimalist Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Masuk</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {total}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Semua laporan warga</p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Perlu Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {pending}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Menunggu respon admin</p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sedang Dikerjakan</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {inProgress + underReview}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Dalam proses lapangan</p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Selesai Ditutup</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {resolved}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Perbaikan rampung</p>
        </Card>
      </div>

      {/* Real-time Trend Chart */}
      <ComplaintStatsChart />

      {/* Quick Status Breakdown & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Aktivitas Laporan Terbaru */}
        <Card className="lg:col-span-8 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Aktivitas Laporan Masuk Terkini
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                5 pengaduan terbaru dari masyarakat.
              </CardDescription>
            </div>
            <Link
              href="/dashboard/admin"
              className="text-xs font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Lihat semua antrean →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {complaints.slice(0, 5).map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                      {c.ticket_number}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                      {c.title}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate max-w-sm">
                    {c.address} • {formatDateTime(c.created_at)}
                  </p>
                </div>

                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Kolom Kanan: Tim Petugas Lapangan Aktif */}
        <Card className="lg:col-span-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Petugas Lapangan ({officers.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              Personel aktif siap ditugaskan.
            </CardDescription>
          </div>

          <div className="space-y-2.5">
            {officers.map((officer) => (
              <div
                key={officer.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {officer.full_name}
                  </div>
                  <div className="text-[10px] text-slate-400">{officer.email}</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">
                  Siap Tugas
                </Badge>
              </div>
            ))}
            {officers.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                Belum ada data petugas lapangan.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
