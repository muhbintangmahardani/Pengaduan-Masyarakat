import React from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Eye,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  FileText,
  Clock,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { Complaint, ComplaintStatus, UserRole } from "@/types";

interface RecentComplaintsGridProps {
  complaints: Complaint[];
  role?: UserRole;
  title?: string;
  viewAllHref?: string;
  limit?: number;
}

export function RecentComplaintsGrid({
  complaints,
  role = "citizen",
  title = "Laporan Pengaduan Terkini",
  viewAllHref = "/dashboard/warga/laporan",
  limit = 2,
}: RecentComplaintsGridProps) {
  // Ambil maksimal 2 laporan (atau sesuai limit) agar seimbang dan rapi
  const displayItems = complaints.slice(0, limit);

  const getDetailHref = (id: string, ticketNumber: string) => {
    if (role === "admin") return `/dashboard/admin/penugasan/${id}`;
    if (role === "officer") return `/dashboard/petugas?ticket=${ticketNumber}`;
    return `/dashboard/warga/laporan/${id}`;
  };

  const getDamageIcon = (type?: string | null) => {
    const t = (type || "").toLowerCase();
    if (t.includes("lubang")) return AlertTriangle;
    if (t.includes("amblas") || t.includes("rusak")) return ShieldAlert;
    return Wrench;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header Bar dengan Link 'Lihat Semua Laporan →' */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3 min-h-[52px]">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            Daftar aduan jalan rusak terkini yang tercatat di sistem.
          </p>
        </div>

        <Link
          href={viewAllHref}
          className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center gap-1 group shrink-0 whitespace-nowrap"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 shrink-0" />
        </Link>
      </div>

      {/* Grid 2x2 Persis Layout Civora */}
      {displayItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 bg-white/50 dark:bg-slate-900/50 flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6 opacity-60" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum Ada Laporan Tercatat
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Laporan perbaikan jalan yang Anda kirimkan akan muncul secara rapi di sini.
            </p>
          </div>
          {role === "citizen" && (
            <Link
              href="/dashboard/warga/buat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-bold transition-all shadow-xs"
            >
              Buat Laporan Sekarang
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {displayItems.map((item) => {
            const IconComponent = getDamageIcon(item.damage_type || item.title);
            const detailHref = getDetailHref(item.id, item.ticket_number);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-border/80 transition-all hover:-translate-y-0.5 duration-200 flex flex-col justify-between"
              >
                {/* Top Section: Icon + Ticket Badge + Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.ticket_number}
                      </span>
                      <StatusBadge status={item.status as ComplaintStatus} />
                    </div>
                  </div>

                  {/* Title & Damage Type */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                      <span>{item.address}</span>
                    </p>
                  </div>
                </div>

                {/* Metadata Meta Info */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground gap-2">
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate">{formatDateTime(item.created_at)}</span>
                  </div>

                  {item.priority && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground shrink-0 whitespace-nowrap">
                      {item.priority}
                    </span>
                  )}
                </div>

                {/* Card Button: Lihat Detail Laporan */}
                <Link
                  href={detailHref}
                  className="w-full py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Lihat Dokumen Laporan</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
