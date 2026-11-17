"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AutoLogoutTimer } from "@/components/common/AutoLogoutTimer";
import type { UserRole } from "@/types";

interface DashboardShellProps {
  userId?: string;
  role: UserRole;
  userName: string;
  userEmail?: string;
  subtitle: string;
  children: React.ReactNode;
}

export function DashboardShell({
  userId,
  role,
  userName,
  userEmail,
  subtitle,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8faf9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative">
      {/* Sesi Auto-Logout Pengaman Inaktivitas */}
      <AutoLogoutTimer />

      {/* Backdrop Gelap untuk Mobile & iPad saat Drawer Terbuka */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <AppSidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (Independent Scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader
          subtitle={subtitle}
          userId={userId}
          userName={userName}
          userRole={role}
          userEmail={userEmail}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div
            key={pathname}
            className="max-w-7xl w-full mx-auto animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
