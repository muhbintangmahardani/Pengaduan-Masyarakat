import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, Wrench, ArrowRight, ShieldCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Complaint } from "@/types";

interface RecentActivityTimelineProps {
  complaints: Complaint[];
  role?: string;
}

export function RecentActivityTimeline({ complaints, role = "citizen" }: RecentActivityTimelineProps) {
  // Ambil laporan terbaru yang memiliki aktivitas
  const activities = complaints.slice(0, 6);

  const getActivityDetails = (item: Complaint) => {
    switch (item.status) {
      case "resolved":
        return {
          title: "Jalan Selesai Diperbaiki",
          desc: "Disetujui tuntas & permukaan jalan aman dilalui.",
          dotColor: "bg-emerald-500 ring-emerald-200 dark:ring-emerald-900",
          iconColor: "text-emerald-500",
        };
      case "under_review":
        return {
          title: "Foto Bukti Siap Ditinjau",
          desc: "Petugas telah selesai pengerjaan di lapangan.",
          dotColor: "bg-orange-500 ring-orange-200 dark:ring-orange-900",
          iconColor: "text-orange-500",
        };
      case "in_progress":
      case "verified":
        return {
          title: "Penanganan Lapangan",
          desc: "Petugas dinas berada di lokasi pengerjaan.",
          dotColor: "bg-sky-500 ring-sky-200 dark:ring-sky-900",
          iconColor: "text-sky-500",
        };
      default:
        return {
          title: "Laporan Diterima Sistem",
          desc: "Menunggu verifikasi admin dinas.",
          dotColor: "bg-amber-500 ring-amber-200 dark:ring-amber-900",
          iconColor: "text-amber-500",
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header Widget */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Aktivitas Terkini
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {String(activities.length).padStart(2, "0")}
          </span>
        </div>

        <Link
          href="/dashboard/notifikasi"
          className="text-xs font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center gap-1 group"
        >
          <span>Riwayat</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* List Timeline Vertical Connected Persis Civora */}
      {activities.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-xs text-slate-400">Belum ada linimasa aktivitas baru</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {activities.map((item) => {
            const act = getActivityDetails(item);

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <span
                  className={`absolute -left-6 top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-900 ${act.dotColor} transition-transform group-hover:scale-125`}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {act.title}
                    </span>
                    <span className="font-mono text-[9px] font-semibold text-slate-400 shrink-0">
                      {formatDateTime(item.updated_at || item.created_at)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {act.desc}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="font-mono text-[10px] font-bold text-[#0c3b37] dark:text-emerald-400">
                      {item.ticket_number}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      • {item.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
