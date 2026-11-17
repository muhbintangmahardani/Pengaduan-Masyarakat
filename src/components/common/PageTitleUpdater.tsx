"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "jalanbaik | Jalan Lebih Baik, Bersama",
      "/login": "Masuk Akun | jalanbaik",
      "/register": "Daftar Warga | jalanbaik",
      "/dashboard/warga": "Dashboard Masyarakat | jalanbaik",
      "/dashboard/warga/buat": "Buat Laporan Baru | jalanbaik",
      "/dashboard/warga/laporan": "Laporan Saya | jalanbaik",
      "/dashboard/admin": "Laporan Masuk & Penugasan | jalanbaik",
      "/dashboard/admin/ringkasan": "Ringkasan Eksekutif | jalanbaik",
      "/dashboard/admin/penugasan": "Monitoring Penugasan | jalanbaik",
      "/dashboard/admin/review": "Tinjau Hasil Perbaikan | jalanbaik",
      "/dashboard/petugas": "Tugas Lapangan | jalanbaik",
      "/dashboard/petugas/ringkasan": "Ringkasan Kerja Petugas | jalanbaik",
      "/dashboard/petugas/riwayat": "Riwayat Pekerjaan Selesai | jalanbaik",
    };

    let title = routeTitles[pathname];

    if (!title) {
      if (pathname.startsWith("/dashboard/admin")) {
        title = "Panel Admin | jalanbaik";
      } else if (pathname.startsWith("/dashboard/petugas")) {
        title = "Ruang Petugas | jalanbaik";
      } else if (pathname.startsWith("/dashboard/warga")) {
        title = "Ruang Warga | jalanbaik";
      } else {
        title = "jalanbaik | Jalan Lebih Baik, Bersama";
      }
    }

    document.title = title;
  }, [pathname]);

  return null;
}
