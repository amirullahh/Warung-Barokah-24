import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/seed/prng";

describe("mulberry32", () => {
  it("menghasilkan sequence yang identik untuk seed yang sama (reproducible)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("menghasilkan angka selalu di rentang [0,1)", () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 200; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("seed berbeda menghasilkan sequence yang berbeda", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });
});
