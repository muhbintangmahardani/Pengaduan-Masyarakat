import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Laporan Baru",
};

export default function BuatLaporanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
