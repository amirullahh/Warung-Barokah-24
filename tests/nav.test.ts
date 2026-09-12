import { describe, it, expect } from "vitest";
import { isNavActive, NAV_ITEMS } from "@/lib/nav";

describe("isNavActive", () => {
  it("beranda aktif hanya di root", () => {
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/transaksi", "/")).toBe(false);
  });
  it("halaman lain aktif kalau path sama persis", () => {
    expect(isNavActive("/transaksi", "/transaksi")).toBe(true);
  });
  it("halaman lain aktif kalau path adalah sub-route", () => {
    expect(isNavActive("/transaksi/123", "/transaksi")).toBe(true);
  });
  it("tidak aktif kalau path beda", () => {
    expect(isNavActive("/budget", "/transaksi")).toBe(false);
  });
  it("tidak salah cocok prefix tanpa batas slash (mis. /transaksiabc)", () => {
    expect(isNavActive("/transaksiabc", "/transaksi")).toBe(false);
  });
});

describe("NAV_ITEMS", () => {
  it("berisi 6 halaman utama sesuai fitur yang sudah dibangun", () => {
    expect(NAV_ITEMS.map((n) => n.href)).toEqual([
      "/",
      "/transaksi",
      "/budget",
      "/stok",
      "/hutang",
      "/laporan",
    ]);
  });
});
