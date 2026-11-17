import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, Wrench, ArrowRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/types";

interface RecentActivityTimelineProps {
  complaints: Complaint[];
  role?: string;
}

export function RecentActivityTimeline({ complaints, role = "citizen" }: RecentActivityTimelineProps) {
  const activities = (complaints || []).slice(0, 5);

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

  return (
    <Card className="rounded-xl border border-border bg-card shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="p-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Aktivitas Progres Terkini
          </CardTitle>
          <span className="text-xs font-mono text-muted-foreground">
            {activities.length} Aktivitas
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Linimasa pembaruan status pengerjaan jalan Anda.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-4 flex-1">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Belum ada aktivitas laporan terkini.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => {
              const details = getActivityDetails(item);
              const href = getDetailHref(item.id, item.ticket_number || "");
              return (
                <div key={item.id} className="flex items-start justify-between gap-3 text-xs border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${details.badgeColor}`}>
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
    </Card>
  );
}
