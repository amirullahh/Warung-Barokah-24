import Link from "next/link";
import { StokBadge } from "@/components/StokBadge";

type ProdukMenipis = {
  produk_id: string;
  nama: string;
  sisa: number;
};

type StokMenipisCardProps = {
  produkMenipis: ProdukMenipis[];
};

export function StokMenipisCard({ produkMenipis }: StokMenipisCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-amber-900">Stok menipis</h2>
        <Link href="/stok" className="text-sm font-medium text-amber-700 underline">
          Lihat semua
        </Link>
      </div>
      {produkMenipis.length === 0 ? (
        <p className="text-sm text-neutral-600">Semua stok aman.</p>
      ) : (
        <ul className="space-y-2">
          {produkMenipis.map((p) => (
            <li key={p.produk_id} className="flex items-center justify-between text-sm">
              <span>{p.nama} (sisa {p.sisa})</span>
              <StokBadge status="menipis" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
