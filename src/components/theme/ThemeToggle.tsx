"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border border-slate-200/60 dark:border-slate-800 bg-transparent ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? "light" : "dark";

    // Fallback jika browser tidak mendukung View Transitions API atau user prefer reduced motion
    if (
      typeof document === "undefined" ||
      !(document as any).startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    // Koordinat pusat tombol (asal mula efek lingkaran menyebar ala Telegram)
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Radius terjauh layar dari titik tombol
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      // Animasi lingkaran menyebar mulus ke seluruh layar
      document.documentElement.animate(
        {
          clipPath,
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800 overflow-hidden ${className}`}
      title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Malam"}
      aria-label="Toggle tema gelap / terang"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Ikon Matahari (Muncul saat Dark Mode dengan rotasi halus 0deg) */}
        <Sun
          className={`w-4 h-4 text-amber-400 absolute transition-all duration-500 ease-in-out ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        {/* Ikon Bulan (Muncul saat Light Mode dengan rotasi halus) */}
        <Moon
          className={`w-4 h-4 text-slate-700 dark:text-slate-200 absolute transition-all duration-500 ease-in-out ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
      </div>
    </Button>
  );
}
