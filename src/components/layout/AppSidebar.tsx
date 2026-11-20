"use client";

import React from "react";
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
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchSubpaths?: boolean;
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
        {
          label: "Penugasan",
          href: "/dashboard/admin/penugasan",
          icon: Share2,
          matchSubpaths: true,
        },
        {
          label: "Hasil perbaikan",
          href: "/dashboard/admin/review",
          icon: CheckCircle2,
          matchSubpaths: true,
        },
      ];
    }

    if (role === "officer") {
      return [
        { label: "Ringkasan", href: "/dashboard/petugas/ringkasan", icon: LayoutGrid },
        { label: "Tugas saya", href: "/dashboard/petugas", icon: Share2 },
        {
          label: "Riwayat tugas",
          href: "/dashboard/petugas/riwayat",
          icon: FileText,
          matchSubpaths: true,
        },
      ];
    }

    // Citizen (Masyarakat)
    return [
      { label: "Dashboard", href: "/dashboard/warga", icon: LayoutGrid },
      {
        label: "Laporan saya",
        href: "/dashboard/warga/laporan",
        icon: FileText,
        matchSubpaths: true,
      },
      { label: "Buat laporan", href: "/dashboard/warga/buat", icon: PlusSquare },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto h-full flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-2xl lg:shadow-none ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${isCollapsed ? "lg:w-20" : "w-72 lg:w-[268px]"}`}
    >
      {/* 1. Header Bar: Height 56px (h-14) on mobile / 64px (h-16) on desktop, matching AppHeader */}
      <div className="h-14 sm:h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-5 flex-shrink-0">
        <div className="flex items-center min-w-0 flex-1 mr-2">
          <Link
            href="/"
            onClick={() => onCloseMobile?.()}
            className="flex items-center focus:outline-none min-w-0"
            title="JalanBaik"
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

      {/* 2. Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2.5">
              {getRoleHeader()}
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isExactActive = pathname === item.href;
              const isSubActive =
                Boolean(item.matchSubpaths) && pathname.startsWith(item.href + "/");
              const isActive = isExactActive || isSubActive;

              return (
                <Link
                  key={item.label}
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
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
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
          <Avatar className="w-7 h-7 border border-slate-200 dark:border-slate-700 flex-shrink-0">
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase">
              {userName ? userName.charAt(0) : <User className="w-3.5 h-3.5" />}
            </AvatarFallback>
          </Avatar>
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
