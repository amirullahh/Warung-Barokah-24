import { createClient } from "@/lib/supabase/server";
import { formatRp } from "@/lib/core";
import { RingkasanCard } from "@/components/RingkasanCard";
import { TrendChart } from "@/components/TrendChart";
import { ForecastCard } from "@/components/ForecastCard";
import { StokMenipisCard } from "@/components/StokMenipisCard";

// Halaman ini tergantung session user (role, usaha_id) — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

function tanggalNHariLalu(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function hariIniStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama")
    .eq("id", user?.id ?? "")
    .single();

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id, role")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const usahaId = anggota?.usaha_id ?? "";

  const { data: tren30 } = await supabase
    .from("v_laba_harian")
    .select("tanggal, masuk, keluar, laba")
    .eq("usaha_id", usahaId)
    .gte("tanggal", tanggalNHariLalu(29))
    .order("tanggal", { ascending: true });

  // Kumulatif sejak awal pencatatan (proxy Kas, bukan kas fisik riil — lih. DESIGN-04-DASHBOARD.md).
  const { data: semuaLaba } = await supabase
    .from("v_laba_harian")
    .select("laba")
    .eq("usaha_id", usahaId);

  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("id, nama")
    .eq("usaha_id", usahaId);

  const { data: pengeluaran30 } = await supabase
    .from("transaksi")
    .select("kategori_id, nominal")
    .eq("usaha_id", usahaId)
    .eq("tipe", "keluar")
    .gte("tanggal", tanggalNHariLalu(29));

  const { data: transaksiTerakhir } = await supabase
    .from("transaksi")
    .select("id, tanggal, tipe, nominal, kategori_id, keterangan")
    .eq("usaha_id", usahaId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: stokMenipis } = await supabase
    .from("v_stok_sisa")
    .select("produk_id, nama, sisa")
    .eq("usaha_id", usahaId)
    .eq("menipis", true);

  const namaKategori = new Map((kategoriList ?? []).map((k) => [k.id, k.nama]));

  const hariIni = hariIniStr();
  const baris = tren30 ?? [];
  const hariIniData = baris.find((b) => b.tanggal === hariIni) ?? { masuk: 0, keluar: 0, laba: 0 };
  const kas = (semuaLaba ?? []).reduce((total, b) => total + b.laba, 0);

  const ringkasan = [
    { label: "Omzet hari ini", value: hariIniData.masuk },
    { label: "Pengeluaran hari ini", value: hariIniData.keluar },
    { label: "Laba hari ini", value: hariIniData.laba },
    { label: "Kas", value: kas },
  ];

  const totalPerKategori = new Map<string, number>();
  for (const t of pengeluaran30 ?? []) {
    totalPerKategori.set(t.kategori_id, (totalPerKategori.get(t.kategori_id) ?? 0) + t.nominal);
  }
  const topKategori = Array.from(totalPerKategori.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([kategoriId, total]) => ({ nama: namaKategori.get(kategoriId) ?? "Kategori", total }));

  const laba7Hari = baris.slice(-7).map((b) => b.laba);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-200">
          Selamat datang, {profile?.nama ?? "Pengguna"}
          {anggota?.role ? ` (${anggota.role})` : ""}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Ringkasan bisnis Warung Madura Barokah 24.</p>
      </div>

      <RingkasanCard items={ringkasan} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart data={baris} />
        </div>
        <div className="space-y-4">
          <ForecastCard labaHarianTerakhir={laba7Hari} />
          <StokMenipisCard produkMenipis={stokMenipis ?? []} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
          <h2 className="mb-2 font-semibold text-brand-900 dark:text-brand-200">Top kategori pengeluaran (30 hari)</h2>
          {topKategori.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Belum ada pengeluaran tercatat.</p>
          ) : (
            <ol className="space-y-2">
              {topKategori.map((k) => (
                <li key={k.nama} className="flex items-center justify-between text-sm text-neutral-900 dark:text-neutral-100">
                  <span>{k.nama}</span>
                  <span className="font-medium">{formatRp(k.total)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
          <h2 className="mb-2 font-semibold text-brand-900 dark:text-brand-200">Transaksi terakhir</h2>
          {!transaksiTerakhir || transaksiTerakhir.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Belum ada transaksi tercatat.</p>
          ) : (
            <ul className="space-y-2">
              {transaksiTerakhir.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm text-neutral-900 dark:text-neutral-100">
                  <span>{namaKategori.get(t.kategori_id) ?? "Kategori"} · {t.tanggal}</span>
                  <span className={`font-medium ${t.tipe === "masuk" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {t.tipe === "masuk" ? "+" : "-"}{formatRp(t.nominal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
