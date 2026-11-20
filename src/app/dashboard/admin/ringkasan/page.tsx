import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardWelcomeHero } from "@/components/dashboard/DashboardWelcomeHero";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { RecentComplaintsGrid } from "@/components/dashboard/RecentComplaintsGrid";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import { ExportButton } from "@/components/common/ExportButton";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Complaint, Profile } from "@/types";

export const metadata: Metadata = {
  title: "Ringkasan Eksekutif",
};

export default async function AdminRingkasanPage() {
  const supabase = await createClient();

  const [complaintsRes, officersRes, userRes] = await Promise.all([
    supabase
      .from("complaints")
      .select("*, profiles:user_id(full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "officer"),
    supabase.auth.getUser(),
  ]);

  const complaints = (complaintsRes.data as Complaint[]) || [];
  const officers = (officersRes.data as Profile[]) || [];
  const userName = userRes.data?.user?.email?.split("@")[0] || "Administrator";

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const inProgress = complaints.filter(
    (c) => c.status === "in_progress" || c.status === "verified"
  ).length;
  const underReview = complaints.filter((c) => c.status === "under_review").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Civora Welcome & SLA Overview Banner */}
      <DashboardWelcomeHero
        userName={userName}
        role="admin"
        ctaText="Kelola Antrean Masuk"
        ctaHref="/dashboard/admin"
        latestComplaint={complaints[0] || null}
        totalPending={pending}
        totalResolved={resolved}
      />

      {/* 2. 4 Metric Cards (Shadcn UI Card Minimalis) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <DashboardMetricCard
          label="Total Laporan"
          count={total}
          icon={FileText}
          variant="slate"
          description="Semua aduan terdata"
          href="/dashboard/admin"
        />
        <DashboardMetricCard
          label="Perlu Verifikasi"
          count={pending}
          icon={Clock}
          variant="amber"
          description="Menunggu disposisi"
          href="/dashboard/admin"
        />
        <DashboardMetricCard
          label="Sedang Dikerjakan"
          count={inProgress + underReview}
          icon={TrendingUp}
          variant="blue"
          description="Tim bergerak di lokasi"
          href="/dashboard/admin/penugasan"
        />
        <DashboardMetricCard
          label="Selesai Ditutup"
          count={resolved}
          icon={CheckCircle2}
          variant="emerald"
          description="Tuntas disetujui dinas"
          href="/dashboard/admin/review"
        />
      </div>

      {/* 3. Main Two-Column Layout (Civora Style: 8-cols Left Cards + 4-cols Right Activity - 100% Sejajar Presisi) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <RecentComplaintsGrid
            complaints={complaints}
            role="admin"
            title="Antrean Laporan & Penugasan Terbaru"
            viewAllHref="/dashboard/admin"
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <RecentActivityTimeline complaints={complaints} role="admin" externalHeader={true} limit={4} />
        </div>
      </div>

      {/* 4. Personel Petugas Lapangan Siaga */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Kesiapan Personel Lapangan ({officers.length} Tim Siaga)
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              Daftar petugas teknis siap penugasan perbaikan jalan kota.
            </CardDescription>
          </div>

          <ExportButton
            complaints={complaints}
            filename="rekap-pengaduan-jalan-admin"
            label="Export Data Rekap"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {officers.map((officer) => (
            <div
              key={officer.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {officer.full_name}
                </div>
                <div className="text-[10px] text-slate-400">{officer.email}</div>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
              >
                Siap Tugas
              </Badge>
            </div>
          ))}

          {officers.length === 0 && (
            <div className="col-span-full text-center py-6 text-xs text-slate-400">
              Belum ada data petugas lapangan terdaftar.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
