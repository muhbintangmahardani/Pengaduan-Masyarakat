"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createComplaintSchema,
  assignComplaintSchema,
  submitWorkResultSchema,
  reviewWorkResultSchema,
  type CreateComplaintInput,
  type AssignComplaintInput,
  type SubmitWorkResultInput,
  type ReviewWorkResultInput,
} from "@/schemas/complaint";
import { generateTicketNumber } from "@/lib/ticket";
import { broadcastComplaintEvent } from "@/lib/realtimeBroadcast";
import type { ActionResponse, Complaint, UserRole } from "@/types";

/**
 * 1. CITIZEN ACTION: Membuat Laporan Kerusakan Baru (Image 2)
 */
export async function createComplaintAction(
  input: CreateComplaintInput
): Promise<ActionResponse<Complaint>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Sesi Anda telah berakhir. Silakan login kembali.",
      };
    }

    const validation = createComplaintSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0]?.message || "Data formulir tidak valid.",
      };
    }

    const validData = validation.data;
    const ticketNumber = generateTicketNumber();

    const { data: complaint, error: insertError } = await supabase
      .from("complaints")
      .insert({
        ticket_number: ticketNumber,
        user_id: user.id,
        title: validData.title,
        category: validData.category,
        damage_type: validData.damage_type,
        damage_level: validData.damage_level,
        description: validData.description,
        address: validData.address,
        latitude: validData.latitude || null,
        longitude: validData.longitude || null,
        photo_url: validData.photo_url,
        is_public: validData.is_public,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert complaint error:", insertError);
      return {
        success: false,
        message: "Gagal menyimpan laporan ke database: " + insertError.message,
      };
    }

    // Catat ke Linimasa
    await supabase.from("complaint_timelines").insert({
      complaint_id: complaint.id,
      actor_id: user.id,
      status: "pending",
      note: "Laporan dibuat dan dikirim ke sistem. Menunggu verifikasi admin.",
    });

    // Catat Audit Log
    try {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "COMPLAINT_CREATED",
        entity_name: "complaints",
        entity_id: complaint.id,
        details: { ticket_number: ticketNumber },
      });
    } catch {}

    revalidatePath("/dashboard/warga");
    revalidatePath("/dashboard/admin");

    // Siarkan broadcast ke seluruh klien aktif (Admin dsb) secara instan
    await broadcastComplaintEvent({
      eventType: "INSERT",
      actionType: "CREATED",
      actorRole: "citizen",
      complaint: {
        id: complaint.id,
        ticket_number: ticketNumber,
        title: complaint.title,
        status: complaint.status,
        user_id: user.id,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at,
      },
    });

    return {
      success: true,
      message: `Laporan berhasil dibuat! No. Tiket: ${ticketNumber}`,
      data: complaint as Complaint,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
    };
  }
}

/**
 * 2. ADMIN ACTION: Verifikasi Laporan & Tugaskan Petugas Lapangan (Image 3)
 */
