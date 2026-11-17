// ==============================================================================
// TYPE DEFINITIONS: PLATFORM PENGADUAN JALANBAIK (PER-ROLE WORKFLOW)
// ==============================================================================

export type UserRole = "citizen" | "officer" | "admin";

export type ComplaintCategory =
  | "infrastruktur"
  | "kebersihan"
  | "ketertiban_umum"
  | "kesehatan"
  | "lingkungan_hidup"
  | "lainnya";

export type ComplaintStatus =
  | "pending" // Menunggu verifikasi
  | "verified" // Diverifikasi
  | "in_progress" // Sedang dikerjakan
  | "under_review" // Menunggu tinjauan admin
  | "resolved" // Selesai diperbaiki
  | "rejected"; // Ditolak / Tidak valid

export type DamageLevel = "Ringan" | "Sedang" | "Berat";
export type DamagePriority = "Rendah" | "Sedang" | "Tinggi" | "Darurat";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  ticket_number: string;
  user_id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  photo_url: string;
  status: ComplaintStatus;
  is_public: boolean;
  assigned_officer_id: string | null;
  
  // Fields khusus workflow jalanbaik
  damage_type?: string;
  damage_level?: string;
  priority?: string;
  target_date?: string | null;
  completion_photo_url?: string | null;
  completion_note?: string | null;
  completed_at?: string | null;
  verified_at?: string | null;

  created_at: string;
  updated_at: string;
  
  // Relations
  profiles?: Profile;
  assigned_officer?: Profile | null;
  complaint_timelines?: ComplaintTimeline[];
}

export interface PublicComplaintFeedItem {
  id: string;
  ticket_number: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  photo_url: string;
  status: ComplaintStatus;
  created_at: string;
  masked_reporter: string;
}

export interface ComplaintTimeline {
  id: string;
  complaint_id: string;
  actor_id: string;
  status: ComplaintStatus;
  note: string;
  evidence_photo_url: string | null;
  created_at: string;
  actor?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_name: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface StatisticsSummary {
  total: number;
  pending: number;
  inProgress: number;
  underReview?: number;
  resolved: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
