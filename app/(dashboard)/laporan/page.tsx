import { createClient } from "@/lib/supabase/server";
import { formatRp, rentangBulan, ringkasanLabaRugi } from "@/lib/core";
import { LaporanActions } from "@/components/LaporanActions";

export const dynamic = "force-dynamic";

type SearchParams = { bulan?: string };

function bulanIniYM(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatTanggalId(tanggal: string): string {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function namaBulanId(bulan: string): string {
  return new Date(`${bulan}-01T00:00:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const bulan = params.bulan ?? bulanIniYM();
  const { awal, akhir } = rentangBulan(bulan);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const usahaId = anggota?.usaha_id ?? "";

  const { data: harian } = await supabase
    .from("v_laba_harian")
    .select("tanggal, masuk, keluar, laba")
    .eq("usaha_id", usahaId)
    .gte("tanggal", awal)
    .lte("tanggal", akhir)
    .order("tanggal", { ascending: true });

  const hari = harian ?? [];
  const ringkasan = ringkasanLabaRugi(hari);

  return (
    <main className="space-y-6 p-6 print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-200">Laporan</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Bulan {namaBulanId(bulan)}</p>
        </div>
        <LaporanActions bulan={bulan} hari={hari} />
      </div>

      <form method="get" className="print:hidden flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
        <div>
          <label htmlFor="filter-bulan" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Pilih bulan</label>
          <input
            id="filter-bulan"
            type="month"
            name="bulan"
            defaultValue={bulan}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <button type="submit" className="h-11 rounded-lg bg-brand-600 px-4 font-medium text-white hover:bg-brand-700">
          Tampilkan
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Omzet</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatRp(ringkasan.totalMasuk)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-400">{formatRp(ringkasan.totalKeluar)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Laba Rugi</p>
          <p className={`text-xl font-bold ${ringkasan.totalLaba >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
            {formatRp(ringkasan.totalLaba)}
          </p>
        </div>
      </div>

      {hari.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">Belum ada transaksi di bulan ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow dark:bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 text-brand-900 dark:bg-neutral-800 dark:text-brand-200">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Masuk</th>
                <th className="p-3">Keluar</th>
                <th className="p-3">Laba</th>
              </tr>
            </thead>
            <tbody>
              {hari.map((h) => (
                <tr key={h.tanggal} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{formatTanggalId(h.tanggal)}</td>
                  <td className="p-3 text-emerald-700 dark:text-emerald-400">{formatRp(h.masuk)}</td>
                  <td className="p-3 text-red-700 dark:text-red-400">{formatRp(h.keluar)}</td>
                  <td className="p-3 font-medium text-neutral-900 dark:text-neutral-100">{formatRp(h.laba)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
