# Design doc — Generator data seed historis (transaksi + stok_gerak)

*Ditulis 2026-09-12, lanjutan langsung dari "Setup project Supabase nyata". Bukan sub-project
UI baru (tidak ada halaman/komponen baru) — tapi ada logika non-trivial (distribusi tanggal/
nominal, penipisan stok) yang layak di-unit-test, jadi tetap ikut alur RED-GREEN, bukan ditulis
manual sebagai SQL statis.*

## Tujuan
Isi `transaksi` (~50 baris) dan `stok_gerak` (~20 baris) untuk 30 hari terakhir di project
Supabase nyata, supaya dashboard (tren, forecast movingAverage/predictNext7), laporan bulanan,
dan badge stok "menipis" (STK-04) punya data sungguhan untuk demo skripsi dan UAT manual
(TESTING-DEPLOYMENT.md), bukan kosong/flat seperti sekarang.

## Kenapa script, bukan SQL tulis tangan
`seed.sql` sendiri sudah punya catatan sejak sub-project #1: 50 baris nominal+tanggal acak yang
tetap realistis (bukan pola berulang yang kelihatan buatan) lebih gampang dan lebih benar
dihasilkan dari kode dengan RNG **ber-seed** (supaya reproducible — regenerate ulang harus
menghasilkan output identik, penting untuk skripsi bisa direproduksi) daripada diketik manual.

## Keputusan desain
1. **Path & runtime**: `scripts/generate-seed-data.ts` (sesuai nama yang sudah disebut di
   komentar `seed.sql`). Logika inti (pure, testable) dipisah ke `lib/seed/*.ts`; script di
   `scripts/` cuma pemanggil tipis yang isi UUID usaha/owner/kasir asli lalu tulis file
   `supabase/seed-historis.sql`. Dijalankan lewat `tsx` (ditambah sebagai devDependency —
   Node 22 di sandbox ini punya `--experimental-strip-types` tapi statusnya masih berubah-ubah
   antar versi Node, `tsx` lebih stabil dipakai lintas mesin termasuk laptop lokal user nanti).
2. **Reproducible via seeded PRNG** (`mulberry32`, bukan `Math.random()`): fungsi generator
   menerima `seed: number` eksplisit. Regenerate dengan seed sama = output identik → bisa
   ditaruh di git, direview, dan direproduksi ulang kapan saja (mis. kalau project Supabase-nya
   perlu dibuat ulang).
3. **Jumlah pasti, bukan "sekitar"**: generator menghasilkan **tepat** 50 `transaksi` dan tepat
   20 `stok_gerak` (bukan random count) — supaya gampang diverifikasi (`count(*) = 50` dst) dan
   deterministik untuk unit test.
4. **Distribusi kategori/tanggal realistis untuk warung 24 jam**:
   - `tipe = 'masuk'` (≈38 dari 50): tersebar di kategori Jual Rokok / Jual Mie-Snack /
     Jual Kopi-Minuman / Jual Pulsa-PPOB, 1–3 entri per hari (warung ini dianggap mencatat
     ringkasan per kategori per hari, bukan tiap struk — konsisten dgn desain `transaksi`
     yang per-kategori, bukan per-item).
   - `tipe = 'keluar'` (≈12 dari 50): lebih jarang — Beli Stok Mie/Snack & Beli Stok Kopi
     beberapa kali (untuk direstock), Gas & Listrik ±mingguan, Lain-lain sesekali.
   - Nominal per kategori pakai rentang realistis warung Jakarta 2026 (mis. Jual Kopi/Minuman
     Rp3.000–15.000, Jual Pulsa/PPOB Rp20.000–100.000, Beli Stok Mie/Snack Rp200.000–500.000)
     — hardcoded per kategori di `lib/seed/generateHistoris.ts`, bukan satu rentang generik.
   - `created_by` diacak berbobot per tipe: transaksi `masuk` didominasi kasir (~70%, sesuai
     kasir jaga shift harian), transaksi `keluar` didominasi owner (~70%, restock/bayar
     tagihan biasa keputusan/tanggung jawab owner) — supaya kedua role sama-sama punya jejak
     data untuk uji manual RLS (kasir hanya update transaksi miliknya sendiri hari itu).
