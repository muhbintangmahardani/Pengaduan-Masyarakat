"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Loader2, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";
import { reviewWorkResultAction } from "@/actions/complaints";
import { emitLocalCrossTab } from "@/lib/realtimeBroadcast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AdminReviewDecisionProps {
  complaintId: string;
  status?: string;
}

export function AdminReviewDecision({ complaintId, status }: AdminReviewDecisionProps) {
  const router = useRouter();
  const [isApproved, setIsApproved] = useState(status === "resolved");
  const [isLoading, setIsLoading] = useState(false);
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkNote, setReworkNote] = useState("");

  const handleDecision = async (decision: "approve" | "rework") => {
    // Cegah klik berulang jika sudah proses atau sudah disetujui
    if (isLoading || isApproved) return;

    setIsLoading(true);
    const toastId = toast.loading(
      decision === "approve"
        ? "Menyetujui hasil pekerjaan dan menutup laporan..."
        : "Mengirim permintaan perbaikan ulang..."
    );

    try {
      const result = await reviewWorkResultAction({
        complaintId,
        decision,
        adminNote: reworkNote,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      if (result.data) {
        emitLocalCrossTab({
          eventType: "UPDATE",
          actionType: decision === "approve" ? "RESOLVED" : "REWORK_REQUESTED",
          actorRole: "admin",
          complaint: {
            id: result.data.id,
            ticket_number: result.data.ticket_number,
            title: result.data.title,
            status: result.data.status,
            user_id: result.data.user_id,
            assigned_officer_id: result.data.assigned_officer_id,
            updated_at: result.data.updated_at,
          },
        });
      }

      toast.dismiss(toastId);
      toast.success(result.message);

      if (decision === "approve") {
        setIsApproved(true);
      }

      setShowReworkModal(false);
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  // JIKA SUDAH DISETUJUI / SELESAI: Kunci tombol & tampilkan status tuntas resmi
  if (isApproved || status === "resolved") {
    return (
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <Alert variant="success" className="rounded-xl">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="text-xs sm:text-sm font-bold">
            Laporan Resmi Disetujui & Selesai Tuntas
          </AlertTitle>
          <AlertDescription className="text-xs">
            Admin telah memverifikasi dokumentasi perbaikan. Laporan resmi ditutup dan warga pelapor telah menerima pemberitahuan hasil akhir.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">
            Status alur penanganan: <strong className="text-emerald-700 dark:text-emerald-400">100% Selesai</strong>
          </span>
          <Link
            href="/dashboard/admin/penugasan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            Kembali ke Monitoring Penugasan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
      <div>
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
          Konfirmasi hasil pekerjaan
        </h3>
        <p className="text-[11px] text-slate-400">
          Persetujuan akan menutup laporan secara tuntas dan memberi tahu pelapor.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowReworkModal(true)}
          disabled={isLoading || isApproved}
          className="rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Minta perbaikan ulang
        </Button>

        <Button
          type="button"
          onClick={() => handleDecision("approve")}
          disabled={isLoading || isApproved}
          className="h-10 px-6 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Menyelesaikan Laporan...
            </>
          ) : (
            <>
              Setujui & beri tahu pelapor
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Shadcn UI Dialog Minta Perbaikan Ulang */}
      <Dialog open={showReworkModal} onOpenChange={setShowReworkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Minta Perbaikan Ulang</DialogTitle>
            <DialogDescription>
              Tuliskan instruksi atau kekurangan yang perlu diperbaiki kembali oleh petugas lapangan.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              rows={3}
              value={reworkNote}
              onChange={(e) => setReworkNote(e.target.value)}
              placeholder="Contoh: Aspal masih bergelombang, tolong diratakan kembali..."
              className="rounded-xl text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReworkModal(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => handleDecision("rework")}
              disabled={isLoading || reworkNote.trim().length < 5}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              Kirim Instruksi Perbaikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
