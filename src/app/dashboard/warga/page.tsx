import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardWelcomeHero } from "@/components/dashboard/DashboardWelcomeHero";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { ComplaintStatsChart } from "@/components/dashboard/ComplaintStatsChart";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import { CitizenComplaintsList } from "@/components/citizen/CitizenComplaintsList";
import { FileText, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
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

  const fullName = profileRes.data?.full_name || "Warga";
  const complaints = (complaintsRes.data as Complaint[]) || [];

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "in_progress" || c.status === "under_review" || c.status === "verified"
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* 1. Shadcn Welcome Hero Banner */}
      <DashboardWelcomeHero
        userName={fullName}
        role="citizen"
        ctaText="Buat Laporan Baru"
        ctaHref="/dashboard/warga/buat"
        latestComplaint={complaints[0] || null}
        totalPending={pendingCount}
        totalResolved={resolvedCount}
      />

      {/* 2. 4 Metric Cards (Shadcn UI Card Minimalis & Elegan) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <DashboardMetricCard
          label="Total Laporan"
          count={totalCount}
          icon={FileText}
          variant="slate"
          description="Semua aduan Anda"
          href="/dashboard/warga/laporan"
        />
        <DashboardMetricCard
          label="Menunggu Verifikasi"
          count={pendingCount}
          icon={Clock}
          variant="amber"
          description="Antrean tinjauan dinas"
          href="/dashboard/warga/laporan"
        />
        <DashboardMetricCard
          label="Sedang Dikerjakan"
          count={inProgressCount}
          icon={TrendingUp}
          variant="blue"
          description="Ditangani tim lapangan"
          href="/dashboard/warga/laporan"
        />
        <DashboardMetricCard
          label="Selesai Diperbaiki"
          count={resolvedCount}
          icon={CheckCircle2}
          variant="emerald"
          description="Jalan tuntas diperbaiki"
          href="/dashboard/warga/laporan"
        />
      </div>

      {/* 3. Analytical Row: Left (8-cols Grafik Card) + Right (4-cols Linimasa Aktivitas) - 100% Sejajar Presisi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <ComplaintStatsChart className="h-full" />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <RecentActivityTimeline complaints={complaints} role="citizen" className="h-full" limit={4} />
        </div>
      </div>

      {/* 4. Tabel / Daftar Lengkap Pengaduan Warga */}
      <CitizenComplaintsList initialComplaints={complaints} />
    </div>
  );
}
