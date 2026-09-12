import { formatRp } from "@/lib/core";

type RingkasanItem = {
  label: string;
  value: number;
};

type RingkasanCardProps = {
  items: RingkasanItem[];
};

export function RingkasanCard({ items }: RingkasanCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-neutral-600">{item.label}</p>
          <p className="mt-1 text-lg font-bold text-amber-900">{formatRp(item.value)}</p>
        </div>
      ))}
    </div>
  );
}
