"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatRp } from "@/lib/core";

type TrendPoint = {
  tanggal: string;
  masuk: number;
  keluar: number;
  laba: number;
};

type TrendChartProps = {
  data: TrendPoint[];
};

function formatTanggalSingkat(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

// Recharts merender SVG dengan warna inline, bukan class Tailwind — jadi warna
// grid/axis/tooltip perlu tahu status dark mode secara eksplisit (bukan cuma dark: class).
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() => setIsDark(root.classList.contains("dark")));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function TrendChart({ data }: TrendChartProps) {
  const [jendela, setJendela] = useState<7 | 30>(7);
  const isDark = useIsDarkMode();
  const tampil = jendela === 7 ? data.slice(-7) : data;

  const warnaGrid = isDark ? "#404040" : "#e5e5e5";
  const warnaTick = isDark ? "#a3a3a3" : "#525252";
  const tooltipStyle = isDark
    ? { backgroundColor: "#262626", border: "1px solid #404040", color: "#f5f5f5" }
    : { backgroundColor: "#ffffff", border: "1px solid #e5e5e5", color: "#171717" };

  return (
    <div className="rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-brand-900 dark:text-brand-200">Tren omzet & pengeluaran</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setJendela(7)}
            aria-pressed={jendela === 7}
            className={`h-9 rounded-lg px-3 text-sm font-medium ${jendela === 7 ? "bg-brand-600 text-white" : "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"}`}
          >
            7 hari
          </button>
          <button
            type="button"
            onClick={() => setJendela(30)}
            aria-pressed={jendela === 30}
            className={`h-9 rounded-lg px-3 text-sm font-medium ${jendela === 30 ? "bg-brand-600 text-white" : "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"}`}
          >
            30 hari
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={tampil} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={warnaGrid} />
            <XAxis dataKey="tanggal" tickFormatter={formatTanggalSingkat} fontSize={12} stroke={warnaTick} />
            <YAxis fontSize={12} tickFormatter={(v: number) => `${Math.round(v / 1000)}rb`} stroke={warnaTick} />
            <Tooltip
              formatter={(value) => formatRp(Number(value))}
              labelFormatter={(label) => formatTanggalSingkat(String(label))}
              contentStyle={tooltipStyle}
            />
            <Legend />
            <Line type="monotone" dataKey="masuk" name="Pemasukan" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="keluar" name="Pengeluaran" stroke="#dc2626" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="laba" name="Laba" stroke="#d97706" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-brand-700 dark:text-brand-300">
          Lihat sebagai tabel
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="p-2 text-neutral-900 dark:text-neutral-100">Tanggal</th>
                <th className="p-2 text-neutral-900 dark:text-neutral-100">Pemasukan</th>
                <th className="p-2 text-neutral-900 dark:text-neutral-100">Pengeluaran</th>
                <th className="p-2 text-neutral-900 dark:text-neutral-100">Laba</th>
              </tr>
            </thead>
            <tbody>
              {tampil.map((t) => (
                <tr key={t.tanggal} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="p-2 text-neutral-900 dark:text-neutral-100">{formatTanggalSingkat(t.tanggal)}</td>
                  <td className="p-2 text-neutral-900 dark:text-neutral-100">{formatRp(t.masuk)}</td>
                  <td className="p-2 text-neutral-900 dark:text-neutral-100">{formatRp(t.keluar)}</td>
                  <td className="p-2 text-neutral-900 dark:text-neutral-100">{formatRp(t.laba)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