5. **stok_gerak (20 baris) sengaja bikin 1 produk "menipis"**: distribusi masuk/keluar per
   produk dihitung supaya minimal satu produk (dipilih deterministik dari seed, kandidat re
   alistis: Gas 3kg atau Telur — stok_minimum kecil, gampang habis) berakhir `sisa <=
   stok_minimum` di `v_stok_sisa`, supaya badge "menipis" (STK-04) benar-benar bisa didemokan,
   bukan cuma diuji lewat unit test `statusStok` yang sudah ada.
6. **Link opsional `stok_gerak.transaksi_id` → `transaksi.id`** (pola "beli stok jadi
   pengeluaran otomatis", STK-02): 2–3 baris `stok_gerak` arah `masuk` (restock Mie Instan /
   Kopi Sachet) di-link ke `transaksi` kategori "Beli Stok ..." yang berpasangan, memakai
   `WITH ... AS (INSERT ... RETURNING id) INSERT INTO stok_gerak (...) SELECT ...` (data-
   modifying CTE Postgres) — supaya pola nyata yang sudah ada di kode aplikasi (`CatatStokForm`
   + server action) juga terwakili di data historis, bukan cuma baris lepas tanpa keterkaitan.
7. **Resolusi FK pakai subquery by name, bukan lookup UUID manual**: `kategori_id` dan
   `produk_id` di SQL yang dihasilkan pakai
   `(select id from kategori where usaha_id = '<uuid>' and nama = '<nama>')` — persis pola yang
   sudah dipakai `budget` insert di `seed.sql`. Menghindari langkah tambahan query manual UUID
   kategori/produk lewat SQL Editor sebelum generate (kategori/produk itu sendiri di-insert
   `seed.sql` tanpa id eksplisit, jadi UUID-nya auto-generated dan tidak diketahui di luar DB).
8. **Escaping teks**: `keterangan` berisi teks Indonesia bebas (mis. "Restock dari distributor
   pagi") — fungsi `toSql` meng-escape petik satu (`'` → `''`) sebagai defense-in-depth walau
   dataset yang di-generate saat ini tidak mengandung petik satu.

## Komponen & file
- `lib/seed/prng.ts` (baru): `mulberry32(seed)` → fungsi RNG `() => number` [0,1), pure.
- `lib/seed/generateHistoris.ts` (baru): `generateHistoris(config)` →
  `{ transaksi: TransaksiSeedRow[], stokGerak: StokGerakSeedRow[] }`. Terima `seed`,
  `usahaId`, `ownerId`, `kasirId`, `hariTerakhir` (default 30), tanggal "hari ini" (default
  `new Date()`, di-inject supaya testable tanpa bergantung jam sistem).
- `lib/seed/toSql.ts` (baru): `buatSqlHistoris(hasil)` → string SQL siap jalan (insert
  `transaksi` biasa, insert `stok_gerak` biasa, dan blok CTE untuk yang linked).
- `scripts/generate-seed-data.ts` (baru): isi konstanta UUID asli (usaha, owner, kasir) →
  panggil `generateHistoris` (seed tetap, misal `20260912`) → `buatSqlHistoris` → tulis
  `supabase/seed-historis.sql`.

## Batasan
Bukan pengganti data produksi sungguhan (ini dataset dummy untuk demo/skripsi). Setelah
dijalankan ke project nyata, `v_stok_sisa`/dashboard/laporan akan menunjukkan angka dari
dataset dummy ini, bukan transaksi warung yang sebenarnya — didokumentasikan juga di
DEPLOY-LOG-01-SETUP-SUPABASE.md.

## Urutan task
1. `lib/seed/prng.ts` (RED-GREEN): determinism (seed sama → sequence sama), range [0,1).
2. `lib/seed/generateHistoris.ts` (RED-GREEN): jumlah baris tepat, semua tanggal dalam rentang,
   tipe/kategori konsisten, nominal positif, minimal 1 produk menipis, minimal 2 baris linked.
3. `lib/seed/toSql.ts` (RED-GREEN): fragment SQL yang diharapkan muncul, escaping petik satu.
4. `scripts/generate-seed-data.ts` — tulis, jalankan via `tsx`, hasil `supabase/seed-historis.sql`.
5. `npm run test` + `npm run build` + `npm run lint` — harus tetap hijau semua.
6. Jalankan `seed-historis.sql` ke project nyata lewat SQL Editor (pola form_input → verify →
   Run → verify yang sudah dipakai), verifikasi `count(*)` dan `v_stok_sisa.menipis`.
7. Update `DEPLOY-LOG-01-SETUP-SUPABASE.md`, commit, push ke `Kelvin/umkm` + vault.
