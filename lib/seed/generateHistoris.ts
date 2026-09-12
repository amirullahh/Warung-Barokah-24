// Generator data historis (transaksi + stok_gerak) 30 hari terakhir — pure, deterministik
// (seed sama => output identik). Dipanggil oleh scripts/generate-seed-data.ts.
// Keputusan desain lengkap: lih. DESIGN-09-SEED-HISTORIS.md.
import { mulberry32 } from "./prng";

export interface TransaksiSeedRow {
  idx: number;
  tanggal: string;
  tipe: "masuk" | "keluar";
  kategoriNama: string;
  nominal: number;
  keterangan: string;
  createdByRole: "owner" | "kasir";
}

export interface StokGerakSeedRow {
  produkNama: string;
  tanggal: string;
  arah: "masuk" | "keluar";
  qty: number;
  keterangan: string;
  /** idx TransaksiSeedRow kalau baris ini adalah stok masuk hasil "beli stok jadi
   * pengeluaran otomatis" (STK-02) — di-render sebagai data-modifying CTE oleh toSql. */
  transaksiRefIdx?: number;
}

export interface GenerateHistorisConfig {
  seed: number;
  /** default 30 — jumlah hari ke belakang termasuk hari ini */
  hariTerakhir?: number;
  /** default new Date() — di-inject supaya testable tanpa bergantung jam sistem */
  hariIni?: Date;
}

export interface GenerateHistorisResult {
  transaksi: TransaksiSeedRow[];
  stokGerak: StokGerakSeedRow[];
}

interface RencanaKategori {
  nama: string;
  count: number;
  min: number;
  max: number;
}

// 38 transaksi masuk (penjualan) — kategori & rentang nominal sesuai DESIGN-09 keputusan #4.
const RENCANA_MASUK: RencanaKategori[] = [
  { nama: "Jual Rokok", count: 10, min: 20000, max: 35000 },
  { nama: "Jual Mie/Snack", count: 10, min: 5000, max: 25000 },
  { nama: "Jual Kopi/Minuman", count: 10, min: 3000, max: 15000 },
  { nama: "Jual Pulsa/PPOB", count: 8, min: 20000, max: 100000 },
];

// 12 transaksi keluar (pengeluaran) — lebih jarang daripada penjualan.
const RENCANA_KELUAR: RencanaKategori[] = [
  { nama: "Beli Stok Mie/Snack", count: 3, min: 200000, max: 500000 },
  { nama: "Beli Stok Kopi", count: 2, min: 100000, max: 300000 },
  { nama: "Gas & Listrik", count: 4, min: 20000, max: 150000 },
  { nama: "Lain-lain", count: 3, min: 10000, max: 150000 },
];

const KETERANGAN_MASUK: Record<string, string> = {
  "Jual Rokok": "Penjualan rokok",
  "Jual Mie/Snack": "Penjualan mie instan & snack",
  "Jual Kopi/Minuman": "Penjualan kopi & minuman",
  "Jual Pulsa/PPOB": "Penjualan pulsa & token PPOB",
};

const KETERANGAN_KELUAR: Record<string, string> = {
  "Beli Stok Mie/Snack": "Restock mie instan & snack dari agen",
  "Beli Stok Kopi": "Restock kopi sachet dari agen",
  "Gas & Listrik": "Isi ulang gas / bayar token listrik",
  "Lain-lain": "Pengeluaran operasional lain-lain",
};

// Harus sinkron dengan produk yang di-insert supabase/seed.sql.
export const PRODUK_MINIMUM: Record<string, number> = {
  "Mie Instan": 20,
  "Kopi Sachet": 15,
  "Gas 3kg": 2,
  Telur: 3,
  Beras: 5,
};

