import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ExportButton } from "@/components/common/ExportButton";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/types";

export const metadata: Metadata = {
  title: "Riwayat Tugas Selesai",
};

export default async function PetugasRiwayatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Ambil semua laporan yang sudah pernah dikerjakan / diselesaikan
  const { data: historyData } = await supabase
    .from("complaints")
    .select(
      `
      *,
      profiles:user_id(full_name, email)
    `
    )
    .in("status", ["under_review", "resolved"])
    .order("completed_at", { ascending: false });

  const history = (historyData as Complaint[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Riwayat Pekerjaan Selesai
          </h1>
          <p className="text-xs text-slate-500">
            Arsip dokumentasi pekerjaan jalan rusak yang telah Anda selesaikan dan disetujui.
          </p>
        </div>

        {history.length > 0 && (
          <ExportButton
            complaints={history}
            filename="riwayat-tugas-petugas"
            label="Export Riwayat"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {history.length === 0 ? (
          <Card className="col-span-full py-16 text-center text-xs text-slate-400 rounded-xl">
            Belum ada riwayat perbaikan yang diselesaikan.
          </Card>
        ) : (
          history.map((item) => (
            <Card
              key={item.id}
              className="rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={item.completion_photo_url || item.photo_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#0c3b37] dark:text-emerald-400">
                    {item.ticket_number}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {item.address}
                  </p>
                  {item.completion_note && (
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      &quot;{item.completion_note}&quot;
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between">
                <span>{item.completed_at ? formatDateTime(item.completed_at) : "Selesai"}</span>
                <Link
                  href={`/dashboard/petugas/riwayat/${item.id}`}
                  className="font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline flex items-center gap-1 text-xs"
                >
                  Detail Info ↗
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
