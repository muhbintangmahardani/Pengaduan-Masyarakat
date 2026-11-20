"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Calendar, Clock, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { subscribeToLiveRoom } from "@/lib/realtimeBroadcast";
import type { Complaint } from "@/types";

interface CitizenComplaintsListProps {
  initialComplaints?: Complaint[];
  complaints?: Complaint[];
  showExport?: boolean;
}

export function CitizenComplaintsList({
  initialComplaints,
  complaints: propComplaints,
  showExport = true,
}: CitizenComplaintsListProps) {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>(
    initialComplaints || propComplaints || []
  );
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "in_progress" | "resolved" | "rejected">("all");

  useEffect(() => {
    if (initialComplaints) {
      setComplaints(initialComplaints);
    } else if (propComplaints) {
      setComplaints(propComplaints);
    }
  }, [initialComplaints, propComplaints]);

  // Live Real-Time Listener (Shared Live Manager)
  useEffect(() => {
    const unsubscribe = subscribeToLiveRoom((payload) => {
      if (payload?.complaint) {
        const comp = payload.complaint as Complaint;
        if (payload.eventType === "INSERT") {
          setComplaints((prev) => {
            if (prev.some((c) => c.id === comp.id)) return prev;
            return [comp, ...prev];
          });
        } else {
          setComplaints((prev) =>
            prev.map((c) => (c.id === comp.id ? { ...c, ...comp } : c))
          );
        }
        router.refresh();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const safeComplaints = (complaints || []).filter(Boolean);
  const pendingCount = safeComplaints.filter((c) => c?.status === "pending").length;
  const inProgressCount = safeComplaints.filter(
    (c) => c?.status === "in_progress" || c?.status === "under_review" || c?.status === "verified"
  ).length;
  const resolvedCount = safeComplaints.filter((c) => c?.status === "resolved").length;
  const rejectedCount = safeComplaints.filter((c) => c?.status === "rejected").length;

  const filtered = safeComplaints.filter((c) => {
    if (!c) return false;
    if (activeTab === "pending") return c.status === "pending";
    if (activeTab === "in_progress")
      return c.status === "in_progress" || c.status === "under_review" || c.status === "verified";
    if (activeTab === "resolved") return c.status === "resolved";
    if (activeTab === "rejected") return c.status === "rejected";
    return true;
  });

  return (
    <Card className="rounded-xl border border-border bg-card shadow-xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Daftar Laporan Pengaduan
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono font-semibold bg-muted/60 text-foreground border-border">
              {complaints.length} Total
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Pantau status verifikasi dan hasil pengerjaan jalan yang Anda laporkan.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
          {showExport && complaints.length > 0 && (
            <div className="shrink-0">
              <ExportButton
                complaints={filtered}
                filename="laporan-saya"
                label="Export Data"
              />
            </div>
          )}

          <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-xl overflow-x-auto max-w-full scrollbar-none shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "in_progress"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Diproses ({inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "resolved"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Selesai ({resolvedCount})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-background text-foreground shadow-xs font-semibold text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ditolak ({rejectedCount})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground">
            Tidak ada laporan dalam kategori ini.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/warga/laporan/${item.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-muted/40 transition-colors group block"
              >
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  <div className="relative w-16 h-16 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border shadow-xs">
                    <Image
                      src={item.photo_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80 shrink-0">
                        {item.ticket_number}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                        {formatDateTime(item.created_at)}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate max-w-[220px] sm:max-w-md">{item.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-[76px] sm:pl-0 pt-0.5 sm:pt-0">
                  <div className="text-xs text-muted-foreground font-mono whitespace-nowrap sm:hidden">
                    {formatDateTime(item.created_at)}
                  </div>

                  <StatusBadge status={item.status} />

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-slate-100/80 dark:bg-slate-800 text-xs font-bold text-[#0c3b37] dark:text-emerald-400 group-hover:bg-[#0c3b37] group-hover:text-white dark:group-hover:bg-emerald-600 dark:group-hover:text-white shadow-2xs transition-all shrink-0">
                    <span className="hidden sm:inline">Detail</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
