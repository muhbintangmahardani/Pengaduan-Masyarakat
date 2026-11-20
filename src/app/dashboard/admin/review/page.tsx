import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminReviewContainer } from "@/components/admin/AdminReviewContainer";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Hasil Perbaikan Lapangan",
};

export default async function AdminReviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ ticket?: string }>;
}) {
  let ticket: string | undefined;
  try {
    const resolvedParams = searchParams ? await searchParams : {};
    ticket = resolvedParams?.ticket;
  } catch (err) {
    console.error("Error resolving searchParams:", err);
  }

  const supabase = await createClient();

  // Ambil seluruh laporan yang siap ditinjau atau telah selesai
  const { data: reviewComplaints } = await supabase
    .from("complaints")
    .select(
      `
      *,
      profiles:user_id(full_name, email),
      assigned_officer:assigned_officer_id(full_name),
      complaint_timelines(
        id,
        status,
        note,
        created_at,
        actor:actor_id(full_name, role)
      )
    `
    )
    .order("created_at", { ascending: false });

  let listData = (reviewComplaints as Complaint[]) || [];

  // Jika tiket spesifik diminta dari URL tetapi tidak ada di query awal, ambil secara eksplisit
  if (ticket && !listData.some((c) => c.ticket_number?.toLowerCase() === ticket?.toLowerCase())) {
    const { data: singleComplaint } = await supabase
      .from("complaints")
      .select(
        `
        *,
        profiles:user_id(full_name, email),
        assigned_officer:assigned_officer_id(full_name),
        complaint_timelines(
          id,
          status,
          note,
          created_at,
          actor:actor_id(full_name, role)
        )
      `
      )
      .eq("ticket_number", ticket)
      .maybeSingle();

    if (singleComplaint) {
      listData = [singleComplaint as Complaint, ...listData];
    }
  }

  return <AdminReviewContainer initialComplaints={listData} initialTicket={ticket} />;
}
