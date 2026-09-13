"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/schemas/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("confirm")
          ? "Email belum dikonfirmasi. Cek inbox kamu dulu, ya."
          : "Email atau password salah. Coba lagi."
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4 dark:bg-neutral-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg dark:bg-neutral-900"
      >
        <div>
          <h1 className="text-xl font-bold text-brand-900 dark:text-brand-200">Warung Madura Barokah 24</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Masuk ke akun kasir/owner</p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium dark:text-neutral-200">Email</label>
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
          <label htmlFor="password" className="mb-1 block text-sm font-medium dark:text-neutral-200">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            autoComplete="current-password"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-brand-600 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-brand-700 underline dark:text-brand-300">
            Daftar
          </Link>
        </p>
        <p className="text-center text-sm">
          <Link href="/" className="text-neutral-500 underline dark:text-neutral-400">
            ← Kembali ke beranda
          </Link>
        </p>
      </form>
    </main>
  );
}
