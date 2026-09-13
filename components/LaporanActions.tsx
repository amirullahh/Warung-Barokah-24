"use client";

import { buatCsvLaporan } from "@/lib/core";

type HariLaba = { tanggal: string; masuk: number; keluar: number; laba: number };

type LaporanActionsProps = {
  bulan: string;
  hari: HariLaba[];
};

export function LaporanActions({ bulan, hari }: LaporanActionsProps) {
  function handleExportCsv() {
    const csv = buatCsvLaporan(bulan, hari);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${bulan}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCetakPdf() {
    window.print();
  }

  return (
    <div className="print:hidden flex gap-2">
      <button
        type="button"
        onClick={handleExportCsv}
        className="h-11 rounded-lg border border-brand-600 px-4 font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-neutral-800"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={handleCetakPdf}
        className="h-11 rounded-lg bg-brand-600 px-4 font-medium text-white transition hover:bg-brand-700"
      >
        Cetak PDF
      </button>
    </div>
  );
}
