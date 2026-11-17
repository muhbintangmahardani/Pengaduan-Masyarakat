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
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "in_progress" | "resolved">("all");

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

  const filtered = safeComplaints.filter((c) => {
    if (!c) return false;
    if (activeTab === "pending") return c.status === "pending";
    if (activeTab === "in_progress")
      return c.status === "in_progress" || c.status === "under_review" || c.status === "verified";
    if (activeTab === "resolved") return c.status === "resolved";
    return true;
  });

  return (
    <Card className="rounded-xl border border-border bg-card shadow-xs">
      <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Daftar Laporan Pengaduan
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              {complaints.length} Total
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Pantau status verifikasi dan hasil pengerjaan jalan yang Anda laporkan.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showExport && complaints.length > 0 && (
            <ExportButton
              complaints={filtered}
              filename="laporan-saya"
              label="Export Data"
            />
          )}

          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "pending"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "in_progress"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Diproses ({inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "resolved"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Selesai ({resolvedCount})
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
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors group block"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                    <Image
                      src={item.photo_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium truncate">
                      <span className="font-mono text-primary font-bold shrink-0">
                        {item.ticket_number}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[180px] sm:max-w-xs">{item.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-1 sm:pt-0 border-t sm:border-0 border-border">
                  <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {formatDateTime(item.created_at)}
                  </div>

                  <StatusBadge status={item.status} />

                  <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-80 group-hover:opacity-100 shrink-0">
                    <span className="hidden sm:inline">Detail</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
