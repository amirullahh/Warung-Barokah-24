import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/schemas/auth";

describe("loginSchema", () => {
  it("valid untuk email & password yang benar", () => {
    expect(loginSchema.safeParse({ email: "owner@barokah.test", password: "rahasia123" }).success).toBe(true);
  });
  it("gagal kalau email bukan format email", () => {
    expect(loginSchema.safeParse({ email: "bukan-email", password: "rahasia123" }).success).toBe(false);
  });
  it("gagal kalau password kurang dari 6 karakter", () => {
    expect(loginSchema.safeParse({ email: "owner@barokah.test", password: "abc" }).success).toBe(false);
  });
  it("gagal kalau email kosong", () => {
    expect(loginSchema.safeParse({ email: "", password: "rahasia123" }).success).toBe(false);
  });
});
