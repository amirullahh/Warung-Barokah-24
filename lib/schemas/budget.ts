import { z } from "zod";

export const budgetSchema = z.object({
  bulan: z.string().min(1, "Bulan wajib diisi"),
  kategori_id: z.string().uuid("Kategori wajib dipilih"),
  pagu: z.coerce.number().int("Harus bilangan bulat").positive("Pagu harus lebih dari 0"),
});
export type BudgetInput = z.infer<typeof budgetSchema>;
