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
