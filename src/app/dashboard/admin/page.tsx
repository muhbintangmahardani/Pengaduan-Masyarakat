import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminIncomingReports } from "@/components/admin/AdminIncomingReports";
import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, FileCheck } from "lucide-react";
import { ExportButton } from "@/components/common/ExportButton";
import type { Complaint, Profile } from "@/types";

export const metadata: Metadata = {
  title: "Laporan Masuk & Penugasan",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Optimasi: Jalankan query laporan & petugas secara paralel
  const [complaintsRes, officersRes] = await Promise.all([
    supabase
      .from("complaints")
      .select("*, profiles:user_id(full_name, email, phone_number)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "officer"),
  ]);

  const complaints = (complaintsRes.data as Complaint[]) || [];
  const officers = (officersRes.data as Profile[]) || [];

  const needVerificationCount = complaints.filter(
    (c) => c.status === "pending"
  ).length;

  const inHandlingCount = complaints.filter(
    (c) => c.status === "in_progress" || c.status === "verified"
  ).length;

  const underReviewCount = complaints.filter(
    (c) => c.status === "under_review"
  ).length;

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Laporan Masuk & Penugasan
          </h1>
          <p className="text-xs text-slate-500">
            Tinjau bukti foto, verifikasi koordinat lokasi, dan tugaskan personel tim lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            {todayFormatted}
          </div>
          <ExportButton
            complaints={complaints}
            filename="semua-laporan-admin"
            label="Export Data"
          />
        </div>
      </div>

      {/* 3 Minimalist Stat Cards in a row (Shadcn UI Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <Card className="p-4 rounded-xl shadow-xs border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {String(needVerificationCount).padStart(2, "0")}
              </span>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Perlu verifikasi
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-4 rounded-xl shadow-xs border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
                {String(inHandlingCount).padStart(2, "0")}
              </span>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Dalam penanganan
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-4 rounded-xl shadow-xs border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {String(underReviewCount).padStart(2, "0")}
              </span>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Menunggu tinjauan
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Master-Detail Component */}
      <AdminIncomingReports complaints={complaints} officers={officers} />
    </div>
  );
}
