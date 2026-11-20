"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { AdminReviewList } from "@/components/admin/AdminReviewList";
import { AdminReviewDetailView } from "@/components/admin/AdminReviewDetailView";
import { DetailReviewSkeleton } from "@/components/admin/DetailReviewSkeleton";
import { Card } from "@/components/ui/card";
import type { Complaint } from "@/types";

interface AdminReviewContainerProps {
  initialComplaints: Complaint[];
  initialTicket?: string;
}

export function AdminReviewContainer({
  initialComplaints,
  initialTicket,
}: AdminReviewContainerProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(initialTicket || null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(!!initialTicket);

  // Jika halaman pertama kali dimuat dengan initialTicket di URL
  useEffect(() => {
    if (initialTicket) {
      setSelectedTicket(initialTicket);
      setIsLoadingDetail(true);
      const timer = setTimeout(() => {
        setIsLoadingDetail(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [initialTicket]);

  // Dukungan tombol Back & Forward pada browser
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const t = urlParams.get("ticket");
      setSelectedTicket(t);
      if (t) {
        setIsLoadingDetail(true);
        setTimeout(() => setIsLoadingDetail(false), 180);
      } else {
        setIsLoadingDetail(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Hitung jumlah laporan under_review untuk badge status info
  const pendingReviewCount = useMemo(
    () => complaints.filter((c) => c.status === "under_review").length,
    [complaints]
  );

  // Navigasi Instan ke Detail (0 milidetik jeda, langsung tampil Skeleton lalu Detail)
  const handleSelectTicket = (ticket: string) => {
    try {
      window.history.pushState({ ticket }, "", `/dashboard/admin/review?ticket=${ticket}`);
    } catch {
      // Fallback aman jika history API terhalang
    }
    setSelectedTicket(ticket);
    setIsLoadingDetail(true);
    window.scrollTo({ top: 0, behavior: "instant" });

    // Animasi transisi skeleton yang halus (200ms)
    setTimeout(() => {
      setIsLoadingDetail(false);
    }, 200);
  };

  // Navigasi Instan Kembali ke Daftar Hasil (0 milidetik jeda)
  const handleBack = () => {
    try {
      window.history.pushState({}, "", "/dashboard/admin/review");
    } catch {
      // Fallback aman
    }
    setSelectedTicket(null);
    setIsLoadingDetail(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // 1. Jika pengguna memilih tiket dan masih dalam tahap skeleton transition
  if (selectedTicket && isLoadingDetail) {
    return <DetailReviewSkeleton ticketNumber={selectedTicket} onBack={handleBack} />;
  }

  // 2. Jika ada tiket yang dipilih dan skeleton transition selesai
  if (selectedTicket && !isLoadingDetail) {
    const targetComplaint = complaints.find(
      (c) => c.ticket_number?.toLowerCase() === selectedTicket.toLowerCase()
    );

    if (!targetComplaint) {
      return (
        <div className="space-y-6">
          <Card className="text-center py-16 p-8 space-y-3 rounded-xl border border-border bg-card shadow-xs">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Laporan dengan tiket {selectedTicket} tidak ditemukan.
            </h2>
            <p className="text-xs text-slate-400">
              Pastikan nomor tiket yang Anda masukkan sudah benar atau kembali ke daftar hasil perbaikan.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0c3b37] text-white text-xs font-semibold hover:bg-[#0c3b37]/90 transition-all cursor-pointer"
              >
                Kembali ke Daftar Hasil Perbaikan
              </button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <AdminReviewDetailView
        complaint={targetComplaint}
        pendingReviewCount={pendingReviewCount}
        onBack={handleBack}
      />
    );
  }

  // 3. Mode Default: Daftar Rekapitulasi Hasil Perbaikan
  return <AdminReviewList complaints={complaints} onSelectTicket={handleSelectTicket} />;
}
