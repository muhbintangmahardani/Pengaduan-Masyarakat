import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 sm:p-10 relative overflow-hidden select-none bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]">
      {/* Top Header Logo */}
      <div className="w-full flex justify-center pt-4 sm:pt-6">
        <JalanBaikLogo size="md" variant="full" subtext="DINAS BINA MARGA & TATA KOTA" />
      </div>

      {/* Main 404 Showcase */}
      <div className="max-w-md w-full text-center space-y-4 my-auto py-8">
        {/* Massive 404 Number */}
        <h1 className="text-8xl sm:text-9xl md:text-[140px] font-black tracking-tight text-slate-900 dark:text-white leading-none">
          404
        </h1>

        {/* Accent Pill Line */}
        <div className="w-12 h-1 bg-[#0c3b37] dark:bg-emerald-500 rounded-full mx-auto" />

        {/* Subtitle Category */}
        <p className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 pt-1">
          Halaman Tidak Ditemukan
        </p>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan ke lokasi lain.
        </p>

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 px-6 rounded-xl bg-[#0c3b37] hover:bg-[#082825] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center pb-2">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          © 2026 Suku Dinas Bina Marga • Kota Administrasi JalanBaik • Internal System v1.0
        </p>
      </div>
    </div>
  );
}
