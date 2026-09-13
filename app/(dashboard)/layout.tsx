import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";
import { tentukanStatusAnggota } from "@/lib/auth/status";

// Dashboard selalu tergantung session user — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // User yang baru register lewat landing page belum tentu sudah di-assign owner ke
  // sebuah usaha (anggota_usaha) — tanpa baris itu, semua query di halaman dashboard
  // (yang selalu filter by usaha_id) bakal balik kosong dan membingungkan. Dialihkan
  // ke halaman "menunggu-assignment" sampai owner menambahkannya lewat Supabase Dashboard.
  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (tentukanStatusAnggota(anggota) === "pending-assignment") {
    redirect("/menunggu-assignment");
  }

  // Nama & logo usaha ditampilkan di AppNav (sidebar) — diambil di sini (bukan di AppNav,
  // yang client component) supaya ganti profil usaha di /pengaturan langsung kelihatan di
  // seluruh halaman dashboard begitu di-refresh, tanpa query tambahan di tiap komponen.
  // Dipisah jadi 2 query: kolom logo_url baru ada setelah migrasi Pengaturan dijalankan —
  // kalau digabung dalam satu select dan kolomnya belum ada, seluruh select gagal dan nama
  // usaha ikut hilang dari sidebar. Dipisah supaya nama tetap tampil walau logo belum bisa.
  const { data: usaha } = await supabase
    .from("usaha")
    .select("nama")
    .eq("id", anggota?.usaha_id ?? "")
    .maybeSingle();

  const { data: usahaLogo } = await supabase
    .from("usaha")
    .select("logo_url")
    .eq("id", anggota?.usaha_id ?? "")
    .maybeSingle();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <AppNav role={anggota?.role} namaUsaha={usaha?.nama} logoUrl={usahaLogo?.logo_url} />
      <div className="pb-16 md:pb-0 md:pl-56 print:pb-0 print:pl-0">{children}</div>
    </div>
  );
}
