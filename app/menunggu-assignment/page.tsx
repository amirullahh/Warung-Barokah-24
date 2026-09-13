import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/ensureProfile";
import { tentukanStatusAnggota } from "@/lib/auth/status";
import { LogoutButton } from "@/components/LogoutButton";

// Halaman transisi untuk user yang sudah login tapi belum di-assign owner ke
// anggota_usaha manapun (lih. lib/auth/status.ts). Bukan static — status bisa berubah
// kapan saja begitu owner nambahin dia lewat Supabase Dashboard.
export const dynamic = "force-dynamic";

export default async function MenungguAssignmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  // Sudah di-assign sejak terakhir dicek (mis. buka lagi tab lama) — langsung ke dashboard,
  // gak perlu nyangkut di halaman menunggu ini.
  if (tentukanStatusAnggota(anggota) === "member") {
    redirect("/dashboard");
  }

  // Baris profiles mungkin belum ada kalau ini pertama kali dia dapat session
  // (mis. baru saja klik link konfirmasi email lalu login) — lih. ensureProfile.ts.
  await ensureProfile(supabase, user);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-neutral-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          <Clock className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-bold text-brand-900 dark:text-brand-200">
          Akun kamu sudah aktif
        </h1>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Tinggal satu langkah lagi: owner Warung Madura Barokah 24 perlu menambahkanmu
          sebagai anggota (owner/kasir) lewat Supabase Dashboard sebelum kamu bisa mulai
          mencatat transaksi.
        </p>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Kalau kamu owner-nya sendiri: buka Supabase Dashboard → Table Editor →{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
            anggota_usaha
          </code>{" "}
          → tambahkan baris baru dengan email akun ini.
        </p>

        <div className="pt-2">
          <LogoutButton className="mx-auto flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800" />
        </div>
      </div>
    </main>
  );
}
