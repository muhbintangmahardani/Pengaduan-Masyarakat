import { z } from "zod";

export const complaintCategoryEnum = z.enum(
  [
    "infrastruktur",
    "kebersihan",
    "ketertiban_umum",
    "kesehatan",
    "lingkungan_hidup",
    "lainnya",
  ],
  {
    errorMap: () => ({ message: "Pilih kategori pengaduan yang valid." }),
  }
);

export const complaintStatusEnum = z.enum(
  [
    "pending",
    "verified",
    "in_progress",
    "under_review",
    "resolved",
    "rejected",
  ],
  {
    errorMap: () => ({ message: "Pilih status pengaduan yang valid." }),
  }
);

// Schema Validasi Formulir Pengaduan Warga (Image 2)
export const createComplaintSchema = z.object({
  title: z
    .string({ required_error: "Judul laporan wajib diisi." })
    .trim()
    .min(5, { message: "Judul laporan minimal 5 karakter." })
    .max(150, { message: "Judul laporan maksimal 150 karakter." }),
  category: complaintCategoryEnum.default("infrastruktur"),
  damage_type: z.string().default("Jalan berlubang"),
  damage_level: z.string().default("Sedang"),
  description: z
    .string({ required_error: "Deskripsi kerusakan wajib diisi." })
    .trim()
    .min(10, { message: "Berikan deskripsi detail minimal 10 karakter." })
    .max(2000, { message: "Deskripsi maksimal 2000 karakter." }),
  address: z
    .string({ required_error: "Alamat lengkap wajib diisi." })
    .trim()
    .min(5, { message: "Alamat lengkap minimal 5 karakter." })
    .max(255, { message: "Alamat maksimal 255 karakter." }),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  photo_url: z
    .string({ required_error: "Foto bukti kerusakan wajib diunggah." })
    .url({ message: "URL foto bukti tidak valid." }),
  is_public: z.boolean().default(true),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

// Schema Verifikasi & Penugasan oleh Admin (Image 3)
export const assignComplaintSchema = z.object({
  complaintId: z.string().uuid({ message: "ID Pengaduan tidak valid." }),
  officerId: z.string().uuid({ message: "Pilih petugas lapangan yang sah." }),
  priority: z.enum(["Rendah", "Sedang", "Tinggi", "Darurat"]).default("Sedang"),
  targetDate: z.string().min(4, { message: "Target tanggal selesai wajib diisi." }),
  note: z.string().optional(),
});

export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;

// Schema Pengiriman Hasil Pekerjaan oleh Petugas (Image 4)
export const submitWorkResultSchema = z.object({
  complaintId: z.string().uuid({ message: "ID Pengaduan tidak valid." }),
  completionPhotoUrl: z
    .string({ required_error: "Foto setelah perbaikan wajib dilampirkan." })
    .url({ message: "URL foto bukti pekerjaan tidak valid." }),
  completionNote: z
    .string({ required_error: "Catatan pekerjaan wajib diisi." })
    .trim()
    .min(10, { message: "Catatan pekerjaan minimal 10 karakter." })
    .max(1000, { message: "Catatan maksimal 1000 karakter." }),
});

export type SubmitWorkResultInput = z.infer<typeof submitWorkResultSchema>;

// Schema Konfirmasi Hasil Pekerjaan oleh Admin (Image 5)
export const reviewWorkResultSchema = z.object({
  complaintId: z.string().uuid({ message: "ID Pengaduan tidak valid." }),
  decision: z.enum(["approve", "rework"]),
  adminNote: z.string().optional(),
});

export type ReviewWorkResultInput = z.infer<typeof reviewWorkResultSchema>;
