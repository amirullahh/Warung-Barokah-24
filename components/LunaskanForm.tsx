"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { lunaskanSchema } from "@/lib/schemas/hutangPiutang";

type Kategori = { id: string; nama: string; tipe: "masuk" | "keluar" };

type LunaskanFormProps = {
  usahaId: string;
  item: { id: string; arah: "hutang" | "piutang"; pihak: string; nominal: number };
  kategoriList: Kategori[];
};

export function LunaskanForm({ usahaId, item, kategoriList }: LunaskanFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kategoriId, setKategoriId] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tipeTransaksi = item.arah === "piutang" ? "masuk" : "keluar";
  const kategoriTersedia = kategoriList.filter((k) => k.tipe === tipeTransaksi);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = lunaskanSchema.safeParse({ kategori_id: kategoriId, tanggal });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: transaksi, error: trxError } = await supabase
      .from("transaksi")
      .insert({
        usaha_id: usahaId,
        tanggal: parsed.data.tanggal,
        tipe: tipeTransaksi,
        kategori_id: parsed.data.kategori_id,
        nominal: item.nominal,
        keterangan: `Pelunasan ${item.arah}: ${item.pihak}`,
      })
      .select("id")
      .single();

    if (trxError || !transaksi) {
      setLoading(false);
      setError("Gagal membuat transaksi pelunasan. Status belum diubah.");
      return;
    }

    const { error: dbError } = await supabase
      .from("hutang_piutang")
      .update({ status: "lunas", sisa: 0, transaksi_lunas_id: transaksi.id })
      .eq("id", item.id);

    setLoading(false);
    if (dbError) {
      setError("Transaksi tercatat, tapi gagal update status. Coba lagi atau cek manual.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Lunaskan
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lunaskan ${item.arah} ${item.pihak}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900">
        <h2 className="font-semibold text-brand-900 dark:text-brand-200">
          Lunaskan {item.arah} — {item.pihak}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Akan tercatat sebagai transaksi {tipeTransaksi === "masuk" ? "pemasukan" : "pengeluaran"}
          {" "}sebesar Rp{item.nominal.toLocaleString("id-ID")}.
        </p>

        <div>
          <label htmlFor="lunas-kategori" className="mb-1 block text-sm font-medium dark:text-neutral-200">Kategori</label>
          <select
            id="lunas-kategori"
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
          <label htmlFor="lunas-tanggal" className="mb-1 block text-sm font-medium dark:text-neutral-200">Tanggal</label>
          <input
            id="lunas-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="h-11 flex-1 rounded-lg bg-brand-600 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60">
            {loading ? "Menyimpan..." : "Konfirmasi lunas"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-lg border border-neutral-300 px-4 font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
