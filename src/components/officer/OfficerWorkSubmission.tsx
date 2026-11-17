"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Camera,
  ImageIcon,
} from "lucide-react";
import { useImageCompression } from "@/hooks/useImageCompression";
import { submitWorkResultAction } from "@/actions/complaints";
import { createClient } from "@/lib/supabase/client";
import { emitLocalCrossTab } from "@/lib/realtimeBroadcast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";

interface OfficerWorkSubmissionProps {
  complaintId: string;
  isAlreadySubmitted: boolean;
  existingPhotoUrl?: string | null;
  existingNote?: string | null;
}

export function OfficerWorkSubmission({
  complaintId,
  isAlreadySubmitted,
  existingPhotoUrl,
  existingNote,
}: OfficerWorkSubmissionProps) {
  const router = useRouter();
  const [completionFile, setCompletionFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingPhotoUrl || null
  );
  const [note, setNote] = useState<string>(
    existingNote ||
      "Lubang sudah ditambal dan permukaan jalan diratakan. Area perbaikan telah dibersihkan dan aman dilalui."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { compressImage, isCompressing } = useImageCompression();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const result = await compressImage(file, 2.0);
      if (result) {
        setCompletionFile(result.file);
        setPreviewUrl(result.previewUrl);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!completionFile && !existingPhotoUrl) {
      toast.error("Wajib mengunggah foto setelah perbaikan.");
      return;
    }

    if (note.trim().length < 10) {
      toast.error("Catatan pekerjaan minimal 10 karakter.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Mengunggah bukti hasil perbaikan...");

    try {
      let finalPhotoUrl = existingPhotoUrl || "";

      if (completionFile) {
        const supabase = createClient();
        const ext = completionFile.name.split(".").pop() || "jpg";
        const fileName = `completed-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `reports/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("evidence-photos")
          .upload(filePath, completionFile, { cacheControl: "3600", upsert: false });

        if (uploadError || !uploadData) {
          throw new Error(uploadError?.message || "Gagal mengunggah foto hasil pekerjaan.");
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("evidence-photos").getPublicUrl(filePath);

        finalPhotoUrl = publicUrl;
      }

      const result = await submitWorkResultAction({
        complaintId,
        completionPhotoUrl: finalPhotoUrl,
        completionNote: note.trim(),
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      if (result.data) {
        emitLocalCrossTab({
          eventType: "UPDATE",
          actionType: "WORK_SUBMITTED",
          actorRole: "officer",
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
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTimeFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <Card className="rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs border-slate-200/80 dark:border-slate-800">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Hasil pekerjaan lapangan
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Unggah bukti foto perbaikan selesai untuk ditinjau dan disetujui admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hidden File Inputs: Kamera Langsung & Galeri */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={isCompressing || isSubmitting || isAlreadySubmitted}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isCompressing || isSubmitting || isAlreadySubmitted}
        />

        {/* Foto Setelah Perbaikan */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Foto bukti setelah perbaikan *</span>
            {previewUrl && (
              <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Klik foto untuk memperbesar
              </span>
            )}
          </label>

          {previewUrl ? (
            <div className="space-y-3">
              <div className="w-full sm:max-w-md">
                <ImageLightboxModal
                  src={previewUrl}
                  alt="Foto Hasil Perbaikan"
                  label="Bukti Foto Perbaikan Selesai"
                  badgeText="HASIL SELESAI"
                  badgeColor="emerald"
                  heightClass="h-52 sm:h-56"
                  caption="Bukti dokumentasi bahwa permukaan jalan telah diratakan dan aman dilalui warga."
                />
              </div>

              {!isAlreadySubmitted && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isCompressing || isSubmitting}
                    className="rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-100"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Ambil Ulang (Kamera)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing || isSubmitting}
                    className="rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-100"
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Pilih dari Galeri
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Opsi 1: Kamera Langsung */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isCompressing || isSubmitting || isAlreadySubmitted}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#0c3b37]/40 hover:border-[#0c3b37] bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-[#e6f4f1] dark:bg-emerald-900/60 flex items-center justify-center text-[#0c3b37] dark:text-emerald-300 group-hover:scale-110 transition-transform">
                  {isCompressing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0c3b37] dark:text-emerald-300">
                    Buka Kamera Langsung
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Ambil foto langsung dari ponsel di lokasi jalan
                  </div>
                </div>
              </button>

              {/* Opsi 2: Unggah Galeri */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing || isSubmitting || isAlreadySubmitted}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer group text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Pilih dari Galeri / Berkas
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    JPG / PNG hingga 5 MB
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Catatan Pekerjaan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Catatan tindakan pekerjaan *
          </label>
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isAlreadySubmitted || isSubmitting}
            placeholder="Tuliskan rincian tindakan perbaikan yang telah dilakukan..."
            className="text-xs sm:text-sm rounded-xl border-slate-200 leading-relaxed"
          />
        </div>

        <div className="text-[11px] text-slate-400">
          Waktu input • {currentTimeFormatted} WIB
        </div>

        {/* Footer Note & Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Admin dinas akan memeriksa foto sebelum laporan ditutup resmi.
          </span>

          {!isAlreadySubmitted ? (
            <Button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="h-11 px-6 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Mengirimkan Hasil...
                </>
              ) : (
                <>
                  Kirim hasil ke admin
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-xs border-amber-200"
            >
              Menunggu persetujuan admin
            </Badge>
          )}
        </div>
      </form>
    </Card>
  );
}
