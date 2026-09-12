export function movingAverage(series: number[], window = 7): number {
  if (!series.length) return 0;
  const w = series.slice(-window);
  return w.reduce((a, b) => a + b, 0) / w.length;
}

export function predictNext7(lastAvg: number): number[] {
  return Array(7).fill(Math.round(lastAvg));
}

export function statusBudget(terpakai: number, pagu: number): "aman" | "hampir" | "over" {
  if (pagu <= 0) return "aman";
  const r = terpakai / pagu;
  if (r > 1) return "over";
  if (r >= 0.8) return "hampir";
  return "aman";
}

export function formatRp(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function statusStok(sisa: number, minimum: number): "aman" | "menipis" {
  return sisa <= minimum ? "menipis" : "aman";
}

export function validasiStokKeluar(sisa: number, qty: number): string | null {
  if (qty > sisa) return `Stok tidak cukup (sisa ${sisa}, minta keluar ${qty}).`;
  return null;
}

const STRUK_MAX_BYTES = 5 * 1024 * 1024;
const STRUK_TIPE_DIIZINKAN = ["image/jpeg", "image/jpg", "image/png"];

export function validasiStruk(file: { size: number; type: string }): string | null {
  if (!STRUK_TIPE_DIIZINKAN.includes(file.type)) {
    return "Format struk harus JPG atau PNG.";
  }
  if (file.size > STRUK_MAX_BYTES) {
    return "Ukuran struk maksimal 5MB.";
  }
  return null;
}

export function rentangBulan(bulan: string): { awal: string; akhir: string } {
  const [tahun, bln] = bulan.split("-").map(Number);
  const awal = `${bulan}-01`;
  const akhirDate = new Date(tahun, bln, 0); // day 0 = hari terakhir bulan `bln` (1-indexed)
  const yyyy = akhirDate.getFullYear();
  const mm = String(akhirDate.getMonth() + 1).padStart(2, "0");
  const dd = String(akhirDate.getDate()).padStart(2, "0");
  return { awal, akhir: `${yyyy}-${mm}-${dd}` };
}

export function ringkasanLabaRugi(
  hari: { masuk: number; keluar: number }[]
): { totalMasuk: number; totalKeluar: number; totalLaba: number } {
  const totalMasuk = hari.reduce((a, h) => a + h.masuk, 0);
  const totalKeluar = hari.reduce((a, h) => a + h.keluar, 0);
  return { totalMasuk, totalKeluar, totalLaba: totalMasuk - totalKeluar };
}

export function buatCsvLaporan(
  bulan: string,
  hari: { tanggal: string; masuk: number; keluar: number; laba: number }[]
): string {
  const header = "Tanggal,Masuk,Keluar,Laba";
  const baris = hari.map((h) => `${h.tanggal},${h.masuk},${h.keluar},${h.laba}`);
  const { totalMasuk, totalKeluar, totalLaba } = ringkasanLabaRugi(hari);
  const totalBaris = `Total,${totalMasuk},${totalKeluar},${totalLaba}`;
  return [header, ...baris, totalBaris].join("\n");
}
