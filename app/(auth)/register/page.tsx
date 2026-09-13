"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/schemas/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Kalau project Supabase mewajibkan konfirmasi email, signUp() sukses tapi belum ada
  // session — tampilkan pesan "cek email" alih-alih langsung redirect (gak ada ke mana pun
  // yang aman dituju karena user belum benar-benar login).
  const [perluKonfirmasiEmail, setPerluKonfirmasiEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ nama, email, password, konfirmasiPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { nama: parsed.data.nama } },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already")
          ? "Email ini sudah terdaftar. Coba masuk lewat halaman Login."
          : "Gagal mendaftar. Coba lagi beberapa saat lagi."
      );
      return;
    }

    if (data.session) {
      // Project tidak mewajibkan konfirmasi email → sudah langsung login.
      router.push("/menunggu-assignment");
      router.refresh();
      return;
    }

    setPerluKonfirmasiEmail(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-10 dark:bg-neutral-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg dark:bg-neutral-900">
        <div>
          <h1 className="text-xl font-bold text-brand-900 dark:text-brand-200">Daftar Akun</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Warung Madura Barokah 24 — Perencana Keuangan UMKM
          </p>
        </div>

        {perluKonfirmasiEmail ? (
          <div className="space-y-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-900 dark:bg-neutral-800 dark:text-brand-100">
            <p className="font-medium">Cek email kamu untuk konfirmasi ✔️</p>
            <p>
              Kami sudah kirim link konfirmasi ke <span className="font-medium">{email}</span>.
              Klik link itu dulu, baru kamu bisa login.
            </p>
            <p>
              Setelah login, akunmu akan berstatus <em>menunggu di-assign</em> sampai owner
              menambahkanmu ke usaha.
            </p>
            <Link href="/login" className="inline-block font-medium text-brand-700 underline dark:text-brand-300">
              Ke halaman Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nama" className="mb-1 block text-sm font-medium dark:text-neutral-200">
                Nama
              </label>
              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium dark:text-neutral-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium dark:text-neutral-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="konfirmasiPassword" className="mb-1 block text-sm font-medium dark:text-neutral-200">
                Konfirmasi Password
              </label>
              <input
                id="konfirmasiPassword"
                type="password"
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-brand-600 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>

            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-medium text-brand-700 underline dark:text-brand-300">
                Masuk
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
