import { describe, it, expect } from "vitest";
import { produkSchema, stokKeluarSchema, stokMasukSchema } from "@/lib/schemas/stok";

describe("produkSchema", () => {
  it("valid: nama+satuan+stok_minimum lengkap", () => {
    const r = produkSchema.safeParse({ nama: "Mie Instan", satuan: "dus", stok_minimum: 5 });
    expect(r.success).toBe(true);
  });
  it("gagal: nama kosong", () => {
    const r = produkSchema.safeParse({ nama: "", satuan: "pcs", stok_minimum: 5 });
    expect(r.success).toBe(false);
  });
  it("gagal: stok_minimum negatif", () => {
    const r = produkSchema.safeParse({ nama: "Kopi", satuan: "pcs", stok_minimum: -1 });
    expect(r.success).toBe(false);
  });
});

describe("stokKeluarSchema", () => {
  it("valid", () => {
    const r = stokKeluarSchema.safeParse({
      produk_id: "11111111-1111-4111-8111-111111111111",
      qty: 2,
      tanggal: "2026-09-12",
    });
    expect(r.success).toBe(true);
  });
  it("gagal: qty 0", () => {
    const r = stokKeluarSchema.safeParse({
      produk_id: "11111111-1111-4111-8111-111111111111",
      qty: 0,
      tanggal: "2026-09-12",
    });
    expect(r.success).toBe(false);
  });
  it("gagal: produk_id bukan uuid", () => {
    const r = stokKeluarSchema.safeParse({ produk_id: "bukan-uuid", qty: 2, tanggal: "2026-09-12" });
    expect(r.success).toBe(false);
  });
});

describe("stokMasukSchema", () => {
  const dasar = {
    produk_id: "11111111-1111-4111-8111-111111111111",
    qty: 40,
    tanggal: "2026-09-12",
  };
  it("valid tanpa buatPengeluaran", () => {
    const r = stokMasukSchema.safeParse({ ...dasar, buatPengeluaran: false });
    expect(r.success).toBe(true);
  });
  it("gagal: buatPengeluaran true tapi nominal kosong", () => {
    const r = stokMasukSchema.safeParse({ ...dasar, buatPengeluaran: true });
    expect(r.success).toBe(false);
  });
  it("gagal: buatPengeluaran true + nominal ada tapi kategori_id kosong", () => {
    const r = stokMasukSchema.safeParse({ ...dasar, buatPengeluaran: true, nominal: 100000 });
    expect(r.success).toBe(false);
  });
  it("valid: buatPengeluaran true + nominal + kategori_id lengkap", () => {
    const r = stokMasukSchema.safeParse({
      ...dasar,
      buatPengeluaran: true,
      nominal: 100000,
      kategori_id: "22222222-2222-4222-8222-222222222222",
    });
    expect(r.success).toBe(true);
  });
});
