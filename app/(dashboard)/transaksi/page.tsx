import { createClient } from "@/lib/supabase/server";
import { formatRp } from "@/lib/core";
import { TambahTransaksiForm } from "@/components/TambahTransaksiForm";

// Halaman ini tergantung session user (usaha_id) — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

type SearchParams = {
  dari?: string;
  sampai?: string;
  kategori?: string;
  tipe?: string;
};

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const usahaId = anggota?.usaha_id ?? "";

  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("id, nama, tipe")
    .eq("usaha_id", usahaId)
    .order("nama");

  let query = supabase
    .from("transaksi")
    .select("id, tanggal, tipe, nominal, kategori_id, keterangan, bukti_url")
    .eq("usaha_id", usahaId)
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.dari) query = query.gte("tanggal", params.dari);
  if (params.sampai) query = query.lte("tanggal", params.sampai);
  if (params.kategori) query = query.eq("kategori_id", params.kategori);
  if (params.tipe) query = query.eq("tipe", params.tipe);

  const { data: transaksiList } = await query;

  const namaKategori = new Map((kategoriList ?? []).map((k) => [k.id, k.nama]));

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-200">Transaksi</h1>
        <TambahTransaksiForm usahaId={usahaId} kategoriList={kategoriList ?? []} />
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
        <div>
          <label htmlFor="filter-dari" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Dari tanggal</label>
          <input
            id="filter-dari"
            type="date"
            name="dari"
            defaultValue={params.dari ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="filter-sampai" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Sampai tanggal</label>
          <input
            id="filter-sampai"
            type="date"
            name="sampai"
            defaultValue={params.sampai ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="filter-kategori" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Kategori</label>
          <select
            id="filter-kategori"
            name="kategori"
            defaultValue={params.kategori ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">Semua kategori</option>
            {(kategoriList ?? []).map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-tipe" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tipe</label>
          <select
            id="filter-tipe"
            name="tipe"
            defaultValue={params.tipe ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">Semua tipe</option>
            <option value="masuk">Pemasukan</option>
            <option value="keluar">Pengeluaran</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="h-11 rounded-lg bg-brand-600 px-4 font-medium text-white hover:bg-brand-700">
            Terapkan
          </button>
        </div>
      </form>

      {!transaksiList || transaksiList.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">Belum ada transaksi yang cocok dengan filter ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow dark:bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 text-brand-900 dark:bg-neutral-800 dark:text-brand-200">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3">Struk</th>
                <th className="p-3">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.map((t) => (
                <tr key={t.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{t.tanggal}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{namaKategori.get(t.kategori_id) ?? "-"}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{t.keterangan ?? "-"}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{t.bukti_url ? "Ada" : "-"}</td>
                  <td className={`p-3 font-medium ${t.tipe === "masuk" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {t.tipe === "masuk" ? "+" : "-"}{formatRp(t.nominal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
