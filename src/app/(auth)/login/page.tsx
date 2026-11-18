"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Clock } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";

function SessionMessage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  if (reason === "idle_timeout") {
    return (
      <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-300">
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-800 dark:text-amber-300">Sesi Berakhir Otomatis</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
            Akun Anda telah dikeluarkan secara otomatis karena tidak ada aktivitas selama 15 menit demi keamanan data. Silakan masuk kembali.
          </div>
        </div>
      </div>
    );
  }

  if (reason === "session_expired") {
    return (
      <div className="mb-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-300">
        <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold">Sesi Kedaluwarsa</div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Masa aktif sesi telah berakhir. Silakan masuk kembali ke akun Anda.
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

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
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[520px]">
        {/* Kolom Kiri: 50% Showcase Visual Jalan Raya Kota (Gambar Terlihat Jelas & Menawan) */}
        <div className="relative bg-[#0c3b37] text-white p-7 sm:p-9 md:p-10 flex flex-col justify-between overflow-hidden min-h-[260px] md:min-h-full">
          {/* Foto Nyata Infrastruktur Jalan Raya Beraspal Mulus */}
          <Image
            src="https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=85"
            alt="Infrastruktur Jalan Raya Beraspal Mulus"
            fill
            className="object-cover opacity-85 transition-opacity"
            priority
          />
          {/* Gradient Overlay Anggun (Gelap di Bawah agar Teks Terbaca Tajam) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#082825] via-[#0c3b37]/60 to-[#0c3b37]/35" />

          {/* Top Brand Logo JalanBaik */}
          <div className="relative z-10">
            <JalanBaikLogo
              variant="full"
              size="lg"
              inverted={true}
              subtext="DINAS BINA MARGA & TATA KOTA"
            />
          </div>

          {/* Bottom Headline & Description with Accent Line */}
          <div className="relative z-10 pt-12 md:pt-0 space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              Sistem Manajemen Pengaduan.
            </h2>
            <div className="border-l-2 border-emerald-400 pl-3.5">
              <p className="text-xs text-emerald-50/90 leading-relaxed font-normal">
                Kontrol penuh atas penanganan infrastruktur jalan, verifikasi laporan warga, dan persetujuan penugasan dalam satu platform terintegrasi.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: 50% Form Login Bersih & Seimbang */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Selamat Datang
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Silakan masuk ke dashboard internal dan layanan jalan.
              </p>
            </div>

            {/* Pesan Sesi Kedaluwarsa / Auto-Logout */}
            <Suspense fallback={null}>
              <SessionMessage />
            </Suspense>

            {/* Form Input Login Langsung (Tanpa Tab Role) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Akun Terdaftar *
                </label>
                <Input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="nama@email.com"
                  className="h-10 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-[#0c3b37]"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
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

              {/* Checkbox Ingat Saya & Lupa Sandi */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0c3b37] focus:ring-[#0c3b37]"
                  />
                  <span>Ingat saya</span>
                </label>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Hubungi administrator dinas untuk permohonan reset kata sandi.");
                  }}
                  className="font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline"
                >
                  Lupa Sandi?
                </a>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Tombol Masuk Dashboard dengan Spinner Loading */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-[#0c3b37] hover:bg-[#082825] text-white font-bold text-xs shadow-sm transition-all cursor-pointer mt-1"
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
            <div className="pt-4 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Belum punya akun warga?{" "}
              </span>
              <Link
                href="/register"
                className="text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline"
              >
                Daftar sekarang
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
