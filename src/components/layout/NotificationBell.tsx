"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  Inbox,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types";
import {
  isNotificationRead,
  isNotificationCleared,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotificationSync,
  notifySync,
} from "@/lib/notificationStore";
import { playNotificationSound } from "@/lib/audioNotification";
import {
  subscribeToLiveRoom,
  type BroadcastComplaintPayload,
} from "@/lib/realtimeBroadcast";

export interface NotificationItem {
  id: string;
  rawId?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  ticketNumber?: string;
  status?: string;
  timestamp: number;
  href?: string;
}

interface NotificationBellProps {
  userId?: string;
  userRole?: UserRole;
}

export function NotificationBell({
  userId,
  userRole = "citizen",
}: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const processedEventKeysRef = useRef<Set<string>>(new Set());
  const unreadKeysRef = useRef<Set<string>>(new Set());

  // 1. Fetch riwayat notifikasi awal yang disesuaikan secara akurat per ROLE
  const fetchRoleNotifications = useCallback(async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from("complaints")
        .select("id, ticket_number, title, status, created_at, updated_at, user_id, assigned_officer_id")
        .order("updated_at", { ascending: false })
        .limit(25);

      if (userRole === "citizen" && userId) {
        query = query.eq("user_id", userId);
      } else if (userRole === "officer" && userId) {
        query = query.eq("assigned_officer_id", userId);
      } else if (userRole === "admin") {
        query = query.in("status", ["pending", "under_review", "in_progress", "verified", "resolved"]);
      }

      const { data: complaints } = await query;

      if (complaints && complaints.length > 0) {
        const activeComplaints = complaints.filter(
          (c) => !isNotificationCleared(c.id)
        );

        const mapped: NotificationItem[] = activeComplaints.map((c) => {
          let title = "Pemberitahuan Laporan";
          let message = `Laporan "${c.title}" (${c.ticket_number})`;
          let href = "/dashboard/warga";

          if (userRole === "admin") {
            if (c.status === "pending") {
              title = "Laporan Perlu Verifikasi";
              message = `Tiket ${c.ticket_number} baru masuk dari warga dan menunggu penugasan.`;
              href = "/dashboard/admin";
            } else if (c.status === "under_review") {
              title = "Hasil Siap Ditinjau";
              message = `Petugas telah menyelesaikan perbaikan ${c.ticket_number}.`;
              href = `/dashboard/admin/review?ticket=${c.ticket_number}`;
            } else if (c.status === "resolved") {
              title = "Laporan Resmi Ditutup";
              message = `Tiket ${c.ticket_number} telah selesai dan disetujui tuntas.`;
              href = `/dashboard/admin/penugasan/${c.id}`;
            } else {
              title = "Pekerjaan Lapangan Aktif";
              message = `Tiket ${c.ticket_number} sedang ditangani tim di lapangan.`;
              href = "/dashboard/admin/penugasan";
            }
          } else if (userRole === "officer") {
            if (c.status === "in_progress" || c.status === "verified") {
              title = "Tugas Lapangan Diterima";
              message = `Anda ditugaskan menangani perbaikan ${c.ticket_number}.`;
              href = `/dashboard/petugas?ticket=${c.ticket_number}`;
            } else if (c.status === "under_review") {
              title = "Menunggu Persetujuan Admin";
              message = `Bukti foto ${c.ticket_number} sedang diperiksa oleh administrator.`;
              href = `/dashboard/petugas?ticket=${c.ticket_number}`;
            } else if (c.status === "resolved") {
              title = "Pekerjaan Disetujui Admin";
              message = `Laporan ${c.ticket_number} dinyatakan selesai dan resmi ditutup.`;
              href = "/dashboard/petugas/riwayat";
            }
          } else {
            // Citizen
            if (c.status === "pending") {
              title = "Laporan Terkirim";
              message = `Laporan ${c.ticket_number} berhasil masuk antrean verifikasi dinas.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            } else if (c.status === "in_progress" || c.status === "verified") {
              title = "Sedang Ditangani Petugas";
              message = `Laporan ${c.ticket_number} telah diverifikasi dan tim sudah di lokasi pengerjaan.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            } else if (c.status === "under_review") {
              title = "Perbaikan Tahap Tinjauan";
              message = `Petugas telah selesai bekerja pada ${c.ticket_number}. Admin sedang memeriksa bukti hasil.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            } else if (c.status === "resolved") {
              title = "Jalan Selesai Diperbaiki!";
              message = `Kabar baik! Laporan ${c.ticket_number} telah selesai diperbaiki dan disetujui dinas.`;
              href = `/dashboard/warga/laporan/${c.id}`;
            }
          }

          const notifKey = `${c.id}:${c.status}`;
          const isReadInStorage = isNotificationRead(c.id, c.status);
          const isExplicitlyUnread = unreadKeysRef.current.has(notifKey);
          const read = isExplicitlyUnread ? false : isReadInStorage;

          return {
            id: notifKey,
            rawId: c.id,
            title,
            message,
            time: formatDateTime(c.updated_at || c.created_at),
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
      console.warn("Gagal memuat notifikasi awal:", err);
    }
  }, [userId, userRole]);

  // 2. Pemroses Event Instan Lintas Role (Broadcast WebSocket & Local Cross-Tab)
  const processNotificationEvent = useCallback(
    (record: any, eventType: string, actionType?: string) => {
      if (!record || Object.keys(record).length === 0) return;

      // Kunci idempotensi unik per event
      const dedupeKey = `${record.id}-${record.status}-${record.updated_at || Date.now()}`;
      if (processedEventKeysRef.current.has(dedupeKey)) {
        return;
      }
      processedEventKeysRef.current.add(dedupeKey);
      if (processedEventKeysRef.current.size > 50) {
        processedEventKeysRef.current.clear();
      }

      const currentUserId = userId ? String(userId).toLowerCase() : "";
      const recordUserId = record.user_id ? String(record.user_id).toLowerCase() : "";
      const recordOfficerId = record.assigned_officer_id
        ? String(record.assigned_officer_id).toLowerCase()
        : "";

      // Verifikasi kepemilikan laporan warga:
      // Cocokkan user_id, atau jika user_id tidak dikirim di payload parsial postgres_changes,
      // cocokkan dengan laporan yang sudah ada di antrean lokal warga
      const isCitizenReport =
        userRole === "citizen" &&
        (recordUserId === currentUserId ||
          (!recordUserId && notifications.some((n) => n.rawId === record.id)));

      let shouldNotify = false;
      let notifTitle = "Pembaruan Laporan";
      let notifMsg = `Laporan ${record.ticket_number || ""} telah diperbarui di sistem.`;
      let href = "/dashboard/warga";

      // =========================================================================
      // ALUR 1: WARGA MEMBUAT LAPORAN BARU -> NOTIFIKASI LANGSUNG KE ADMIN
      // =========================================================================
      if (eventType === "INSERT" || actionType === "CREATED") {
        if (userRole === "admin") {
          shouldNotify = true;
          notifTitle = "🚨 Laporan Baru Masuk!";
          notifMsg = `Warga melaporkan "${record.title || "Jalan Rusak"}" (${record.ticket_number || ""}). Segera verifikasi & tugaskan tim.`;
          href = "/dashboard/admin";
        }
      }

      // =========================================================================
      // ALUR 2: ADMIN MENUGASKAN PETUGAS LAPANGAN -> NOTIFIKASI KE PETUGAS & WARGA
      // =========================================================================
      else if (
        record.status === "in_progress" ||
        record.status === "verified" ||
        actionType === "ASSIGNED"
      ) {
        if (userRole === "officer" && recordOfficerId === currentUserId) {
          shouldNotify = true;
          notifTitle = "🛠️ Tugas Lapangan Baru!";
          notifMsg = `Admin menugaskan Anda menangani perbaikan "${record.title || "Jalan"}" (${record.ticket_number}). Buka tugas untuk navigasi GPS.`;
          href = `/dashboard/petugas?ticket=${record.ticket_number}`;
        } else if (isCitizenReport) {
          shouldNotify = true;
          notifTitle = "🚗 Laporan Sedang Dikerjakan";
          notifMsg = `Laporan Anda (${record.ticket_number}) telah diverifikasi dinas dan tim lapangan sedang menangani di lokasi.`;
          href = `/dashboard/warga/laporan/${record.id}`;
        }
      }

      // =========================================================================
      // ALUR 3: PETUGAS SELESAI & UNGGAH FOTO -> NOTIFIKASI KE ADMIN & WARGA
      // =========================================================================
      else if (record.status === "under_review" || actionType === "WORK_SUBMITTED") {
        if (userRole === "admin") {
          shouldNotify = true;
          notifTitle = "🔍 Hasil Pekerjaan Siap Ditinjau!";
          notifMsg = `Petugas telah menyelesaikan perbaikan ${record.ticket_number} dan mengunggah foto bukti. Silakan konfirmasi hasil.`;
          href = `/dashboard/admin/review?ticket=${record.ticket_number}`;
        } else if (isCitizenReport) {
          shouldNotify = true;
          notifTitle = "📋 Perbaikan Tahap Tinjauan";
          notifMsg = `Petugas telah menyelesaikan pekerjaan pada ${record.ticket_number}. Admin sedang memeriksa bukti hasil.`;
          href = `/dashboard/warga/laporan/${record.id}`;
        }
      }

      // =========================================================================
      // ALUR 4: ADMIN MENYETUJUI LAPORAN -> NOTIFIKASI KE WARGA & PETUGAS
      // =========================================================================
      else if (record.status === "resolved" || actionType === "RESOLVED") {
        if (isCitizenReport) {
          shouldNotify = true;
          notifTitle = "🎉 Jalan Selesai Diperbaiki!";
          notifMsg = `Kabar baik! Laporan Anda (${record.ticket_number}) telah tuntas diperbaiki dan disetujui dinas. Terima kasih!`;
          href = `/dashboard/warga/laporan/${record.id}`;
        } else if (userRole === "officer" && recordOfficerId === currentUserId) {
          shouldNotify = true;
          notifTitle = "✅ Pekerjaan Disetujui Admin";
          notifMsg = `Laporan ${record.ticket_number} telah disetujui tuntas oleh administrator. Terima kasih atas kerja keras Anda!`;
          href = "/dashboard/petugas/riwayat";
        }
      }

      // =========================================================================
      // ALUR 5: ADMIN MEMINTA PERBAIKAN ULANG -> NOTIFIKASI KE PETUGAS
      // =========================================================================
      else if (actionType === "REWORK_REQUESTED") {
        if (userRole === "officer" && recordOfficerId === currentUserId) {
          shouldNotify = true;
          notifTitle = "⚠️ Permintaan Perbaikan Ulang";
          notifMsg = `Admin meminta perbaikan ulang untuk ${record.ticket_number}. Silakan periksa catatan dan lokasi kembali.`;
          href = `/dashboard/petugas?ticket=${record.ticket_number}`;
        }
      }

      // JIKA NOTIFIKASI BERLAKU UNTUK USER INI
      if (shouldNotify) {
        // 1. Putar suara notifikasi merdu instan
        playNotificationSound();

        const notifKey = `${record.id}:${record.status}`;
        unreadKeysRef.current.add(notifKey);

        // 2. Tambahkan notifikasi BARU dengan read = false ke list state
        const newNotifItem: NotificationItem = {
          id: notifKey,
          rawId: record.id,
          title: notifTitle,
          message: notifMsg,
          time: "Baru saja",
          read: false,
          ticketNumber: record.ticket_number,
          status: record.status,
          timestamp: Date.now(),
          href,
        };

        setNotifications((prev) => {
          const filtered = prev.filter((p) => p.id !== notifKey && p.rawId !== record.id);
          return [newNotifItem, ...filtered.slice(0, 24)];
        });

        // 3. Tampilkan Banner Toast Interaktif dengan Tombol Langsung Buka
        toast.info(notifTitle, {
          description: notifMsg,
          icon: <Bell className="w-4 h-4 text-emerald-500 animate-bounce" />,
          duration: 8000,
          action: href
            ? {
                label: "Buka",
                onClick: () => router.push(href),
              }
            : undefined,
        });

        // 4. Sinkronkan ke halaman riwayat /dashboard/notifikasi
        notifySync();
      }

      // REFRESH DATA HALAMAN OTOMATIS TANPA RELOAD MANUAL:
      const isRelevantToUser =
        userRole === "admin" ||
        recordUserId === currentUserId ||
        recordOfficerId === currentUserId;

      if (isRelevantToUser) {
        router.refresh();
      }
    },
    [userId, userRole, router]
  );

  // 3. Setup Multi-Channel Real-time via Shared Live Manager
  useEffect(() => {
    fetchRoleNotifications();

    const unsubscribeSync = subscribeToNotificationSync(() => {
      fetchRoleNotifications();
    });

    const unsubscribeLive = subscribeToLiveRoom((payload) => {
      if (payload && payload.complaint) {
        processNotificationEvent(
          payload.complaint,
          payload.eventType,
          payload.actionType
        );
      }
    });

    // Polling aktif senyap berkala sebagai pengaman jika perangkat mobile sempat tertidur
    const pollTimer = setInterval(() => {
      fetchRoleNotifications();
    }, 20000);

    return () => {
      unsubscribeSync();
      unsubscribeLive();
      clearInterval(pollTimer);
    };
  }, [fetchRoleNotifications, processNotificationEvent]);

  // Hitung jumlah notifikasi belum dibaca (memastikan akurat)
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    unreadKeysRef.current.clear();
    markAllNotificationsAsRead(
      notifications.map((n) => ({ id: n.rawId || n.id, status: n.status }))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Semua notifikasi ditandai sudah dibaca");
  };

  const handleItemClick = (item: NotificationItem) => {
    unreadKeysRef.current.delete(item.id);
    if (item.rawId && item.status) {
      unreadKeysRef.current.delete(`${item.rawId}:${item.status}`);
    }
    markNotificationAsRead(item.rawId || item.id, item.status);
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setIsOpen(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700">
            Verifikasi
          </span>
        );
      case "in_progress":
      case "verified":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700">
            Pengerjaan
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700">
            Tinjauan
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700">
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          aria-label="Notifikasi Real-time"
        >
          {/* Ikon Lonceng: Menyala Merah Terang Saat Ada Notifikasi Baru */}
          <Bell
            className={`w-4 h-4 transition-transform ${
              unreadCount > 0
                ? "text-red-600 dark:text-red-400 animate-bounce"
                : "group-hover:scale-105"
            }`}
          />

          {/* Badge / Titik Indikator Merah Menyala Berdenyut */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-md select-none z-10 animate-in zoom-in-75 duration-200">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative z-10 font-bold leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-md overflow-hidden z-50"
      >
        {/* Header Dropdown */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Notifikasi Sistem
            </span>
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 font-extrabold shadow-xs">
                {unreadCount} baru
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tandai dibaca
            </button>
          )}
        </div>

        {/* List Item Notifikasi */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-5 h-5 opacity-40" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Belum ada notifikasi baru
              </p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                Setiap pembaruan tiket dan penugasan akan masuk secara otomatis seketika di sini.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <Link
                key={item.id}
                href={item.href || "#"}
                onClick={() => handleItemClick(item)}
                className={`block p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors ${
                  !item.read
                    ? "bg-red-50/70 dark:bg-red-950/40 border-l-4 border-red-500"
                    : "dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-200 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{item.time}</span>
                      {item.ticketNumber && (
                        <span className="font-mono font-semibold text-[#0c3b37] dark:text-emerald-400 truncate">
                          • {item.ticketNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {!item.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse ring-2 ring-red-300 dark:ring-red-900" />
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer: Navigasi ke Halaman Lengkap Notifikasi */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-center">
          <Link
            href="/dashboard/notifikasi"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:bg-[#e6f4f1] dark:hover:bg-emerald-950/40 transition-colors"
          >
            <span>Lihat Semua Riwayat Notifikasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
