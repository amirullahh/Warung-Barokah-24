"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { budgetSchema } from "@/lib/schemas/budget";

type Kategori = { id: string; nama: string };

type TambahBudgetFormProps = {
  usahaId: string;
  kategoriList: Kategori[];
  bulanDefault: string;
};

export function TambahBudgetForm({ usahaId, kategoriList, bulanDefault }: TambahBudgetFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState(bulanDefault);
  const [kategoriId, setKategoriId] = useState("");
  const [pagu, setPagu] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = budgetSchema.safeParse({ bulan, kategori_id: kategoriId, pagu });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("budget").insert({
      usaha_id: usahaId,
      bulan: parsed.data.bulan,
      kategori_id: parsed.data.kategori_id,
      pagu: parsed.data.pagu,
    });
    setLoading(false);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "Budget untuk kategori ini di bulan tersebut sudah ada."
          : "Gagal menyimpan budget. Coba lagi."
      );
      return;
    }
    setKategoriId("");
    setPagu("");
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
        + Budget baru
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Budget baru"
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
        className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900"
      >
        <h2 className="font-semibold text-brand-900 dark:text-brand-200">Budget baru</h2>

        <div>
          <label htmlFor="budget-bulan" className="mb-1 block text-sm font-medium dark:text-neutral-200">Bulan</label>
          <input
            id="budget-bulan"
            type="month"
            value={bulan.slice(0, 7)}
            onChange={(e) => setBulan(`${e.target.value}-01`)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="budget-kategori" className="mb-1 block text-sm font-medium dark:text-neutral-200">Kategori</label>
          <select
            id="budget-kategori"
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">Pilih kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="budget-pagu" className="mb-1 block text-sm font-medium dark:text-neutral-200">Pagu (Rp)</label>
          <input
            id="budget-pagu"
            type="number"
            min={1}
            value={pagu}
            onChange={(e) => setPagu(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

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
