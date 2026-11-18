import type { Complaint } from "@/types";
import { formatDateTime, formatDateTimeWithHours, formatStatusLabel, formatCurrentDateWIB } from "@/lib/utils";

/**
 * Mengonversi daftar pengaduan menjadi format CSV murni tabular dengan UTF-8 BOM
 * Dapat dibuka langsung di Microsoft Excel, Google Sheets, atau aplikasi spreadsheet lainnya
 * dengan susunan kolom rapi dan encoding karakter yang aman.
 */
export function exportComplaintsToCSV(
  complaints: Complaint[],
  filename: string = "laporan-jalanbaik.csv"
) {
  if (!complaints || complaints.length === 0) {
    if (typeof window !== "undefined") {
      alert("Tidak ada data laporan untuk diekspor.");
    }
    return;
  }

  // Header Kolom Tabel Murni
  const headers = [
    "No",
    "No. Tiket",
    "Tanggal Masuk",
    "Judul Laporan",
    "Status Laporan",
    "Prioritas",
    "Jenis Kerusakan",
    "Tingkat Kerusakan",
    "Alamat Lengkap",
    "Koordinat GPS",
    "Nama Pelapor",
    "Petugas Lapangan",
    "Target Selesai",
    "Tanggal Selesai",
    "Catatan Tindakan Lapangan",
  ];

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""').trim();
    return `"${str}"`;
  };

  const rows = complaints.map((c, index) => {
    const lat = Number(c.latitude);
    const lng = Number(c.longitude);
    const coords =
      !isNaN(lat) && !isNaN(lng) && c.latitude !== null && c.longitude !== null
        ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        : "-";
    const reporterName = c.profiles?.full_name || "Masyarakat";
    const officerName = c.assigned_officer?.full_name || "-";
    const createdDate = formatDateTimeWithHours(c.created_at);
    const targetDate = c.target_date ? formatDateTime(c.target_date) : "-";
    const completedDate = c.completed_at ? formatDateTimeWithHours(c.completed_at) : "-";

    return [
      escapeCSV(index + 1),
      escapeCSV(c.ticket_number),
      escapeCSV(createdDate),
      escapeCSV(c.title),
      escapeCSV(formatStatusLabel(c.status)),
      escapeCSV(c.priority ? c.priority.toUpperCase() : "SEDANG"),
      escapeCSV(c.damage_type || c.category || "Jalan Rusak"),
      escapeCSV(c.damage_level || "-"),
      escapeCSV(c.address),
      escapeCSV(coords),
      escapeCSV(reporterName),
      escapeCSV(officerName),
      escapeCSV(targetDate),
      escapeCSV(completedDate),
      escapeCSV(c.completion_note || "-"),
    ].join(",");
  });

  // Tambahkan UTF-8 Byte Order Mark (\uFEFF) agar Excel mengenali karakter Indonesia dengan sempurna
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Menghasilkan dokumen PDF murni berformat tabel resmi instansi (bukan screenshot UI aplikasi).
 * Menggunakan iframe cetak khusus sehingga bebas dari sidebar, header, dark mode, dan tombol web.
 */
