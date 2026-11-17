import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <JalanBaikLogo size="lg" variant="full" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Error 404 • Not Found
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Halaman atau data laporan yang Anda cari tidak tersedia, telah dipindahkan, atau tiket pengaduan tidak ditemukan.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              asChild
              className="h-11 px-5 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white font-bold text-xs shadow-sm"
            >
              <Link href="/dashboard/warga">
                <Home className="w-4 h-4 mr-1.5" />
                Kembali ke Dashboard
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 px-5 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700"
            >
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Halaman Masuk
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          © 2026 jalanbaik • Layanan Pengaduan Transparansi Jalan
        </p>
      </div>
    </div>
  );
}
