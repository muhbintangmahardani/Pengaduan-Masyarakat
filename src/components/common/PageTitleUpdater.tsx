"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "JalanBaik | Jalan Lebih Baik, Bersama",
      "/login": "Masuk Akun | JalanBaik",
      "/register": "Daftar Warga | JalanBaik",
      "/dashboard/warga": "Dashboard Masyarakat | JalanBaik",
      "/dashboard/warga/buat": "Buat Laporan Baru | JalanBaik",
      "/dashboard/warga/laporan": "Laporan Saya | JalanBaik",
      "/dashboard/admin": "Laporan Masuk & Penugasan | JalanBaik",
      "/dashboard/admin/ringkasan": "Ringkasan Eksekutif | JalanBaik",
      "/dashboard/admin/penugasan": "Monitoring Penugasan | JalanBaik",
      "/dashboard/admin/review": "Tinjau Hasil Perbaikan | JalanBaik",
      "/dashboard/petugas": "Tugas Lapangan | JalanBaik",
      "/dashboard/petugas/ringkasan": "Ringkasan Kerja Petugas | JalanBaik",
      "/dashboard/petugas/riwayat": "Riwayat Pekerjaan Selesai | JalanBaik",
    };

    let title = routeTitles[pathname];

    if (!title) {
      if (pathname.startsWith("/dashboard/admin")) {
        title = "Panel Admin | JalanBaik";
      } else if (pathname.startsWith("/dashboard/petugas")) {
        title = "Ruang Petugas | JalanBaik";
      } else if (pathname.startsWith("/dashboard/warga")) {
        title = "Ruang Warga | JalanBaik";
      } else {
        title = "JalanBaik | Jalan Lebih Baik, Bersama";
      }
    }

    document.title = title;
  }, [pathname]);

  return null;
}
