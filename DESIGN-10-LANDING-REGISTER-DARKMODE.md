# DESIGN-10 — Landing Page, Registrasi Publik, Status Pending-Assignment, Dark Mode

*Ditulis 2026-09-13. Dipicu oleh feedback: aplikasi belum punya landing page, tidak bisa
daftar sendiri (akun owner/kasir sebelumnya cuma dibuat manual lewat Supabase Dashboard),
dan tampilan dinilai kurang profesional/elegan serta belum ada dark mode.*

## Keputusan scope (dikonfirmasi ke user sebelum implementasi)

1. **Model registrasi**: registrasi publik dibuka, tapi akun baru **tidak otomatis** jadi
   owner sebuah usaha baru (bukan multi-tenant). Setelah daftar, akun berstatus
   *pending-assignment* sampai owner Warung Madura Barokah 24 menambahkannya ke tabel
   `anggota_usaha` lewat Supabase Dashboard (alur manual yang sudah dipakai sejak awal
   proyek ini, tidak perlu UI admin baru). Alasan: studi kasus skripsi ini scope-nya tetap
   **satu** UMKM (sesuai judul), bukan platform multi-UMKM — kalau registrasi langsung bikin
   usaha baru per akun, itu mengubah scope penelitian secara signifikan.
2. **Isi landing page**: lengkap (hero, fitur, cara kerja, CTA, footer) — bukan minimal.
3. **Cakupan redesign**: iterasi ini cuma landing page + halaman auth (login/register) +
   infrastruktur dark mode. Dashboard, transaksi, budget, stok, hutang, laporan **belum**
   di-redesign — direncanakan sebagai iterasi berikutnya supaya perubahan tidak menumpuk
   sekaligus dan gampang di-review/di-demo terpisah.

## Kenapa perlu restrukturisasi routing (`/` pindah ke `/dashboard`)

Sebelumnya `app/(dashboard)/page.tsx` (route group tidak memengaruhi URL) ada di `/` —
artinya root URL selalu jadi halaman dashboard yang dilindungi auth. Supaya `/` bisa jadi
landing page publik, halaman dashboard dipindah ke `/dashboard`
(`git mv app/(dashboard)/page.tsx app/(dashboard)/dashboard/page.tsx`). Dampak yang
disesuaikan: `lib/nav.ts` (`NAV_ITEMS[0].href`), `components/AppNav.tsx` (`ICON_MAP`),
`app/(auth)/login/page.tsx` (`router.push`), dan `tests/nav.test.ts`.

## Alur register → pending → member

```
signUp() ──┬─ session langsung ada (project TIDAK wajib confirm email)
           │   → redirect ke /menunggu-assignment
           │
           └─ session belum ada (project WAJIB confirm email)
               → tampilkan "cek email kamu", user klik link,
                 lalu login manual → redirect ke /menunggu-assignment
```

`(dashboard)/layout.tsx` sekarang query `anggota_usaha` (bukan cuma `auth.getUser()`) dan
redirect ke `/menunggu-assignment` kalau belum ada baris — dipisah jadi fungsi pure
`tentukanStatusAnggota()` (`lib/auth/status.ts`, unit-tested) supaya logikanya gampang
diverifikasi tanpa mock Supabase.

**`profiles` row dibuat kapan?** RLS `"self insert profiles"` mensyaratkan
`auth.uid() = id`, jadi insert cuma bisa terjadi kalau ada session aktif. Karena signUp()
tidak selalu langsung memberi session (tergantung setting confirm email di project), insert
`profiles` **tidak dilakukan saat submit form register**, melainkan lewat helper idempotent
`ensureProfile()` (`lib/auth/ensureProfile.ts`, dipanggil dari halaman
`/menunggu-assignment`) yang jalan pertama kali user benar-benar punya session — entah itu
langsung setelah register (auto-confirm) atau setelah klik link email lalu login manual.
Pakai `upsert(..., { ignoreDuplicates: true })` supaya aman dipanggil berkali-kali dan tidak
menimpa `nama` yang mungkin sudah diubah user.

