"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
  Loader2,
  Navigation,
  Camera,
  ImageIcon,
  Sparkles,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

import { RealMap } from "@/components/common/RealMap";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useImageCompression } from "@/hooks/useImageCompression";
import { createComplaintAction } from "@/actions/complaints";
import { createClient } from "@/lib/supabase/client";
import { emitLocalCrossTab } from "@/lib/realtimeBroadcast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createComplaintSchema,
  type CreateComplaintInput,
} from "@/schemas/complaint";

export default function BuatLaporanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [autoAddressDetected, setAutoAddressDetected] = useState<boolean>(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    coordinates,
    isLoading: isGeoLoading,
    error: geoError,
    getLocation,
  } = useGeolocation();

  const { compressImage, isCompressing } = useImageCompression();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateComplaintInput>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      title: "",
      category: "infrastruktur",
      damage_type: "Jalan berlubang",
      damage_level: "Sedang",
      description: "",
      address: "",
      latitude: null,
      longitude: null,
      photo_url: "",
      is_public: true,
    },
  });

  // Fungsi Reverse Geocoding (OpenStreetMap Nominatim)
  const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id,en",
          },
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data) {
        const addr = data.address;
        if (addr) {
          const road = addr.road || addr.street || addr.pedestrian || addr.path || "";
          const houseNumber = addr.house_number ? `No. ${addr.house_number}` : "";
          const roadWithNum = [road, houseNumber].filter(Boolean).join(" ");
          const suburb = addr.suburb || addr.neighbourhood || addr.village || "";
          const city = addr.city || addr.town || addr.municipality || addr.county || "";
          const state = addr.state || "";
          const parts = [roadWithNum, suburb, city, state].filter(Boolean);
          if (parts.length >= 2) {
            return parts.join(", ");
          }
        }
        if (data.display_name) {
          return data.display_name;
        }
      }
      return null;
    } catch (err) {
      console.warn("Reverse geocode error:", err);
      return null;
    }
  };

  const handleGetLocation = async () => {
    const coords = await getLocation();
    if (coords) {
      setValue("latitude", coords.latitude);
      setValue("longitude", coords.longitude);

      // Auto-detect alamat jalan menggunakan reverse geocoding
      setIsReverseGeocoding(true);
      try {
        const detectedAddress = await reverseGeocode(coords.latitude, coords.longitude);
        if (detectedAddress) {
          setValue("address", detectedAddress, { shouldValidate: true });
          setAutoAddressDetected(true);
          toast.success("Titik GPS & Alamat berhasil dideteksi otomatis!", {
            description: "Alamat telah diisi otomatis. Anda dapat menyesuaikannya bila kurang akurat.",
          });
        } else {
          toast.success("Titik GPS berhasil diambil! Silakan lengkapi alamat detail.");
        }
      } finally {
        setIsReverseGeocoding(false);
      }
    } else if (geoError) {
      toast.error(geoError);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const result = await compressImage(file, 2.0);
      if (result) {
        setCompressedFile(result.file);
        setPreviewUrl(result.previewUrl);
        setValue("photo_url", "https://uploading.supabase.storage/pending");
      }
    }
  };

  const onSubmit = async (data: CreateComplaintInput) => {
    if (!compressedFile) {
      toast.error("Wajib mengunggah foto bukti kerusakan jalan!");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Mengunggah bukti foto dan memproses laporan...");

    try {
      const supabase = createClient();
      const ext = compressedFile.name.split(".").pop() || "jpg";
      const fileName = `complaint-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `reports/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("evidence-photos")
        .upload(filePath, compressedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError || !uploadData) {
        throw new Error(uploadError?.message || "Gagal mengunggah foto ke storage.");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("evidence-photos").getPublicUrl(filePath);

      const response = await createComplaintAction({
        ...data,
        photo_url: publicUrl,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      if (response.data) {
        emitLocalCrossTab({
          eventType: "INSERT",
          actionType: "CREATED",
          actorRole: "citizen",
          complaint: {
            id: response.data.id,
            ticket_number: response.data.ticket_number,
            title: response.data.title,
            status: response.data.status,
            user_id: response.data.user_id,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at,
          },
        });
      }

      toast.dismiss(loadingToast);
      toast.success(response.message || "Laporan berhasil dikirim!");
      router.push("/dashboard/warga");
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan sistem saat mengirim laporan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLat = watch("latitude");
  const currentLng = watch("longitude");

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-2">
          {/* Tombol Kembali Ber-shape Seragam */}
          <div>
            <Link
              href="/dashboard/warga"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-muted/80 hover:text-[#0c3b37] dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Ada jalan rusak? Laporkan.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Lengkapi informasi dan foto kondisi jalan agar petugas cepat menangani di lokasi.
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="text-xs font-semibold px-3 py-1 bg-[#e6f4f1] text-[#0c3b37] self-start sm:self-auto"
        >
          01 Detail laporan
        </Badge>
      </div>

      {/* 2. Main Form Grid */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Informasi Kerusakan & Kamera (7 cols) */}
          <Card className="lg:col-span-7 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Informasi kerusakan jalan
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Tanda * wajib diisi</p>
            </div>

            {/* Judul laporan */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Judul laporan *
              </Label>
              <Input
                {...register("title")}
                placeholder="Contoh: Jalan berlubang cukup dalam di Jl. Melati"
                disabled={isSubmitting}
                className="h-11 text-xs sm:text-sm rounded-xl border-slate-200"
              />
              {errors.title && (
                <p className="text-xs text-rose-500">{errors.title.message}</p>
              )}
            </div>

            {/* Dropdown Jenis & Tingkat Kerusakan (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Jenis kerusakan *
                </Label>
                <div className="relative">
                  <select
                    {...register("damage_type")}
                    disabled={isSubmitting}
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0c3b37]/20 dark:focus:ring-emerald-500/20 focus:border-[#0c3b37] dark:focus:border-emerald-500 appearance-none transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="Jalan berlubang">Jalan berlubang</option>
                    <option value="Aspal retak">Aspal retak</option>
                    <option value="Aspal ambles">Aspal ambles</option>
                    <option value="Jalan bergelombang">Jalan bergelombang</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tingkat kerusakan *
                </Label>
                <div className="relative">
                  <select
                    {...register("damage_level")}
                    disabled={isSubmitting}
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0c3b37]/20 dark:focus:ring-emerald-500/20 focus:border-[#0c3b37] dark:focus:border-emerald-500 appearance-none transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi kerusakan */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Deskripsi kerusakan *
              </Label>
              <Textarea
                {...register("description")}
                rows={3}
                placeholder="Terdapat beberapa lubang di tengah jalan dekat pertigaan. Berbahaya bagi pengendara roda dua terutama saat malam atau hujan."
                disabled={isSubmitting}
                className="text-xs sm:text-sm rounded-xl border-slate-200"
              />
              {errors.description && (
                <p className="text-xs text-rose-500">{errors.description.message}</p>
              )}
            </div>

            {/* Foto bukti kerusakan: Kamera Langsung & Galeri + Lightbox Preview */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Foto bukti kerusakan jalan *</span>
                {previewUrl && (
                  <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap Dikirim (Klik foto untuk perbesar)
                  </span>
                )}
              </Label>

              {/* Hidden Inputs: Kamera Langsung & Berkas */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                disabled={isCompressing || isSubmitting}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isCompressing || isSubmitting}
              />

              {/* Preview Foto dengan Lightbox Pop-up jika sudah ada */}
              {previewUrl ? (
                <div className="space-y-3">
                  <div className="w-full sm:max-w-md">
                    <ImageLightboxModal
                      src={previewUrl}
                      alt="Pratinjau Foto Kerusakan"
                      label="Foto Bukti Kerusakan Jalan"
                      badgeText="FOTO PELAPOR"
                      badgeColor="amber"
                      heightClass="h-52 sm:h-60"
                      caption="Pastikan foto terlihat tajam dan menunjukkan kondisi lubang atau kerusakan secara utuh."
                    />
                  </div>

                  {/* Tombol Ambil Ulang / Ganti Foto */}
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
                      Foto Ulang (Kamera)
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
                </div>
              ) : (
                /* Jika belum ada foto, tampilkan 2 opsi: Kamera Langsung & Unggah Galeri */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* OPSI 1: Buka Kamera Langsung (Khusus Mobile Handphone & Laptop Kamera) */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isCompressing || isSubmitting}
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
                        Ambil Foto Kamera Langsung
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Buka kamera HP seketika di lokasi jalan
                      </div>
                    </div>
                  </button>

                  {/* OPSI 2: Pilih dari Galeri / Berkas Foto */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing || isSubmitting}
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

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Foto harus jelas dan menunjukkan kondisi lubang atau kerusakan secara utuh.
              </p>
            </div>

            {/* Footer Form Kiri */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                Laporan akan langsung diverifikasi oleh tim dinas terkait.
              </span>

              <Button
                type="submit"
                disabled={isSubmitting || isCompressing}
                className="h-11 px-6 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white font-semibold text-xs shadow-sm w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Mengirimkan Laporan...
                  </>
                ) : (
                  <>
                    Kirim laporan sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Kolom Kanan: Lokasi Kejadian & Reverse Geocoding (5 cols) */}
          <Card className="lg:col-span-5 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Lokasi kejadian
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tentukan titik GPS dan sesuaikan alamat jika perlu.
              </p>
            </div>

            {/* Real Interactive Map Live GPS (OpenStreetMap) */}
            <RealMap
              latitude={currentLat ?? null}
              longitude={currentLng ?? null}
              className="w-full h-48 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-700"
            />

            {/* Tombol Ambil Lokasi GPS (Dengan Auto Reverse Geocode) */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                disabled={isGeoLoading || isReverseGeocoding || isSubmitting}
                className="w-full h-11 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-[#e6f4f1] dark:hover:bg-emerald-950/40 hover:text-[#0c3b37] dark:hover:text-emerald-300 transition-colors"
              >
                {isGeoLoading || isReverseGeocoding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#0c3b37] dark:text-emerald-400" />
                    <span>
                      {isReverseGeocoding ? "Mendeteksi Nama Jalan..." : "Mengambil Titik GPS..."}
                    </span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-4 h-4 mr-2 text-[#0c3b37] dark:text-emerald-400" />
                    <span>Gunakan lokasi GPS saya</span>
                  </>
                )}
              </Button>

              {autoAddressDetected && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl font-medium">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Alamat terisi otomatis dari GPS. Bisa disunting jika kurang akurat.</span>
                </div>
              )}
            </div>

            {/* Alamat lengkap (Editable Textarea) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Alamat lengkap / Patokan *
                </Label>
                <span className="text-[10px] text-slate-400">Bisa diedit manual</span>
              </div>
              <Textarea
                {...register("address")}
                rows={3}
                placeholder="Contoh: Jl. Melati No. 24, Sukajadi, Kota Bandung (Dekat Alfamart / Pos RW)"
                disabled={isSubmitting || isReverseGeocoding}
                className="text-xs rounded-xl border-slate-200 leading-relaxed"
              />
              {errors.address && (
                <p className="text-xs text-rose-500">{errors.address.message}</p>
              )}
            </div>

            {/* Koordinat GPS Display */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                KOORDINAT GPS
              </span>
              <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                <span>
                  {currentLat && currentLng
                    ? `${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`
                    : "Belum terdeteksi (Klik tombol GPS di atas)"}
                </span>
                {currentLat && currentLng && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-sans font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Akurat
                  </span>
                )}
              </div>
            </div>

            {/* Location Privacy Note */}
            <div className="p-3 bg-[#e6f4f1] dark:bg-emerald-950/40 text-[#0c3b37] dark:text-emerald-300 text-[11px] rounded-xl font-medium leading-relaxed">
              Titik lokasi dan foto hanya digunakan untuk mempermudah petugas dinas menemukan dan memperbaiki lokasi jalan rusak.
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
