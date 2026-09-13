"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { stokMasukSchema, stokKeluarSchema } from "@/lib/schemas/stok";
import { validasiStokKeluar } from "@/lib/core";

type Produk = { id: string; nama: string; sisa: number };
type Kategori = { id: string; nama: string };

type CatatStokFormProps = {
  usahaId: string;
  mode: "masuk" | "keluar";
  produkList: Produk[];
  kategoriList?: Kategori[];
};

export function CatatStokForm({ usahaId, mode, produkList, kategoriList = [] }: CatatStokFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [produkId, setProdukId] = useState("");
  const [qty, setQty] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [keterangan, setKeterangan] = useState("");
  const [buatPengeluaran, setBuatPengeluaran] = useState(false);
  const [nominal, setNominal] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setProdukId("");
    setQty("");
    setKeterangan("");
    setBuatPengeluaran(false);
    setNominal("");
    setKategoriId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "keluar") {
      const parsed = stokKeluarSchema.safeParse({ produk_id: produkId, qty, tanggal, keterangan });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
        return;
      }
      const produk = produkList.find((p) => p.id === parsed.data.produk_id);
      const pesanSisa = validasiStokKeluar(produk?.sisa ?? 0, parsed.data.qty);
      if (pesanSisa) {
        setError(pesanSisa);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const { error: dbError } = await supabase.from("stok_gerak").insert({
        usaha_id: usahaId,
        produk_id: parsed.data.produk_id,
        arah: "keluar",
        qty: parsed.data.qty,
        tanggal: parsed.data.tanggal,
        keterangan: parsed.data.keterangan || null,
      });
      setLoading(false);
      if (dbError) {
        setError("Gagal menyimpan stok keluar. Coba lagi.");
        return;
      }
      resetForm();
      setOpen(false);
      router.refresh();
      return;
    }

    const parsed = stokMasukSchema.safeParse({
      produk_id: produkId,
      qty,
      tanggal,
      keterangan,
      buatPengeluaran,
      nominal: buatPengeluaran ? nominal : undefined,
      kategori_id: buatPengeluaran ? kategoriId : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    let transaksiId: string | null = null;

    if (parsed.data.buatPengeluaran) {
      const { data: transaksi, error: trxError } = await supabase
        .from("transaksi")
        .insert({
          usaha_id: usahaId,
          tanggal: parsed.data.tanggal,
          tipe: "keluar",
          kategori_id: parsed.data.kategori_id,
          nominal: parsed.data.nominal,
          keterangan: `Beli stok: ${parsed.data.keterangan || ""}`.trim(),
        })
        .select("id")
        .single();
      if (trxError || !transaksi) {
        setLoading(false);
        setError("Gagal membuat transaksi pengeluaran. Stok belum dicatat.");
        return;
      }
      transaksiId = transaksi.id;
    }

    const { error: dbError } = await supabase.from("stok_gerak").insert({
      usaha_id: usahaId,
      produk_id: parsed.data.produk_id,
      arah: "masuk",
      qty: parsed.data.qty,
      tanggal: parsed.data.tanggal,
      keterangan: parsed.data.keterangan || null,
      transaksi_id: transaksiId,
    });
    setLoading(false);
    if (dbError) {
      setError("Gagal menyimpan stok masuk. Coba lagi.");
      return;
    }
    resetForm();
    setOpen(false);
    router.refresh();
  }

  const label = mode === "masuk" ? "Catat stok masuk" : "Catat stok keluar";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 rounded-lg border border-brand-600 px-4 font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-neutral-800"
      >
        {label}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-sm space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900"
      >
        <h2 className="font-semibold text-brand-900 dark:text-brand-200">{label}</h2>

        <div>
          <label htmlFor={`${mode}-produk`} className="mb-1 block text-sm font-medium dark:text-neutral-200">Produk</label>
          <select
            id={`${mode}-produk`}
            value={produkId}
            onChange={(e) => setProdukId(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">Pilih produk</option>
            {produkList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama} (sisa {p.sisa})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${mode}-qty`} className="mb-1 block text-sm font-medium dark:text-neutral-200">Jumlah</label>
          <input
            id={`${mode}-qty`}
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor={`${mode}-tanggal`} className="mb-1 block text-sm font-medium dark:text-neutral-200">Tanggal</label>
          <input
            id={`${mode}-tanggal`}
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor={`${mode}-keterangan`} className="mb-1 block text-sm font-medium dark:text-neutral-200">Keterangan (opsional)</label>
          <input
            id={`${mode}-keterangan`}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        {mode === "masuk" && (
          <div className="space-y-3 rounded-lg bg-brand-50 p-3 dark:bg-neutral-800">
            <label className="flex items-center gap-2 text-sm font-medium dark:text-neutral-200">
              <input
                type="checkbox"
                checked={buatPengeluaran}
                onChange={(e) => setBuatPengeluaran(e.target.checked)}
                className="h-5 w-5"
              />
              Beli stok → buat pengeluaran otomatis
            </label>

            {buatPengeluaran && (
              <>
                <div>
                  <label htmlFor="masuk-nominal" className="mb-1 block text-sm font-medium dark:text-neutral-200">Nominal (Rp)</label>
                  <input
                    id="masuk-nominal"
                    type="number"
                    min={1}
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="masuk-kategori" className="mb-1 block text-sm font-medium dark:text-neutral-200">Kategori pengeluaran</label>
                  <select
                    id="masuk-kategori"
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  >
                    <option value="">Pilih kategori</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="h-11 flex-1 rounded-lg bg-brand-600 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-11 rounded-lg border border-neutral-300 px-4 font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