**Tidak ada perubahan schema.sql** — kolom/tabel yang dibutuhkan (`profiles`,
`anggota_usaha`, RLS insert self) sudah ada sejak awal. "Pending" bukan kolom status, tapi
diturunkan dari ada/tidaknya baris `anggota_usaha` — konsisten dengan gaya `v_stok_sisa`
yang menurunkan `menipis` dari data, bukan kolom terpisah.

## Dark mode

- `tailwind.config.ts`: `darkMode: "class"` (sebelumnya tidak diset — dark mode CSS
  var yang sudah ada di `globals.css` sebenarnya tidak pernah dipakai variant `dark:` di
  komponen manapun, cuma bereaksi ke `prefers-color-scheme` lewat CSS murni tanpa saklar).
- `lib/theme.ts` (`tentukanThemeAwal`, unit-tested): localStorage menang kalau ada &
  valid, sebaliknya fallback ke `prefers-color-scheme`.
- `components/ThemeToggle.tsx`: client component, toggle class `dark` di `<html>` +
  simpan pilihan ke `localStorage("theme")`.
- **Anti-FOUC**: skrip inline di `<head>` (`app/layout.tsx`) pasang class `dark` SEBELUM
  React hydrate, supaya user yang sudah pilih dark mode tidak lihat kedip putih. Logikanya
  sengaja ditulis ulang manual sebagai JS polos (gak bisa import `lib/theme.ts` langsung di
  skrip inline) — kalau `tentukanThemeAwal` diubah, skrip ini harus diubah bareng (dicatat
  di komentar kode).
- **Cakupan**: dark mode dipasang penuh di landing page + halaman login/register/
  menunggu-assignment. Dashboard & halaman fitur lain BELUM punya varian `dark:` (masih
  hardcode warna terang) — toggle tetap aman dipakai (class `dark` di `<html>` tidak
  merusak apa pun di sana, cuma belum ada efek visual), menyusul di iterasi redesign
  berikutnya.

## Palet warna baru

Ditambahkan skala warna `brand-*` di `tailwind.config.ts` (50–950) — nuansa
amber/terracotta yang lebih dalam & hangat dibanding `amber-*` bawaan Tailwind yang
dipakai sebelumnya, dipilih supaya terasa lebih "warung/kelontong" tapi tetap terlihat
matang untuk sebuah produk (bukan cuma warna default framework). Dipakai di landing +
auth pages; siap dipakai ulang saat redesign dashboard di iterasi berikutnya supaya
seluruh app konsisten satu palet.

## Yang sengaja belum dikerjakan (di luar scope yang disepakati)

- Redesign visual dashboard/transaksi/budget/stok/hutang/laporan — iterasi berikutnya.
- Tombol logout di `AppNav` (sidebar dashboard) — saat ini cuma ada di halaman
  `/menunggu-assignment` (`components/LogoutButton.tsx`, reusable). Ditemukan aplikasi
  memang belum pernah punya tombol logout di dashboard sama sekali — bukan regresi dari
  perubahan ini, tapi baik untuk ditambahkan di iterasi redesign berikutnya.
- UI admin untuk assign anggota_usaha dari dalam aplikasi — owner masih assign manual
  lewat Supabase Dashboard Table Editor, sesuai keputusan scope di atas.

## Verifikasi

- `npm test` — 104 test lulus (14 file test, 13 baru + reuse convention loginSchema.test.ts).
- `npm run build` — sukses, `/`, `/menunggu-assignment`, `/dashboard` dan seluruh halaman
  bisnis lain terdaftar sebagai dynamic (`ƒ`) seperti semula; `/login` & `/register` statis (`○`).
- `npx tsc --noEmit` & `next lint` — bersih, 0 error/warning.
- Verifikasi runtime lokal (`npm run start` + `curl`) dengan env Supabase asli:
  `/`, `/login`, `/register` → 200; `/dashboard`, `/menunggu-assignment` tanpa session →
  307 redirect ke `/login` (perilaku yang diharapkan); landing page dicek mengandung teks
  hero & CTA yang benar.
