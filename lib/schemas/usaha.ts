import { z } from "zod";

export const pengaturanUsahaSchema = z.object({
  nama: z.string().trim().min(1, "Nama warung wajib diisi").max(100, "Nama warung maksimal 100 karakter"),
  alamat: z.string().trim().max(200, "Alamat maksimal 200 karakter").optional().or(z.literal("")),
  jam_operasional: z.string().trim().max(50, "Jam operasional maksimal 50 karakter").optional().or(z.literal("")),
});
export type PengaturanUsahaInput = z.infer<typeof pengaturanUsahaSchema>;
