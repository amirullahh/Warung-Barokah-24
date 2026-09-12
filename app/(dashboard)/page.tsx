import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama")
    .eq("id", user?.id ?? "")
    .single();

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("role")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-amber-900">
        Selamat datang, {profile?.nama ?? "Pengguna"}
        {anggota?.role ? ` (${anggota.role})` : ""}
      </h1>
      <p className="mt-2 text-neutral-600">
        Dashboard bisnis (omzet, tren, stok) menyusul di sub-project berikutnya.
      </p>
    </main>
  );
}
