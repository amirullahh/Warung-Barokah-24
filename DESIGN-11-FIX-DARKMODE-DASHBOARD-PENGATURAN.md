# DESIGN-11 — Perbaikan Dark Mode Dashboard, Modal, Logout, & Fitur Pengaturan Warung

*Ditulis 2026-09-13. Dipicu oleh feedback setelah DESIGN-10 dipakai nyata di lokal: teks
dashboard hilang (putih di atas putih) saat browser/OS dalam mode gelap, dashboard tidak
punya toggle dark/light sendiri, 3 modal "tambah" muncul di pojok kanan atas bukan di
tengah, tidak ada tombol logout di dashboard, dan owner tidak bisa mengubah profil warung
(nama/alamat/logo) dari dalam aplikasi.*

## Bug 1 — teks dashboard tak terlihat di dark mode

**Akar masalah**: `globals.css` (DESIGN-10) mengubah `.dark { --foreground: #ededed; }`
dari media-query jadi class-based, tapi cakupan dark mode DESIGN-10 **sengaja** dibatasi ke
landing/auth saja (lih. DESIGN-10 § "Cakupan") — dashboard & halaman fitur lain tidak
diberi variant `dark:` sama sekali, dengan asumsi itu aman karena "belum ada efek visual".
Asumsi itu salah: `body { color: var(--foreground) }` tetap berlaku secara global, jadi
begitu class `dark` menempel di `<html>` (dipasang otomatis oleh skrip anti-FOUC kalau
`prefers-color-scheme: dark`, TERLEPAS dari apakah user pernah menyentuh toggle), setiap
teks dashboard yang tidak punya warna eksplisit ikut mewarisi `--foreground` yang sekarang
nyaris putih — persis skenario di screenshot user (tabel Transaksi, dkk).

**Perbaikan**:
1. Setiap halaman dashboard (`dashboard`, `budget`, `stok`, `transaksi`, `hutang`,
   `laporan`) dan komponennya diberi variant `dark:` penuh — heading, label, isi tabel,
   card, form input, badge status — bukan cuma dibiarkan mewarisi warna body.
2. Sebagai *defense-in-depth* tambahan (supaya elemen yang lolos tidak sengaja diberi
   `dark:` tetap tidak invisible), wrapper terluar di `(dashboard)/layout.tsx` diberi warna
   teks dasar eksplisit: `text-neutral-900 dark:text-neutral-100`.
3. `TrendChart.tsx` (Recharts) tidak bisa dikasih class Tailwind karena SVG-nya dirender
   dengan warna inline lewat prop, bukan class — dibuat hook kecil `useIsDarkMode()`
   (`MutationObserver` di `document.documentElement`, reaktif ke toggle) supaya warna grid,
   axis, dan tooltip ikut menyesuaikan; garis tren (hijau/merah/oranye) dibiarkan tetap
   karena kontras cukup di kedua tema.

## Bug 2 — 3 modal "tambah" muncul di pojok, bukan di tengah

**Akar masalah**: `TambahBudgetForm`, `CatatStokForm`, `TambahProdukForm` merender
`<form>` langsung tanpa overlay pembungkus, beda dari `TambahTransaksiForm`/
`TambahHutangPiutangForm`/`LunaskanForm` yang sejak awal sudah benar memakai
`<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center
justify-center bg-black/40 p-4">`. Tanpa overlay itu, form ikut alur dokumen normal dan
nongkrong tepat di posisi tombol pemicunya (pojok kanan atas tiap halaman) — bukan bug
posisi CSS, tapi memang belum jadi modal sungguhan.

**Perbaikan**: tambahkan wrapper overlay yang sama persis (termasuk `onClick` klik-luar
dan `onKeyDown` Escape untuk menutup) ke ketiga komponen tersebut.

## Dashboard: toggle dark/light + logout + rebrand warna

- `AppNav.tsx` (dipakai di seluruh `(dashboard)/layout.tsx`) sekarang menerima
  `role`/`namaUsaha`/`logoUrl` dan merender `<ThemeToggle />` + `<LogoutButton />` di
  footer sidebar desktop (dan `<ThemeToggle />` mengambang di kanan-atas untuk mobile,
  karena sidebar desktop tersembunyi di layar kecil). Sebelum ini dashboard memang tidak
  pernah punya cara logout maupun ganti tema sendiri sama sekali — bukan regresi, tapi gap
  yang sudah dicatat sebagai "menyusul" di DESIGN-10.
