"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { registerAction } from "@/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result && !result.success) {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f6f8] dark:bg-slate-950 p-4 sm:p-6 transition-colors duration-200 relative select-none">
      {/* Dark Mode Toggle Floating di Pojok Kanan Atas */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Floating Balanced Modern Card (Ukuran & Elemen Form 100% Identik dengan Halaman Masuk) */}
      <div className="w-full max-w-[880px] lg:h-[580px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[24px] border border-border/80 shadow-2xl shadow-slate-300/30 dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Kolom Kiri: 50% Showcase Visual Satgas Perbaikan Jalan */}
        <div className="relative bg-[#0c3b37] text-white p-7 lg:p-9 flex flex-col justify-between overflow-hidden min-h-[240px] lg:min-h-full">
          <Image
            src="/images/auth-hero.jpg"
            alt="Petugas Satgas Bina Marga Memperbaiki Jalan Raya"
            fill
            className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-[#0c3b37]/35" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <JalanBaikLogo
              variant="full"
              size="md"
              inverted={true}
              subtext="PARTISIPASI WARGA KOTA"
            />
          </div>

          {/* Bottom Headline with Accent Line */}
          <div className="relative z-10 pt-8 lg:pt-0 space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
              Pendaftaran Akun Warga.
            </h2>
            <div className="border-l-2 border-emerald-400 pl-3">
              <p className="text-xs text-slate-200/90 leading-relaxed font-normal">
                Jadilah pelopor jalan yang aman dan nyaman. Setiap laporan foto Anda langsung ditindaklanjuti oleh petugas dinas terkait secara transparan.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: 50% Form Registrasi Akun Berukuran Rapi & Nyaman */}
        <div className="p-7 sm:p-8 lg:p-9 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <div className="space-y-1 mb-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Daftar Akun Baru
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lengkapi identitas untuk mulai membuat laporan jalan rusak.
              </p>
              <div className="pt-2">
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="fullName"
                  required
                  disabled={isLoading}
                  placeholder="Budi Setiawan"
                  className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-[#0c3b37] dark:focus:border-emerald-500 transition-all px-3.5"
                />
              </div>

              {/* Email Warga */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Alamat Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="budi@gmail.com"
                  className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-[#0c3b37] dark:focus:border-emerald-500 transition-all px-3.5"
                />
              </div>

              {/* Nomor WhatsApp/Telepon */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp / Telepon
                </Label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  disabled={isLoading}
                  placeholder="081234567890"
                  className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-[#0c3b37] dark:focus:border-emerald-500 transition-all px-3.5"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi (Minimal 6 Karakter) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="h-10 text-xs sm:text-sm rounded-xl pr-10 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-[#0c3b37] dark:focus:border-emerald-500 transition-all px-3.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
                    title={showPassword ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Buat Akun Identik dengan Masuk Dashboard */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#0c3b37] hover:bg-[#082825] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-[0.99] transition-all cursor-pointer mt-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    Daftar Akun Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Link Masuk Akun */}
            <div className="pt-3 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sudah memiliki akun?{" "}
              </span>
              <Link
                href="/login"
                className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline ml-0.5 whitespace-nowrap"
              >
                Masuk di sini
              </Link>
            </div>
          </div>

          {/* Footer Card */}
          <div className="pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-800 text-center space-y-0.5">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              © 2026 Suku Dinas Bina Marga • Kota Administrasi JalanBaik.
            </p>
            <p className="text-[10px] text-slate-400/80 dark:text-slate-600">
              Sistem Terintegrasi v1.0 • Akses Khusus Pengguna Resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
