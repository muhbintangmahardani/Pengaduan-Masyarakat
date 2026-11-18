"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { exportComplaintsToCSV, printComplaintsReport } from "@/lib/export";
import { toast } from "sonner";
import type { Complaint } from "@/types";

interface ExportButtonProps {
  complaints: Complaint[];
  filename?: string;
  className?: string;
  label?: string;
}

export function ExportButton({
  complaints,
  filename = "laporan-jalanbaik",
  className = "",
  label = "Export Laporan",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    if (!complaints || complaints.length === 0) {
      toast.error("Tidak ada data laporan untuk diekspor.");
      return;
    }
    setIsExporting(true);
    try {
      exportComplaintsToCSV(complaints, `${filename}-${Date.now()}.csv`);
      toast.success("File CSV laporan berhasil diunduh.");
    } catch {
      toast.error("Gagal mengekspor laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!complaints || complaints.length === 0) {
      toast.error("Tidak ada data laporan untuk dicetak.");
      return;
    }
    printComplaintsReport(complaints, filename);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className={`gap-1.5 rounded-lg border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 ${className}`}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0c3b37]" />
          ) : (
            <Download className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl">
        <DropdownMenuItem
          onClick={handleExportCSV}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer py-2 rounded-lg"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Unduh Excel / CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handlePrint}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer py-2 rounded-lg"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Cetak / Simpan PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
