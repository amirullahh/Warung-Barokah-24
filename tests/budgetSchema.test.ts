import { describe, it, expect } from "vitest";
import { budgetSchema } from "@/lib/schemas/budget";

describe("budgetSchema", () => {
  it("valid: bulan+kategori_id+pagu lengkap", () => {
    const r = budgetSchema.safeParse({
      bulan: "2026-10-01",
      kategori_id: "11111111-1111-4111-8111-111111111111",
      pagu: 500000,
    });
    expect(r.success).toBe(true);
  });
  it("gagal: bulan kosong", () => {
    const r = budgetSchema.safeParse({
      bulan: "",
      kategori_id: "11111111-1111-4111-8111-111111111111",
      pagu: 500000,
    });
    expect(r.success).toBe(false);
  });
  it("gagal: kategori_id bukan uuid", () => {
    const r = budgetSchema.safeParse({ bulan: "2026-10-01", kategori_id: "bukan-uuid", pagu: 500000 });
    expect(r.success).toBe(false);
  });
  it("gagal: pagu 0", () => {
    const r = budgetSchema.safeParse({
      bulan: "2026-10-01",
      kategori_id: "11111111-1111-4111-8111-111111111111",
      pagu: 0,
    });
    expect(r.success).toBe(false);
  });
  it("gagal: pagu negatif", () => {
    const r = budgetSchema.safeParse({
      bulan: "2026-10-01",
      kategori_id: "11111111-1111-4111-8111-111111111111",
      pagu: -500000,
    });
    expect(r.success).toBe(false);
  });
});
