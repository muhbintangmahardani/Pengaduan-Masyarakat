"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Clock, ShieldAlert, LogOut, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Konfigurasi Batas Waktu Aktivitas
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 menit total
const WARNING_COUNTDOWN_SECONDS = 60; // 60 detik sebelum sesi habis
const WARNING_THRESHOLD_MS = INACTIVITY_TIMEOUT_MS - WARNING_COUNTDOWN_SECONDS * 1000; // 14 menit
const ACTIVITY_THROTTLE_MS = 4000; // Throttle update ke storage setiap 4 detik

export function AutoLogoutTimer() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_COUNTDOWN_SECONDS);
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  // Prosedur Logout Otomatis
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // Hapus storage lokal penanda aktivitas
      if (typeof window !== "undefined") {
        localStorage.removeItem("jb_last_activity_time");
        sessionStorage.removeItem("jb_last_activity_time");
      }

      // Sign out dari Supabase Auth
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Error saat auto logout:", e);
    } finally {
      // Alihkan halaman ke login dengan alasan idle_timeout
      window.location.href = "/login?reason=idle_timeout";
    }
  }, []);

  // Catat aktivitas pengguna (klik, ketik, sentuh, scroll)
  const recordUserActivity = useCallback(() => {
    const now = Date.now();
    // Throttle agar tidak membebani browser
    if (now - lastActivityRef.current > ACTIVITY_THROTTLE_MS) {
      lastActivityRef.current = now;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("jb_last_activity_time", now.toString());
        } catch {
          // ignore storage error
        }
      }
    }
    // Jika dialog peringatan sedang muncul dan user beraktivitas, reset peringatan
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(WARNING_COUNTDOWN_SECONDS);
    }
  }, [showWarning]);

  // Tombol "Tetap Masuk": reset timer sepenuhnya
  const handleStayLoggedIn = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jb_last_activity_time", now.toString());
      } catch {
        // ignore storage error
      }
    }
    setShowWarning(false);
    setSecondsRemaining(WARNING_COUNTDOWN_SECONDS);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inisialisasi timestamp awal
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem("jb_last_activity_time", now.toString());
    } catch {
      // ignore
    }

    // 1. Event listener interaksi pengguna
    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];
    const handleEvent = () => recordUserActivity();

    events.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    // 2. Sinkronisasi antar Tab (jika user aktif di tab lain)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jb_last_activity_time" && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime) && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          if (showWarning) {
            setShowWarning(false);
            setSecondsRemaining(WARNING_COUNTDOWN_SECONDS);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 3. Deteksi saat tab dibuka kembali setelah perangkat tidur / tab blur
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const currentTime = Date.now();
        const stored = localStorage.getItem("jb_last_activity_time");
        const effectiveLast = stored ? parseInt(stored, 10) : lastActivityRef.current;
        const idleDuration = currentTime - effectiveLast;

        if (idleDuration >= INACTIVITY_TIMEOUT_MS) {
          handleAutoLogout();
        } else if (idleDuration >= WARNING_THRESHOLD_MS) {
          const remainingSec = Math.max(1, Math.round((INACTIVITY_TIMEOUT_MS - idleDuration) / 1000));
          setSecondsRemaining(remainingSec);
          setShowWarning(true);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Interval Timer pengecekan setiap 1 detik
    const timerInterval = setInterval(() => {
      const currentTime = Date.now();
      const stored = localStorage.getItem("jb_last_activity_time");
      const effectiveLast = stored ? parseInt(stored, 10) : lastActivityRef.current;
      const idleDuration = currentTime - effectiveLast;

      if (idleDuration >= INACTIVITY_TIMEOUT_MS) {
        handleAutoLogout();
      } else if (idleDuration >= WARNING_THRESHOLD_MS) {
        const remainingSec = Math.max(1, Math.round((INACTIVITY_TIMEOUT_MS - idleDuration) / 1000));
        setSecondsRemaining(remainingSec);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(timerInterval);
    };
  }, [handleAutoLogout, recordUserActivity, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sesi Anda Akan Berakhir
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tidak ada aktivitas terdeteksi selama 14 menit
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Demi keamanan data dan integritas akun Anda, sesi login Anda akan diakhiri secara otomatis dalam:
        </p>

        {/* Angka Countdown Besar & Jelas */}
        <div className="flex items-center justify-center py-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800/60">
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
            {secondsRemaining}
          </span>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 ml-2">
            detik tersisa
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleAutoLogout}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            Keluar Sekarang
          </button>
          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="px-5 py-2.5 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-bold transition-all shadow-md active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tetap Masuk
          </button>
        </div>
      </div>
    </div>
  );
}
