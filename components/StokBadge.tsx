type StokBadgeProps = {
  status: "aman" | "menipis";
};

export function StokBadge({ status }: StokBadgeProps) {
  if (status === "menipis") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
        Menipis
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      Aman
    </span>
  );
}
