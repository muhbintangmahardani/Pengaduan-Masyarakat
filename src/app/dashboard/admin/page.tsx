import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminIncomingReports } from "@/components/admin/AdminIncomingReports";
import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, FileCheck } from "lucide-react";
import { ExportButton } from "@/components/common/ExportButton";
import { formatCurrentDateWIB } from "@/lib/utils";
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

  const todayFormatted = formatCurrentDateWIB();

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

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
          <ExportButton
            complaints={complaints}
            filename="semua-laporan-admin"
            label="Export Data"
          />
        </div>
      </div>

      {/* 3 Minimalist Stat Cards in a row (Shadcn UI Card) - 3 kolom ringkas bahkan di mobile agar tidak menumpuk tebal */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Card 1 */}
        <Card className="p-3 sm:p-4 rounded-xl shadow-xs border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Verifikasi
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-sans">
            {String(needVerificationCount).padStart(2, "0")}
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-3 sm:p-4 rounded-xl shadow-xs border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Penanganan
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-sans">
            {String(inHandlingCount).padStart(2, "0")}
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-3 sm:p-4 rounded-xl shadow-xs border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Tinjauan
            </span>
            <FileCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-sans">
            {String(underReviewCount).padStart(2, "0")}
          </div>
        </Card>
      </div>

      {/* Main Master-Detail Component */}
      <AdminIncomingReports complaints={complaints} officers={officers} />
    </div>
  );
}
