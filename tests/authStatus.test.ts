import { describe, it, expect } from "vitest";
import { tentukanStatusAnggota } from "@/lib/auth/status";

describe("tentukanStatusAnggota", () => {
  it("member kalau ada baris anggota_usaha", () => {
    expect(tentukanStatusAnggota({ usaha_id: "u1", role: "owner" })).toBe("member");
    expect(tentukanStatusAnggota({ usaha_id: "u1", role: "kasir" })).toBe("member");
  });

  it("pending-assignment kalau belum ada baris anggota_usaha", () => {
    expect(tentukanStatusAnggota(null)).toBe("pending-assignment");
  });
});
