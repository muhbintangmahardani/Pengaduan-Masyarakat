import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, UserCheck, Clock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { formatDateTime } from "@/lib/utils";
import type { Complaint, Profile } from "@/types";

export const metadata: Metadata = {
  title: "Monitoring Penugasan",
};

export default async function AdminPenugasanPage() {
  const supabase = await createClient();

  // Ambil laporan yang telah ditugaskan (in_progress, under_review, resolved)
  const { data: assignedComplaints } = await supabase
    .from("complaints")
    .select(`
      *,
      profiles:user_id(full_name),
      assigned_officer:assigned_officer_id(full_name, email)
    `)
    .not("assigned_officer_id", "is", null)
    .order("updated_at", { ascending: false });

  const complaints = (assignedComplaints as any[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Monitoring Penugasan Petugas
          </h1>
          <p className="text-xs text-slate-500">
            Pantau status pengerjaan, target penyelesaian, dan personel yang bertugas di lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportButton
            complaints={complaints}
            filename="monitoring-penugasan-admin"
            label="Export Data"
          />
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold"
          >
            Tugaskan Tiket Baru →
          </Link>
        </div>
      </div>

      <Card className="rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Laporan / Lokasi</th>
                <th className="py-3 px-4">Petugas Lapangan</th>
                <th className="py-3 px-4">Target Selesai</th>
                <th className="py-3 px-4">Prioritas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Belum ada penugasan aktif. Silakan verifikasi tiket di menu &quot;Laporan Masuk&quot;.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                      {item.ticket_number}
                    </td>
                    <td className="py-3 px-4 min-w-[240px]">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.address}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.assigned_officer?.full_name || "Petugas Lapangan"}
                      </div>
                      <div className="text-[10px] text-slate-400">Tim Jalan 02</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {item.target_date ? formatDateTime(item.target_date) : "2 Hari"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800">
                        {item.priority || "Sedang"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link
                          href={`/dashboard/admin/penugasan/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline"
                        >
                          Detail Tugas
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {item.status === "under_review" && (
                          <Link
                            href={`/dashboard/admin/review?ticket=${item.ticket_number}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                          >
                            Tinjau
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
