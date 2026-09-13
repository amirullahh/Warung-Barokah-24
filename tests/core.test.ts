import { describe, it, expect } from "vitest";
import {
  movingAverage,
  predictNext7,
  statusBudget,
  formatRp,
  statusStok,
  validasiStokKeluar,
  validasiStruk,
  validasiLogo,
  rentangBulan,
  ringkasanLabaRugi,
  buatCsvLaporan,
} from "@/lib/core";

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

describe("validasiStruk", () => {
  it("jpg <5MB -> null (boleh)", () => {
    expect(validasiStruk({ size: 1_000_000, type: "image/jpeg" })).toBeNull();
  });
  it("png <5MB -> null (boleh)", () => {
    expect(validasiStruk({ size: 500_000, type: "image/png" })).toBeNull();
  });
  it("jpg >5MB -> pesan error ukuran", () => {
    expect(validasiStruk({ size: 6_000_000, type: "image/jpeg" })).toMatch(/maksimal/);
  });
  it("tipe pdf -> pesan error format", () => {
    expect(validasiStruk({ size: 100_000, type: "application/pdf" })).toMatch(/JPG atau PNG/);
  });
});

describe("validasiLogo", () => {
  it("jpg <2MB -> null (boleh)", () => {
    expect(validasiLogo({ size: 500_000, type: "image/jpeg" })).toBeNull();
  });
  it("png <2MB -> null (boleh)", () => {
    expect(validasiLogo({ size: 200_000, type: "image/png" })).toBeNull();
  });
  it("jpg >2MB -> pesan error ukuran", () => {
    expect(validasiLogo({ size: 3_000_000, type: "image/jpeg" })).toMatch(/maksimal/);
  });
  it("tipe pdf -> pesan error format", () => {
    expect(validasiLogo({ size: 100_000, type: "application/pdf" })).toMatch(/JPG atau PNG/);
  });
});

describe("rentangBulan", () => {
  it("September 2026 (30 hari)", () => {
    expect(rentangBulan("2026-09")).toEqual({ awal: "2026-09-01", akhir: "2026-09-30" });
  });
  it("Januari (31 hari)", () => {
    expect(rentangBulan("2026-01")).toEqual({ awal: "2026-01-01", akhir: "2026-01-31" });
  });
  it("Februari non-kabisat 2026 (28 hari)", () => {
    expect(rentangBulan("2026-02")).toEqual({ awal: "2026-02-01", akhir: "2026-02-28" });
  });
  it("Februari kabisat 2024 (29 hari)", () => {
    expect(rentangBulan("2024-02")).toEqual({ awal: "2024-02-01", akhir: "2024-02-29" });
  });
});

describe("ringkasanLabaRugi", () => {
  it("sum masuk/keluar/laba dari beberapa hari", () => {
    const hari = [
      { masuk: 100_000, keluar: 40_000 },
      { masuk: 50_000, keluar: 10_000 },
    ];
    expect(ringkasanLabaRugi(hari)).toEqual({ totalMasuk: 150_000, totalKeluar: 50_000, totalLaba: 100_000 });
  });
  it("array kosong -> semua 0", () => {
    expect(ringkasanLabaRugi([])).toEqual({ totalMasuk: 0, totalKeluar: 0, totalLaba: 0 });
  });
});

describe("buatCsvLaporan", () => {
  const hari = [
    { tanggal: "2026-09-01", masuk: 100_000, keluar: 40_000, laba: 60_000 },
    { tanggal: "2026-09-02", masuk: 50_000, keluar: 10_000, laba: 40_000 },
  ];
  it("header + baris harian + baris total", () => {
    const csv = buatCsvLaporan("2026-09", hari);
    const baris = csv.split("\n");
    expect(baris[0]).toBe("Tanggal,Masuk,Keluar,Laba");
    expect(baris[1]).toBe("2026-09-01,100000,40000,60000");
    expect(baris[2]).toBe("2026-09-02,50000,10000,40000");
    expect(baris[3]).toBe("Total,150000,50000,100000");
  });
  it("tidak mengandung karakter non-breaking space (U+00A0) dari formatRp", () => {
    const csv = buatCsvLaporan("2026-09", hari);
    expect(csv).not.toContain(" ");
    expect(csv).not.toContain("Rp");
  });
});
