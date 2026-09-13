import { createClient } from "@/lib/supabase/server";
import { BudgetBar } from "@/components/BudgetBar";
import { TambahBudgetForm } from "@/components/TambahBudgetForm";

// Halaman ini tergantung session user (role, usaha_id) — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

function bulanIni(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function BudgetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id, role")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const usahaId = anggota?.usaha_id ?? "";
  const isOwner = anggota?.role === "owner";
  const bulan = bulanIni();

  const { data: kategoriKeluar } = await supabase
    .from("kategori")
    .select("id, nama")
    .eq("usaha_id", usahaId)
    .eq("tipe", "keluar")
    .order("nama");

  const { data: realisasi } = await supabase
    .from("v_budget_realisasi")
    .select("kategori_id, pagu, terpakai")
    .eq("usaha_id", usahaId)
    .eq("bulan", bulan);

  const namaKategori = new Map((kategoriKeluar ?? []).map((k) => [k.id, k.nama]));

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-200">Budget</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Bulan {new Date(bulan).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
        </div>
        {isOwner && (
          <TambahBudgetForm usahaId={usahaId} kategoriList={kategoriKeluar ?? []} bulanDefault={bulan} />
        )}
      </div>

      {!realisasi || realisasi.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">
          Belum ada budget bulan ini.{isOwner ? " Tambah budget dulu." : " Owner belum menambahkan budget."}
        </p>
      ) : (
        <div className="space-y-4">
          {realisasi.map((r) => (
            <div key={r.kategori_id} className="rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
              <h2 className="mb-2 font-semibold text-brand-900 dark:text-brand-200">
                {namaKategori.get(r.kategori_id) ?? "Kategori"}
              </h2>
              <BudgetBar terpakai={r.terpakai} pagu={r.pagu} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
