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
        className="h-11 rounded-lg bg-amber-600 px-4 font-medium text-white"
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
        className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow"
      >
        <h2 className="font-semibold text-amber-900">Transaksi baru</h2>

        <div>
          <span className="mb-1 block text-sm font-medium">Tipe</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTipe("masuk"); setKategoriId(""); }}
              aria-pressed={tipe === "masuk"}
              className={`h-11 flex-1 rounded-lg font-medium ${tipe === "masuk" ? "bg-emerald-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => { setTipe("keluar"); setKategoriId(""); }}
              aria-pressed={tipe === "keluar"}
              className={`h-11 flex-1 rounded-lg font-medium ${tipe === "keluar" ? "bg-red-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="trx-tanggal" className="mb-1 block text-sm font-medium">Tanggal</label>
          <input
            id="trx-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="trx-kategori" className="mb-1 block text-sm font-medium">Kategori</label>
          <select
            id="trx-kategori"
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Pilih kategori</option>
            {kategoriTersedia.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="trx-nominal" className="mb-1 block text-sm font-medium">Nominal (Rp)</label>
          <MoneyInput id="trx-nominal" value={nominal} onChange={setNominal} placeholder="0" />
        </div>

        <div>
          <label htmlFor="trx-keterangan" className="mb-1 block text-sm font-medium">Keterangan (opsional)</label>
          <input
            id="trx-keterangan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <ReceiptUpload onFileSelected={setFile} />

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
    </div>
  );
}
