import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Complaint, UserRole } from "@/types";

interface DashboardWelcomeHeroProps {
  userName: string;
  role: UserRole;
  ctaText?: string;
  ctaHref?: string;
  latestComplaint?: Complaint | null;
  totalPending?: number;
  totalResolved?: number;
}

export function DashboardWelcomeHero({
  userName,
  role,
  ctaText,
  ctaHref = "/dashboard/warga/buat",
  latestComplaint,
  totalPending = 0,
  totalResolved = 0,
}: DashboardWelcomeHeroProps) {
  const firstName = userName ? userName.split(" ")[0] : "Pengguna";

  const getDefaultCta = () => {
    if (role === "admin") {
      return { text: "Tinjau Laporan Masuk", href: "/dashboard/admin" };
    }
    if (role === "officer") {
      return { text: "Buka Tugas Lapangan", href: "/dashboard/petugas" };
    }
    return { text: "Buat Laporan Baru", href: "/dashboard/warga/buat" };
  };

  const defaultCta = getDefaultCta();
  const buttonText = ctaText || defaultCta.text;
  const buttonHref = ctaHref || defaultCta.href;

  const getSubHeadline = () => {
    if (role === "admin") {
      return "Kendali terpadu verifikasi laporan warga, penugasan petugas lapangan, dan SLA perbaikan jalan kota.";
    }
    if (role === "officer") {
      return "Daftar penugasan perbaikan jalan aktif, rute GPS lokasi, dan pelaporan hasil foto penyelesaian tugas.";
    }
    return "Satu wadah transparansi penanganan jalan rusak: laporkan jalan berlubang, pantau status pengerjaan, dan kawal hasilnya.";
  };

  return (
    <Card className="rounded-xl border border-border bg-gradient-to-br from-[#0c3b37] via-[#0f4b45] to-[#125851] text-white overflow-hidden shadow-xs relative">
      {/* Background accents */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-16 w-60 h-60 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

      <CardContent className="p-5 sm:p-6 lg:p-7 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 max-w-xl">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Selamat datang, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            {getSubHeadline()}
          </p>
        </div>

        <div className="shrink-0 flex items-center">
          <Button
            asChild
            className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-[#0c3b37] font-semibold text-xs sm:text-sm h-10 px-5 rounded-lg shadow-sm gap-2 whitespace-nowrap shrink-0"
          >
            <Link href={buttonHref}>
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