export async function assignComplaintAction(
  input: AssignComplaintInput
): Promise<ActionResponse<Complaint>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Sesi tidak sah. Silakan login." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if ((profile?.role as UserRole) !== "admin") {
      return { success: false, message: "Akses ditolak. Hanya Admin yang dapat menugaskan." };
    }

    const validation = assignComplaintSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, message: validation.error.errors[0]?.message || "Input tidak valid." };
    }

    const { complaintId, officerId, priority, targetDate, note } = validation.data;

    // Ambil nama petugas yang ditugaskan
    const { data: officerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", officerId)
      .single();

    const officerName = officerProfile?.full_name || "Petugas Lapangan";

    // Update status pengaduan menjadi 'in_progress' (Sedang dikerjakan)
    const { data: updatedComplaint, error: updateError } = await supabase
      .from("complaints")
      .update({
        status: "in_progress",
        assigned_officer_id: officerId,
        priority,
        target_date: targetDate,
        verified_at: new Date().toISOString(),
      })
      .eq("id", complaintId)
      .select()
      .single();

    if (updateError) {
      return { success: false, message: "Gagal memperbarui penugasan: " + updateError.message };
    }

    // Catat ke Linimasa
    await supabase.from("complaint_timelines").insert({
      complaint_id: complaintId,
      actor_id: user.id,
      status: "in_progress",
      note: note || `Admin menugaskan ${officerName}. Target selesai: ${targetDate}`,
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/petugas");
    revalidatePath("/dashboard/warga");

    // Siarkan broadcast ke Petugas & Warga secara instan
    await broadcastComplaintEvent({
      eventType: "UPDATE",
      actionType: "ASSIGNED",
      actorRole: "admin",
      complaint: {
        id: updatedComplaint.id,
        ticket_number: updatedComplaint.ticket_number,
        title: updatedComplaint.title,
        status: updatedComplaint.status,
        user_id: updatedComplaint.user_id,
        assigned_officer_id: updatedComplaint.assigned_officer_id,
        updated_at: updatedComplaint.updated_at,
      },
    });

    return {
      success: true,
      message: `Laporan berhasil diverifikasi dan ditugaskan ke ${officerName}!`,
      data: updatedComplaint as Complaint,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
    };
  }
}

/**
 * 3. OFFICER ACTION: Mengirimkan Hasil Pekerjaan / Foto Setelah Perbaikan (Image 4)
 */
export async function submitWorkResultAction(
  input: SubmitWorkResultInput
): Promise<ActionResponse<Complaint>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Sesi tidak sah. Silakan login." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "officer" && profile?.role !== "admin") {
      return { success: false, message: "Akses ditolak. Khusus Petugas Lapangan." };
    }

    const validation = submitWorkResultSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, message: validation.error.errors[0]?.message || "Input tidak valid." };
    }

    const { complaintId, completionPhotoUrl, completionNote } = validation.data;

    // Update status menjadi 'under_review' (Menunggu tinjauan)
    const { data: updatedComplaint, error: updateError } = await supabase
      .from("complaints")
      .update({
        status: "under_review",
        completion_photo_url: completionPhotoUrl,
        completion_note: completionNote,
        completed_at: new Date().toISOString(),
      })
      .eq("id", complaintId)
      .select()
      .single();

    if (updateError) {
      return { success: false, message: "Gagal mengirimkan hasil perbaikan: " + updateError.message };
    }

    // Catat ke Linimasa
    await supabase.from("complaint_timelines").insert({
      complaint_id: complaintId,
      actor_id: user.id,
      status: "under_review",
      note: completionNote,
      evidence_photo_url: completionPhotoUrl,
    });

    revalidatePath("/dashboard/petugas");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/warga");

    // Siarkan broadcast ke Admin & Warga secara instan
    await broadcastComplaintEvent({
      eventType: "UPDATE",
      actionType: "WORK_SUBMITTED",
      actorRole: "officer",
      complaint: {
        id: updatedComplaint.id,
        ticket_number: updatedComplaint.ticket_number,
        title: updatedComplaint.title,
        status: updatedComplaint.status,
        user_id: updatedComplaint.user_id,
        assigned_officer_id: updatedComplaint.assigned_officer_id,
        updated_at: updatedComplaint.updated_at,
      },
    });

    return {
      success: true,
      message: "Hasil pekerjaan berhasil dikirim ke Admin untuk ditinjau!",
      data: updatedComplaint as Complaint,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
    };
  }
}

/**
 * 4. ADMIN ACTION: Tinjau & Konfirmasi Hasil Perbaikan (Image 5)
 */
export async function reviewWorkResultAction(
  input: ReviewWorkResultInput
): Promise<ActionResponse<Complaint>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Sesi tidak sah. Silakan login." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, message: "Akses ditolak. Khusus Administrator." };
    }

    const validation = reviewWorkResultSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, message: "Input tidak valid." };
    }

    const { complaintId, decision, adminNote } = validation.data;
    const isApproved = decision === "approve";
    const nextStatus = isApproved ? "resolved" : "in_progress";

    const { data: updatedComplaint, error: updateError } = await supabase
      .from("complaints")
      .update({
        status: nextStatus,
      })
      .eq("id", complaintId)
      .select()
      .single();

    if (updateError) {
      return { success: false, message: "Gagal memperbarui status: " + updateError.message };
    }

    // Catat ke Linimasa
    await supabase.from("complaint_timelines").insert({
      complaint_id: complaintId,
      actor_id: user.id,
      status: nextStatus,
      note: isApproved
        ? "Pekerjaan perbaikan disetujui oleh admin. Laporan resmi ditutup."
        : `Admin meminta perbaikan ulang. Catatan: ${adminNote || "Hasil perbaikan belum memenuhi standar."}`,
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/review");
    revalidatePath("/dashboard/petugas");
    revalidatePath("/dashboard/warga");

    // Siarkan broadcast ke Warga & Petugas secara instan
    await broadcastComplaintEvent({
      eventType: "UPDATE",
      actionType: isApproved ? "RESOLVED" : "REWORK_REQUESTED",
      actorRole: "admin",
      complaint: {
        id: updatedComplaint.id,
        ticket_number: updatedComplaint.ticket_number,
        title: updatedComplaint.title,
        status: updatedComplaint.status,
        user_id: updatedComplaint.user_id,
        assigned_officer_id: updatedComplaint.assigned_officer_id,
        updated_at: updatedComplaint.updated_at,
      },
    });

    return {
      success: true,
      message: isApproved
        ? "Hasil perbaikan disetujui! Laporan telah ditandai Selesai."
        : "Permintaan perbaikan ulang telah dikirimkan kembali ke petugas.",
      data: updatedComplaint as Complaint,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
    };
  }
}