export function printComplaintsReport(
  complaints: Complaint[],
  documentTitle: string = "Laporan Pengaduan Jalan"
) {
  if (typeof window === "undefined" || !complaints || complaints.length === 0) {
    return;
  }

  const isSingle = complaints.length === 1;
  const printDateStr = formatDateTimeWithHours(new Date().toISOString());

  // Hitung ringkasan
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "in_progress" || c.status === "under_review" || c.status === "verified"
  ).length;
  const pendingCount = complaints.filter((c) => c.status === "pending").length;

  let reportHtml = "";

  if (isSingle) {
    const c = complaints[0];
    const reporterName = c.profiles?.full_name || "Masyarakat";
    const officerName = c.assigned_officer?.full_name || "-";
    const lat = Number(c.latitude);
    const lng = Number(c.longitude);
    const coords =
      !isNaN(lat) && !isNaN(lng) && c.latitude !== null && c.longitude !== null
        ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        : "-";

    reportHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan #${c.ticket_number} - jalanbaik</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 10pt;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 10px;
          }
          .kop {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2.5px solid #0c3b37;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .kop-title h1 {
            font-size: 14pt;
            font-weight: 800;
            color: #0c3b37;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .kop-title p {
            font-size: 8.5pt;
            color: #475569;
          }
          .badge-ticket {
            background: #e6f4f1;
            color: #0c3b37;
            border: 1px solid #0c3b37;
            padding: 6px 14px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 11pt;
            font-weight: bold;
          }
          .doc-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .doc-header h2 {
            font-size: 12pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #1e293b;
          }
          .doc-header p {
            font-size: 8.5pt;
            color: #64748b;
          }
          .section-title {
            font-size: 9.5pt;
            font-weight: 700;
            color: #0c3b37;
            text-transform: uppercase;
            margin: 14px 0 6px 0;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          table.data-table td {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            font-size: 9pt;
            vertical-align: top;
          }
          table.data-table td.label-col {
            width: 25%;
            background-color: #f8fafc;
            font-weight: 600;
            color: #334155;
          }
          .status-tag {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 8.5pt;
          }
          .status-resolved { background: #dcfce7; color: #166534; }
          .status-in_progress { background: #e0f2fe; color: #0369a1; }
          .status-under_review { background: #fef3c7; color: #92400e; }
          .status-pending { background: #f1f5f9; color: #475569; }
          .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sign-box {
            width: 45%;
            text-align: center;
            font-size: 8.5pt;
          }
          .sign-space {
            height: 60px;
          }
          .sign-line {
            border-top: 1px solid #334155;
            padding-top: 4px;
            font-weight: 600;
          }
          .footer-note {
            margin-top: 30px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            font-size: 7.5pt;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <div class="kop-title">
            <h1>DINAS BINA MARGA & PENATAAN RUANG</h1>
            <p>Sistem Pengaduan & Layanan Transparansi Perbaikan Jalan (jalanbaik)</p>
          </div>
          <div class="badge-ticket">${c.ticket_number}</div>
        </div>

        <div class="doc-header">
          <h2>LEMBAR LAPORAN PENGADUAN & PERBAIKAN JALAN</h2>
          <p>Dicetak pada: ${printDateStr}</p>
        </div>

        <div class="section-title">1. INFORMASI PENGADUAN</div>
        <table class="data-table">
          <tr>
            <td class="label-col">No. Tiket</td>
            <td><strong>${c.ticket_number}</strong></td>
            <td class="label-col">Status Penanganan</td>
            <td><span class="status-tag status-${c.status}">${formatStatusLabel(c.status).toUpperCase()}</span></td>
          </tr>
          <tr>
            <td class="label-col">Judul Laporan</td>
            <td colspan="3"><strong>${c.title}</strong></td>
          </tr>
          <tr>
            <td class="label-col">Nama Pelapor</td>
            <td>${reporterName}</td>
            <td class="label-col">Tanggal Masuk</td>
            <td>${formatDateTimeWithHours(c.created_at)}</td>
          </tr>
          <tr>
            <td class="label-col">Jenis Kerusakan</td>
            <td>${c.damage_type || c.category || "Jalan Rusak"}</td>
            <td class="label-col">Tingkat / Prioritas</td>
            <td>${c.damage_level || "-"} / <strong>${(c.priority || "Sedang").toUpperCase()}</strong></td>
          </tr>
          <tr>
            <td class="label-col">Deskripsi Masalah</td>
            <td colspan="3">${c.description || "-"}</td>
          </tr>
        </table>

        <div class="section-title">2. LOKASI KERUSAKAN JALAN</div>
        <table class="data-table">
          <tr>
            <td class="label-col">Alamat Lengkap</td>
            <td colspan="3">${c.address}</td>
          </tr>
          <tr>
            <td class="label-col">Koordinat GPS</td>
            <td colspan="3">${coords}</td>
          </tr>
        </table>

        <div class="section-title">3. PENUGASAN & TINDAK LANJUT LAPANGAN</div>
        <table class="data-table">
          <tr>
            <td class="label-col">Petugas Lapangan</td>
            <td><strong>${officerName}</strong></td>
            <td class="label-col">Target Penyelesaian</td>
            <td>${c.target_date ? formatDateTime(c.target_date) : "2 Hari Kerja"}</td>
          </tr>
          <tr>
            <td class="label-col">Tanggal Selesai</td>
            <td>${c.completed_at ? formatDateTimeWithHours(c.completed_at) : "Dalam proses penanganan"}</td>
            <td class="label-col">Verifikasi Admin</td>
            <td>${c.verified_at ? formatDateTimeWithHours(c.verified_at) : "-"}</td>
          </tr>
          <tr>
            <td class="label-col">Catatan Petugas</td>
            <td colspan="3">${c.completion_note || "Tidak ada catatan tambahan dari petugas."}</td>
          </tr>
        </table>

        <div class="signatures">
          <div class="sign-box">
            <p>Petugas Pelaksana Lapangan,</p>
            <div class="sign-space"></div>
            <div class="sign-line">( ${officerName} )</div>
            <p style="color:#64748b; font-size: 7.5pt; margin-top: 2px;">Tim Satgas Perbaikan Jalan</p>
          </div>
          <div class="sign-box">
            <p>Pengawas / Pejabat Penilai,</p>
            <div class="sign-space"></div>
            <div class="sign-line">( Petugas Pengawas Dinas )</div>
            <p style="color:#64748b; font-size: 7.5pt; margin-top: 2px;">Dinas Bina Marga</p>
          </div>
        </div>

        <div class="footer-note">
          Dokumen ini diterbitkan secara otomatis oleh sistem transparansi publik <strong>jalanbaik</strong> dan memiliki kekuatan data yang valid sesuai basis data resmi.
        </div>
      </body>
      </html>
    `;
  } else {
    // Mode Banyak Laporan: TABEL REKAPITULASI RESMI
    const tableRows = complaints
      .map((c, idx) => {
        const reporterName = c.profiles?.full_name || "Masyarakat";
        const officerName = c.assigned_officer?.full_name || "-";
        const createdDate = formatDateTime(c.created_at);
        const targetDate = c.target_date ? formatDateTime(c.target_date) : "-";
        const completedDate = c.completed_at ? formatDateTime(c.completed_at) : "-";

        return `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td style="font-family: monospace; font-weight: bold; white-space: nowrap;">${c.ticket_number}</td>
            <td style="white-space: nowrap;">${createdDate}</td>
            <td>
              <strong>${c.title}</strong>
              <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">${c.damage_type || c.category || "Jalan Rusak"}</div>
            </td>
            <td>${c.address}</td>
            <td>${reporterName}</td>
            <td>${officerName}</td>
            <td style="white-space: nowrap;">${targetDate}</td>
            <td style="text-align: center; white-space: nowrap;">
              <span class="status-tag status-${c.status}">${formatStatusLabel(c.status)}</span>
            </td>
            <td style="white-space: nowrap;">${completedDate}</td>
          </tr>
        `;
      })
      .join("");

    reportHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${documentTitle} - jalanbaik</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 8.5pt;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 10px;
          }
          .kop {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0c3b37;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .kop-title h1 {
            font-size: 13pt;
            font-weight: 800;
            color: #0c3b37;
            text-transform: uppercase;
          }
          .kop-title p {
            font-size: 8pt;
            color: #475569;
          }
          .rekap-header {
            margin-bottom: 12px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
          }
          .rekap-header h2 {
            font-size: 11pt;
            font-weight: bold;
            color: #1e293b;
            text-transform: uppercase;
          }
          .stats-boxes {
            display: flex;
            gap: 10px;
          }
          .stat-pill {
            padding: 4px 10px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-size: 8pt;
          }
          .stat-pill strong {
            color: #0c3b37;
          }
          table.report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table.report-table th {
            background-color: #0c3b37;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 7px 6px;
            border: 1px solid #082825;
            font-size: 8pt;
            text-transform: uppercase;
          }
          table.report-table td {
            padding: 6px;
            border: 1px solid #cbd5e1;
            font-size: 8pt;
            vertical-align: top;
          }
          table.report-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .status-tag {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 7.5pt;
          }
          .status-resolved { background: #dcfce7; color: #166534; }
          .status-in_progress { background: #e0f2fe; color: #0369a1; }
          .status-under_review { background: #fef3c7; color: #92400e; }
          .status-pending { background: #f1f5f9; color: #475569; }
          .footer-section {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            page-break-inside: avoid;
          }
          .footer-left {
            font-size: 7.5pt;
            color: #64748b;
          }
          .footer-sign {
            width: 220px;
            text-align: center;
            font-size: 8pt;
          }
          .sign-space {
            height: 50px;
          }
          .sign-line {
            border-top: 1px solid #334155;
            padding-top: 3px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <div class="kop-title">
            <h1>DINAS BINA MARGA & PENATAAN RUANG</h1>
            <p>Sistem Pengaduan & Layanan Transparansi Perbaikan Jalan (jalanbaik)</p>
          </div>
          <div style="text-align: right; font-size: 7.5pt; color: #64748b;">
            Tanggal Cetak:<br><strong>${printDateStr}</strong>
          </div>
        </div>

        <div class="rekap-header">
          <h2>DAFTAR REKAPITULASI LAPORAN PENGADUAN JALAN</h2>
          <div class="stats-boxes">
            <div class="stat-pill">Total: <strong>${totalCount}</strong></div>
            <div class="stat-pill">Selesai: <strong>${resolvedCount}</strong></div>
            <div class="stat-pill">Dikerjakan: <strong>${inProgressCount}</strong></div>
            <div class="stat-pill">Verifikasi: <strong>${pendingCount}</strong></div>
          </div>
        </div>

        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">No</th>
              <th style="width: 90px;">No. Tiket</th>
              <th style="width: 75px;">Tgl Masuk</th>
              <th style="width: 170px;">Laporan Kerusakan</th>
              <th>Alamat Lokasi</th>
              <th style="width: 90px;">Pelapor</th>
              <th style="width: 90px;">Petugas</th>
              <th style="width: 70px;">Target</th>
              <th style="width: 95px; text-align: center;">Status</th>
              <th style="width: 75px;">Tuntas</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer-section">
          <div class="footer-left">
            <p>• Dokumen ini merupakan rekapitulasi data tabel resmi sistem <strong>jalanbaik</strong>.</p>
            <p>• Data diverifikasi dan dicetak secara otomatis pada ${printDateStr}.</p>
          </div>
          <div class="footer-sign">
            <p>Penanggung Jawab Pemeliharaan Jalan,</p>
            <div class="sign-space"></div>
            <div class="sign-line">( Pejabat Pengawas Teknis )</div>
            <p style="color: #64748b; font-size: 7.5pt; margin-top: 1px;">Dinas Bina Marga</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Gunakan teknik Iframe terisolasi agar murni dokumen laporan yang dicetak
  // (Tanpa menyertakan UI web, sidebar, header, dark mode, atau tombol aplikasi)
  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "none";
  printFrame.style.visibility = "hidden";
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
  if (!frameDoc) {
    document.body.removeChild(printFrame);
    return;
  }

  frameDoc.open();
  frameDoc.write(reportHtml);
  frameDoc.close();

  // Beri waktu browser menyiapkan layout cetak iframe
  setTimeout(() => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } catch (e) {
      console.error("Gagal mencetak laporan:", e);
    } finally {
      // Bersihkan elemen iframe dari DOM setelah dialog cetak selesai
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch {}
      }, 3000);
    }
  }, 350);
}
