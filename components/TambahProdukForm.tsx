"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { produkSchema } from "@/lib/schemas/stok";

export function TambahProdukForm({ usahaId }: { usahaId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [satuan, setSatuan] = useState("pcs");
  const [stokMinimum, setStokMinimum] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = produkSchema.safeParse({ nama, satuan, stok_minimum: stokMinimum });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("produk").insert({
      usaha_id: usahaId,
      nama: parsed.data.nama,
      satuan: parsed.data.satuan,
      stok_minimum: parsed.data.stok_minimum,
    });
    setLoading(false);

    if (dbError) {
      setError("Gagal menyimpan produk. Coba lagi.");
      return;
    }
    setNama("");
    setSatuan("pcs");
    setStokMinimum("5");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 rounded-lg bg-amber-600 px-4 font-medium text-white"
      >
        + Produk baru
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-4 shadow">
      <h2 className="font-semibold text-amber-900">Produk baru</h2>

      <div>
        <label htmlFor="produk-nama" className="mb-1 block text-sm font-medium">Nama produk</label>
        <input
          id="produk-nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="produk-satuan" className="mb-1 block text-sm font-medium">Satuan</label>
        <input
          id="produk-satuan"
          value={satuan}
          onChange={(e) => setSatuan(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="produk-minimum" className="mb-1 block text-sm font-medium">Stok minimum</label>
        <input
          id="produk-minimum"
          type="number"
          min={0}
          value={stokMinimum}
          onChange={(e) => setStokMinimum(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="h-11 flex-1 rounded-lg bg-amber-600 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-11 rounded-lg border border-neutral-300 px-4 font-medium text-neutral-700"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
