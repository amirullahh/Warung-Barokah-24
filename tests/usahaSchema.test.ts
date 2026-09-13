import { describe, it, expect } from "vitest";
import { pengaturanUsahaSchema } from "@/lib/schemas/usaha";

describe("pengaturanUsahaSchema", () => {
  it("nama, alamat, jam_operasional valid -> lolos", () => {
    const parsed = pengaturanUsahaSchema.safeParse({
      nama: "Warung Madura Barokah 24",
      alamat: "Slipi, Kemanggisan, Palmerah, Jakarta Barat",
      jam_operasional: "24 jam",
    });
    expect(parsed.success).toBe(true);
  });

  it("alamat & jam_operasional kosong -> tetap lolos (opsional)", () => {
    const parsed = pengaturanUsahaSchema.safeParse({
      nama: "Warung Madura Barokah 24",
      alamat: "",
      jam_operasional: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("nama kosong -> gagal", () => {
    const parsed = pengaturanUsahaSchema.safeParse({ nama: "  ", alamat: "", jam_operasional: "" });
    expect(parsed.success).toBe(false);
  });

  it("nama lebih dari 100 karakter -> gagal", () => {
    const parsed = pengaturanUsahaSchema.safeParse({
      nama: "a".repeat(101),
      alamat: "",
      jam_operasional: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("alamat lebih dari 200 karakter -> gagal", () => {
    const parsed = pengaturanUsahaSchema.safeParse({
      nama: "Warung",
      alamat: "a".repeat(201),
      jam_operasional: "",
    });
    expect(parsed.success).toBe(false);
  });
});
