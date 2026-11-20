"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Check,
  MapPin,
  Calendar,
  ExternalLink,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, formatDateTimeWithHours } from "@/lib/utils";
import { assignComplaintAction, rejectComplaintAction } from "@/actions/complaints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import {
  subscribeToLiveRoom,
  emitLocalCrossTab,
} from "@/lib/realtimeBroadcast";
import type { Complaint, Profile, ComplaintStatus } from "@/types";

interface AdminIncomingReportsProps {
  complaints: Complaint[];
  officers: Profile[];
}

export function AdminIncomingReports({
  complaints: initialComplaints,
  officers,
}: AdminIncomingReportsProps) {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(
    initialComplaints[0]?.id || ""
  );

  const [isPhotoVerified, setIsPhotoVerified] = useState(true);
  const [priority, setPriority] = useState<"Rendah" | "Sedang" | "Tinggi" | "Darurat">("Sedang");
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(
    officers[0]?.id || ""
  );
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReassignForm, setShowReassignForm] = useState(false);

  // State untuk Fitur Penolakan Laporan (Hoax / Tidak Valid)
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("Laporan Tidak Valid / Fiktif");
  const [rejectNote, setRejectNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Sinkronkan state saat props berubah
  useEffect(() => {
    setComplaints(initialComplaints);
    if (!selectedId && initialComplaints.length > 0) {
      setSelectedId(initialComplaints[0].id);
    }
  }, [initialComplaints]);

  // Real-time listener menggunakan shared manager (bebas konflik)
  useEffect(() => {
    const unsubscribe = subscribeToLiveRoom((payload) => {
      if (payload?.complaint) {
        const comp = payload.complaint as Complaint;
        if (payload.eventType === "INSERT") {
          setComplaints((prev) => {
            if (prev.some((c) => c.id === comp.id)) return prev;
            return [comp, ...prev];
          });
          setSelectedId((prev) => prev || comp.id);
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

  // Filter pengaduan berdasarkan pencarian dan tab status dengan penanganan null-safety
  const filtered = (complaints || []).filter((c) => {
    if (!c) return false;
    const title = c.title || "";
    const ticket = c.ticket_number || "";
    const address = c.address || "";
    const searchLower = (search || "").toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(searchLower) ||
      ticket.toLowerCase().includes(searchLower) ||
      address.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (statusFilter === "pending") return c.status === "pending";
    if (statusFilter === "in_progress")
      return c.status === "in_progress" || c.status === "verified";
    if (statusFilter === "under_review") return c.status === "under_review";
    if (statusFilter === "resolved") return c.status === "resolved";
    if (statusFilter === "rejected") return c.status === "rejected";

    return true;
  });

  const current = complaints.find((c) => c.id === selectedId) || filtered[0] || complaints[0];

  const assignedOfficer = officers.find(
    (o) => o.id === current?.assigned_officer_id
  );

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;

    if (!selectedOfficerId) {
      toast.error("Silakan pilih petugas lapangan terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Memverifikasi dan menugaskan petugas...");

    try {
      const result = await assignComplaintAction({
        complaintId: current.id,
        officerId: selectedOfficerId,
        priority,
        targetDate,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      // Optimistic update status lokal langsung berubah menjadi 'in_progress'
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === current.id
            ? {
                ...c,
                status: "in_progress",
                assigned_officer_id: selectedOfficerId,
                priority,
                target_date: targetDate,
                verified_at: new Date().toISOString(),
              }
            : c
        )
      );

      setShowReassignForm(false);
      if (result.data) {
        emitLocalCrossTab({
          eventType: "UPDATE",
          actionType: "ASSIGNED",
          actorRole: "admin",
          complaint: {
            id: result.data.id,
            ticket_number: result.data.ticket_number,
            title: result.data.title,
            status: result.data.status,
            user_id: result.data.user_id,
            assigned_officer_id: result.data.assigned_officer_id,
            updated_at: result.data.updated_at,
          },
        });
      }
      toast.dismiss(toastId);
      toast.success(result.message);
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;

    setIsRejecting(true);
    const toastId = toast.loading("Memproses penolakan laporan...");

    try {
      const result = await rejectComplaintAction({
        complaintId: current.id,
        reason: rejectReason,
        note: rejectNote.trim(),
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      const fullReasonText = rejectNote.trim()
        ? `[${rejectReason}] ${rejectNote.trim()}`
        : rejectReason;

      // Optimistic update status lokal langsung menjadi 'rejected'
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === current.id
            ? {
                ...c,
                status: "rejected",
                completion_note: fullReasonText,
                verified_at: new Date().toISOString(),
              }
            : c
        )
      );

      emitLocalCrossTab({
        eventType: "UPDATE",
        actionType: "REJECTED",
        actorRole: "admin",
        complaint: {
          id: current.id,
          ticket_number: current.ticket_number,
          title: current.title,
          status: "rejected",
          user_id: current.user_id,
          completion_note: fullReasonText,
          updated_at: new Date().toISOString(),
        },
      });

      setShowRejectModal(false);
      setRejectNote("");
      toast.dismiss(toastId);
      toast.success("Laporan berhasil ditolak dan status diperbarui.");
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Gagal menolak laporan.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Kolom Kiri: Antrean Laporan (4 cols / 35%) - Selaras dan sejajar presisi dengan card detail di sebelahnya */}
      <Card className="lg:col-span-4 rounded-xl p-5 space-y-4 shadow-sm border border-border bg-card flex flex-col h-full">
        <div className="flex items-center justify-between gap-2 shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            Antrean Laporan
          </h2>
          <Badge variant="outline" className="text-[10px] text-slate-600 dark:text-slate-300 font-medium shrink-0 whitespace-nowrap bg-muted/50 border-border">
            {filtered.length} tiket
          </Badge>
        </div>

        {/* Tab Filter Status (Horizontal Scroll & Single-Line per Tab) */}
        <div className="flex flex-nowrap overflow-x-auto scrollbar-none gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-border shrink-0">
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Perlu Verifikasi" },
            { id: "in_progress", label: "Diproses" },
            { id: "under_review", label: "Tinjauan" },
            { id: "resolved", label: "Selesai" },
            { id: "rejected", label: "Ditolak" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`whitespace-nowrap shrink-0 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-slate-900 text-[#0c3b37] dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Cari ID atau nama jalan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Daftar Item Antrean: Tinggi dinamis flex-1 menyesuaikan card sebelah persis, bisa discroll jika ada lebih dari 2 card */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1 min-h-[192px]">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Tidak ada laporan dalam filter ini.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.id === (current?.id || selectedId);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowReassignForm(false);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      document.getElementById("report-detail")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#eef7f5] dark:bg-emerald-950/40 border-[#b2ded6] dark:border-emerald-700/60 shadow-xs"
                      : "bg-white dark:bg-slate-900/90 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isSelected
                          ? "text-[#0c3b37] dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {item.ticket_number}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-1 font-medium">
                    {item.address} • {formatDateTime(item.created_at)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Kolom Kanan: Detail & Form Verifikasi & Penugasan (8 cols / 65%) */}
      {current ? (
        <Card id="report-detail" className="lg:col-span-8 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm border border-border bg-card flex flex-col h-full">
          {/* Header Tiket Detail */}
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4 shrink-0">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                {current.ticket_number}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {current.title}
              </h1>
              <p className="text-xs text-slate-400">
                Dilaporkan {current.profiles?.full_name || "Warga"} •{" "}
                {formatDateTimeWithHours(current.created_at)}
              </p>
            </div>

            <StatusBadge status={current.status} />
          </div>

          {/* Main Grid: Photo & Info vs Assignment / Status Panel (Compact & Tidak Memanjang) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start flex-1">
            {/* Sisi Kiri: Foto, Lokasi, Deskripsi */}
            <div className="space-y-4 flex flex-col">
              {/* Foto Pelapor */}
              <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border group shrink-0">
                <Image
                  src={current.photo_url}
                  alt={current.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                  FOTO PELAPOR
                </div>
              </div>

              {/* Lokasi Kejadian */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  LOKASI KEJADIAN
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {current.address}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-[#0c3b37] dark:text-emerald-400 pt-0.5">
                  <span>
                    {(() => {
                      const lat = Number(current.latitude);
                      const lng = Number(current.longitude);
                      return !isNaN(lat) && !isNaN(lng) && current.latitude !== null && current.longitude !== null
                        ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                        : "-6.8915, 107.5965";
                    })()}
                  </span>
                  <span>•</span>
                  <a
                    href={`https://www.google.com/maps?q=${current.latitude || -6.8915},${current.longitude || 107.5965}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-0.5"
                  >
                    Buka peta ↗
                  </a>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1 pt-1 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  DESKRIPSI
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-border">
                  {current.description}
                </p>
              </div>
            </div>

            {/* Sisi Kanan: CONDITIONAL PANEL BERDASARKAN STATUS */}
            {current.status === "pending" || showReassignForm ? (
              /* FORM VERIFIKASI & PENUGASAN (HANYA UNTUK LAPORAN PENDING ATAU REASSIGN) */
              <form
                onSubmit={handleAssign}
                className="bg-[#f8faf9] dark:bg-slate-800/40 border border-[#e8ecea] dark:border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {showReassignForm ? "Ubah penugasan petugas" : "Verifikasi & penugasan"}
                  </h3>
                  {showReassignForm && (
                    <button
                      type="button"
                      onClick={() => setShowReassignForm(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Checkbox Konfirmasi */}
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="photoVerified"
                    checked={isPhotoVerified}
                    onCheckedChange={(checked) => setIsPhotoVerified(Boolean(checked))}
                  />
                  <Label
                    htmlFor="photoVerified"
                    className="cursor-pointer text-xs font-semibold text-emerald-800 dark:text-emerald-300"
                  >
                    ✓ Foto dan lokasi sesuai
                  </Label>
                </div>

                {/* Prioritas Penanganan */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Prioritas penanganan
                  </Label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full h-10 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0c3b37]/20 focus:border-[#0c3b37] appearance-none transition-all cursor-pointer"
                    >
                      <option value="Rendah">Rendah</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Tinggi">Tinggi</option>
                      <option value="Darurat">Darurat</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Petugas Lapangan Dropdown */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Petugas lapangan
                  </Label>
                  <div className="relative">
                    <select
                      value={selectedOfficerId}
                      onChange={(e) => setSelectedOfficerId(e.target.value)}
                      className="w-full h-10 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0c3b37]/20 focus:border-[#0c3b37] appearance-none transition-all cursor-pointer"
                    >
                      {officers.map((officer) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.full_name} • Tim Jalan 02
                        </option>
                      ))}
                      {officers.length === 0 && (
                        <option value="">(Belum ada petugas terdaftar)</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Target Selesai Date Picker */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Target selesai
                  </Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white border-slate-200"
                  />
                </div>

                {/* Tombol Verifikasi & Tugaskan */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isPhotoVerified}
                    className="w-full h-11 bg-[#0c3b37] hover:bg-[#082825] text-white font-semibold text-xs shadow-sm rounded-xl cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        {showReassignForm ? "Simpan Perubahan Penugasan" : "Verifikasi & tugaskan"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {!showReassignForm && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRejectModal(true)}
                      className="w-full h-10 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      Tolak Laporan (Tidak Sesuai / Hoax)
                    </Button>
                  )}

                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    {showReassignForm
                      ? "Perubahan penugasan akan langsung tersimpan."
                      : "Pilih verifikasi untuk menugaskan petugas, atau tolak jika laporan tidak sesuai."}
                  </p>
                </div>
              </form>
            ) : current.status === "in_progress" || current.status === "verified" ? (
              /* KONDISI 2: LAPORAN SEDANG DIKERJAKAN OLEH PETUGAS */
              <div className="bg-[#f0f9f8] dark:bg-slate-800/60 border border-[#c2e4dd] dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Sedang Dikerjakan di Lapangan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Laporan telah diverifikasi & ditugaskan ke petugas.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Petugas Ditugaskan:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {assignedOfficer?.full_name || "Petugas Lapangan"} (Tim Jalan 02)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Prioritas:</span>
                    <Badge variant="outline" className="font-bold text-amber-700 bg-amber-50">
                      {current.priority || "Sedang"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Target Selesai:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {current.target_date ? formatDateTime(current.target_date) : "2 Hari ke depan"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  Menunggu petugas menyelesaikan perbaikan dan mengirimkan foto bukti hasil pengerjaan.
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href={`/dashboard/admin/penugasan/${current.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Buka Halaman Detail Penugasan & Peta →
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReassignForm(true)}
                    className="w-full text-xs font-semibold rounded-xl border-slate-200 hover:bg-white"
                  >
                    Ubah Petugas / Target Selesai
                  </Button>
                </div>
              </div>
            ) : current.status === "under_review" ? (
              /* KONDISI 3: PEKERJAAN SELESAI, MENUNGGU TINJAUAN ADMIN (MATCHING SCREENSHOT ISSUE) */
              <div className="bg-[#f0f9f8] dark:bg-slate-800/60 border border-[#b8dfd8] dark:border-emerald-800/40 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Hasil Pekerjaan Siap Ditinjau
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Petugas telah mengirimkan dokumentasi perbaikan.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Petugas lapangan telah menandai pekerjaan selesai dan mengunggah foto bukti perbaikan jalan.
                  </p>

                  {current.completion_photo_url && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                      <Image
                        src={current.completion_photo_url}
                        alt="Foto Hasil Perbaikan"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                        BUKTI PERBAIKAN PETUGAS
                      </div>
                    </div>
                  )}

                  {current.completion_note && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 italic">
                      &quot;{current.completion_note}&quot;
                    </div>
                  )}
                </div>

                <Link
                  href={`/dashboard/admin/review?ticket=${current.ticket_number}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white font-semibold text-xs transition-all shadow-sm"
                >
                  Tinjau & Konfirmasi Hasil Perbaikan
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[10px] text-slate-400 text-center">
                  Buka layar komparasi foto sebelum/sesudah dan konfirmasi ke warga.
                </p>
              </div>
            ) : current.status === "resolved" ? (
              /* KONDISI 4: LAPORAN TELAH SELESAI & DITUTUP */
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Laporan Selesai & Ditutup
                    </h3>
                    <p className="text-[11px] text-emerald-700/80">
                      Perbaikan telah diverifikasi dan disetujui.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-emerald-100 dark:border-slate-800 text-xs space-y-1.5">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Laporan ini telah melewati seluruh tahapan: Verifikasi Admin → Penanganan Petugas → Tinjauan & Penutupan.
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Warga pelapor telah menerima pemberitahuan perbaikan selesai.
                  </div>
                </div>

                <Link
                  href={`/dashboard/admin/review?ticket=${current.ticket_number}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 text-xs font-semibold transition-colors shadow-2xs"
                >
                  Lihat Dokumentasi Selesai
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : current.status === "rejected" ? (
              /* KONDISI 5: LAPORAN TELAH DITOLAK */
              <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                    <AlertCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                      Laporan Ditolak / Tidak Diproses
                    </h3>
                    <p className="text-[11px] text-rose-700/80">
                      Laporan ditandai tidak valid oleh admin.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-rose-100 dark:border-slate-800 text-xs space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Alasan & Penjelasan Penolakan:
                    </span>
                    <p className="text-xs text-rose-900 dark:text-rose-300 font-medium mt-1 leading-relaxed whitespace-pre-line">
                      {current.completion_note || "Laporan tidak valid atau tidak ditemukan kerusakan jalan di lokasi."}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    Status ini otomatis ditampilkan pada halaman detail pelapor dan tercatat di linimasa.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {/* MODAL PENOLAKAN LAPORAN (HOAX / TIDAK SESUAI / ISENG) */}
      {showRejectModal && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tolak Laporan #{current.ticket_number}
                </h3>
                <p className="text-xs text-slate-500">
                  Pastikan bukti foto dan informasi telah diperiksa. Penolakan akan memberitahukan warga alasan laporan tidak dapat diproses.
                </p>
              </div>
            </div>

            <form onSubmit={handleReject} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kategori Alasan Penolakan <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full h-10 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none transition-all cursor-pointer"
                  >
                    <option value="Laporan Tidak Valid / Fiktif">Laporan Tidak Valid / Fiktif (Hoax)</option>
                    <option value="Jalan Tidak Rusak / Kondisi Normal">Jalan Tidak Rusak / Kondisi Normal</option>
                    <option value="Foto Tidak Jelas / Tidak Relevan">Foto Tidak Jelas / Tidak Relevan</option>
                    <option value="Lokasi Di Luar Wilayah Operasional">Lokasi Di Luar Wilayah Operasional</option>
                    <option value="Laporan Duplikat">Laporan Duplikat / Sedang Ditangani</option>
                    <option value="Lainnya">Alasan Lainnya</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catatan Tambahan untuk Warga (Opsional)
                </Label>
                <textarea
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Contoh: Setelah pengecekan lapangan, jalan ini sudah diperbaiki minggu lalu atau foto tidak menampilkan jalan umum."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectNote("");
                  }}
                  className="rounded-xl text-xs font-semibold px-4"
                  disabled={isRejecting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isRejecting}
                  className="rounded-xl text-xs font-semibold px-4 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Menolak...
                    </>
                  ) : (
                    "Konfirmasi Tolak Laporan"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