- Seluruh `amber-*` bawaan Tailwind di dashboard diganti `brand-*` (skala yang sudah
  dibuat di DESIGN-10) supaya satu palet konsisten dengan landing/auth; beberapa aksen
  gradient ditambahkan (header sidebar, `ForecastCard`) sesuai preferensi user
  ("gradient keemasan"). Warna **semantik** yang maknanya bukan brand (status budget
  "hampir" = amber, badge "Tempo" hutang = amber, hijau/merah pemasukan-pengeluaran) sengaja
  **tidak** diubah jadi brand — hanya ditambah variant `dark:` supaya tetap kontras.
- `navItemsUntukRole(role)` (`lib/nav.ts`) menambahkan item nav "Pengaturan" khusus untuk
  role `owner` (kasir tetap 6 item seperti sebelumnya); `NAV_ITEMS` dasar tidak diubah agar
  kompatibel dengan test lama.

## Fitur baru: Pengaturan warung (nama, alamat, jam operasional, logo)

Halaman `/pengaturan` (owner-only — kasir yang mengetik URL-nya langsung dialihkan ke
`/dashboard`) menampilkan `PengaturanUsahaForm` yang:
- Mengubah `nama`/`alamat`/`jam_operasional` lewat `.update()` ke tabel `usaha` — RLS-nya
  sudah ada sejak schema awal (`"owner update usaha" ... using (is_owner(id))`), tidak
  perlu policy baru untuk bagian ini.
- Meng-upload logo ke bucket Storage baru `logo-usaha` (**public**, beda dari bucket
  `struk` yang private — logo perlu tampil di sidebar semua anggota tanpa signed URL) di
  path tetap `{usaha_id}/logo` dengan `upsert: true`, lalu simpan `getPublicUrl()`-nya
  (ditambah query param timestamp supaya tidak ke-cache browser dengan URL yang sama
  persis) ke kolom baru `usaha.logo_url`.

**Migrasi Supabase** (blok baru di akhir `supabase/schema.sql`, dijalankan sekali di SQL
Editor project yang sudah live):
```sql
alter table usaha add column if not exists logo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logo-usaha', 'logo-usaha', true, 2097152, array['image/jpeg','image/png'])
on conflict (id) do nothing;

create policy "owner upload logo usaha" on storage.objects for insert
with check (bucket_id = 'logo-usaha' and private.is_owner((storage.foldername(name))[1]::uuid));

create policy "owner update logo usaha" on storage.objects for update
using (bucket_id = 'logo-usaha' and private.is_owner((storage.foldername(name))[1]::uuid));

create policy "owner delete logo usaha" on storage.objects for delete
using (bucket_id = 'logo-usaha' and private.is_owner((storage.foldername(name))[1]::uuid));
```
(`private.is_owner`, bukan `public.is_owner`, karena fungsi itu sudah dipindah ke schema
`private` di blok perbaikan Security Advisor sebelumnya di `schema.sql`.)

**Ketahanan terhadap migrasi yang belum dijalankan**: sebelum blok di atas dijalankan,
kolom `logo_url` belum ada — kalau di-select bareng kolom lain dalam satu query, PostgREST
menolak seluruh query (bukan cuma kolom itu), yang akan membuat nama/alamat warung ikut
kosong padahal datanya ada. Untuk itu, baik `(dashboard)/layout.tsx` maupun
`app/(dashboard)/pengaturan/page.tsx` sengaja memisah query inti (`nama`/`alamat`/
`jam_operasional`) dari query `logo_url` jadi dua `.select()` terpisah — kalau migrasi
belum jalan, hanya bagian logo yang gagal (fallback: tanpa logo), bukan seluruh form/nama
sidebar.

## Yang sengaja belum dikerjakan

- Halaman-halaman lain (transaksi, budget, dst.) belum diberi gradient/aksen visual
  seramai `ForecastCard` — cukup rebrand warna + dark mode, sesuai permintaan "elegan dan
  mudah terbaca" tanpa menyebut redesign total.
- Tidak ada UI untuk menghapus logo yang sudah diupload (cuma bisa diganti dengan upload
  baru) — dianggap cukup untuk kebutuhan studi kasus satu warung ini.

## Verifikasi

- `npm test` — 116 test lulus (15 file test; +12 baru: 3 `navItemsUntukRole`, 4
  `validasiLogo`, 5 `pengaturanUsahaSchema`).
- `npx tsc --noEmit` — bersih.
- `next lint` — bersih (0 warning; termasuk memperbaiki posisi komentar
  `eslint-disable-next-line` di `AppNav.tsx` yang sebelumnya salah baris sehingga tidak
  benar-benar menekan warning `no-img-element`).
- `npm run build` — sukses; `/pengaturan` terdaftar sebagai halaman dynamic (`ƒ`) baru,
  seluruh route lain tetap seperti semula.