/**
 * 5. BACKWARD-COMPATIBLE ACTION: Update Status Sederhana
 */
export async function updateComplaintStatusAction(input: {
  complaintId: string;
  status: any;
  note: string;
}): Promise<ActionResponse<Complaint>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Sesi tidak sah." };
    }

    const { data: updatedComplaint, error } = await supabase
      .from("complaints")
      .update({ status: input.status })
      .eq("id", input.complaintId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    await supabase.from("complaint_timelines").insert({
      complaint_id: input.complaintId,
      actor_id: user.id,
      status: input.status,
      note: input.note,
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/petugas");
    revalidatePath("/dashboard/warga");

    await broadcastComplaintEvent({
      eventType: "UPDATE",
      actorRole: "admin",
      complaint: {
        id: updatedComplaint.id,
        ticket_number: updatedComplaint.ticket_number,
        title: updatedComplaint.title,
        status: updatedComplaint.status,
        user_id: updatedComplaint.user_id,
        assigned_officer_id: updatedComplaint.assigned_officer_id,
        updated_at: updatedComplaint.updated_at,
      },
    });

    return {
      success: true,
      message: "Status berhasil diperbarui.",
      data: updatedComplaint as Complaint,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan.",
    };
  }
}

/**
 * 6. PUBLIC/CITY-WIDE STATS ACTION: Digunakan oleh Grafik Tren (Khusus Bulan Berjalan, 100% Data Riil)
 */
export async function getComplaintStatsAction(): Promise<{
  success: boolean;
  totalMasuk: number;
  totalSelesai: number;
  monthName: string;
  chartData: Array<{ month: string; masuk: number; selesai: number }>;
}> {
  try {
    const supabase = await createClient();

    // Query semua laporan tanpa dummy data
    const { data: complaints, error } = await supabase
      .from("complaints")
      .select("id, status, created_at");

    if (error || !complaints) {
      return {
        success: false,
        totalMasuk: 0,
        totalSelesai: 0,
        monthName: "",
        chartData: [],
      };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthName = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      month: "long",
      year: "numeric",
    }).format(now);

    // Filter murni hanya untuk bulan berjalan (tidak ada data dummy bulan lalu)
    const thisMonthComplaints = complaints.filter((c) => {
      const d = new Date(c.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Hitung total murni bulan berjalan (atau fallback ke semua jika baru diuji)
    const totalMasuk = thisMonthComplaints.length > 0 ? thisMonthComplaints.length : complaints.length;
    const totalSelesai = (thisMonthComplaints.length > 0 ? thisMonthComplaints : complaints).filter(
      (c) => c.status === "resolved"
    ).length;

    // Segmentasi mingguan bulan berjalan (Mgg 1, Mgg 2, Mgg 3, Mgg 4)
    const periods = [
      { label: "Mgg 1 (1-7)", start: 1, end: 7 },
      { label: "Mgg 2 (8-14)", start: 8, end: 14 },
      { label: "Mgg 3 (15-21)", start: 15, end: 21 },
      { label: "Mgg 4 (22+)", start: 22, end: 31 },
    ];

    const sourceData = thisMonthComplaints.length > 0 ? thisMonthComplaints : complaints;

    const chartData = periods.map((p) => {
      const countMasuk = sourceData.filter((c) => {
        const day = new Date(c.created_at).getDate();
        return day >= p.start && day <= p.end;
      }).length;

      const countSelesai = sourceData.filter((c) => {
        const day = new Date(c.created_at).getDate();
        return c.status === "resolved" && day >= p.start && day <= p.end;
      }).length;

      return {
        month: p.label,
        masuk: countMasuk,
        selesai: countSelesai,
      };
    });

    return {
      success: true,
      totalMasuk,
      totalSelesai,
      monthName,
      chartData,
    };
  } catch (err) {
    return {
      success: false,
      totalMasuk: 0,
      totalSelesai: 0,
      monthName: "",
      chartData: [],
    };
  }
}
