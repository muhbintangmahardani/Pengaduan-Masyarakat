import crypto from "crypto";

/**
 * Menghasilkan Nomor Tiket Pengaduan Unik Gaya Jalanbaik
 * Format: JB-YYYY-XXXX
 * Contoh: JB-2026-0142
 */
export function generateTicketNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  // Menghasilkan 4 digit angka acak atau sekuensial (misal: 0142)
  const randomNum = Math.floor(100 + Math.random() * 9000);
  const formattedNum = String(randomNum).padStart(4, "0");

  return `JB-${year}-${formattedNum}`;
}
