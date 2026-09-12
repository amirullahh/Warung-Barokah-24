// Render GenerateHistorisResult (pure data) menjadi SQL siap jalan lewat SQL Editor Supabase.
// kategori_id/produk_id di-resolve pakai subquery by name (pola yang sama dipakai insert
// `budget` di supabase/seed.sql) — bukan lookup UUID manual, karena kategori/produk di-insert
// tanpa id eksplisit (auto gen_random_uuid()). Lih. DESIGN-09-SEED-HISTORIS.md keputusan #6/#7.
import type { GenerateHistorisResult, TransaksiSeedRow } from "./generateHistoris";

export interface ToSqlConfig {
  usahaId: string;
  ownerId: string;
  kasirId: string;
}

function escapeSql(s: string): string {
  return s.replace(/'/g, "''");
}

function roleToId(role: "owner" | "kasir", cfg: ToSqlConfig): string {
  return role === "owner" ? cfg.ownerId : cfg.kasirId;
}

function kategoriSubquery(usahaId: string, nama: string): string {
  return `(select id from kategori where usaha_id = '${usahaId}' and nama = '${escapeSql(nama)}')`;
}

function produkSubquery(usahaId: string, nama: string): string {
  return `(select id from produk where usaha_id = '${usahaId}' and nama = '${escapeSql(nama)}')`;
}

function transaksiValuesTuple(t: TransaksiSeedRow, cfg: ToSqlConfig): string {
  const { usahaId } = cfg;
  return `('${usahaId}', '${t.tanggal}', '${t.tipe}', ${kategoriSubquery(usahaId, t.kategoriNama)}, ${t.nominal}, '${escapeSql(t.keterangan)}', '${roleToId(t.createdByRole, cfg)}')`;
}

export function buatSqlHistoris(hasil: GenerateHistorisResult, cfg: ToSqlConfig): string {
  const { usahaId } = cfg;
  const lines: string[] = [];

  lines.push("-- Data historis 30 hari terakhir — di-generate via scripts/generate-seed-data.ts");
  lines.push("-- (lib/seed/generateHistoris.ts, seed PRNG deterministik). Lih. DESIGN-09-SEED-HISTORIS.md.");
  lines.push("");

  const linkedIdx = new Set(
    hasil.stokGerak.filter((s) => s.transaksiRefIdx !== undefined).map((s) => s.transaksiRefIdx!)
  );

  lines.push("-- 1) transaksi (yang jadi pasangan restock via CTE muncul di bagian 3, bukan di sini)");
  lines.push("insert into transaksi (usaha_id, tanggal, tipe, kategori_id, nominal, keterangan, created_by) values");
  const trxRows = hasil.transaksi
    .filter((t) => !linkedIdx.has(t.idx))
    .map((t) => `  ${transaksiValuesTuple(t, cfg)}`);
  lines.push(trxRows.join(",\n") + ";");
  lines.push("");

  lines.push("-- 2) stok_gerak yang TIDAK terkait transaksi (restock lepas / terjual-dipakai)");
  lines.push("insert into stok_gerak (usaha_id, produk_id, tanggal, arah, qty, keterangan) values");
  const stokRows = hasil.stokGerak
    .filter((s) => s.transaksiRefIdx === undefined)
    .map(
      (s) =>
        `  ('${usahaId}', ${produkSubquery(usahaId, s.produkNama)}, '${s.tanggal}', '${s.arah}', ${s.qty}, '${escapeSql(s.keterangan)}')`
    );
  lines.push(stokRows.join(",\n") + ";");
  lines.push("");

  lines.push("-- 3) pasangan beli-stok -> stok masuk, transaksi_id di-link via data-modifying CTE (pola STK-02)");
  const linked = hasil.stokGerak.filter((s) => s.transaksiRefIdx !== undefined);
  for (const s of linked) {
    const t = hasil.transaksi.find((x) => x.idx === s.transaksiRefIdx)!;
    lines.push(
      [
        "with trx as (",
        "  insert into transaksi (usaha_id, tanggal, tipe, kategori_id, nominal, keterangan, created_by)",
        `  values ${transaksiValuesTuple(t, cfg)}`,
        "  returning id",
        ")",
        "insert into stok_gerak (usaha_id, produk_id, tanggal, arah, qty, transaksi_id, keterangan)",
        `select '${usahaId}', ${produkSubquery(usahaId, s.produkNama)}, '${s.tanggal}', '${s.arah}', ${s.qty}, id, '${escapeSql(s.keterangan)}'`,
        "from trx;",
      ].join("\n")
    );
  }
  lines.push("");

  return lines.join("\n");
}
