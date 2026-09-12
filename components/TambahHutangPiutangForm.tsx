"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hutangPiutangSchema } from "@/lib/schemas/hutangPiutang";
import { MoneyInput } from "@/components/MoneyInput";

export function TambahHutangPiutangForm({ usahaId }: { usahaId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [arah, setArah] = useState<"hutang" | "piutang">("piutang");
  const [pihak, setPihak] = useState("");
  const [nominal, setNominal] = useState<number | "">("");
  const [jatuhTempo, setJatuhTempo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setArah("piutang");
    setPihak("");
    setNominal("");
    setJatuhTempo("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = hutangPiutangSchema.safeParse({
      arah,
      pihak,
      nominal,
      jatuh_tempo: jatuhTempo || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("hutang_piutang").insert({
      usaha_id: usahaId,
      arah: parsed.data.arah,
      pihak: parsed.data.pihak,
      nominal: parsed.data.nominal,
      sisa: parsed.data.nominal,
      status: "tempo",
      jatuh_tempo: parsed.data.jatuh_tempo || null,
    });
    setLoading(false);

    if (dbError) {
      setError("Gagal menyimpan. Coba lagi.");
      return;
    }
    resetForm();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-lg bg-amber-600 px-4 font-medium text-white">
        + Hutang/Piutang
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah hutang atau piutang"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-4 shadow">
        <h2 className="font-semibold text-amber-900">Hutang/Piutang baru</h2>

        <div>
          <span className="mb-1 block text-sm font-medium">Jenis</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setArah("piutang")}
              aria-pressed={arah === "piutang"}
              className={`h-11 flex-1 rounded-lg font-medium ${arah === "piutang" ? "bg-emerald-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
            >
              Piutang (orang berutang ke kita)
            </button>
            <button
              type="button"
              onClick={() => setArah("hutang")}
              aria-pressed={arah === "hutang"}
              className={`h-11 flex-1 rounded-lg font-medium ${arah === "hutang" ? "bg-red-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
            >
              Hutang (kita berutang)
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="hp-pihak" className="mb-1 block text-sm font-medium">Nama pihak</label>
          <input
            id="hp-pihak"
            value={pihak}
            onChange={(e) => setPihak(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="hp-nominal" className="mb-1 block text-sm font-medium">Nominal (Rp)</label>
          <MoneyInput id="hp-nominal" value={nominal} onChange={setNominal} placeholder="0" />
        </div>

        <div>
          <label htmlFor="hp-tempo" className="mb-1 block text-sm font-medium">Jatuh tempo (opsional)</label>
          <input
            id="hp-tempo"
            type="date"
            value={jatuhTempo}
            onChange={(e) => setJatuhTempo(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="h-11 flex-1 rounded-lg bg-amber-600 font-medium text-white disabled:opacity-60">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-lg border border-neutral-300 px-4 font-medium text-neutral-700">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
