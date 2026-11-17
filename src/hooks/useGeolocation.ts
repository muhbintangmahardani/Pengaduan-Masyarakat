"use client";

import { useState, useCallback } from "react";

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  isLoading: boolean;
  error: string | null;
  getLocation: () => Promise<GeolocationCoordinates | null>;
  clearLocation: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] =
    useState<GeolocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback((): Promise<GeolocationCoordinates | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        const errorMsg = "Fitur Geolocation tidak didukung oleh peramban ini.";
        setError(errorMsg);
        resolve(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 detik batas waktu
        maximumAge: 60000, // cache 1 menit
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeolocationCoordinates = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: position.coords.accuracy,
          };
          setCoordinates(coords);
          setIsLoading(false);
          resolve(coords);
        },
        (geoError) => {
          let errorMsg = "Gagal mengambil koordinat lokasi.";
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMsg =
                "Izin akses GPS ditolak. Silakan izinkan akses lokasi pada browser Anda atau isi alamat manual.";
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMsg =
                "Informasi lokasi saat ini tidak tersedia pada perangkat Anda.";
              break;
            case geoError.TIMEOUT:
              errorMsg =
                "Waktu permintaan lokasi habis (timeout). Silakan coba lagi.";
              break;
          }
          setError(errorMsg);
          setIsLoading(false);
          resolve(null);
        },
        options
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    coordinates,
    isLoading,
    error,
    getLocation,
    clearLocation,
  };
}
