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

  // Menentukan Judul Halaman Sederhana & Bersih (Tanpa Breadcrumb Berulang)
  const getPageTitle = (): string => {
    if (pathname === "/dashboard/profile") return "Profil Saya";
    if (pathname.startsWith("/dashboard/notifikasi")) return "Notifikasi";

    // Ruang Masyarakat
    if (pathname === "/dashboard/warga") return "Dashboard";
    if (pathname === "/dashboard/warga/buat") return "Buat Laporan Baru";
    if (pathname.startsWith("/dashboard/warga/laporan/")) return "Detail Laporan";
    if (pathname === "/dashboard/warga/laporan") return "Laporan Saya";

    // Ruang Admin
    if (pathname === "/dashboard/admin") return "Laporan Masuk & Penugasan";
    if (pathname === "/dashboard/admin/ringkasan") return "Ringkasan Eksekutif";
    if (pathname.startsWith("/dashboard/admin/penugasan/")) return "Detail Penugasan";
    if (pathname === "/dashboard/admin/penugasan") return "Monitoring Penugasan";
    if (pathname.startsWith("/dashboard/admin/review")) return "Tinjau Hasil Perbaikan";

    // Ruang Petugas
    if (pathname === "/dashboard/petugas/ringkasan") return "Ringkasan Kerja";
    if (pathname.startsWith("/dashboard/petugas/riwayat/")) return "Detail Riwayat Tugas";
    if (pathname === "/dashboard/petugas/riwayat") return "Riwayat Pekerjaan";
    if (pathname === "/dashboard/petugas") return "Tugas Lapangan";

    return "Dashboard";
  };

  const pageTitle = getPageTitle();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      {/* KIRI: Tombol Sidebar Trigger (PanelLeft) + Judul Menu Aktif */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              onOpenMobileMenu?.();
            } else {
              onToggleSidebar?.();
            }
          }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          title="Buka / Tutup Sidebar"
          aria-label="Buka / Tutup Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-border shrink-0" />

        <span className="font-bold text-xs sm:text-sm text-foreground tracking-tight truncate">
          {pageTitle}
        </span>
      </div>

      {/* KANAN: Mode Malam, Lonceng Notifikasi Real-time & Avatar Profil */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <ThemeToggle />
        <NotificationBell userId={userId} userRole={userRole} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 pl-2 py-1.5 rounded-full hover:bg-muted transition-colors focus:outline-none group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {userName}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {roleLabelMap[userRole] || userRole}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shadow-xs">
                {userName ? (
                  userName.charAt(0).toUpperCase()
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-2">
            <div className="p-2">
              <p className="text-xs font-bold text-foreground truncate">
                {userName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {userEmail || "user@jalanbaik.id"}
              </p>
              <div className="mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                  {roleLabelMap[userRole]}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/profile"
                className="w-full flex items-center gap-2 cursor-pointer text-xs"
              >
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Pengaturan Profil</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/notifikasi"
                className="w-full flex items-center gap-2 cursor-pointer text-xs"
              >
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Riwayat Notifikasi</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer text-xs font-semibold py-1 focus:text-rose-600"
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
