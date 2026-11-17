"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Inbox,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  isNotificationRead,
  isNotificationCleared,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearSingleNotification,
  clearAllNotifications,
  subscribeToNotificationSync,
} from "@/lib/notificationStore";
import { subscribeToLiveRoom } from "@/lib/realtimeBroadcast";
import type { UserRole } from "@/types";

interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  time: string;
  fullDate: string;
  read: boolean;
  ticketNumber?: string;
  status?: string;
  timestamp: number;
  href?: string;
}

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "actionable" | "resolved">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("citizen");
  const [userId, setUserId] = useState<string>("");

  const loadNotifications = async (silent: boolean = false) => {
    // Hanya tampilkan skeleton besar jika data belum pernah dimuat sama sekali
    if (!silent && notifications.length === 0) {
      setIsLoading(true);
    } else if (!silent) {
      setIsRefreshing(true);
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role: UserRole = profile?.role || "citizen";
      setUserRole(role);

      let query = supabase
        .from("complaints")
        .select("id, ticket_number, title, status, created_at, updated_at, user_id, assigned_officer_id")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (role === "citizen") {
        query = query.eq("user_id", user.id);
      } else if (role === "officer") {
        query = query.eq("assigned_officer_id", user.id);
      } else if (role === "admin") {
        // Admin melihat laporan pending, in_progress, under_review, resolved
      }

      const { data: complaints } = await query;

      if (complaints && complaints.length > 0) {
        const activeComplaints = complaints.filter(
          (c) => !isNotificationCleared(c.id)
        );

        const mapped: NotificationRecord[] = activeComplaints.map((c) => {
          let title = "Pemberitahuan Laporan";
          let message = `Laporan "${c.title}" (${c.ticket_number})`;
          let href = "/dashboard/warga";

          if (role === "admin") {
            if (c.status === "pending") {
              title = "Laporan Perlu Verifikasi";
              message = `Tiket ${c.ticket_number} baru masuk dari warga dan menunggu penugasan segera.`;
              href = "/dashboard/admin";
            } else if (c.status === "under_review") {
              title = "Hasil Siap Ditinjau";
              message = `Petugas telah menyelesaikan perbaikan ${c.ticket_number}. Silakan verifikasi bukti.`;
              href = `/dashboard/admin/review?ticket=${c.ticket_number}`;
            } else if (c.status === "in_progress") {
              title = "Pekerjaan Lapangan Aktif";
              message = `Tiket ${c.ticket_number} sedang dalam penanganan petugas lapangan.`;
              href = "/dashboard/admin/penugasan";
            } else {
              title = "Laporan Selesai & Ditutup";
              message = `Tiket ${c.ticket_number} telah disetujui tuntas oleh administrator.`;
              href = "/dashboard/admin/penugasan";
            }
          } else if (role === "officer") {
            if (c.status === "in_progress" || c.status === "verified") {
              title = "Tugas Lapangan Diterima";
              message = `Admin menugaskan Anda menangani perbaikan jalan untuk ${c.ticket_number}.`;
              href = `/dashboard/petugas?ticket=${c.ticket_number}`;
            } else if (c.status === "under_review") {
              title = "Menunggu Persetujuan Admin";
              message = `Bukti foto ${c.ticket_number} sedang diperiksa oleh administrator.`;
              href = `/dashboard/petugas?ticket=${c.ticket_number}`;
            } else if (c.status === "resolved") {
              title = "Pekerjaan Disetujui & Tuntas";
              message = `Laporan ${c.ticket_number} dinyatakan selesai dan resmi ditutup.`;
              href = "/dashboard/petugas/riwayat";
            }
          } else {
            // Citizen
            if (c.status === "pending") {
              title = "Laporan Terkirim ke Sistem";
              message = `Laporan ${c.ticket_number} berhasil masuk dan antre untuk verifikasi tim dinas.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            } else if (c.status === "in_progress" || c.status === "verified") {
              title = "Sedang Ditangani Petugas";
              message = `Laporan ${c.ticket_number} telah diverifikasi dan tim lapangan sedang memperbaiki di lokasi.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            } else if (c.status === "under_review") {
              title = "Perbaikan Tahap Tinjauan";
              message = `Petugas telah selesai bekerja pada ${c.ticket_number}. Admin sedang memeriksa bukti hasil.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            } else if (c.status === "resolved") {
              title = "Jalan Selesai Diperbaiki!";
              message = `Laporan ${c.ticket_number} telah selesai dan permukaan jalan aman dilalui.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            }
          }

          const read = isNotificationRead(c.id, c.status);

          return {
            id: c.id,
            title,
            message,
            time: formatDateTime(c.updated_at || c.created_at),
            fullDate: new Date(c.updated_at || c.created_at).toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            read,
            ticketNumber: c.ticket_number,
            status: c.status,
            timestamp: new Date(c.updated_at || c.created_at).getTime(),
            href,
          };
        });

        setNotifications(mapped);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn("Gagal mengambil daftar notifikasi:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications(false);

    const unsubscribeSync = subscribeToNotificationSync(() => {
      loadNotifications(true);
    });

    const unsubscribeLive = subscribeToLiveRoom(() => {
      loadNotifications(true);
    });

    // Polling background senyap setiap 30 detik tanpa flicker UI
    const pollTimer = setInterval(() => {
      loadNotifications(true);
    }, 30000);

    return () => {
      unsubscribeSync();
      unsubscribeLive();
      clearInterval(pollTimer);
    };
  }, []);

  const handleMarkAllRead = () => {
    const items = notifications.map((n) => ({ id: n.id, status: n.status }));
    markAllNotificationsAsRead(items);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Semua notifikasi ditandai sudah dibaca");
  };

  const handleClearAll = () => {
    const ids = notifications.map((n) => n.id);
    clearAllNotifications(ids);
    setNotifications([]);
    toast.success("Riwayat notifikasi berhasil dibersihkan!");
  };

  const handleMarkSingleRead = (id: string, status: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(id, status);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Notifikasi ditandai dibaca");
  };

  const handleClearSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    clearSingleNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notifikasi dihapus dari riwayat");
  };

  // Filter tab items
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.read;
    if (activeTab === "actionable")
      return item.status === "pending" || item.status === "under_review" || item.status === "in_progress";
    if (activeTab === "resolved") return item.status === "resolved";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700 text-xs font-bold"
          >
            Verifikasi
          </Badge>
        );
      case "in_progress":
      case "verified":
        return (
          <Badge
            variant="outline"
            className="bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-700 text-xs font-bold"
          >
            Pengerjaan
          </Badge>
        );
      case "under_review":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700 text-xs font-bold"
          >
            Tinjauan
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 text-xs font-bold"
          >
            Selesai
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Riwayat Notifikasi
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                {unreadCount} baru
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Semua riwayat pembaruan status laporan, penugasan lapangan, dan verifikasi dinas.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadNotifications(false)}
            disabled={isLoading || isRefreshing}
            className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700"
            title="Segarkan daftar notifikasi"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Menyegarkan..." : "Segarkan"}
          </Button>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              Tandai Semua Dibaca
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Bersihkan Riwayat
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "all"
              ? "bg-[#0c3b37] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          Semua ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "unread"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <span>Belum Dibaca</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "unread" ? "bg-white text-red-600" : "bg-red-600 text-white"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("actionable")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "actionable"
              ? "bg-[#0c3b37] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          Proses / Penugasan
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resolved")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "resolved"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          Selesai
        </button>
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200/50"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="rounded-2xl p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 shadow-none">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Bell className="w-6 h-6 opacity-40" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak ada notifikasi dalam filter ini
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {activeTab === "unread"
                ? "Bagus sekali! Semua notifikasi telah Anda baca."
                : "Semua riwayat notifikasi baru yang masuk akan otomatis tampil di sini."}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((item) => (
            <Card
              key={item.id}
              className={`rounded-2xl transition-all border p-4 sm:p-5 relative ${
                !item.read
                  ? "bg-red-50/20 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-xs ring-1 ring-red-500/10"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Indicator Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      !item.read
                        ? "bg-red-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {item.status === "resolved" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : item.status === "under_review" ? (
                      <Wrench className="w-5 h-5" />
                    ) : item.status === "in_progress" ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      {getStatusBadge(item.status)}
                      {!item.read && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                          BARU
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.fullDate}
                      </span>
                      {item.ticketNumber && (
                        <span className="font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                          Tiket: {item.ticketNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                  {!item.read && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMarkSingleRead(item.id, item.status, e)}
                      className="h-8 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      title="Tandai Sudah Dibaca"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Baca
                    </Button>
                  )}

                  {item.href && (
                    <Link
                      href={item.href}
                      onClick={() => markNotificationAsRead(item.id)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Buka Tiket</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleClearSingle(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Hapus dari riwayat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
