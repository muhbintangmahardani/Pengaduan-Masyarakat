"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#0c3b37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Memuat layanan jalanbaik...</p>
      </div>
    </div>
  );
}
