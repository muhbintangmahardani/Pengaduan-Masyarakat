"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
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

  // Live Real-Time Listener (Shared Live Manager bebas konflik)
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
    <Card className="rounded-xl p-5 sm:p-7 space-y-5 shadow-xs border-slate-100 dark:border-slate-800">
      {/* Header and Filter Tabs + Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Laporan Saya
            </h2>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 shadow-xs"
            >
              {complaints.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Klik laporan untuk membuka halaman detail progres penanganan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showExport && complaints.length > 0 && (
            <ExportButton
              complaints={filtered}
              filename="laporan-saya"
              label="Export Data"
            />
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "all"
                  ? "bg-[#0c3b37] text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
            >
              Semua ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "pending"
                  ? "bg-[#0c3b37] text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "in_progress"
                  ? "bg-[#0c3b37] text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
            >
              Diproses ({inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "resolved"
                  ? "bg-[#0c3b37] text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
            >
              Selesai ({resolvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List items: Navigates directly to dedicated page /dashboard/warga/laporan/[id] */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400">
          Tidak ada laporan dalam kategori ini.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/warga/laporan/${item.id}`}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 p-2.5 sm:p-3 rounded-lg transition-colors group block"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200/60 dark:border-slate-700">
                  <Image
                    src={item.photo_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#0c3b37] dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 font-medium truncate">
                    <span className="font-mono text-[#0c3b37] dark:text-emerald-400 font-bold shrink-0">
                      {item.ticket_number}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[180px] sm:max-w-xs">{item.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-1 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
                  {formatDateTime(item.created_at)}
                </div>

                <StatusBadge status={item.status} />

                <div className="flex items-center gap-1 text-xs font-semibold text-[#0c3b37] dark:text-emerald-400 opacity-80 group-hover:opacity-100 shrink-0">
                  <span className="hidden sm:inline">Detail</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
