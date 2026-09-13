import { describe, it, expect } from "vitest";
import { registerSchema } from "@/lib/schemas/auth";

describe("registerSchema", () => {
  const valid = {
    nama: "Budi Santoso",
    email: "budi@contoh.test",
    password: "rahasia123",
    konfirmasiPassword: "rahasia123",
  };

  it("valid untuk data lengkap & password cocok", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("gagal kalau nama kosong", () => {
    const r = registerSchema.safeParse({ ...valid, nama: "" });
    expect(r.success).toBe(false);
  });

  it("gagal kalau nama cuma spasi", () => {
    const r = registerSchema.safeParse({ ...valid, nama: "   " });
    expect(r.success).toBe(false);
  });

  it("gagal kalau nama lebih dari 100 karakter", () => {
    const r = registerSchema.safeParse({ ...valid, nama: "a".repeat(101) });
    expect(r.success).toBe(false);
  });

  it("gagal kalau email bukan format email", () => {
    const r = registerSchema.safeParse({ ...valid, email: "bukan-email" });
    expect(r.success).toBe(false);
  });

  it("gagal kalau password kurang dari 6 karakter", () => {
    const r = registerSchema.safeParse({ ...valid, password: "abc", konfirmasiPassword: "abc" });
    expect(r.success).toBe(false);
  });

  it("gagal kalau konfirmasi password tidak sama dengan password", () => {
    const r = registerSchema.safeParse({ ...valid, konfirmasiPassword: "beda123" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.path).toEqual(["konfirmasiPassword"]);
      expect(r.error.issues[0]?.message).toMatch(/tidak sama/i);
    }
  });

  it("gagal kalau konfirmasi password kosong", () => {
    const r = registerSchema.safeParse({ ...valid, konfirmasiPassword: "" });
    expect(r.success).toBe(false);
  });
});
