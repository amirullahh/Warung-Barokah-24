import { describe, it, expect } from "vitest";
import { isNavActive, NAV_ITEMS, navItemsUntukRole } from "@/lib/nav";

describe("isNavActive", () => {
  it("href root (\"/\") aktif hanya kalau path persis root (dipakai landing page, bukan NAV_ITEMS lagi)", () => {
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/transaksi", "/")).toBe(false);
    expect(isNavActive("/dashboard", "/")).toBe(false);
  });
  it("beranda (/dashboard) aktif di /dashboard dan sub-route-nya", () => {
    expect(isNavActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavActive("/transaksi", "/dashboard")).toBe(false);
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
      "/dashboard",
      "/transaksi",
      "/budget",
      "/stok",
      "/hutang",
      "/laporan",
    ]);
  });
});

describe("navItemsUntukRole", () => {
  it("owner dapat tambahan menu Pengaturan di akhir", () => {
    const hrefs = navItemsUntukRole("owner").map((n) => n.href);
    expect(hrefs).toEqual(["/dashboard", "/transaksi", "/budget", "/stok", "/hutang", "/laporan", "/pengaturan"]);
  });

  it("kasir tidak dapat menu Pengaturan", () => {
    const hrefs = navItemsUntukRole("kasir").map((n) => n.href);
    expect(hrefs).toEqual(NAV_ITEMS.map((n) => n.href));
  });

  it("role undefined (belum diketahui) juga tidak dapat menu Pengaturan", () => {
    expect(navItemsUntukRole(undefined)).toEqual(NAV_ITEMS);
  });
});
