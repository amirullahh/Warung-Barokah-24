import { describe, it, expect } from "vitest";
import { transaksiSchema } from "@/lib/schemas/transaksi";

describe("transaksiSchema", () => {
  const dasar = {
    tanggal: "2026-09-12",
    tipe: "masuk" as const,
    kategori_id: "11111111-1111-4111-8111-111111111111",
    nominal: 15000,
  };
  it("valid", () => {
    expect(transaksiSchema.safeParse(dasar).success).toBe(true);
  });
  it("gagal: nominal 0 (TRX-02)", () => {
    expect(transaksiSchema.safeParse({ ...dasar, nominal: 0 }).success).toBe(false);
  });
  it("gagal: nominal negatif (TRX-02)", () => {
    expect(transaksiSchema.safeParse({ ...dasar, nominal: -5 }).success).toBe(false);
  });
  it("gagal: tipe bukan masuk/keluar", () => {
    expect(transaksiSchema.safeParse({ ...dasar, tipe: "lainnya" }).success).toBe(false);
  });
  it("gagal: kategori_id bukan uuid", () => {
    expect(transaksiSchema.safeParse({ ...dasar, kategori_id: "bukan-uuid" }).success).toBe(false);
  });
});
