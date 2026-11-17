import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ComplaintCategory, ComplaintStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal standar Indonesia dalam zona waktu Asia/Jakarta (WIB)
 * Contoh: "18 Nov 2026"
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format tanggal lengkap beserta nama hari dan jam dalam zona waktu Asia/Jakarta (WIB) secara real-time
 * Contoh: "Rabu, 18 Nov 2026, 03.43 WIB"
 */
export function formatDateTimeWithHours(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formatter.format(date)} WIB`;
  } catch {
    return dateString;
  }
}

/**
 * Format tanggal hari ini dalam format lengkap berbahasa Indonesia (WIB)
 * Contoh: "Rabu, 18 November 2026"
 */
export function formatCurrentDateWIB(): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/**
 * Format jam dan menit saja dalam zona waktu Asia/Jakarta (WIB)
 * Contoh: "03.43 WIB"
 */
export function formatTimeWIB(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formatter.format(date)} WIB`;
  } catch {
    return dateString;
  }
}

export function formatCategoryLabel(category: ComplaintCategory): string {
  const map: Record<ComplaintCategory, string> = {
    infrastruktur: "Jalan & Infrastruktur",
    kebersihan: "Kebersihan & Sampah",
    ketertiban_umum: "Ketertiban Umum",
    kesehatan: "Fasilitas Kesehatan",
    lingkungan_hidup: "Taman & Lingkungan",
    lainnya: "Lainnya",
  };
  return map[category] || category;
}

export function formatStatusLabel(status: ComplaintStatus): string {
  const map: Record<ComplaintStatus, string> = {
    pending: "Menunggu verifikasi",
    verified: "Diverifikasi",
    in_progress: "Sedang dikerjakan",
    under_review: "Menunggu tinjauan",
    resolved: "Selesai diperbaiki",
    rejected: "Ditolak",
  };
  return map[status] || status;
}

export function formatPriorityLabel(priority: "low" | "medium" | "high"): string {
  const map: Record<"low" | "medium" | "high", string> = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi (Darurat)",
  };
  return map[priority] || priority;
}
