import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardWelcomeHero } from "@/components/dashboard/DashboardWelcomeHero";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { RecentComplaintsGrid } from "@/components/dashboard/RecentComplaintsGrid";
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
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Civora-Style Top Welcome & Quick Status Banner (2 Panels) */}
      <DashboardWelcomeHero
        userName={fullName}
        role="citizen"
        ctaText="Buat Laporan Baru"
        ctaHref="/dashboard/warga/buat"
        latestComplaint={complaints[0] || null}
        totalPending={pendingCount}
        totalResolved={resolvedCount}
      />

      {/* 2. 4 Metric Cards Row (Clean, Uppercase Label, Big Value, View All Footer) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardMetricCard
          label="TOTAL LAPORAN"
          count={totalCount}
          icon={FileText}
          variant="slate"
          description="Semua aduan yang dikirim"
          href="/dashboard/warga/laporan"
          linkText="Lihat Semua"
        />
        <DashboardMetricCard
          label="MENUNGGU VERIFIKASI"
          count={pendingCount}
          icon={Clock}
          variant="amber"
          description="Sedang ditinjau dinas"
          href="/dashboard/warga/laporan"
          linkText="Lihat Antrean"
        />
        <DashboardMetricCard
          label="SEDANG DIKERJAKAN"
          count={inProgressCount}
          icon={TrendingUp}
          variant="blue"
          description="Ditangani tim lapangan"
          href="/dashboard/warga/laporan"
          linkText="Lihat Pengerjaan"
        />
        <DashboardMetricCard
          label="SELESAI DIPERBAIKI"
          count={resolvedCount}
          icon={CheckCircle2}
          variant="emerald"
          description="Jalan tuntas diperbaiki"
          href="/dashboard/warga/laporan"
          linkText="Lihat Hasil"
        />
      </div>

      {/* 3. Main Content Section: Left 8-cols (Cards Grid) + Right 4-cols (Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <RecentComplaintsGrid
            complaints={complaints}
            role="citizen"
            title="Laporan Pengaduan Terkini"
            viewAllHref="/dashboard/warga/laporan"
          />
        </div>

        <div className="lg:col-span-4">
          <RecentActivityTimeline complaints={complaints} role="citizen" />
        </div>
      </div>

      {/* 4. Tabel Daftar Lengkap dengan Filter Tab & Pencarian */}
      <CitizenComplaintsList initialComplaints={complaints} />
    </div>
  );
}
