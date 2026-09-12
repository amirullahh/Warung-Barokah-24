import { describe, it, expect } from "vitest";
import { buatSqlHistoris } from "@/lib/seed/toSql";
import type { GenerateHistorisResult } from "@/lib/seed/generateHistoris";

const CFG = {
  usahaId: "10000000-0000-0000-0000-000000000001",
  ownerId: "2c3bca3a-44ee-472e-8c64-59088816f4d7",
  kasirId: "73a00cc2-c91e-489e-8965-2cadd6e7ac30",
};

function fixture(): GenerateHistorisResult {
  return {
    transaksi: [
      {
        idx: 0,
        tanggal: "2026-09-01",
        tipe: "masuk",
        kategoriNama: "Jual Rokok",
        nominal: 25000,
        keterangan: "Penjualan rokok",
        createdByRole: "kasir",
      },
      {
        idx: 1,
        tanggal: "2026-09-05",
        tipe: "keluar",
        kategoriNama: "Beli Stok Mie/Snack",
        nominal: 300000,
        keterangan: "Restock d'Agen Jaya",
        createdByRole: "owner",
      },
    ],
    stokGerak: [
      {
        produkNama: "Kopi Sachet",
        tanggal: "2026-09-02",
        arah: "keluar",
        qty: 5,
        keterangan: "Terjual",
      },
      {
        produkNama: "Mie Instan",
        tanggal: "2026-09-05",
        arah: "masuk",
        qty: 40,
        keterangan: "Restock dari distributor",
        transaksiRefIdx: 1,
      },
    ],
  };
}

describe("buatSqlHistoris", () => {
  const sql = buatSqlHistoris(fixture(), CFG);

  it("insert transaksi biasa memakai subquery kategori by name", () => {
    expect(sql).toContain("insert into transaksi");
    expect(sql).toContain(
      "(select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok')"
    );
    expect(sql).toContain("'2c3bca3a-44ee-472e-8c64-59088816f4d7'");
  });

  it("transaksi yang linked ke stok_gerak TIDAK muncul di insert transaksi biasa (cuma di blok CTE)", () => {
    const insertTransaksiBiasa = sql.split("-- 3)")[0];
    expect(insertTransaksiBiasa).not.toContain("Beli Stok Mie/Snack");
  });

  it("stok_gerak yang tidak linked pakai subquery produk by name", () => {
    expect(sql).toContain(
      "(select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Kopi Sachet')"
    );
  });

  it("stok_gerak yang linked pakai data-modifying CTE (with ... insert ... returning id)", () => {
    expect(sql).toContain("with trx as");
    expect(sql).toContain("returning id");
    expect(sql).toContain(
      "(select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Mie Instan')"
    );
  });

  it("meng-escape petik satu di keterangan (SQL injection / syntax safety)", () => {
    expect(sql).toContain("Restock d''Agen Jaya");
    expect(sql).not.toContain("Restock d'Agen Jaya'");
  });
});
