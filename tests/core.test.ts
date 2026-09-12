import { describe, it, expect } from "vitest";
import { movingAverage, predictNext7, statusBudget, formatRp, statusStok, validasiStokKeluar } from "@/lib/core";

describe("movingAverage", () => {
  it("menghitung rata-rata dari 7 angka", () => {
    expect(movingAverage([10, 20, 30, 40, 50, 60, 70], 7)).toBe(40);
  });
  it("mengembalikan 0 kalau series kosong", () => {
    expect(movingAverage([], 7)).toBe(0);
  });
  it("hanya memakai window terakhir kalau series lebih panjang", () => {
    expect(movingAverage([1000, 10, 20, 30, 40, 50, 60, 70], 7)).toBe(40);
  });
});

describe("predictNext7", () => {
  it("mengembalikan array 7 angka dibulatkan dari lastAvg", () => {
    expect(predictNext7(40.4)).toEqual([40, 40, 40, 40, 40, 40, 40]);
  });
});

describe("statusBudget", () => {
  it("aman kalau terpakai 79% dari pagu", () => {
    expect(statusBudget(790_000, 1_000_000)).toBe("aman");
  });
  it("hampir kalau terpakai 80% dari pagu", () => {
    expect(statusBudget(800_000, 1_000_000)).toBe("hampir");
  });
  it("over kalau terpakai 101% dari pagu", () => {
    expect(statusBudget(1_010_000, 1_000_000)).toBe("over");
  });
  it("aman kalau pagu 0 (hindari div by zero)", () => {
    expect(statusBudget(500, 0)).toBe("aman");
  });
});

describe("formatRp", () => {
  it("memformat 15000 jadi Rp15.000", () => {
    expect(formatRp(15000)).toBe("Rp\u00A015.000"); // \u00A0 = non-breaking space, output asli Intl.NumberFormat id-ID
  });
  it("memformat 0 jadi Rp0", () => {
    expect(formatRp(0)).toBe("Rp\u00A00");
  });
});

describe("statusStok", () => {
  it("sisa sama dengan minimum -> menipis", () => {
    expect(statusStok(5, 5)).toBe("menipis");
  });
  it("sisa di bawah minimum -> menipis", () => {
    expect(statusStok(2, 5)).toBe("menipis");
  });
  it("sisa di atas minimum -> aman", () => {
    expect(statusStok(10, 5)).toBe("aman");
  });
});

describe("validasiStokKeluar", () => {
  it("qty <= sisa -> null (boleh)", () => {
    expect(validasiStokKeluar(10, 5)).toBeNull();
  });
  it("qty pas sama dengan sisa -> null (boleh, pas habis)", () => {
    expect(validasiStokKeluar(5, 5)).toBeNull();
  });
  it("qty > sisa -> pesan error", () => {
    expect(validasiStokKeluar(3, 5)).toMatch(/tidak cukup/);
  });
});
