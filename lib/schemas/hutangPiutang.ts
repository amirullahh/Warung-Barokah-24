import { z } from "zod";

export const hutangPiutangSchema = z.object({
  arah: z.enum(["hutang", "piutang"]),
  pihak: z.string().min(1, "Nama pihak wajib diisi"),
  nominal: z.coerce.number().int("Harus bilangan bulat").positive("Nominal harus lebih dari 0"),
  jatuh_tempo: z.string().optional(),
});
export type HutangPiutangInput = z.infer<typeof hutangPiutangSchema>;

export const lunaskanSchema = z.object({
  kategori_id: z.string().uuid("Kategori wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
});
export type LunaskanInput = z.infer<typeof lunaskanSchema>;
