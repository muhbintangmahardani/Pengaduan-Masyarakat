"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  PlusSquare,
  CheckCircle2,
  Share2,
  Inbox,
  LogOut,
  X,
  User,
  ChevronRight,
  CornerDownRight,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  role,
  userName = "Pengguna",
  userEmail,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [ticketQuery, setTicketQuery] = useState<string | null>(null);

  // Ambil tiket dari query string browser secara aman (tanpa memicu de-opt Suspense Next.js)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("ticket");
      setTicketQuery(t || null);
    }
  }, [pathname]);

  const getRoleHeader = () => {
    if (role === "admin") return "RUANG ADMIN";
    if (role === "officer") return "RUANG PETUGAS";
    return "RUANG MASYARAKAT";
  };

  const getNavItems = (): NavItem[] => {
    if (role === "admin") {
      return [
        { label: "Ringkasan", href: "/dashboard/admin/ringkasan", icon: LayoutGrid },
        { label: "Laporan masuk", href: "/dashboard/admin", icon: Inbox },
        { label: "Penugasan", href: "/dashboard/admin/penugasan", icon: Share2 },
        { label: "Hasil perbaikan", href: "/dashboard/admin/review", icon: CheckCircle2 },
      ];
    }

    if (role === "officer") {
      return [
        { label: "Ringkasan", href: "/dashboard/petugas/ringkasan", icon: LayoutGrid },
        { label: "Tugas saya", href: "/dashboard/petugas", icon: Share2 },
        { label: "Riwayat tugas", href: "/dashboard/petugas/riwayat", icon: FileText },
      ];
    }

    // Citizen (Masyarakat)
    return [
      { label: "Dashboard", href: "/dashboard/warga", icon: LayoutGrid },
      { label: "Laporan saya", href: "/dashboard/warga/laporan", icon: FileText },
      { label: "Buat laporan", href: "/dashboard/warga/buat", icon: PlusSquare },
    ];
  };

  const navItems = getNavItems();

  // Evaluasi cerdas untuk mendeteksi konteks detail tugas dan menghasilkan label breadcrumb sidebar
  const getDetailInfo = () => {
    // 1. Admin: Detail Penugasan (/dashboard/admin/penugasan/[id])
    if (pathname.startsWith("/dashboard/admin/penugasan/")) {
      const rawId = pathname.replace("/dashboard/admin/penugasan/", "").split("/")[0];
      const detailLabel = rawId
        ? rawId.startsWith("JB-")
          ? rawId
          : `Detail #${rawId.slice(0, 8)}`
        : "Detail Penugasan";

      return {
        parentHref: "/dashboard/admin/penugasan",
        parentLabel: "Penugasan",
        detailLabel,
      };
    }

    // 2. Admin: Hasil Perbaikan / Tinjauan Lapangan (/dashboard/admin/review)
    if (pathname === "/dashboard/admin/review" || pathname.startsWith("/dashboard/admin/review/")) {
      const subId = pathname.replace("/dashboard/admin/review", "").replace(/^\//, "").split("/")[0];
      const activeTicket = ticketQuery || subId;
      const detailLabel = activeTicket
        ? activeTicket.startsWith("JB-")
          ? activeTicket
          : `Tiket ${activeTicket}`
        : "Tinjau Hasil";

      return {
        parentHref: "/dashboard/admin/review",
        parentLabel: "Hasil perbaikan",
        detailLabel,
      };
    }

    // 3. Petugas: Detail Riwayat Tugas (/dashboard/petugas/riwayat/[id])
    if (pathname.startsWith("/dashboard/petugas/riwayat/")) {
      const rawId = pathname.replace("/dashboard/petugas/riwayat/", "").split("/")[0];
      const detailLabel = rawId
        ? rawId.startsWith("JB-")
          ? rawId
          : `Tugas #${rawId.slice(0, 8)}`
        : "Detail Tugas Selesai";

      return {
        parentHref: "/dashboard/petugas/riwayat",
        parentLabel: "Riwayat tugas",
        detailLabel,
      };
    }

    // 4. Petugas: Tugas Lapangan Aktif dengan Nomor Tiket
    if (pathname === "/dashboard/petugas" && ticketQuery) {
      return {
        parentHref: "/dashboard/petugas",
        parentLabel: "Tugas saya",
        detailLabel: ticketQuery,
      };
    }

    // 5. Warga: Detail Laporan (/dashboard/warga/laporan/[id])
    if (pathname.startsWith("/dashboard/warga/laporan/")) {
      const rawId = pathname.replace("/dashboard/warga/laporan/", "").split("/")[0];
      const detailLabel = rawId
        ? rawId.startsWith("JB-")
          ? rawId
          : `Laporan #${rawId.slice(0, 8)}`
        : "Detail Laporan";

      return {
        parentHref: "/dashboard/warga/laporan",
        parentLabel: "Laporan saya",
        detailLabel,
      };
    }

    return null;
  };

  const detailInfo = getDetailInfo();

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto h-full flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-2xl lg:shadow-none ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${isCollapsed ? "lg:w-20" : "w-72 lg:w-[268px]"}`}
    >
      {/* 1. Header Bar: Height 64px (h-16) with border-b, matching AppHeader */}
      <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-5 flex-shrink-0">
        <div className="flex items-center min-w-0 flex-1 mr-2">
          <Link
            href="/"
            onClick={() => onCloseMobile?.()}
            className="flex items-center focus:outline-none min-w-0"
            title="jalanbaik"
          >
            <JalanBaikLogo
              size={isCollapsed ? "md" : "md"}
              variant={isCollapsed ? "icon" : "full"}
            />
          </Link>
        </div>

        {/* Tombol Tutup Mobile & Tablet Drawer */}
        <div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
              title="Tutup Menu"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation Items dengan Breadcrumb Detail Tugas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2.5">
              {getRoleHeader()}
            </div>
          )}

          {/* Breadcrumb Mini Badge di Atas Daftar Navigasi Saat Membuka Detail Tugas */}
          {!isCollapsed && detailInfo && (
            <div className="mx-2 mb-3.5 px-3 py-2 rounded-xl bg-[#e8f5f1]/90 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-1.5 text-[11px] animate-in fade-in duration-200 shadow-2xs">
              <span className="font-medium text-slate-600 dark:text-slate-400 truncate">
                {detailInfo.parentLabel}
              </span>
              <ChevronRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-[#0c3b37] dark:text-emerald-300 truncate">
                {detailInfo.detailLabel}
              </span>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isExactActive = pathname === item.href;
              const isDetailActive = detailInfo?.parentHref === item.href;
              const isActive = isExactActive || isDetailActive;

              return (
                <div key={item.label} className="space-y-1">
                  <Link
                    href={item.href}
                    prefetch={true}
                    onClick={() => onCloseMobile?.()}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 duration-150 ${
                      isActive
                        ? "bg-[#e8f5f1] dark:bg-emerald-950/50 text-[#0c3b37] dark:text-emerald-300 shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-[#0c3b37] dark:text-emerald-400" : "text-slate-400"
                      }`}
                    />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isCollapsed && isDetailActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </Link>

                  {/* Cabang Hierarki Breadcrumb Bersarang di Bawah Menu Induk */}
                  {isDetailActive && !isCollapsed && (
                    <div className="ml-5 pl-3 border-l-2 border-[#0c3b37]/25 dark:border-emerald-500/30 my-1 py-0.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#e8f5f1] dark:bg-emerald-950/60 text-[#0c3b37] dark:text-emerald-300">
                        <CornerDownRight className="w-3 h-3 text-[#0c3b37] dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{detailInfo.detailLabel}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-auto animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. Footer Section (Profil Saya, Help Box, Logout) */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 flex-shrink-0 bg-white dark:bg-slate-900">
        <Link
          href="/dashboard/profile"
          onClick={() => onCloseMobile?.()}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title={isCollapsed ? "Profil Saya" : undefined}
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0 font-bold text-xs uppercase border border-slate-200 dark:border-slate-700">
            {userName ? userName.charAt(0) : <User className="w-3.5 h-3.5" />}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate leading-none mb-0.5">
                {userName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {userEmail || "Lihat & edit profil"}
              </p>
            </div>
          )}
        </Link>

        {/* Kotak Layanan Bantuan (Hidden on collapse) */}
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                Pusat Bantuan
              </p>
              <p className="text-[9px] text-slate-400">Siap melayani 24/7</p>
            </div>
            <a
              href="mailto:support@jalanbaik.go.id"
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Kontak
            </a>
          </div>
        )}

        {/* Tombol Logout */}
        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title={isCollapsed ? "Keluar Sistem" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Keluar Sistem</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
