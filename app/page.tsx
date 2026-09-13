import Link from "next/link";
import {
  Receipt,
  Wallet,
  Package,
  HandCoins,
  FileText,
  ShieldCheck,
  UserPlus,
  Clock3,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { tentukanStatusAnggota } from "@/lib/auth/status";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

const FITUR = [
  {
    icon: Receipt,
    judul: "Transaksi Masuk/Keluar",
    deskripsi:
      "Catat tiap pemasukan dan pengeluaran per kategori, lengkap dengan foto struk — gak perlu buku catatan lagi.",
  },
  {
    icon: Wallet,
    judul: "Budget Planner",
    deskripsi:
      "Pasang pagu bulanan per kategori pengeluaran, pantau realisasinya lewat progress bar dan status Aman/Hampir/Over.",
  },
  {
    icon: Package,
    judul: "Stok Ringan",
    deskripsi:
      "Catat stok masuk/keluar per produk, sisa dihitung otomatis, dan dapat notifikasi begitu stok menipis.",
  },
  {
    icon: HandCoins,
    judul: "Hutang & Piutang",
    deskripsi:
      "Lacak status tempo sampai lunas — pelunasan otomatis tercatat di laporan keuangan, gak perlu dobel catat.",
  },
  {
    icon: FileText,
    judul: "Laporan & Forecasting",
    deskripsi:
      "Ringkasan laba rugi bulanan, export CSV, cetak PDF, plus prediksi pemasukan minggu depan (moving average 7 hari).",
  },
  {
    icon: ShieldCheck,
    judul: "Aman per Role",
    deskripsi:
      "Owner dan kasir punya hak akses berbeda, ditegakkan langsung di level database (Row Level Security) — bukan cuma disembunyikan di tampilan.",
  },
];

const LANGKAH = [
  {
    icon: UserPlus,
    judul: "Daftar akun",
    deskripsi: "Isi nama, email, dan password lewat halaman Daftar. Cepat, tanpa perlu approval berlapis.",
  },
  {
    icon: Clock3,
    judul: "Menunggu di-assign owner",
    deskripsi:
      "Owner warung menambahkanmu sebagai anggota (owner/kasir) lewat panel admin — jaga supaya cuma orang yang tepat yang bisa akses data usaha.",
  },
  {
    icon: ClipboardCheck,
    judul: "Mulai catat keuangan",
    deskripsi: "Begitu di-assign, dashboard, transaksi, budget, stok, sampai laporan langsung bisa dipakai.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ctaHref = "/register";
  let ctaLabel = "Daftar Sekarang";

  if (user) {
    const { data: anggota } = await supabase
      .from("anggota_usaha")
      .select("usaha_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    ctaHref = tentukanStatusAnggota(anggota) === "member" ? "/dashboard" : "/menunggu-assignment";
    ctaLabel = tentukanStatusAnggota(anggota) === "member" ? "Ke Dashboard" : "Cek Status Akun";
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="font-bold text-brand-900 dark:text-brand-200">Barokah 24</span>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300 md:flex">
            <a href="#fitur" className="hover:text-brand-700 dark:hover:text-brand-300">Fitur</a>
            <a href="#cara-kerja" className="hover:text-brand-700 dark:hover:text-brand-300">Cara Kerja</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link
                href={ctaHref}
                className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-medium leading-10 text-white transition hover:bg-brand-700"
              >
                {ctaLabel}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-10 rounded-lg px-3 text-sm font-medium leading-10 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-medium leading-10 text-white transition hover:bg-brand-700"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
              Studi kasus: Warung Madura Barokah 24
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-neutral-900 dark:text-white md:text-5xl">
              Kelola keuangan warungmu,{" "}
              <span className="text-brand-600 dark:text-brand-400">bukan cuma di buku catatan</span>
            </h1>
            <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400 md:text-lg">
              Catat transaksi, atur budget, pantau stok, dan lihat laporan laba rugi bisnismu —
              semua dalam satu aplikasi web, bisa diakses owner maupun kasir sesuai perannya
              masing-masing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="flex h-12 items-center gap-2 rounded-lg bg-brand-600 px-6 font-medium text-white transition hover:bg-brand-700"
              >
                {user ? ctaLabel : "Daftar Sekarang"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="flex h-12 items-center rounded-lg border border-neutral-300 px-6 font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Ringkasan hari ini
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { label: "Omzet", value: "Rp 1.250.000" },
                { label: "Pengeluaran", value: "Rp 380.000" },
                { label: "Laba", value: "Rp 870.000" },
                { label: "Stok menipis", value: "2 produk" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white p-3 dark:bg-neutral-800">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.label}</p>
                  <p className="mt-1 font-semibold text-neutral-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              *Ilustrasi tampilan dashboard, bukan data sungguhan.
            </p>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-900/40 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">Semua yang dibutuhkan warung 24 jam</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Dirancang dari kebutuhan nyata Warung Madura Barokah 24 — buka 24 jam, banyak
              transaksi kecil, dan perlu dua peran (owner & kasir) yang saling percaya tapi tetap
              perlu batasan akses.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FITUR.map((f) => (
              <div key={f.judul} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-neutral-900 dark:text-white">{f.judul}</h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{f.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section id="cara-kerja" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">Cara kerjanya</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Registrasi terbuka untuk siapa saja, tapi akses ke data usaha tetap dikontrol
              penuh oleh owner — jadi gak sembarang orang bisa lihat catatan keuangan warung.
            </p>
          </div>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {LANGKAH.map((langkah, i) => (
              <li key={langkah.judul} className="relative rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
                <span className="absolute -top-3 left-5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <langkah.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-neutral-900 dark:text-white">{langkah.judul}</h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{langkah.deskripsi}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200 bg-brand-600 py-16 dark:border-neutral-800 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Siap kelola keuangan warungmu lebih rapi?
          </h2>
          <p className="mt-2 text-brand-50">
            Gratis untuk dicoba — daftar akun dalam hitungan menit.
          </p>
          <div className="mt-6">
            <Link
              href={user ? ctaHref : "/register"}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 font-medium text-brand-700 transition hover:bg-brand-50"
            >
              {user ? ctaLabel : "Daftar Sekarang"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <p>Warung Madura Barokah 24 — Slipi, Kemanggisan, Palmerah, Jakarta Barat.</p>
        <p className="mt-1">
          Dibangun sebagai studi kasus skripsi S1 Teknologi Informasi dengan Next.js &amp; Supabase.
        </p>
      </footer>
    </main>
  );
}
