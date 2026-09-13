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
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-brand-900 dark:text-brand-200">Stok menipis</h2>
        <Link href="/stok" className="text-sm font-medium text-brand-700 underline dark:text-brand-300">
          Lihat semua
        </Link>
      </div>
      {produkMenipis.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Semua stok aman.</p>
      ) : (
        <ul className="space-y-2">
          {produkMenipis.map((p) => (
            <li key={p.produk_id} className="flex items-center justify-between text-sm text-neutral-900 dark:text-neutral-100">
              <span>{p.nama} (sisa {p.sisa})</span>
              <StokBadge status="menipis" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
