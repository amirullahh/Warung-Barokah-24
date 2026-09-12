# Warung Barokah 24 — Sistem Perencana Keuangan UMKM

Aplikasi web pencatatan transaksi, budget planner, manajemen stok ringan, dan pelaporan
keuangan untuk UMKM warung kelontong — dibangun sebagai studi kasus skripsi S1 dengan
**Next.js** dan **Supabase**.

**Studi kasus:** Warung Madura Barokah 24 — Slipi, Kemanggisan, Palmerah, Jakarta Barat (buka 24 jam)
**Judul skripsi:** Rancang Bangun Sistem Perencana Keuangan UMKM Berbasis Web dengan Next.js
dan Supabase (Studi Kasus: Warung Madura Barokah 24)

## Latar Belakang

Warung kelontong yang buka 24 jam sering mencatat keuangan secara manual di buku — rawan
salah hitung, uang pribadi bercampur dengan uang usaha, dan tidak ada gambaran tren atau
proyeksi arus kas. Stok barang (mie, kopi, gas, telur, beras) juga tidak tercatat rapi
sehingga owner baru sadar kehabisan stok saat pembeli sudah bertanya.

Aplikasi ini menjawab masalah tersebut dengan mencatat transaksi masuk/keluar per kategori,
memisahkan role **owner** dan **kasir** lewat Row Level Security di database (bukan hanya
disembunyikan di tampilan), serta menghubungkan pencatatan stok dengan keuangan secara
otomatis (beli stok = pengeluaran tercatat sekali klik).

## Fitur

- **Autentikasi & multi-role** — login lewat Supabase Auth, role `owner` dan `kasir` per
  usaha (`anggota_usaha`), hak akses ditegakkan di level database lewat Row Level Security,
  bukan hanya disembunyikan di UI.
- **Transaksi masuk/keluar** — pencatatan per kategori, tanggal, nominal, keterangan, dan
  upload foto struk (Supabase Storage, bucket privat).
- **Budget planner** — pagu bulanan per kategori pengeluaran, progress bar realisasi, badge
  status **Aman / Hampir / Over** berdasarkan persentase pemakaian.
- **Stok ringan** — pencatatan stok masuk/keluar per produk, sisa stok dihitung otomatis dari
  histori (bukan kolom manual), badge **"menipis"** saat sisa ≤ stok minimum. Opsi "beli stok
  jadi pengeluaran otomatis" membuat transaksi pengeluaran + catatan stok masuk dalam satu
  alur (via data-modifying CTE di server), sehingga datanya selalu konsisten.
- **Dashboard** — ringkasan hari ini, tren pemasukan/pengeluaran (Recharts), kartu stok
  menipis, dan **forecasting moving-average 7 hari** untuk prediksi pemasukan minggu depan.
- **Hutang/piutang** — pencatatan status tempo → lunas, pelunasan otomatis membuat jurnal
  lawan (transaksi masuk/keluar) supaya laporan tetap akurat.
- **Laporan bulanan** — ringkasan laba rugi per bulan, export ke CSV, cetak ke PDF lewat
  `window.print()` dengan layout khusus cetak.
- **Navigasi responsif** — sidebar di desktop, bottom navigation di mobile.

## Tumpukan Teknologi

| Layer | Teknologi |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Server Components + Server Actions) |
| Bahasa | TypeScript (strict mode) |
| Backend & DB | [Supabase](https://supabase.com/) — Postgres, Auth, Row Level Security, Storage |
| Styling | Tailwind CSS |
| Grafik | [Recharts](https://recharts.org/) |
| Ikon | [lucide-react](https://lucide.dev/) |
| Validasi | [Zod](https://zod.dev/) |
| Testing | [Vitest](https://vitest.dev/) (unit test, alur TDD Red-Green-Refactor) |
| Deploy | [Vercel](https://vercel.com/) |

## Arsitektur Singkat

```
Browser → Next.js (Server/Client Components) → Supabase JS (anon key + RLS) → Postgres
                                              ↳ Storage (foto struk, bucket privat)
```

Semua tabel bisnis mengaktifkan Row Level Security; akses dibatasi lewat fungsi
`is_member()`/`is_owner()` (disimpan di schema `private`, tidak diekspos lewat REST API) yang
dipanggil dari policy per tabel. Logika murni yang mudah diuji (moving average, status
budget, format rupiah, generator data seed) dipisah ke `lib/core.ts` dan `lib/seed/` sebagai
fungsi pure tanpa side effect. Detail keputusan desain ada di setiap `DESIGN-*.md` /
`PLAN-*.md` pada riwayat commit proyek ini.

### Skema database (Postgres, `supabase/schema.sql`)

`profiles`, `usaha`, `anggota_usaha`, `kategori`, `transaksi`, `budget`, `hutang_piutang`,
`produk`, `stok_gerak` — lengkap dengan RLS policy, view agregasi (`v_laba_harian`,
`v_budget_realisasi`, `v_stok_sisa`), dan trigger pembatas kolom untuk pelunasan
hutang/piutang oleh kasir.

## Menjalankan di Lokal

### Prasyarat
- Node.js 20+ dan npm
- Project Supabase (gratis di [supabase.com](https://supabase.com)) — atau gunakan project
  yang sudah ada untuk studi kasus ini

### Langkah

```bash
git clone https://github.com/amirullahh/Warung-Barokah-24.git
cd Warung-Barokah-24
npm install --legacy-peer-deps
```

Salin `.env.example` menjadi `.env.local`, lalu isi dengan kredensial project Supabase kamu
(**URL** dan **anon/publishable key** — keduanya memang aman dipakai di browser, jangan pernah
memasukkan *service role/secret key* ke sini):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx
```

Siapkan database — jalankan isi `supabase/schema.sql` lewat SQL Editor di dashboard Supabase,
lanjutkan dengan `supabase/seed.sql` (data dasar) dan `supabase/seed-historis.sql` (contoh 50
transaksi + 20 gerakan stok 30 hari terakhir, di-generate lewat `scripts/generate-seed-data.ts`
supaya nominal dan tanggalnya realistis dan reproducible).

Jalankan server pengembangan:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Skrip lain

```bash
npm run test    # unit test (Vitest)
npm run build   # production build + type-check
npm run lint    # ESLint
```

## Deploy

Aplikasi ini dirancang untuk deploy satu klik ke **Vercel**, terhubung ke repository GitHub
ini. Environment variable yang perlu di-set di Vercel sama seperti `.env.local` di atas
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Keamanan

- Row Level Security aktif di seluruh tabel bisnis; otorisasi ditegakkan di database, bukan
  hanya di client.
- Kredensial (service role key, password database) tidak pernah disimpan di kode atau
  environment publik.
- Foto struk disimpan di bucket Storage privat, hanya bisa diakses anggota usaha terkait.
- `.env.local` di-gitignore dan tidak pernah masuk riwayat commit.

## Lisensi

Proyek ini dibuat untuk keperluan tugas akhir (skripsi) S1 Teknologi Informasi.
