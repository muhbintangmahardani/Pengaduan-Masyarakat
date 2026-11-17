"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  Shield,
  PanelLeft,
  Home,
  ChevronRight,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { UserRole } from "@/types";

interface AppHeaderProps {
  subtitle: string;
  userId?: string;
  userName: string;
  userRole: UserRole;
  userEmail?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileMenu?: () => void;
}

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export function AppHeader({
  subtitle,
  userId,
  userName,
  userRole,
  userEmail,
  isSidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileMenu,
}: AppHeaderProps) {
  const pathname = usePathname();

  const roleLabelMap: Record<UserRole, string> = {
    citizen: "Masyarakat",
    officer: "Petugas Lapangan",
    admin: "Administrator",
  };

  const getHomeHref = () => {
    if (userRole === "admin") return "/dashboard/admin";
    if (userRole === "officer") return "/dashboard/petugas/ringkasan";
    return "/dashboard/warga";
  };

  // Struktur breadcrumb dinamis: Icon Home mewakili Beranda Utama, tanpa teks berulang
  const getBreadcrumbs = (): BreadcrumbSegment[] => {
    // Profil Pengguna (Semua Role)
    if (pathname === "/dashboard/profile") {
      return [{ label: "Profil Saya" }];
    }

    // Riwayat Notifikasi
    if (pathname.startsWith("/dashboard/notifikasi")) {
      return [{ label: "Notifikasi" }];
    }

    // 1. Ruang Masyarakat (Citizen)
    if (pathname === "/dashboard/warga") {
      return [{ label: "Dashboard" }];
    }
    if (pathname === "/dashboard/warga/buat") {
      return [{ label: "Buat Laporan" }];
    }
    if (pathname === "/dashboard/warga/laporan") {
      return [{ label: "Laporan Saya" }];
    }
    if (pathname.startsWith("/dashboard/warga/laporan/")) {
      return [
        { label: "Laporan Saya", href: "/dashboard/warga/laporan" },
        { label: "Detail Laporan" },
      ];
    }

    // 2. Ruang Administrator (Admin)
    if (pathname === "/dashboard/admin") {
      return [{ label: "Laporan Masuk" }];
    }
    if (pathname === "/dashboard/admin/ringkasan") {
      return [{ label: "Ringkasan Eksekutif" }];
    }
    if (pathname === "/dashboard/admin/penugasan") {
      return [{ label: "Monitoring Penugasan" }];
    }
    if (pathname.startsWith("/dashboard/admin/penugasan/")) {
      return [
        { label: "Monitoring Penugasan", href: "/dashboard/admin/penugasan" },
        { label: "Detail Penugasan" },
      ];
    }
    if (pathname.startsWith("/dashboard/admin/review")) {
      return [{ label: "Hasil Perbaikan" }];
    }

    // 3. Ruang Petugas (Officer)
    if (pathname === "/dashboard/petugas/ringkasan") {
      return [{ label: "Ringkasan Kerja" }];
    }
    if (pathname === "/dashboard/petugas") {
      return [{ label: "Tugas Saya" }];
    }
    if (pathname === "/dashboard/petugas/riwayat") {
      return [{ label: "Riwayat Tugas" }];
    }
    if (pathname.startsWith("/dashboard/petugas/riwayat/")) {
      return [
        { label: "Riwayat Tugas", href: "/dashboard/petugas/riwayat" },
        { label: "Detail Riwayat Tugas" },
      ];
    }

    return [{ label: "Dashboard" }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      {/* KIRI: Tombol Sidebar (PanelLeft) + Home Icon + Chevron + Breadcrumbs Segmen */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 mr-2">
        {/* Tombol Sidebar Trigger (PanelLeft) - Responsif Mobile & Desktop */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              onOpenMobileMenu?.();
            } else {
              onToggleSidebar?.();
            }
          }}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Buka / Tutup Sidebar"
          aria-label="Buka / Tutup Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Separator Garis Tipis Vertikal */}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Home Icon Button (Sesuai Referensi Gambar 2) */}
        <Link
          href={getHomeHref()}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title="Beranda Dashboard"
          aria-label="Beranda Dashboard"
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Chevron Separator Awal */}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 select-none shrink-0" />

        {/* Segmen Breadcrumb Dinamis */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-w-0 overflow-hidden">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-600 select-none shrink-0 ${!isLast ? "hidden sm:inline" : ""}`} />
                )}

                {isLast ? (
                  <span className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors whitespace-nowrap hidden sm:inline"
                  >
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* KANAN: Mode Malam, Lonceng Notifikasi Real-time & Avatar Profil (Sejajar sempurna) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <ThemeToggle />
        <NotificationBell userId={userId} userRole={userRole} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 pl-2 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0c3b37] transition-colors">
                  {userName}
                </div>
                <div className="text-[10px] text-slate-400">
                  {roleLabelMap[userRole] || userRole}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#e6f4f1] text-[#0c3b37] font-bold text-xs flex items-center justify-center border border-[#0c3b37]/20 shadow-xs">
                {userName ? (
                  userName.charAt(0).toUpperCase()
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-2">
            <div className="p-2">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {userEmail || "user@jalanbaik.id"}
              </p>
              <div className="mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f4f1] dark:bg-emerald-950/60 text-[#0c3b37] dark:text-emerald-300 uppercase">
                  {roleLabelMap[userRole]}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 py-1.5 cursor-pointer hover:text-[#0c3b37] dark:hover:text-emerald-400"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pengaturan Profil</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 text-rose-600 font-semibold text-xs py-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
