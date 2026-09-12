import { z } from "zod";

export const transaksiSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  tipe: z.enum(["masuk", "keluar"]),
  kategori_id: z.string().uuid("Kategori wajib dipilih"),
  nominal: z.coerce.number().int("Harus bilangan bulat").positive("Nominal harus lebih dari 0"),
  keterangan: z.string().optional(),
});
export type TransaksiInput = z.infer<typeof transaksiSchema>;
