import { createClient } from "@/lib/supabase/server";
import { StokBadge } from "@/components/StokBadge";
import { TambahProdukForm } from "@/components/TambahProdukForm";
import { CatatStokForm } from "@/components/CatatStokForm";

// Halaman ini tergantung session user (role, usaha_id) — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

export default async function StokPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id, role")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const usahaId = anggota?.usaha_id ?? "";
  const isOwner = anggota?.role === "owner";

  const { data: stokSisa } = await supabase
    .from("v_stok_sisa")
    .select("produk_id, nama, satuan, stok_minimum, sisa, menipis")
    .eq("usaha_id", usahaId)
    .order("nama");

  const { data: kategoriKeluar } = await supabase
    .from("kategori")
    .select("id, nama")
    .eq("usaha_id", usahaId)
    .eq("tipe", "keluar")
    .order("nama");

  const produkList = (stokSisa ?? []).map((s) => ({ id: s.produk_id, nama: s.nama, sisa: s.sisa }));

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-200">Stok</h1>
        <div className="flex flex-wrap gap-2">
          <CatatStokForm usahaId={usahaId} mode="masuk" produkList={produkList} kategoriList={kategoriKeluar ?? []} />
          <CatatStokForm usahaId={usahaId} mode="keluar" produkList={produkList} />
          {isOwner && <TambahProdukForm usahaId={usahaId} />}
        </div>
      </div>

      {!stokSisa || stokSisa.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">Belum ada produk. Tambah produk dulu untuk mulai catat stok.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow dark:bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 text-brand-900 dark:bg-neutral-800 dark:text-brand-200">
              <tr>
                <th className="p-3">Produk</th>
                <th className="p-3">Satuan</th>
                <th className="p-3">Sisa</th>
                <th className="p-3">Minimum</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stokSisa.map((s) => (
                <tr key={s.produk_id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-3 font-medium text-neutral-900 dark:text-neutral-100">{s.nama}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{s.satuan}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{s.sisa}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{s.stok_minimum}</td>
                  <td className="p-3">
                    <StokBadge status={s.menipis ? "menipis" : "aman"} />
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
