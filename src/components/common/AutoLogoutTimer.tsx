"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// Konfigurasi Batas Waktu Aktivitas
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 menit total
const ACTIVITY_THROTTLE_MS = 2000; // Throttle update ke storage & cookie setiap 2 detik

// Helper membaca cookie jb_last_activity di browser
function getCookieLastActivity(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jb_last_activity="));
  if (!match) return null;
  const val = parseInt(match.split("=")[1], 10);
  return isNaN(val) ? null : val;
}

// Helper menyimpan timestamp ke localStorage dan document.cookie secara sinkron
function saveActivityTimestamp(time: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jb_last_activity_time", time.toString());
  } catch {}
  try {
    document.cookie = `jb_last_activity=${time}; path=/; max-age=86400; SameSite=Lax`;
  } catch {}
}

export function AutoLogoutTimer() {
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  // Prosedur Logout Otomatis Langsung (Hening / Tanpa Popup Alert)
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // Bersihkan storage lokal penanda aktivitas
      if (typeof window !== "undefined") {
        localStorage.removeItem("jb_last_activity_time");
        sessionStorage.removeItem("jb_last_activity_time");
        document.cookie = "jb_last_activity=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      // Sign out dari Supabase Auth
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Auto logout:", e);
    } finally {
      // Langsung arahkan ke login tanpa popup alert
      window.location.href = "/login";
    }
  }, []);

  // Catat aktivitas pengguna (klik, ketik, sentuh layar ponsel, scroll)
  const recordUserActivity = useCallback(() => {
    const now = Date.now();
    // Throttle agar tidak membebani browser atau baterai ponsel
    if (now - lastActivityRef.current > ACTIVITY_THROTTLE_MS) {
      lastActivityRef.current = now;
      saveActivityTimestamp(now);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Evaluasi timestamp aktivitas sebelumnya saat halaman dimuat (mount / refresh)
    const now = Date.now();
    const stored = localStorage.getItem("jb_last_activity_time");
    const storedTime = stored ? parseInt(stored, 10) : null;
    const cookieTime = getCookieLastActivity();

    const candidates = [storedTime, cookieTime].filter(
      (t): t is number => typeof t === "number" && !isNaN(t) && t > 0
    );
    const existingTime = candidates.length > 0 ? Math.max(...candidates) : null;

    if (existingTime) {
      const elapsed = now - existingTime;
      // JIKA SUDAH MELEBIHI 15 MENIT: Langsung logout seketika tanpa popup
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        handleAutoLogout();
        return;
      }
      lastActivityRef.current = existingTime;
    } else {
      lastActivityRef.current = now;
      saveActivityTimestamp(now);
    }

    // 2. Event listener interaksi pengguna (touch mobile & mouse desktop)
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "touchstart",
      "touchmove",
      "touchend",
      "scroll",
      "click",
    ];
    const handleEvent = () => recordUserActivity();

    events.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    // 3. Sinkronisasi antar Tab (jika user aktif di tab lain)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jb_last_activity_time" && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime) && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 4. Deteksi kebangkitan ponsel / tab setelah layar mati (visibilitychange, focus, pageshow)
    const checkWakeupInactivity = () => {
      const currentTime = Date.now();
      const storedVal = localStorage.getItem("jb_last_activity_time");
      const sTime = storedVal ? parseInt(storedVal, 10) : null;
      const cTime = getCookieLastActivity();

      const timePoints = [sTime, cTime, lastActivityRef.current].filter(
        (t): t is number => typeof t === "number" && !isNaN(t) && t > 0
      );
      const effectiveLast = timePoints.length > 0 ? Math.max(...timePoints) : lastActivityRef.current;
      const idleDuration = currentTime - effectiveLast;

      if (idleDuration >= INACTIVITY_TIMEOUT_MS) {
        handleAutoLogout();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkWakeupInactivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", checkWakeupInactivity);
    window.addEventListener("pageshow", checkWakeupInactivity);

    // 5. Interval Timer pengecekan aktif setiap 2 detik
    const timerInterval = setInterval(() => {
      const currentTime = Date.now();
      const storedVal = localStorage.getItem("jb_last_activity_time");
      const sTime = storedVal ? parseInt(storedVal, 10) : null;
      const cTime = getCookieLastActivity();

      const timePoints = [sTime, cTime, lastActivityRef.current].filter(
        (t): t is number => typeof t === "number" && !isNaN(t) && t > 0
      );
      const effectiveLast = timePoints.length > 0 ? Math.max(...timePoints) : lastActivityRef.current;
      const idleDuration = currentTime - effectiveLast;

      if (idleDuration >= INACTIVITY_TIMEOUT_MS) {
        handleAutoLogout();
      }
    }, 2000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkWakeupInactivity);
      window.removeEventListener("pageshow", checkWakeupInactivity);
      clearInterval(timerInterval);
    };
  }, [handleAutoLogout, recordUserActivity]);

  return null;
}
