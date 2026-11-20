"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, X, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface ImageLightboxModalProps {
  src: string;
  alt: string;
  label?: string;
  caption?: string;
  badgeText?: string;
  badgeColor?: "default" | "emerald" | "amber" | "sky";
  className?: string;
  imageClassName?: string;
  heightClass?: string;
  showZoomHint?: boolean;
}

export function ImageLightboxModal({
  src,
  alt,
  label,
  caption,
  badgeText,
  badgeColor = "default",
  className = "",
  imageClassName = "object-cover",
  heightClass = "h-48 sm:h-56",
  showZoomHint = true,
}: ImageLightboxModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Fallback pengaman agar Next.js <Image /> tidak crash bila src null/undefined/empty
  const safeSrc =
    src && typeof src === "string" && src.trim() !== ""
      ? src
      : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7";

  const handleOpen = () => {
    setScale(1);
    setIsOpen(true);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 2.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.8));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  const getBadgeStyle = () => {
    switch (badgeColor) {
      case "emerald":
        return "bg-emerald-600 text-white";
      case "amber":
        return "bg-amber-600 text-white";
      case "sky":
        return "bg-sky-600 text-white";
      default:
        return "bg-black/70 text-white";
    }
  };

  return (
    <>
      {/* Clickable Image Container */}
      <div
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        className={`group relative w-full ${heightClass} rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer shadow-xs transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 ${className}`}
        title="Klik untuk melihat foto ukuran penuh"
      >
        <Image
          src={safeSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`${imageClassName} transition-transform duration-300 group-hover:scale-105`}
        />

        {/* Optional Badge (e.g. KONDISI AWAL / SESUDAH PERBAIKAN) */}
        {badgeText && (
          <div
            className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider shadow-xs ${getBadgeStyle()}`}
          >
            {badgeText}
          </div>
        )}

        {/* Hover / Tap Zoom Hint Overlay */}
        {showZoomHint && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <Maximize2 className="w-3.5 h-3.5 text-[#0c3b37] dark:text-emerald-400" />
              <span>Perbesar Foto</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideCloseButton={true}
          className="max-w-4xl w-[95vw] max-h-[92vh] p-0 overflow-hidden bg-slate-950/95 border-slate-800 text-white rounded-2xl flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-4">
              {badgeText && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${getBadgeStyle()}`}
                >
                  {badgeText}
                </span>
              )}
              <DialogTitle className="text-sm font-bold text-white truncate">
                {label || alt}
              </DialogTitle>
            </div>

            {/* Quick Action Controls Berjejer Rapi Tanpa Tumpang Tindih */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              {scale !== 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-[10px] font-bold rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset Ukuran"
                >
                  100%
                </button>
              )}
              <a
                href={safeSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Buka Foto Asli di Tab Baru"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Pemisah Halus */}
              <div className="h-4 w-px bg-slate-700/80 mx-1 shrink-0" />

              {/* Tombol Silang (Tutup Modal) yang Mandiri dan Terpisah */}
              <DialogClose asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Tutup Preview Foto"
                  aria-label="Tutup Preview Foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Main Photo View Area */}
          <div className="relative flex-1 min-h-[300px] max-h-[72vh] overflow-auto flex items-center justify-center p-4 bg-black/60">
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{ transform: `scale(${scale})` }}
            >
              <img
                src={safeSrc}
                alt={alt}
                className="max-h-[68vh] max-w-full rounded-lg object-contain shadow-2xl mx-auto select-none"
              />
            </div>
          </div>

          {/* Footer Caption */}
          {caption && (
            <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-300 flex-shrink-0">
              <p className="leading-relaxed">{caption}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
