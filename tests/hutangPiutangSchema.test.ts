import { describe, it, expect } from "vitest";
import { hutangPiutangSchema, lunaskanSchema } from "@/lib/schemas/hutangPiutang";

describe("hutangPiutangSchema", () => {
  const dasar = { arah: "piutang" as const, pihak: "Tetangga Budi", nominal: 50000 };
  it("valid tanpa jatuh_tempo", () => {
    expect(hutangPiutangSchema.safeParse(dasar).success).toBe(true);
  });
  it("valid dengan jatuh_tempo", () => {
    expect(hutangPiutangSchema.safeParse({ ...dasar, jatuh_tempo: "2026-10-01" }).success).toBe(true);
  });
  it("gagal: pihak kosong", () => {
    expect(hutangPiutangSchema.safeParse({ ...dasar, pihak: "" }).success).toBe(false);
  });
  it("gagal: nominal 0", () => {
    expect(hutangPiutangSchema.safeParse({ ...dasar, nominal: 0 }).success).toBe(false);
  });
  it("gagal: arah bukan hutang/piutang", () => {
    expect(hutangPiutangSchema.safeParse({ ...dasar, arah: "lainnya" }).success).toBe(false);
  });
});

describe("lunaskanSchema", () => {
  it("valid", () => {
    const r = lunaskanSchema.safeParse({
      kategori_id: "11111111-1111-4111-8111-111111111111",
      tanggal: "2026-09-12",
    });
    expect(r.success).toBe(true);
  });
  it("gagal: kategori_id bukan uuid", () => {
    expect(lunaskanSchema.safeParse({ kategori_id: "bukan-uuid", tanggal: "2026-09-12" }).success).toBe(false);
  });
  it("gagal: tanggal kosong", () => {
    expect(
      lunaskanSchema.safeParse({ kategori_id: "11111111-1111-4111-8111-111111111111", tanggal: "" }).success
    ).toBe(false);
  });
});
