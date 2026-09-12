"use client";

import { useState } from "react";
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

export function TrendChart({ data }: TrendChartProps) {
  const [jendela, setJendela] = useState<7 | 30>(7);
  const tampil = jendela === 7 ? data.slice(-7) : data;

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-amber-900">Tren omzet & pengeluaran</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setJendela(7)}
            aria-pressed={jendela === 7}
            className={`h-9 rounded-lg px-3 text-sm font-medium ${jendela === 7 ? "bg-amber-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
          >
            7 hari
          </button>
          <button
            type="button"
            onClick={() => setJendela(30)}
            aria-pressed={jendela === 30}
            className={`h-9 rounded-lg px-3 text-sm font-medium ${jendela === 30 ? "bg-amber-600 text-white" : "border border-neutral-300 text-neutral-700"}`}
          >
            30 hari
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={tampil} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="tanggal" tickFormatter={formatTanggalSingkat} fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v: number) => `${Math.round(v / 1000)}rb`} />
            <Tooltip
              formatter={(value) => formatRp(Number(value))}
              labelFormatter={(label) => formatTanggalSingkat(String(label))}
            />
            <Legend />
            <Line type="monotone" dataKey="masuk" name="Pemasukan" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="keluar" name="Pengeluaran" stroke="#dc2626" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="laba" name="Laba" stroke="#d97706" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-amber-700">
          Lihat sebagai tabel
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="p-2">Tanggal</th>
                <th className="p-2">Pemasukan</th>
                <th className="p-2">Pengeluaran</th>
                <th className="p-2">Laba</th>
              </tr>
            </thead>
            <tbody>
              {tampil.map((t) => (
                <tr key={t.tanggal} className="border-b border-neutral-100">
                  <td className="p-2">{formatTanggalSingkat(t.tanggal)}</td>
                  <td className="p-2">{formatRp(t.masuk)}</td>
                  <td className="p-2">{formatRp(t.keluar)}</td>
                  <td className="p-2">{formatRp(t.laba)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
