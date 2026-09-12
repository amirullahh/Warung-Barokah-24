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
        <h1 className="text-2xl font-bold text-amber-900">Transaksi</h1>
        <TambahTransaksiForm usahaId={usahaId} kategoriList={kategoriList ?? []} />
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow">
        <div>
          <label htmlFor="filter-dari" className="mb-1 block text-sm font-medium">Dari tanggal</label>
          <input
            id="filter-dari"
            type="date"
            name="dari"
            defaultValue={params.dari ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="filter-sampai" className="mb-1 block text-sm font-medium">Sampai tanggal</label>
          <input
            id="filter-sampai"
            type="date"
            name="sampai"
            defaultValue={params.sampai ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="filter-kategori" className="mb-1 block text-sm font-medium">Kategori</label>
          <select
            id="filter-kategori"
            name="kategori"
            defaultValue={params.kategori ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Semua kategori</option>
            {(kategoriList ?? []).map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-tipe" className="mb-1 block text-sm font-medium">Tipe</label>
          <select
            id="filter-tipe"
            name="tipe"
            defaultValue={params.tipe ?? ""}
            className="h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Semua tipe</option>
            <option value="masuk">Pemasukan</option>
            <option value="keluar">Pengeluaran</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="h-11 rounded-lg bg-amber-600 px-4 font-medium text-white">
            Terapkan
          </button>
        </div>
      </form>

      {!transaksiList || transaksiList.length === 0 ? (
        <p className="text-neutral-600">Belum ada transaksi yang cocok dengan filter ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-amber-50 text-amber-900">
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
                <tr key={t.id} className="border-t border-neutral-100">
                  <td className="p-3">{t.tanggal}</td>
                  <td className="p-3">{namaKategori.get(t.kategori_id) ?? "-"}</td>
                  <td className="p-3">{t.keterangan ?? "-"}</td>
                  <td className="p-3">{t.bukti_url ? "Ada" : "-"}</td>
                  <td className={`p-3 font-medium ${t.tipe === "masuk" ? "text-emerald-700" : "text-red-700"}`}>
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
