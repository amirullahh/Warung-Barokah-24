import { z } from "zod";

export const produkSchema = z.object({
  nama: z.string().min(1, "Nama produk wajib diisi"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  stok_minimum: z.coerce.number().int("Harus bilangan bulat").min(0, "Tidak boleh negatif"),
});
export type ProdukInput = z.infer<typeof produkSchema>;

const stokDasarSchema = z.object({
  produk_id: z.string().uuid("Produk wajib dipilih"),
  qty: z.coerce.number().int("Harus bilangan bulat").positive("Jumlah harus lebih dari 0"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  keterangan: z.string().optional(),
});

export const stokKeluarSchema = stokDasarSchema;
export type StokKeluarInput = z.infer<typeof stokKeluarSchema>;

export const stokMasukSchema = stokDasarSchema
  .extend({
    buatPengeluaran: z.boolean().default(false),
    nominal: z.coerce.number().int().positive().optional(),
    kategori_id: z.string().uuid().optional(),
  })
  .refine((d) => !d.buatPengeluaran || (d.nominal !== undefined && d.nominal > 0), {
    message: "Nominal wajib diisi kalau buat pengeluaran otomatis",
    path: ["nominal"],
  })
  .refine((d) => !d.buatPengeluaran || !!d.kategori_id, {
    message: "Kategori wajib dipilih kalau buat pengeluaran otomatis",
    path: ["kategori_id"],
  });
export type StokMasukInput = z.infer<typeof stokMasukSchema>;
