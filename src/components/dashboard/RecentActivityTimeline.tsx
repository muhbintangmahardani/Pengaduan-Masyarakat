import React from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Complaint } from "@/types";

interface RecentActivityTimelineProps {
  complaints: Complaint[];
  role?: string;
  className?: string;
}

export function RecentActivityTimeline({
  complaints,
  role = "citizen",
  className,
}: RecentActivityTimelineProps) {
  // Ambil maksimal 3 laporan agar tinggi card proporsional dan sejajar persis dengan grafik di sampingnya
  const activities = (complaints || []).slice(0, 3);

  const getActivityDetails = (item: Complaint) => {
    switch (item.status) {
      case "resolved":
        return {
          title: "Jalan Selesai Diperbaiki",
          desc: "Disetujui tuntas & permukaan jalan aman dilalui.",
          badgeVariant: "default" as const,
          badgeText: "Selesai",
          badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "under_review":
        return {
          title: "Foto Bukti Siap Ditinjau",
          desc: "Petugas telah selesai pengerjaan lapangan.",
          badgeVariant: "secondary" as const,
          badgeText: "Tinjauan",
          badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        };
      case "in_progress":
      case "verified":
        return {
          title: "Dalam Pengerjaan",
          desc: "Petugas lapangan berada di lokasi perbaikan.",
          badgeVariant: "secondary" as const,
          badgeText: "Dikerjakan",
          badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        };
      default:
        return {
          title: "Laporan Diterima",
          desc: "Menunggu verifikasi admin dinas.",
          badgeVariant: "outline" as const,
          badgeText: "Menunggu",
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
    }
  };

  const getDetailHref = (id: string, ticketNumber: string) => {
    if (role === "admin") return `/dashboard/admin/penugasan/${id}`;
    if (role === "officer") return `/dashboard/petugas?ticket=${ticketNumber}`;
    return `/dashboard/warga/laporan/${id}`;
  };

  const viewAllHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "officer"
      ? "/dashboard/petugas"
      : "/dashboard/warga/laporan";

  return (
    <Card className={cn("rounded-xl border border-border bg-card shadow-xs h-full flex flex-col justify-between overflow-hidden", className)}>
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Aktivitas Progres Terkini
          </CardTitle>
          <span className="text-xs font-mono text-muted-foreground">
            {complaints.length} Laporan
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Linimasa pembaruan status pengerjaan jalan Anda.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
            <Clock className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="font-medium text-foreground">Belum ada aktivitas laporan</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Pembaruan status pengerjaan jalan akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 my-auto">
            {activities.map((item) => {
              const details = getActivityDetails(item);
              const href = getDetailHref(item.id, item.ticket_number || "");
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-xs border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-[190px]">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${details.badgeColor}`}
                      >
                        {details.badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {item.address}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>

                  <Link
                    href={href}
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Lihat detail"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Footer Link yang Rapi Sejajar dengan Footer Grafik */}
      <div className="p-3.5 sm:p-4 border-t border-border/60 bg-muted/20 shrink-0 mt-auto flex items-center justify-between text-xs">
        <span className="text-muted-foreground text-[11px]">
          {activities.length} dari {complaints.length} aktivitas terbaru
        </span>
        <Link
          href={viewAllHref}
          className="font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center gap-1 group"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Card>
  );
}
