"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { transaksiSchema } from "@/lib/schemas/transaksi";
import { MoneyInput } from "@/components/MoneyInput";
import { ReceiptUpload } from "@/components/ReceiptUpload";

type Kategori = { id: string; nama: string; tipe: "masuk" | "keluar" };

type TambahTransaksiFormProps = {
  usahaId: string;
  kategoriList: Kategori[];
};

export function TambahTransaksiForm({ usahaId, kategoriList }: TambahTransaksiFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipe, setTipe] = useState<"masuk" | "keluar">("masuk");
  const [kategoriId, setKategoriId] = useState("");
  const [nominal, setNominal] = useState<number | "">("");
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const kategoriTersedia = kategoriList.filter((k) => k.tipe === tipe);

  function resetForm() {
    setTanggal(new Date().toISOString().slice(0, 10));
    setTipe("masuk");
    setKategoriId("");
    setNominal("");
    setKeterangan("");
    setFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = transaksiSchema.safeParse({ tanggal, tipe, kategori_id: kategoriId, nominal, keterangan });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: transaksi, error: dbError } = await supabase
      .from("transaksi")
      .insert({
        usaha_id: usahaId,
        tanggal: parsed.data.tanggal,
        tipe: parsed.data.tipe,
        kategori_id: parsed.data.kategori_id,
        nominal: parsed.data.nominal,
        keterangan: parsed.data.keterangan || null,
      })
      .select("id")
      .single();

    if (dbError || !transaksi) {
      setLoading(false);
      setError("Gagal menyimpan transaksi. Coba lagi.");
      return;
    }

    if (file) {
      const path = `${usahaId}/${transaksi.id}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("struk").upload(path, file);
      if (!uploadError) {
        await supabase.from("transaksi").update({ bukti_url: path }).eq("id", transaksi.id);
      }
      // Upload struk gagal tidak boleh menggagalkan transaksi yang sudah tersimpan —
      // struk cuma pelengkap opsional (lih. keputusan desain #2 di DESIGN-05-TRANSAKSI.md).
    }

    setLoading(false);
    resetForm();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 rounded-lg bg-brand-600 px-4 font-medium text-white transition hover:bg-brand-700"
      >
        + Transaksi
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah transaksi"
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
        className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900"
      >
        <h2 className="font-semibold text-brand-900 dark:text-brand-200">Transaksi baru</h2>

        <div>
          <span className="mb-1 block text-sm font-medium dark:text-neutral-200">Tipe</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTipe("masuk"); setKategoriId(""); }}
              aria-pressed={tipe === "masuk"}
              className={`h-11 flex-1 rounded-lg font-medium ${tipe === "masuk" ? "bg-emerald-600 text-white" : "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"}`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => { setTipe("keluar"); setKategoriId(""); }}
              aria-pressed={tipe === "keluar"}
              className={`h-11 flex-1 rounded-lg font-medium ${tipe === "keluar" ? "bg-red-600 text-white" : "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"}`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="trx-tanggal" className="mb-1 block text-sm font-medium dark:text-neutral-200">Tanggal</label>
          <input
            id="trx-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="trx-kategori" className="mb-1 block text-sm font-medium dark:text-neutral-200">Kategori</label>
          <select
            id="trx-kategori"
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">Pilih kategori</option>
            {kategoriTersedia.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="trx-nominal" className="mb-1 block text-sm font-medium dark:text-neutral-200">Nominal (Rp)</label>
          <MoneyInput id="trx-nominal" value={nominal} onChange={setNominal} placeholder="0" />
        </div>

        <div>
          <label htmlFor="trx-keterangan" className="mb-1 block text-sm font-medium dark:text-neutral-200">Keterangan (opsional)</label>
          <input
            id="trx-keterangan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <ReceiptUpload onFileSelected={setFile} />

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
