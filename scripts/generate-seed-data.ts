// Pemanggil tipis: isi UUID asli usaha/owner/kasir project "Warung Madura Barokah 24"
// (ahswhffkfpltmwsxuxfn) lalu tulis SQL siap-jalan ke supabase/seed-historis.sql.
// Jalankan: npx tsx scripts/generate-seed-data.ts
// Logika generate ada di lib/seed/*.ts (pure, unit-tested) — lih. DESIGN-09-SEED-HISTORIS.md.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateHistoris } from "../lib/seed/generateHistoris";
import { buatSqlHistoris } from "../lib/seed/toSql";

const USAHA_ID = "10000000-0000-0000-0000-000000000001";
const OWNER_ID = "2c3bca3a-44ee-472e-8c64-59088816f4d7"; // owner@barokah.test
const KASIR_ID = "73a00cc2-c91e-489e-8965-2cadd6e7ac30"; // kasir@barokah.test
const SEED = 20260912; // tanggal generate — dipin supaya reproducible

const hasil = generateHistoris({ seed: SEED });
const sql = buatSqlHistoris(hasil, { usahaId: USAHA_ID, ownerId: OWNER_ID, kasirId: KASIR_ID });

const outPath = fileURLToPath(new URL("../supabase/seed-historis.sql", import.meta.url));
writeFileSync(outPath, sql + "\n");

console.log(
  `Generated ${hasil.transaksi.length} transaksi + ${hasil.stokGerak.length} stok_gerak baris -> ${outPath}`
);
