import { movingAverage, predictNext7, formatRp } from "@/lib/core";

type ForecastCardProps = {
  labaHarianTerakhir: number[];
};

export function ForecastCard({ labaHarianTerakhir }: ForecastCardProps) {
  const rataRata = movingAverage(labaHarianTerakhir, 7);
  const prediksi = predictNext7(rataRata);
  const totalPrediksi = prediksi.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 p-4 shadow-sm dark:from-neutral-900 dark:to-neutral-800">
      <h2 className="font-semibold text-brand-900 dark:text-brand-200">Prediksi laba 7 hari ke depan</h2>
      <p className="mt-1 text-2xl font-bold text-brand-900 dark:text-brand-100">{formatRp(totalPrediksi)}</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Rata-rata {formatRp(rataRata)}/hari, berdasarkan 7 hari terakhir.
      </p>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">*Estimasi MA-7 (rata-rata bergerak), bukan jaminan.</p>
    </div>
  );
}
