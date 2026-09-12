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
        <h1 className="text-2xl font-bold text-amber-900">Hutang/Piutang</h1>
        <TambahHutangPiutangForm usahaId={usahaId} />
      </div>

      <div className="flex gap-2">
        <Link
          href="/hutang?arah=piutang"
          className={`h-11 rounded-lg px-4 py-2 text-sm font-medium ${arah === "piutang" ? "bg-amber-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
        >
          Piutang
        </Link>
        <Link
          href="/hutang?arah=hutang"
          className={`h-11 rounded-lg px-4 py-2 text-sm font-medium ${arah === "hutang" ? "bg-amber-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
        >
          Hutang
        </Link>
      </div>

      {!daftar || daftar.length === 0 ? (
        <p className="text-neutral-600">Belum ada {arah} tercatat.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-amber-50 text-amber-900">
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
                <tr key={item.id} className="border-t border-neutral-100">
                  <td className="p-3 font-medium">{item.pihak}</td>
                  <td className="p-3">{formatRp(item.nominal)}</td>
                  <td className="p-3">{item.jatuh_tempo ?? "-"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === "lunas" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
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
