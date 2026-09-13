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
        <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</p>
          <p className="mt-1 text-lg font-bold text-brand-900 dark:text-brand-200">{formatRp(item.value)}</p>
        </div>
      ))}
    </div>
  );
}
