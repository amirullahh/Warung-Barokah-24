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
          <h1 className="text-2xl font-bold text-amber-900">Laporan</h1>
          <p className="text-sm text-neutral-600">Bulan {namaBulanId(bulan)}</p>
        </div>
        <LaporanActions bulan={bulan} hari={hari} />
      </div>

      <form method="get" className="print:hidden flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow">
        <div>
          <label htmlFor="filter-bulan" className="mb-1 block text-sm font-medium">Pilih bulan</label>
          <input
            id="filter-bulan"
            type="month"
            name="bulan"
            defaultValue={bulan}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button type="submit" className="h-11 rounded-lg bg-amber-600 px-4 font-medium text-white">
          Tampilkan
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-neutral-600">Total Omzet</p>
          <p className="text-xl font-bold text-emerald-700">{formatRp(ringkasan.totalMasuk)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-neutral-600">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-700">{formatRp(ringkasan.totalKeluar)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-neutral-600">Laba Rugi</p>
          <p className={`text-xl font-bold ${ringkasan.totalLaba >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {formatRp(ringkasan.totalLaba)}
          </p>
        </div>
      </div>

      {hari.length === 0 ? (
        <p className="text-neutral-600">Belum ada transaksi di bulan ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-amber-50 text-amber-900">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Masuk</th>
                <th className="p-3">Keluar</th>
                <th className="p-3">Laba</th>
              </tr>
            </thead>
            <tbody>
              {hari.map((h) => (
                <tr key={h.tanggal} className="border-t border-neutral-100">
                  <td className="p-3">{formatTanggalId(h.tanggal)}</td>
                  <td className="p-3 text-emerald-700">{formatRp(h.masuk)}</td>
                  <td className="p-3 text-red-700">{formatRp(h.keluar)}</td>
                  <td className="p-3 font-medium">{formatRp(h.laba)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
