import { describe, it, expect } from "vitest";
import { tentukanThemeAwal } from "@/lib/theme";

describe("tentukanThemeAwal", () => {
  it("pakai preferensi tersimpan kalau ada dan valid", () => {
    expect(tentukanThemeAwal("dark", false)).toBe("dark");
    expect(tentukanThemeAwal("light", true)).toBe("light");
  });

  it("fallback ke preferensi sistem kalau belum ada yang tersimpan", () => {
    expect(tentukanThemeAwal(null, true)).toBe("dark");
    expect(tentukanThemeAwal(null, false)).toBe("light");
  });

  it("abaikan nilai tersimpan yang tidak dikenal, fallback ke sistem", () => {
    expect(tentukanThemeAwal("biru", true)).toBe("dark");
    expect(tentukanThemeAwal("", false)).toBe("light");
  });
});
