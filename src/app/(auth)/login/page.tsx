"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";

function SessionMessage() {
  return null;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result && !result.success) {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full flex items-center justify-center bg-[#f4f6f8] dark:bg-slate-950 p-3 sm:p-4 md:p-6 transition-colors duration-200 relative select-none">
      {/* Dark Mode Toggle Floating di Pojok Kanan Atas */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Floating Balanced Modern Card (Ukuran Pas Layar Tanpa Perlu Scroll di Zoom 100%) */}
      <div className="w-full max-w-[880px] lg:h-[530px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[24px] border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-300/40 dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Kolom Kiri: 50% Showcase Visual Satgas Perbaikan Jalan */}
        <div className="relative bg-[#0c3b37] text-white p-6 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden min-h-[220px] lg:min-h-full">
          {/* Foto Nyata Satgas Pekerjaan Umum / Bina Marga Sedang Memperbaiki Jalan */}
          <Image
            src="/images/auth-hero.jpg"
            alt="Petugas Satgas Bina Marga Memperbaiki Jalan Raya"
            fill
            className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            priority
          />
          {/* Gradient Overlay Anggun */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-[#0c3b37]/35" />

          {/* Top Brand Logo JalanBaik */}
          <div className="relative z-10">
            <JalanBaikLogo
              variant="full"
              size="md"
              inverted={true}
              subtext="DINAS BINA MARGA & TATA KOTA"
            />
          </div>

          {/* Bottom Headline & Description with Accent Line */}
          <div className="relative z-10 pt-6 lg:pt-0 space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-snug">
              Sistem Manajemen Pengaduan.
            </h2>
            <div className="border-l-2 border-emerald-400 pl-3">
              <p className="text-[11px] sm:text-xs text-slate-200/90 leading-relaxed font-normal">
                Kontrol penuh atas penanganan infrastruktur jalan, verifikasi laporan warga, dan persetujuan penugasan satgas dalam satu platform terintegrasi.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: 50% Form Login Bersih, Rapi & Lega Tanpa Scroll */}
        <div className="p-6 sm:p-7 lg:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <div className="space-y-1 mb-4">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Selamat Datang
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Silakan masuk ke dashboard internal dan layanan jalan.
              </p>
              <div className="pt-1.5">
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>

            {/* Pesan Sesi Kedaluwarsa / Auto-Logout */}
            <Suspense fallback={null}>
              <SessionMessage />
            </Suspense>

            {/* Form Input Login Langsung */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ID Karyawan / Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="admin@jalanbaik.go.id atau budi@gmail.com"
                  className="h-10 text-xs sm:text-sm rounded-xl border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-[#0c3b37] dark:focus:border-emerald-500 transition-all px-3"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="h-10 text-xs sm:text-sm rounded-xl pr-10 border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-[#0c3b37] dark:focus:border-emerald-500 transition-all px-3"
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

              {/* Checkbox Ingat Saya & Lupa Sandi */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-[#0c3b37] focus:ring-[#0c3b37] dark:bg-slate-900 cursor-pointer accent-[#0c3b37]"
                  />
                  <span className="group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    Ingat saya
                  </span>
                </label>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Hubungi administrator dinas untuk permohonan reset kata sandi.");
                  }}
                  className="font-semibold text-[#0c3b37] dark:text-emerald-400 hover:underline"
                >
                  Lupa sandi?
                </a>
              </div>

              {/* Tombol Masuk Dashboard */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10.5 sm:h-11 rounded-xl bg-[#0c3b37] hover:bg-[#082825] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer mt-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Memproses Masuk...
                  </>
                ) : (
                  <>
                    Masuk Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Link Daftar Warga Baru */}
            <div className="pt-3 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Belum punya akun warga?{" "}
              </span>
              <Link
                href="/register"
                className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline ml-0.5"
              >
                Daftar sekarang
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
