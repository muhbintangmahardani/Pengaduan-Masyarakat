"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "Jalan Baik | Jalan Lebih Baik, Bersama",
      "/login": "Masuk Akun | Jalan Baik",
      "/register": "Daftar Warga | Jalan Baik",
      "/dashboard/warga": "Dashboard Masyarakat | Jalan Baik",
      "/dashboard/warga/buat": "Buat Laporan Baru | Jalan Baik",
      "/dashboard/warga/laporan": "Laporan Saya | Jalan Baik",
      "/dashboard/admin": "Laporan Masuk & Penugasan | Jalan Baik",
      "/dashboard/admin/ringkasan": "Ringkasan Eksekutif | Jalan Baik",
      "/dashboard/admin/penugasan": "Monitoring Penugasan | Jalan Baik",
      "/dashboard/admin/review": "Tinjau Hasil Perbaikan | Jalan Baik",
      "/dashboard/petugas": "Tugas Lapangan | Jalan Baik",
      "/dashboard/petugas/ringkasan": "Ringkasan Kerja Petugas | Jalan Baik",
      "/dashboard/petugas/riwayat": "Riwayat Pekerjaan Selesai | Jalan Baik",
    };

    let title = routeTitles[pathname];

    if (!title) {
      if (pathname.startsWith("/dashboard/admin")) {
        title = "Panel Admin | Jalan Baik";
      } else if (pathname.startsWith("/dashboard/petugas")) {
        title = "Ruang Petugas | Jalan Baik";
      } else if (pathname.startsWith("/dashboard/warga")) {
        title = "Ruang Warga | Jalan Baik";
      } else {
        title = "Jalan Baik | Jalan Lebih Baik, Bersama";
      }
    }

    document.title = title;
  }, [pathname]);

  return null;
}
