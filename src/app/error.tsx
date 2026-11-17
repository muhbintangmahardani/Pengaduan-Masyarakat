"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error digest untuk keperluan debugging
    console.error("Application error captured by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Terjadi Kendala Memuat Halaman
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sistem sedang memperbarui koneksi database atau sesi Anda telah disegarkan.
          </p>
          {error.digest && (
            <div className="inline-block mt-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              Kode Digest: {error.digest}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#0c3b37] hover:bg-[#0c3b37]/90 text-white text-xs font-semibold h-10 px-4 rounded-xl gap-2 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Muat Ulang
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto text-xs font-semibold h-10 px-4 rounded-xl gap-2 border-slate-200 dark:border-slate-700"
          >
            <Link href="/login">
              <Home className="w-3.5 h-3.5" />
              Kembali ke Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
