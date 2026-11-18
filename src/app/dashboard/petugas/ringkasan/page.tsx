import React from "react";
import type { Metadata } from "next";
import { CheckCircle2, Clock, Wrench, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardWelcomeHero } from "@/components/dashboard/DashboardWelcomeHero";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { RecentComplaintsGrid } from "@/components/dashboard/RecentComplaintsGrid";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import type { Complaint, Profile } from "@/types";

export const metadata: Metadata = {
  title: "Ringkasan Kerja Petugas",
};

export default async function PetugasRingkasanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileRes, tasksRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("complaints")
      .select("*")
      .eq("assigned_officer_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const fullName = profileRes.data?.full_name || "Petugas Lapangan";
  const tasks = (tasksRes.data as Complaint[]) || [];

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((t) => t.status === "in_progress" || t.status === "verified").length;
  const submittedTasks = tasks.filter((t) => t.status === "under_review").length;
  const completedTasks = tasks.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Civora Welcome Hero Banner */}
      <DashboardWelcomeHero
        userName={fullName}
        role="officer"
        ctaText="Buka Tugas Lapangan"
        ctaHref="/dashboard/petugas"
        latestComplaint={tasks[0] || null}
        totalPending={activeTasks}
        totalResolved={completedTasks}
      />

      {/* 2. 4 Metric Cards (Shadcn UI Card Minimalis) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <DashboardMetricCard
          label="Total Penugasan"
          count={totalTasks}
          icon={FileText}
          variant="slate"
          description="Semua tugas akun Anda"
          href="/dashboard/petugas/riwayat"
        />
        <DashboardMetricCard
          label="Tugas Aktif"
          count={activeTasks}
          icon={Wrench}
          variant="blue"
          description="Perlu segera dikerjakan"
          href="/dashboard/petugas"
        />
        <DashboardMetricCard
          label="Menunggu Tinjauan"
          count={submittedTasks}
          icon={Clock}
          variant="orange"
          description="Bukti foto ditinjau admin"
          href="/dashboard/petugas"
        />
        <DashboardMetricCard
          label="Selesai Disetujui"
          count={completedTasks}
          icon={CheckCircle2}
          variant="emerald"
          description="Tuntas disetujui dinas"
          href="/dashboard/petugas/riwayat"
        />
      </div>

      {/* 3. Main Two-Column Layout (Civora Style: 8-cols Left Cards + 4-cols Right Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <RecentComplaintsGrid
            complaints={tasks}
            role="officer"
            title="Daftar Tugas Lapangan Terkini"
            viewAllHref="/dashboard/petugas"
          />
        </div>

        <div className="lg:col-span-4">
          <RecentActivityTimeline complaints={tasks} role="officer" />
        </div>
      </div>
    </div>
  );
}
