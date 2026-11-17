import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CitizenComplaintsList } from "@/components/citizen/CitizenComplaintsList";
import { Button } from "@/components/ui/button";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Laporan Saya",
};

export default async function WargaLaporanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: complaintsData } = await supabase
    .from("complaints")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const complaints = (complaintsData as Complaint[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Daftar Laporan Saya
          </h1>
          <p className="text-xs text-slate-500">
            Riwayat seluruh aduan perbaikan jalan yang pernah Anda kirimkan ke sistem.
          </p>
        </div>

        <Link
          href="/dashboard/warga/buat"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Buat Laporan Baru
        </Link>
      </div>

      <CitizenComplaintsList initialComplaints={complaints} />
    </div>
  );
}
