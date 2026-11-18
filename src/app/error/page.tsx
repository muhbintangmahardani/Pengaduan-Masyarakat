"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileWarning,
  Lock,
  ShieldAlert,
  Clock,
  Hourglass,
  ServerCrash,
  Network,
  AlertOctagon,
  TimerOff,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";
import { ErrorView } from "@/components/common/ErrorView";
import { HTTP_ERROR_LIST, HTTP_ERRORS, type HttpErrorDefinition } from "@/lib/errorCodes";

function ErrorContent() {
  const searchParams = useSearchParams();
  const queryCode = searchParams.get("code");
  const selectedCode = queryCode ? parseInt(queryCode, 10) : null;
  const [filter, setFilter] = useState<"all" | "4xx" | "5xx">("all");

  // Jika URL memiliki parameter ?code=... yang valid, langsung tampilkan view error yang diminta
  if (selectedCode && HTTP_ERRORS[selectedCode]) {
    return <ErrorView code={selectedCode} showBackToCatalog={true} />;
  }

  const filteredErrors = HTTP_ERROR_LIST.filter((item) => {
    if (filter === "4xx") return item.category.startsWith("Client");
    if (filter === "5xx") return item.category.startsWith("Server");
    return true;
  });

  const getIconForCode = (code: number) => {
    switch (code) {
      case 400:
        return <FileWarning className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 401:
        return <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 403:
        return <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 408:
        return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 429:
        return <Hourglass className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 500:
        return <ServerCrash className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 502:
        return <Network className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 503:
        return <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 504:
        return <TimerOff className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 select-none">
      {/* Header Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-slate-200/80 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <JalanBaikLogo size="md" variant="full" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
            <Link href="/login">Halaman Masuk</Link>
          </Button>
        </div>
      </div>

      {/* Main Content Showcase */}
      <div className="max-w-6xl mx-auto py-8 sm:py-12 space-y-8">
        <div className="space-y-3 text-center sm:text-left max-w-2xl">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1 rounded-full border-emerald-600/40 text-[#0c3b37] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">
            Daftar Status HTTP Resmi
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Pusat Penanganan Kode Error Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Daftar lengkap kode status error HTTP yang diimplementasikan pada sistem transparansi jalanbaik untuk menjamin keamanan, kejelasan diagnostik, dan kenyamanan seluruh pengguna.
          </p>
        </div>

        {/* Filter Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`rounded-xl text-xs font-bold ${
              filter === "all"
                ? "bg-[#0c3b37] hover:bg-[#082825] text-white"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            Semua Kode ({HTTP_ERROR_LIST.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "4xx" ? "default" : "outline"}
            onClick={() => setFilter("4xx")}
            className={`rounded-xl text-xs font-bold ${
              filter === "4xx"
                ? "bg-[#0c3b37] hover:bg-[#082825] text-white"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            Client Errors (4xx)
          </Button>
          <Button
            size="sm"
            variant={filter === "5xx" ? "default" : "outline"}
            onClick={() => setFilter("5xx")}
            className={`rounded-xl text-xs font-bold ${
              filter === "5xx"
                ? "bg-[#0c3b37] hover:bg-[#082825] text-white"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            Server Errors (5xx)
          </Button>
        </div>

        {/* Grid Kartu Error */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredErrors.map((err) => (
            <Card
              key={err.code}
              className="rounded-2xl p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {getIconForCode(err.code)}
                  </div>
                  <Badge variant="outline" className={`font-mono text-[11px] font-bold ${err.badgeClass}`}>
                    {err.code} • {err.name}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0c3b37] dark:group-hover:text-emerald-400 transition-colors">
                    {err.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong className="font-semibold">{err.code} {err.name}:</strong> {err.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Solusi:</span>
                  {err.solution}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {err.category}
                </span>
                <Link
                  href={`/error/${err.code}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c3b37] dark:text-emerald-400 hover:underline"
                >
                  Simulasikan Laman
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ErrorCatalogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat katalog error...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
