"use client";

import { useState, useCallback } from "react";

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
}

export interface UseImageCompressionReturn {
  isCompressing: boolean;
  error: string | null;
  compressImage: (
    file: File,
    maxSizeMB?: number
  ) => Promise<CompressionResult | null>;
  resetCompression: () => void;
}

export function useImageCompression(): UseImageCompressionReturn {
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetCompression = useCallback(() => {
    setIsCompressing(false);
    setError(null);
  }, []);

  const compressImage = useCallback(
    async (
      file: File,
      maxSizeMB: number = 2.0
    ): Promise<CompressionResult | null> => {
      setIsCompressing(true);
      setError(null);

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        const msg = "File yang dipilih bukan merupakan format gambar yang valid.";
        setError(msg);
        setIsCompressing(false);
        return null;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      // Jika file sudah di bawah target dan berukuran sangat kecil, buat preview langsung
      if (file.size <= maxSizeBytes && file.type === "image/jpeg") {
        setIsCompressing(false);
        return {
          file,
          previewUrl: URL.createObjectURL(file),
          originalSize: file.size,
          compressedSize: file.size,
        };
      }

      try {
        const imageBitmap = await createImageBitmap(file);
        const originalWidth = imageBitmap.width;
        const originalHeight = imageBitmap.height;

        // Skalakan resolusi maksimal ke 1920x1920 (Full HD) demi efisiensi
        const MAX_DIMENSION = 1920;
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
          if (originalWidth > originalHeight) {
            targetWidth = MAX_DIMENSION;
            targetHeight = Math.round(
              (originalHeight * MAX_DIMENSION) / originalWidth
            );
          } else {
            targetHeight = MAX_DIMENSION;
            targetWidth = Math.round(
              (originalWidth * MAX_DIMENSION) / originalHeight
            );
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Gagal menginisialisasi konteks canvas 2D peramban.");
        }

        ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

        // Kompresi bertahap dengan menurunkan kualitas jika masih > 2 MB
        let quality = 0.85;
        let blob: Blob | null = null;

        while (quality >= 0.3) {
          blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
          );

          if (blob && blob.size <= maxSizeBytes) {
            break;
          }
          quality -= 0.15; // Kurangi kualitas secara iteratif
        }

        if (!blob) {
          throw new Error("Gagal memproses kompresi gambar.");
        }

        // Buat objek File baru dengan nama unik
        const cleanFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        const compressedFile = new File([blob], cleanFileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);

        setIsCompressing(false);
        return {
          file: compressedFile,
          previewUrl,
          originalSize: file.size,
          compressedSize: compressedFile.size,
        };
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengompresi gambar.";
        setError(message);
        setIsCompressing(false);
        return null;
      }
    },
    []
  );

  return {
    isCompressing,
    error,
    compressImage,
    resetCompression,
  };
}