function formatTanggal(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mundurHari(hariIni: Date, offset: number): Date {
  const d = new Date(hariIni);
  d.setDate(d.getDate() - offset);
  return d;
}

function acakInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function hitungSisaPerProduk(rows: StokGerakSeedRow[]): Record<string, number> {
  const sisa: Record<string, number> = {};
  for (const r of rows) {
    sisa[r.produkNama] = (sisa[r.produkNama] ?? 0) + (r.arah === "masuk" ? r.qty : -r.qty);
  }
  return sisa;
}

export function generateHistoris(config: GenerateHistorisConfig): GenerateHistorisResult {
  const { seed, hariTerakhir = 30 } = config;
  const hariIni = config.hariIni ?? new Date();
  const rng = mulberry32(seed);

  const transaksi: TransaksiSeedRow[] = [];
  let idx = 0;

  for (const rencana of RENCANA_MASUK) {
    for (let i = 0; i < rencana.count; i++) {
      const offset = Math.floor(rng() * hariTerakhir);
      transaksi.push({
        idx: idx++,
        tanggal: formatTanggal(mundurHari(hariIni, offset)),
        tipe: "masuk",
        kategoriNama: rencana.nama,
        nominal: acakInt(rng, rencana.min, rencana.max),
        keterangan: KETERANGAN_MASUK[rencana.nama],
        createdByRole: rng() < 0.7 ? "kasir" : "owner",
      });
    }
  }

  for (const rencana of RENCANA_KELUAR) {
    for (let i = 0; i < rencana.count; i++) {
      const offset = Math.floor(rng() * hariTerakhir);
      transaksi.push({
        idx: idx++,
        tanggal: formatTanggal(mundurHari(hariIni, offset)),
        tipe: "keluar",
        kategoriNama: rencana.nama,
        nominal: acakInt(rng, rencana.min, rencana.max),
        keterangan: KETERANGAN_KELUAR[rencana.nama],
        createdByRole: rng() < 0.7 ? "owner" : "kasir",
      });
    }
  }

  // Urutkan berdasarkan tanggal supaya file SQL yang dihasilkan enak dibaca manusia.
  // `idx` tetap dipertahankan sebagai ID stabil (bukan posisi array) supaya link
  // stok_gerak.transaksiRefIdx di bawah tetap valid setelah pengurutan ini.
  transaksi.sort((a, b) => (a.tanggal < b.tanggal ? -1 : a.tanggal > b.tanggal ? 1 : a.idx - b.idx));

  function tanggalByIdx(targetIdx: number): string {
    return transaksi.find((t) => t.idx === targetIdx)!.tanggal;
  }

  // Pilih baris "Beli Stok ..." mana yang mau di-link ke stok_gerak masuk (pola STK-02:
  // beli stok jadi pengeluaran otomatis). Tidak semua baris "Beli Stok" di-link — realistis
  // kalau tidak semua pembelian langsung dicatat sebagai stok masuk hari itu juga.
  const beliMieSnackIdx = transaksi
    .filter((t) => t.kategoriNama === "Beli Stok Mie/Snack")
    .map((t) => t.idx)
    .slice(0, 2);
  const beliKopiIdx = transaksi
    .filter((t) => t.kategoriNama === "Beli Stok Kopi")
    .map((t) => t.idx)
    .slice(0, 1);

  const stokGerak: StokGerakSeedRow[] = [];

  function tambahStok(
    produkNama: string,
    arah: "masuk" | "keluar",
    qty: number,
    keterangan: string,
    transaksiRefIdx?: number
  ) {
    const tanggal =
      transaksiRefIdx !== undefined
        ? tanggalByIdx(transaksiRefIdx)
        : formatTanggal(mundurHari(hariIni, Math.floor(rng() * hariTerakhir)));
    stokGerak.push({ produkNama, tanggal, arah, qty, keterangan, transaksiRefIdx });
  }

  // Mie Instan (stok_minimum 20): 2 restock linked + 4 keluar (terjual) -> tetap aman.
  tambahStok("Mie Instan", "masuk", 40, "Restock dari distributor", beliMieSnackIdx[0]);
  tambahStok("Mie Instan", "masuk", 35, "Restock dari distributor", beliMieSnackIdx[1]);
  for (const qty of [15, 12, 10, 5]) tambahStok("Mie Instan", "keluar", qty, "Terjual");

  // Kopi Sachet (stok_minimum 15): 1 restock linked + 1 restock lepas + 2 keluar -> aman.
  tambahStok("Kopi Sachet", "masuk", 30, "Restock dari distributor", beliKopiIdx[0]);
  tambahStok("Kopi Sachet", "masuk", 15, "Restock tambahan");
  for (const qty of [10, 8]) tambahStok("Kopi Sachet", "keluar", qty, "Terjual");

  // Gas 3kg (stok_minimum 2): sengaja dibuat menipis (sisa <= minimum) untuk demo STK-04.
  tambahStok("Gas 3kg", "masuk", 6, "Restock gas 3kg");
  for (const qty of [2, 2, 2]) tambahStok("Gas 3kg", "keluar", qty, "Terjual ke pelanggan");

  // Telur (stok_minimum 3): juga dibuat menipis.
  tambahStok("Telur", "masuk", 6, "Restock telur");
  for (const qty of [2, 2]) tambahStok("Telur", "keluar", qty, "Terjual");

  // Beras (stok_minimum 5): tetap aman.
  for (const qty of [20, 10]) tambahStok("Beras", "masuk", qty, "Restock beras");
  tambahStok("Beras", "keluar", 10, "Terjual");

  return { transaksi, stokGerak };
}
