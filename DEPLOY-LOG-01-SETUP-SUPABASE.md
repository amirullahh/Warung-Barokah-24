# Deploy log — Setup project Supabase nyata

*Ditulis 2026-09-12, mengikuti checklist Deploy #1 di TESTING-DEPLOYMENT.md. Bukan sub-project
fitur baru (tidak ada kode aplikasi baru) — ini log kerja infrastruktur/deployment.*

## Yang sudah dikerjakan

1. **Project dibuat**: organisasi "Warung Madura Barokah 24" (sudah ada sebelumnya di akun
   Supabase user) → project baru "Warung Madura Barokah 24", plan Free.
   - Project ref: `ahswhffkfpltmwsxuxfn` — URL `https://ahswhffkfpltmwsxuxfn.supabase.co`.
   - Region: dipilih "Asia-Pacific" (opsi umum, ditandai RECOMMENDED oleh Supabase) → otomatis
     resolve ke **Northeast Asia (Tokyo)**, bukan Singapore. Masih jauh lebih dekat ke Jakarta
     dibanding region default US/EU; tidak di-provision ulang karena selisih latensi
     Tokyo-vs-Singapore untuk MVP demo skripsi ini tidak signifikan. Kalau nanti mau dipindah ke
     Singapore murni, perlu project baru (Supabase tidak bisa migrasi region project yang sudah
     jalan).
   - Password database: **di-generate lewat tombol "Generate a password" bawaan Supabase**
     (bukan diketik manual) — nilainya sempat tersalin otomatis ke clipboard OS user saat
     tombol itu diklik, TIDAK PERNAH dibaca/disimpan oleh Claude. User perlu menyimpan sendiri
     password ini (mis. ke password manager) kalau nanti butuh koneksi langsung ke Postgres
     (psql/connection string) — untuk pemakaian normal aplikasi (lewat `@supabase/supabase-js`
     + anon/publishable key), password DB ini **tidak dibutuhkan sama sekali**.
   - Security saat create: "Enable Data API" tetap ON (wajib, dipakai `supabase-js`).
     "Automatically expose new tables" diubah ke OFF (mengikuti rekomendasi Supabase sendiri +
     kebiasaan proyek ini yang selalu eksplisit soal RLS, bukan auto-expose).

2. **`schema.sql` dijalankan penuh** lewat SQL Editor (paste + run) — 9 tabel, RLS policies
   (is_member/is_owner + 15 policy), 3 view (`v_laba_harian`, `v_budget_realisasi`,
   `v_stok_sisa`), trigger `enforce_hutang_piutang_update`. Semua sudah termasuk 2 fix RLS/
   trigger dari sub-project #5 (transaksi) & #6 (hutang_piutang). Diverifikasi lewat Table
   Editor: 9 tabel + 3 view muncul semua.

3. **Temuan baru: Security Advisor Supabase (splinter linter) — 7 warning, 0 error**, muncul
   otomatis setelah schema di atas benar-benar live (linter statis ini tidak bisa jalan atas
   `schema.sql` sebagai file, cuma atas database yang sudah nyata — makanya baru ketahuan
   sekarang, bukan berarti terlewat sebelumnya):
   - **Function Search Path Mutable** (×3: `is_member`, `is_owner`,
     `enforce_hutang_piutang_update`) — tanpa `search_path` di-pin, fungsi `SECURITY DEFINER`
     rentan dibajak lewat session `search_path` (privilege escalation klasik Postgres).
   - **Public/Signed-In Users Can Execute SECURITY DEFINER Function** (×2 fungsi × 2 varian)
     — `is_member`/`is_owner` awalnya bisa dipanggil langsung lewat REST RPC
     (`/rest/v1/rpc/is_member`) oleh siapa saja (anon) maupun user login, padahal keduanya cuma
     dimaksud dipakai INTERNAL oleh RLS policy, bukan API publik.

   **Fix** (ditambahkan ke `supabase/schema.sql` di repo dengan komentar penjelasan lengkap,
   sudah dijalankan juga di project nyata, sudah divalidasi ulang lewat Security Advisor →
   **0 error, 0 warning**):
   - `is_member`/`is_owner` dipindah ke schema baru `private` (`ALTER FUNCTION ... SET SCHEMA`)
     — Postgres menyimpan referensi fungsi di definisi RLS policy sebagai OID internal (bukan
     re-resolve nama tiap query), jadi ke-15 policy yang sudah ada **tetap jalan tanpa
     diubah**. PostgREST cuma auto-expose fungsi di schema `public`, jadi keduanya otomatis
     hilang dari permukaan REST API.
   - Ketiga fungsi di-`SET search_path = public, pg_temp`.
   - `enforce_hutang_piutang_update()` diganti isinya (`create or replace`, OID & trigger yang
     sudah nempel tidak berubah) supaya rujukan ke `is_owner()` di-qualify jadi
     `private.is_owner(...)` — perlu di-qualify karena search_path fungsi ini sengaja dipin
     ke `public, pg_temp` saja (tidak termasuk `private`).

4. **Storage bucket `struk`** dibuat lewat SQL (bukan lewat form dashboard) — private,
   `file_size_limit` 5MB + `allowed_mime_types` JPG/PNG (disamakan dengan `validasiStruk()` di
   `lib/core.ts` sebagai defense-in-depth di level storage, bukan cuma client-side). Policy
   insert+select: `bucket_id = 'struk' and private.is_member((storage.foldername(name))[1]::uuid)`
   — path upload `{usaha_id}/{transaksi_id}-{nama_file}` (sudah sesuai konvensi
   `TambahTransaksiForm.tsx`). Diverifikasi lewat halaman Storage → Policies: 2 policy muncul.

