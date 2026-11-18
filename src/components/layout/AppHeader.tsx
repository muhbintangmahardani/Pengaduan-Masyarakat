"use client";

import React, { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  isMobileMenuOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileMenu?: () => void;
}

interface BreadcrumbStep {
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
  isMobileMenuOpen = false,
  onToggleSidebar,
  onOpenMobileMenu,
}: AppHeaderProps) {
  const pathname = usePathname();
  const [ticketQuery, setTicketQuery] = useState<string | null>(null);

  // Ambil tiket dari query string browser (misal ?ticket=JB-2026-4158)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("ticket");
      setTicketQuery(t || null);
    }
  }, [pathname]);

  const roleLabelMap: Record<UserRole, string> = {
    citizen: "Masyarakat",
    officer: "Petugas Lapangan",
    admin: "Administrator",
  };

  // Menghasilkan hierarki breadcrumb yang sejajar horizontal di topbar
  const getBreadcrumbs = (): BreadcrumbStep[] => {
    // 1. Profil & Notifikasi
    if (pathname === "/dashboard/profile") {
      return [{ label: "Profil Saya" }];
    }
    if (pathname.startsWith("/dashboard/notifikasi")) {
      return [{ label: "Notifikasi" }];
    }

    // 2. Ruang Masyarakat (Citizen)
    if (pathname === "/dashboard/warga") {
      return [{ label: "Dashboard" }];
    }
    if (pathname === "/dashboard/warga/buat") {
      return [
        { label: "Laporan Saya", href: "/dashboard/warga/laporan" },
        { label: "Buat Laporan" },
      ];
    }
    if (pathname.startsWith("/dashboard/warga/laporan/")) {
      return [
        { label: "Laporan Saya", href: "/dashboard/warga/laporan" },
        { label: "Detail Laporan" },
      ];
    }
    if (pathname === "/dashboard/warga/laporan") {
      return [{ label: "Laporan Saya" }];
    }

    // 3. Ruang Admin
    if (pathname === "/dashboard/admin/ringkasan") {
      return [{ label: "Ringkasan" }];
    }
    if (pathname === "/dashboard/admin") {
      return [{ label: "Laporan Masuk" }];
    }
    if (pathname.startsWith("/dashboard/admin/penugasan/")) {
      return [
        { label: "Penugasan", href: "/dashboard/admin/penugasan" },
        { label: "Detail Penugasan" },
      ];
    }
    if (pathname === "/dashboard/admin/penugasan") {
      return [{ label: "Penugasan" }];
    }
    if (pathname.startsWith("/dashboard/admin/review")) {
      const detailLabel = ticketQuery ? `Detail Laporan (${ticketQuery})` : "Detail Laporan";
      return [
        { label: "Hasil Perbaikan", href: "/dashboard/admin/review" },
        { label: detailLabel },
      ];
    }

    // 4. Ruang Petugas Lapangan (Officer)
    if (pathname === "/dashboard/petugas/ringkasan") {
      return [{ label: "Ringkasan" }];
    }
    if (pathname.startsWith("/dashboard/petugas/riwayat/")) {
      return [
        { label: "Riwayat Tugas", href: "/dashboard/petugas/riwayat" },
        { label: "Detail Laporan" },
      ];
    }
    if (pathname === "/dashboard/petugas/riwayat") {
      return [{ label: "Riwayat Tugas" }];
    }
    if (pathname === "/dashboard/petugas") {
      if (ticketQuery) {
        return [
          { label: "Tugas Saya", href: "/dashboard/petugas" },
          { label: `Detail Tugas (${ticketQuery})` },
        ];
      }
      return [{ label: "Tugas Saya" }];
    }

    return [{ label: "Dashboard" }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-background/95 backdrop-blur-sm px-3 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      {/* KIRI: Tombol Toggle Sidebar / Animated Hamburger + Breadcrumb Navigasi Sejajar Horisontal */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 mr-2 sm:mr-3">
        {/* Tombol Mobile Hamburger dengan Animasi Morf Transisi ke 'X' (Ukuran & Ketebalan Harmonis dengan Icon Sekitar) */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg hover:bg-muted active:scale-95 transition-all cursor-pointer shrink-0 gap-[3.5px] p-1.5 focus:outline-none"
          title={isMobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
          aria-label={isMobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
        >
          <span
            className={`block h-[1.75px] w-[18px] bg-foreground/90 rounded-full transition-all duration-300 ease-in-out origin-center ${
              isMobileMenuOpen ? "rotate-45 translate-y-[5.25px]" : ""
            }`}
          />
          <span
            className={`block h-[1.75px] w-[18px] bg-foreground/90 rounded-full transition-all duration-200 ease-in-out ${
              isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-[1.75px] w-[18px] bg-foreground/90 rounded-full transition-all duration-300 ease-in-out origin-center ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-[5.25px]" : ""
            }`}
          />
        </button>

        {/* Tombol Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          title="Buka / Tutup Sidebar"
          aria-label="Buka / Tutup Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Divider pemisah hanya di layar desktop/tablet agar mobile tetap rapi */}
        <div className="hidden sm:block h-4 w-px bg-border shrink-0" />

        {/* Shadcn Breadcrumb Sejajar dengan Lonceng Notifikasi */}
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="text-xs sm:text-sm font-medium flex-nowrap overflow-hidden">
            {breadcrumbs.map((step, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <React.Fragment key={step.label}>
                  <BreadcrumbItem className="truncate">
                    {isLast || !step.href ? (
                      <BreadcrumbPage className="truncate font-semibold text-foreground text-xs sm:text-sm">
                        {step.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={step.href}
                          className="text-muted-foreground hover:text-foreground transition-colors truncate text-xs sm:text-sm"
                        >
                          {step.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="shrink-0" />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* KANAN: Mode Malam, Lonceng Notifikasi Real-time & Avatar Profil (Sejajar dengan Breadcrumb) */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <ThemeToggle />
        <NotificationBell userId={userId} userRole={userRole} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2.5 p-0.5 sm:pl-2 sm:py-1.5 rounded-full hover:bg-muted transition-colors focus:outline-none group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {userName}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {roleLabelMap[userRole] || userRole}
                </div>
              </div>

              <Avatar className="w-8 h-8 border border-primary/20 shadow-xs shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {userName ? (
                    userName.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-foreground transition-transform shrink-0" />
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
                <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {roleLabelMap[userRole]}
                </Badge>
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
