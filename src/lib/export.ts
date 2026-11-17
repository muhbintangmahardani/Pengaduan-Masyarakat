import type { Complaint } from "@/types";
import { formatDateTime, formatStatusLabel } from "@/lib/utils";

/**
 * Mengonversi daftar pengaduan menjadi format CSV dengan UTF-8 BOM
 * sehingga dapat dibuka di Microsoft Excel / Google Sheets tanpa masalah encoding karakter.
 */
export function exportComplaintsToCSV(
  complaints: Complaint[],
  filename: string = "laporan-jalanbaik.csv"
) {
  if (!complaints || complaints.length === 0) {
    alert("Tidak ada data laporan untuk diekspor.");
    return;
  }

  const headers = [
    "No. Tiket",
    "Judul Laporan",
    "Status",
    "Prioritas",
    "Jenis Kerusakan",
    "Tingkat Kerusakan",
    "Alamat",
    "Koordinat GPS",
    "Pelapor",
    "Petugas Lapangan",
    "Tanggal Masuk",
    "Target Selesai",
    "Tanggal Selesai",
    "Catatan Penyelesaian",
  ];

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = complaints.map((c) => {
    const coords =
      c.latitude && c.longitude
        ? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`
        : "";
    const reporterName = c.profiles?.full_name || "Masyarakat";
    const officerName = c.assigned_officer?.full_name || "-";
    const createdDate = formatDateTime(c.created_at);
    const targetDate = c.target_date ? formatDateTime(c.target_date) : "-";
    const completedDate = c.completed_at ? formatDateTime(c.completed_at) : "-";

    return [
      escapeCSV(c.ticket_number),
      escapeCSV(c.title),
      escapeCSV(formatStatusLabel(c.status)),
      escapeCSV(c.priority || "Sedang"),
      escapeCSV(c.damage_type || c.category || "Jalan Rusak"),
      escapeCSV(c.damage_level || "-"),
      escapeCSV(c.address),
      escapeCSV(coords),
      escapeCSV(reporterName),
      escapeCSV(officerName),
      escapeCSV(createdDate),
      escapeCSV(targetDate),
      escapeCSV(completedDate),
      escapeCSV(c.completion_note || "-"),
    ].join(",");
  });

  // Tambahkan UTF-8 BOM (\uFEFF)
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Mencetak laporan atau menyimpan sebagai file PDF melalui dialog cetak browser
 */
export function printComplaintsReport() {
  if (typeof window !== "undefined") {
    window.print();
  }
}