5. **`.env.local`** dibuat di `Kelvin/umkm/.env.local` (di-gitignore, tidak pernah masuk git)
   berisi `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key —
   eksplisit ditandai Supabase "safe to use in a browser" / "can be safely shared publicly").
   **Secret key (`sb_secret_...`) tidak pernah dibaca/disalin/dicatat di mana pun** sesuai
   aturan keamanan.

## Update 2026-09-12 (lanjutan, sesi yang sama): 2 user demo + seed.sql SUDAH dijalankan

User sudah membuat 2 akun lewat Dashboard Supabase → Authentication → Add user sendiri
(Claude tidak pernah melihat/menangani passwordnya, cuma UUID-nya lewat halaman Users — UUID
bukan data rahasia):
- `owner@barokah.test` → UUID `2c3bca3a-44ee-472e-8c64-59088816f4d7`
- `kasir@barokah.test` → UUID `73a00cc2-c91e-489e-8965-2cadd6e7ac30`

UUID di atas sudah dipakai mengganti placeholder `00000000-...0001`/`...0002` di
`supabase/seed.sql`, lalu file itu dijalankan penuh lewat SQL Editor. Diverifikasi lewat query
`count(*)` per tabel — semua sesuai jumlah yang di-insert: 2 profiles, 1 usaha, 2
anggota_usaha, 8 kategori, 5 produk, 4 budget, 4 hutang_piutang.

## Update 2026-09-12 (lanjutan lagi, sesi yang sama): generator data seed historis SUDAH dijalankan

`lib/seed/prng.ts` (mulberry32 ber-seed) + `lib/seed/generateHistoris.ts` +
`lib/seed/toSql.ts` (RED-GREEN, 16 test baru) + `scripts/generate-seed-data.ts` (dijalankan
lewat `tsx`, ditambah devDependency) — detail keputusan desain di `DESIGN-09-SEED-HISTORIS.md`.
Hasil generate (`supabase/seed-historis.sql`, ikut di-commit sebagai referensi) sudah dijalankan
penuh lewat SQL Editor project nyata (paste per-bagian karena Monaco SQL Editor sempat perlu
di-refresh ke `/sql/new` supaya editor benar-benar kosong sebelum diisi ulang — beberapa kali
percobaan form_input sebelumnya numpuk/nyambung dengan isi lama, bukan menimpa, jadi solusinya
selalu mulai dari tab query baru per query yang dijalankan).

Diverifikasi lewat query langsung ke project nyata:
- `count(*)` → 50 transaksi, 20 stok_gerak, 3 di antaranya stok_gerak dengan `transaksi_id`
  terisi (pola "beli stok jadi pengeluaran otomatis" / STK-02, di-link lewat data-modifying CTE).
- `select * from v_stok_sisa` → **Gas 3kg** (sisa 0, minimum 2) dan **Telur** (sisa 2, minimum 3)
  keduanya `menipis = true` (sengaja, sesuai desain); Beras (20/5), Kopi Sachet (27/15), Mie
  Instan (33/20) semuanya `menipis = false` — badge STK-04 sekarang bisa didemokan nyata.

Catatan proses SQL Editor: dialog "Potential issue detected... query creates a table without
enabling Row Level Security" sempat muncul saat menjalankan bagian `insert into stok_gerak`
— ini heuristik client-side SQL Editor yang salah deteksi (`insert into X (...)` mirip pola
`create table`), bukan temuan nyata (tabel `stok_gerak` sudah RLS-enabled sejak `schema.sql`,
sudah diverifikasi 0 warning di Security Advisor sebelumnya). Dipilih "Run without RLS" supaya
tidak ada statement tambahan yang dikirim di luar yang sudah ditulis sendiri di
`seed-historis.sql`.

npm test (90 lulus) + `next build` + `next lint` tetap hijau sebelum dijalankan ke DB nyata.

## Yang MASIH perlu dikerjakan

1. `npm install --legacy-peer-deps` di laptop lokal kalau `Kelvin/umkm` di lokal belum sinkron
   `package.json` terbaru (nambah `recharts`, `lucide-react`, dan sekarang `tsx` juga).
2. Buat `Kelvin/umkm/.env.local` secara manual (device bridge menolak menulis file
   `.env*.local` lewat remote tool) — isinya 2 baris `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (lih. bagian 5 di atas untuk nilainya, keduanya memang
   ditandai Supabase "aman dipakai di browser").
3. Sekarang seed data (dasar + historis) sudah lengkap semua — Blackbox/UAT manual
   (TESTING-DEPLOYMENT.md) & deploy Vercel (Tahap 4) sudah bisa mulai dikerjakan kapan saja.

## Batasan
Ini BUKAN pengganti Blackbox/UAT manual (TESTING-DEPLOYMENT.md) — baru setelah 2 akun demo +
seed data ada, skenario AUTH-01/TRX-01/dst bisa benar-benar dijalankan lewat browser sungguhan
memakai project ini. Deploy ke Vercel (Tahap 4) juga belum dilakukan — env var di atas baru
untuk `Kelvin/umkm/.env.local` (development lokal), belum di-set di Vercel project settings.
