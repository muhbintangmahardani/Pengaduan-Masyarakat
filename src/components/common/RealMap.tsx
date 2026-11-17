"use client";

import React, { useState } from "react";
import { MapPin, Navigation, ExternalLink, Loader2 } from "lucide-react";

interface RealMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  className?: string;
}

export function RealMap({
  latitude,
  longitude,
  address,
  className = "",
}: RealMapProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // Default koordinat jika belum diizinkan (Contoh: Bandung)
  const defaultLat = -6.9025;
  const defaultLng = 107.6186;

  const lat = latitude ?? defaultLat;
  const lng = longitude ?? defaultLng;

  // Bounding box span ~0.006 derajat untuk zoom yang pas pada level jalan
  const delta = 0.0035;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${className}`}>
      {/* Skeleton / Placeholder sebelum iframe selesai termuat */}
      {!isIframeLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 gap-2 z-10 animate-pulse">
          <Navigation className="w-6 h-6 text-[#0c3b37]/50 animate-spin" />
          <span className="text-[11px] font-medium">Memuat peta lokasi...</span>
        </div>
      )}

      {/* Live Map iframe dengan loading lazy dan onLoad handler */}
      <iframe
        title="Peta Lokasi Nyata"
        src={embedUrl}
        onLoad={() => setIsIframeLoaded(true)}
        className="w-full h-full border-0 pointer-events-auto"
        loading="lazy"
      />

      {/* Pin Overlay Badge */}
      <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-[#0c3b37] dark:text-emerald-400 pointer-events-none z-20">
        <MapPin className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-bounce" />
        <span>
          {latitude && longitude ? "Posisi GPS Nyata Terdeteksi" : "Peta Lokasi Sekitar"}
        </span>
      </div>

      {/* External Link Overlay */}
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0c3b37] flex items-center gap-1 shadow-sm transition-colors z-20"
      >
        <span>Buka Google Maps</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
