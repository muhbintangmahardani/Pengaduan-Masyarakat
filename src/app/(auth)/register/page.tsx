"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { registerAction } from "@/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result && !result.success) {
      setErrorMessage(result.message);
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/70 dark:bg-slate-950 p-4 sm:p-6 md:p-8 transition-colors duration-200 relative select-none">
      {/* Dark Mode Toggle Floating di Pojok Kanan Atas */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Floating 50:50 Balanced Card */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[560px]">
        {/* Kolom Kiri: 50% Showcase Visual Jalan Raya Kota */}
        <div className="relative bg-[#0c3b37] text-white p-7 sm:p-9 md:p-10 flex flex-col justify-between overflow-hidden min-h-[260px] md:min-h-full">
          <Image
            src="https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=85"
            alt="Infrastruktur Jalan Raya Beraspal Mulus"
            fill
            className="object-cover opacity-85 transition-opacity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#082825] via-[#0c3b37]/60 to-[#0c3b37]/35" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <JalanBaikLogo
              variant="full"
              size="lg"
              inverted={true}
              subtext="PARTISIPASI WARGA KOTA"
            />
          </div>

          {/* Bottom Headline with Accent Line */}
          <div className="relative z-10 pt-12 md:pt-0 space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              Pendaftaran Akun Warga.
            </h2>
            <div className="border-l-2 border-emerald-400 pl-3.5">
              <p className="text-xs text-emerald-50/90 leading-relaxed font-normal">
                Jadilah pelopor jalan yang aman dan nyaman. Setiap laporan foto Anda langsung ditindaklanjuti oleh petugas dinas terkait secara transparan.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: 50% Form Registrasi Akun */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <div className="space-y-1 mb-5">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Daftar Akun Baru
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lengkapi identitas untuk mulai membuat laporan jalan rusak.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap *
                </label>
                <Input
                  type="text"
                  name="fullName"
                  required
                  disabled={isLoading}
                  placeholder="Budi Setiawan"
                  className="h-10 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-[#0c3b37]"
                />
              </div>

              {/* Email Warga */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Alamat Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="budi@gmail.com"
                  className="h-10 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-[#0c3b37]"
                />
              </div>

              {/* Nomor WhatsApp/Telepon */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp / Telepon
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  disabled={isLoading}
                  placeholder="081234567890"
                  className="h-10 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-[#0c3b37]"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi (Min. 6 Karakter) *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="h-10 text-xs sm:text-sm rounded-lg pr-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-[#0c3b37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    title={showPassword ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Tombol Buat Akun dengan Spinner Loading */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-[#0c3b37] hover:bg-[#082825] text-white font-bold text-xs shadow-sm transition-all cursor-pointer mt-2"
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
            <div className="pt-4 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sudah memiliki akun?{" "}
              </span>
              <Link
                href="/login"
                className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline"
              >
                Masuk di sini
              </Link>
            </div>
          </div>

          {/* Footer Card */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
            © 2026 Suku Dinas Bina Marga • Kota Administrasi JalanBaik.
          </div>
        </div>
      </div>
    </div>
  );
}
