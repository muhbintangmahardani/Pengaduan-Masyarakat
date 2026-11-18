"use client";

import React from "react";
import Link from "next/link";
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
  Home,
  RefreshCw,
  ArrowLeft,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JalanBaikLogo } from "@/components/common/JalanBaikLogo";
import { HTTP_ERRORS, type HttpErrorDefinition } from "@/lib/errorCodes";

interface ErrorViewProps {
  code: number;
  customMessage?: string;
  showBackToCatalog?: boolean;
}

export function ErrorView({
  code,
  customMessage,
  showBackToCatalog = true,
}: ErrorViewProps) {
  const errorDef: HttpErrorDefinition = HTTP_ERRORS[code] || {
    code,
    name: "HTTP Error",
    title: "Terjadi Kendala Layanan",
    description: customMessage || "Terjadi kesalahan pada permintaan HTTP Anda.",
    category: "Server Error (5xx)",
    solution: "Silakan muat ulang halaman atau kembali ke beranda.",
    badgeVariant: "destructive",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800",
  };

  const getErrorIcon = () => {
    switch (code) {
      case 400:
        return <FileWarning className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
      case 401:
        return <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
      case 403:
        return <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />;
      case 408:
        return <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />;
      case 429:
        return <Hourglass className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />;
      case 500:
        return <ServerCrash className="w-8 h-8 text-red-600 dark:text-red-400" />;
      case 502:
        return <Network className="w-8 h-8 text-rose-600 dark:text-rose-400" />;
      case 503:
        return <AlertOctagon className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
      case 504:
        return <TimerOff className="w-8 h-8 text-slate-600 dark:text-slate-400" />;
      default:
        return <ServerCrash className="w-8 h-8 text-red-600 dark:text-red-400" />;
    }
  };

  const getIconBackground = () => {
    switch (code) {
      case 400:
        return "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
      case 401:
        return "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800";
      case 403:
        return "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800";
      case 408:
        return "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800";
      case 429:
        return "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800";
      case 500:
        return "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800";
      case 502:
        return "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800";
      case 503:
        return "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
      case 504:
        return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
      default:
        return "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <JalanBaikLogo size="lg" variant="full" />
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 bg-white dark:bg-slate-900">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border shadow-inner ${getIconBackground()}`}
          >
            {getErrorIcon()}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className={`font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${errorDef.badgeClass}`}
              >
                Error {errorDef.code} • {errorDef.name}
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {errorDef.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {customMessage || errorDef.description}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-200 block">
                Solusi Tindakan:
              </span>
              <p>{errorDef.solution}</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            {code === 401 ? (
              <Button
                asChild
                className="h-11 px-5 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Link href="/login">
                  <Lock className="w-4 h-4 mr-1.5" />
                  Masuk ke Akun
                </Link>
              </Button>
            ) : (
              <Button
                onClick={() => window.location.reload()}
                className="h-11 px-5 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Coba Muat Ulang
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="h-11 px-5 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-1.5" />
                Beranda
              </Link>
            </Button>

            {showBackToCatalog && (
              <Button
                asChild
                variant="ghost"
                className="h-11 px-4 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <Link href="/error">
                  <LifeBuoy className="w-4 h-4 mr-1.5" />
                  Daftar Kode
                </Link>
              </Button>
            )}
          </div>
        </Card>

        <p className="text-[11px] text-slate-400">
          © 2026 jalanbaik • Layanan Transparansi Pengaduan Jalan Rusak
        </p>
      </div>
    </div>
  );
}
