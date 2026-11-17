import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, Wrench, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Ringkasan Kerja Petugas",
};

export default async function PetugasRingkasanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: myTasks } = await supabase
    .from("complaints")
    .select("*")
    .eq("assigned_officer_id", user.id)
    .order("updated_at", { ascending: false });

  const tasks = (myTasks as Complaint[]) || [];

  const activeTasks = tasks.filter((t) => t.status === "in_progress" || t.status === "verified");
  const submittedTasks = tasks.filter((t) => t.status === "under_review");
  const completedTasks = tasks.filter((t) => t.status === "resolved");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ringkasan Kerja Petugas Lapangan
          </h1>
          <p className="text-xs text-slate-500">
            Statistik penanganan perbaikan jalan, target pengerjaan, dan riwayat pekerjaan Anda.
          </p>
        </div>

        <Link
          href="/dashboard/petugas"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold"
        >
          Buka Tugas Aktif →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tugas Aktif Lapangan</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {activeTasks.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sedang dalam proses perbaikan</p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Menunggu Tinjauan Admin</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {submittedTasks.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Bukti foto telah dikirim</p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Perbaikan Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {completedTasks.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Telah disetujui & ditutup</p>
        </Card>
      </div>

      <Card className="p-5 rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4">
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Daftar Penugasan Terbaru Anda
        </CardTitle>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada tugas yang ditugaskan ke akun Anda.
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                      {task.ticket_number}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {task.address} • Target: {task.target_date ? formatDateTime(task.target_date) : "2 Hari"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                  <Link
                    href={
                      task.status === "resolved" || task.status === "under_review"
                        ? `/dashboard/petugas/riwayat/${task.id}`
                        : `/dashboard/petugas?ticket=${task.ticket_number}`
                    }
                    className="text-xs font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline"
                  >
                    {task.status === "resolved" || task.status === "under_review" ? "Detail →" : "Kerjakan →"}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
