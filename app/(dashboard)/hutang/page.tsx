import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRp } from "@/lib/core";
import { TambahHutangPiutangForm } from "@/components/TambahHutangPiutangForm";
import { LunaskanForm } from "@/components/LunaskanForm";

export const dynamic = "force-dynamic";

type SearchParams = { arah?: string };

export default async function HutangPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const arah = params.arah === "hutang" ? "hutang" : "piutang";

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
    .eq("usaha_id", usahaId);

  const { data: daftar } = await supabase
    .from("hutang_piutang")
    .select("id, arah, pihak, nominal, sisa, status, jatuh_tempo")
    .eq("usaha_id", usahaId)
    .eq("arah", arah)
    .order("status", { ascending: true })
    .order("jatuh_tempo", { ascending: true });

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-200">Hutang/Piutang</h1>
        <TambahHutangPiutangForm usahaId={usahaId} />
      </div>

      <div className="flex gap-2">
        <Link
          href="/hutang?arah=piutang"
          className={`h-11 rounded-lg px-4 py-2 text-sm font-medium ${arah === "piutang" ? "bg-brand-600 text-white" : "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"}`}
        >
          Piutang
        </Link>
        <Link
          href="/hutang?arah=hutang"
          className={`h-11 rounded-lg px-4 py-2 text-sm font-medium ${arah === "hutang" ? "bg-brand-600 text-white" : "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"}`}
        >
          Hutang
        </Link>
      </div>

      {!daftar || daftar.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">Belum ada {arah} tercatat.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow dark:bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 text-brand-900 dark:bg-neutral-800 dark:text-brand-200">
              <tr>
                <th className="p-3">Pihak</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Jatuh tempo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((item) => (
                <tr key={item.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-3 font-medium text-neutral-900 dark:text-neutral-100">{item.pihak}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{formatRp(item.nominal)}</td>
                  <td className="p-3 text-neutral-900 dark:text-neutral-100">{item.jatuh_tempo ?? "-"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === "lunas"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {item.status === "lunas" ? "Lunas" : "Tempo"}
                    </span>
                  </td>
                  <td className="p-3">
                    {item.status === "tempo" && (
                      <LunaskanForm usahaId={usahaId} item={item} kategoriList={kategoriList ?? []} />
                    )}
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
