import { statusBudget, formatRp } from "@/lib/core";

type BudgetBarProps = {
  terpakai: number;
  pagu: number;
};

const STATUS_LABEL = { aman: "Aman", hampir: "Hampir", over: "Over" } as const;
const STATUS_BAR_COLOR = { aman: "bg-emerald-500", hampir: "bg-amber-500", over: "bg-red-600" } as const;
const STATUS_BADGE_COLOR = {
  aman: "bg-emerald-100 text-emerald-700",
  hampir: "bg-amber-100 text-amber-800",
  over: "bg-red-100 text-red-700",
} as const;

export function BudgetBar({ terpakai, pagu }: BudgetBarProps) {
  const status = statusBudget(terpakai, pagu);
  const persen = pagu > 0 ? Math.min(100, Math.round((terpakai / pagu) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>{formatRp(terpakai)} / {formatRp(pagu)}</span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        aria-valuenow={persen}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full ${STATUS_BAR_COLOR[status]}`} style={{ width: `${persen}%` }} />
      </div>
    </div>
  );
}
