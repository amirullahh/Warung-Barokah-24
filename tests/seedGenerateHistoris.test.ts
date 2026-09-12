import { describe, it, expect } from "vitest";
import {
  generateHistoris,
  hitungSisaPerProduk,
  PRODUK_MINIMUM,
} from "@/lib/seed/generateHistoris";

const HARI_INI = new Date("2026-09-12T00:00:00");
const HARI_TERAKHIR = 30;

function buatHasil(seed = 20260912) {
  return generateHistoris({ seed, hariIni: HARI_INI, hariTerakhir: HARI_TERAKHIR });
}

describe("generateHistoris — transaksi", () => {
  it("menghasilkan tepat 50 baris transaksi", () => {
    const { transaksi } = buatHasil();
    expect(transaksi).toHaveLength(50);
  });

  it("semua tanggal ada dalam rentang 30 hari terakhir (inklusif hari ini)", () => {
    const { transaksi } = buatHasil();
    const awal = new Date(HARI_INI);
    awal.setDate(awal.getDate() - (HARI_TERAKHIR - 1));
    const awalStr = awal.toISOString().slice(0, 10);
    const akhirStr = HARI_INI.toISOString().slice(0, 10);
    for (const t of transaksi) {
      expect(t.tanggal >= awalStr).toBe(true);
      expect(t.tanggal <= akhirStr).toBe(true);
    }
  });

  it("nominal semua positif dan bilangan bulat", () => {
    const { transaksi } = buatHasil();
    for (const t of transaksi) {
      expect(t.nominal).toBeGreaterThan(0);
      expect(Number.isInteger(t.nominal)).toBe(true);
    }
  });

  it("kategori 'masuk' cuma dari kategori bertipe masuk, dan sebaliknya", () => {
    const { transaksi } = buatHasil();
    const kategoriMasuk = ["Jual Rokok", "Jual Mie/Snack", "Jual Kopi/Minuman", "Jual Pulsa/PPOB"];
    const kategoriKeluar = ["Beli Stok Mie/Snack", "Beli Stok Kopi", "Gas & Listrik", "Lain-lain"];
    for (const t of transaksi) {
      if (t.tipe === "masuk") expect(kategoriMasuk).toContain(t.kategoriNama);
      else expect(kategoriKeluar).toContain(t.kategoriNama);
    }
  });

  it("createdByRole cuma 'owner' atau 'kasir', dan kedua role sama-sama muncul", () => {
    const { transaksi } = buatHasil();
    const roles = new Set(transaksi.map((t) => t.createdByRole));
    for (const t of transaksi) expect(["owner", "kasir"]).toContain(t.createdByRole);
    expect(roles.has("owner")).toBe(true);
    expect(roles.has("kasir")).toBe(true);
  });

  it("idx unik untuk setiap baris (dipakai sebagai referensi link stok_gerak)", () => {
    const { transaksi } = buatHasil();
    const idxSet = new Set(transaksi.map((t) => t.idx));
    expect(idxSet.size).toBe(transaksi.length);
  });

  it("deterministik: seed sama menghasilkan output identik", () => {
    const hasil1 = buatHasil();
    const hasil2 = buatHasil();
    expect(hasil1).toEqual(hasil2);
  });
});

describe("generateHistoris — stok_gerak", () => {
  it("menghasilkan tepat 20 baris stok_gerak", () => {
    const { stokGerak } = buatHasil();
    expect(stokGerak).toHaveLength(20);
  });

  it("qty semua positif dan bilangan bulat, arah valid", () => {
    const { stokGerak } = buatHasil();
    for (const s of stokGerak) {
      expect(s.qty).toBeGreaterThan(0);
      expect(Number.isInteger(s.qty)).toBe(true);
      expect(["masuk", "keluar"]).toContain(s.arah);
    }
  });

  it("semua produkNama ada di daftar 5 produk yang sudah di-seed", () => {
    const { stokGerak } = buatHasil();
    const daftarProduk = Object.keys(PRODUK_MINIMUM);
    for (const s of stokGerak) expect(daftarProduk).toContain(s.produkNama);
  });

  it("minimal 1 produk berakhir 'menipis' (sisa <= stok_minimum) supaya badge STK-04 bisa didemokan", () => {
    const { stokGerak } = buatHasil();
    const sisa = hitungSisaPerProduk(stokGerak);
    const adaYangMenipis = Object.entries(sisa).some(
      ([nama, s]) => s <= PRODUK_MINIMUM[nama]
    );
    expect(adaYangMenipis).toBe(true);
  });

  it("tidak ada produk yang sisanya negatif (stok keluar tidak boleh melebihi masuk)", () => {
    const { stokGerak } = buatHasil();
    const sisa = hitungSisaPerProduk(stokGerak);
    for (const s of Object.values(sisa)) expect(s).toBeGreaterThanOrEqual(0);
  });

  it("minimal 2 baris stok masuk terhubung ke transaksi 'Beli Stok ...' (pola STK-02)", () => {
    const { transaksi, stokGerak } = buatHasil();
    const linked = stokGerak.filter((s) => s.transaksiRefIdx !== undefined);
    expect(linked.length).toBeGreaterThanOrEqual(2);
    for (const s of linked) {
      expect(s.arah).toBe("masuk");
      const trx = transaksi.find((t) => t.idx === s.transaksiRefIdx);
      expect(trx).toBeDefined();
      expect(trx!.tipe).toBe("keluar");
      expect(trx!.kategoriNama.startsWith("Beli Stok")).toBe(true);
      expect(trx!.tanggal).toBe(s.tanggal);
    }
  });
});
