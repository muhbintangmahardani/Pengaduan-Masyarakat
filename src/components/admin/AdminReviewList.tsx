"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  User,
  ArrowRight,
  HardHat,
  Filter,
  Eye,
  FileCheck2,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { formatDateTime } from "@/lib/utils";
import { DetailReviewSkeleton } from "@/components/admin/DetailReviewSkeleton";
import type { Complaint } from "@/types";

interface AdminReviewListProps {
  complaints: Complaint[];
}

export function AdminReviewList({ complaints }: AdminReviewListProps) {
  const [activeTab, setActiveTab] = useState<"all" | "under_review" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [navigatingTicket, setNavigatingTicket] = useState<string | null>(null);

  // Metrik Ringkasan
  const pendingCount = useMemo(
    () => complaints.filter((c) => c.status === "under_review").length,
    [complaints]
  );
  const resolvedCount = useMemo(
    () => complaints.filter((c) => c.status === "resolved").length,
    [complaints]
  );
  const totalCount = complaints.length;

  // Filter & Search
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Filter Tab Status
      if (activeTab === "under_review" && item.status !== "under_review") {
        return false;
      }
      if (activeTab === "resolved" && item.status !== "resolved") {
        return false;
      }

      // Filter Pencarian
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const ticket = (item.ticket_number || "").toLowerCase();
      const title = (item.title || "").toLowerCase();
      const address = (item.address || "").toLowerCase();
      const officer = (
        Array.isArray((item as any).assigned_officer)
          ? (item as any).assigned_officer[0]?.full_name
          : (item as any).assigned_officer?.full_name || ""
      ).toLowerCase();

      return (
        ticket.includes(q) ||
        title.includes(q) ||
        address.includes(q) ||
        officer.includes(q)
      );
    });
  }, [complaints, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Hasil Perbaikan Lapangan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar dokumentasi hasil pengerjaan tim lapangan yang siap ditinjau atau telah selesai diperbaiki.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            complaints={complaints}
            filename="rekapitulasi-hasil-perbaikan"
            label="Export Data"
          />
        </div>
      </div>

      {/* 2. Kartu Metrik Ringkasan Cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Perlu Tinjauan */}
        <Card
          onClick={() => setActiveTab("under_review")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "under_review"
              ? "border-amber-400 dark:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs ring-1 ring-amber-400/50"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Perlu Tinjauan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {pendingCount}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Menunggu persetujuan
            </span>
          </div>
        </Card>

        {/* Card 2: Selesai & Disetujui */}
        <Card
          onClick={() => setActiveTab("resolved")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "resolved"
              ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-400/50"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Selesai & Disetujui
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {resolvedCount}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Laporan tuntas
            </span>
          </div>
        </Card>

        {/* Card 3: Total Dokumentasi */}
        <Card
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-[#0c3b37] dark:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs ring-1 ring-[#0c3b37]/30"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Total Dokumentasi
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Laporan tercatat
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Baris Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Tab Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-border w-fit">
          {[
            { id: "all", label: "Semua", count: totalCount },
            { id: "under_review", label: "Perlu Tinjauan", count: pendingCount },
            { id: "resolved", label: "Selesai Disetujui", count: resolvedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-900 text-[#0c3b37] dark:text-emerald-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-[#0c3b37]/10 dark:bg-emerald-400/20 text-[#0c3b37] dark:text-emerald-400"
                    : "bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Input Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Cari ID tiket, lokasi, petugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs rounded-xl h-9 bg-card border-border shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Daftar Kartu Hasil Perbaikan (Responsive Grid) */}
      {filteredComplaints.length === 0 ? (
        <Card className="text-center py-16 p-8 space-y-3 rounded-xl border border-border bg-card shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak ada laporan hasil perbaikan yang sesuai.
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? `Tidak ditemukan hasil untuk "${searchQuery}". Coba kata kunci lain atau ubah filter tab.`
              : "Belum ada laporan dengan dokumentasi perbaikan pada kategori ini."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredComplaints.map((item) => {
            const officerName =
              (Array.isArray((item as any).assigned_officer)
                ? (item as any).assigned_officer[0]?.full_name
                : (item as any).assigned_officer?.full_name) || "Petugas Lapangan";

            const citizenName =
              (Array.isArray((item as any).profiles)
                ? (item as any).profiles[0]?.full_name
                : (item as any).profiles?.full_name) || "Pelapor";

            const isPendingReview = item.status === "under_review";

            return (
              <Card
                key={item.id}
                className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header Card: Tiket, Tanggal & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                        {item.ticket_number}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Lokasi */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.address || "Lokasi jalan terdata"}</span>
                  </div>

                  {/* Before vs After Thumbnail Comparison */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Foto Sebelum */}
                    <div className="space-y-1">
                      <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border">
                        <Image
                          src={item.photo_url || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7"}
                          alt={`Foto sebelum perbaikan ${item.ticket_number}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/90 text-white shadow-2xs backdrop-blur-xs">
                          SEBELUM
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Pelapor: {citizenName}
                      </p>
                    </div>

                    {/* Foto Sesudah */}
                    <div className="space-y-1">
                      <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border">
                        <Image
                          src={item.completion_photo_url || item.photo_url || "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6"}
                          alt={`Foto sesudah perbaikan ${item.ticket_number}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/90 text-white shadow-2xs backdrop-blur-xs">
                          SESUDAH
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Petugas: {officerName}
                      </p>
                    </div>
                  </div>

                  {/* Catatan Petugas */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-border text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Catatan:{" "}
                    </span>
                    {item.completion_note || "Perbaikan telah selesai dilaksanakan oleh tim petugas lapangan."}
                  </div>
                </div>

                {/* Footer Card: Info Pengerjaan & Tombol Aksi */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    <span>
                      {item.completed_at
                        ? `Selesai ${formatDateTime(item.completed_at)}`
                        : `Diajukan ${formatDateTime(item.created_at)}`}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/admin/review?ticket=${item.ticket_number}`}
                    onClick={() => setNavigatingTicket(item.ticket_number)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isPendingReview
                        ? "bg-[#0c3b37] text-white hover:bg-[#0c3b37]/90 shadow-2xs hover:shadow-xs"
                        : "border border-border bg-card text-slate-700 dark:text-slate-200 hover:bg-muted/80 shadow-2xs"
                    }`}
                  >
                    {navigatingTicket === item.ticket_number ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Memuat...</span>
                      </>
                    ) : (
                      <>
                        <span>{isPendingReview ? "Tinjau Hasil" : "Lihat Bukti"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
