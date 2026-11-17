import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ComplaintCategory, ComplaintStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTimeWithHours(dateString: string): string {
  try {
    const date = new Date(dateString);
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${dateFormatted}, ${hours}.${minutes} WIB`;
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

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
