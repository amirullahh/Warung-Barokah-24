import type { SupabaseClient, User } from "@supabase/supabase-js";

// Dipanggil setelah user berhasil login/register (session aktif) untuk memastikan
// baris `profiles` miliknya ada. Kenapa tidak cukup dibuat sekali saja saat register:
// - Kalau project mewajibkan konfirmasi email, signUp() TIDAK mengembalikan session
//   (auth.uid() belum ada), jadi insert ke `profiles` (yang RLS-nya "id = auth.uid()")
//   belum bisa dilakukan saat itu juga — baru bisa setelah user klik link konfirmasi
//   dan login untuk pertama kali.
// - `ignoreDuplicates: true` supaya idempotent (aman dipanggil berkali-kali tiap
//   halaman diakses) dan tidak menimpa `nama` yang mungkin sudah diubah user sendiri.
export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<void> {
  const metaNama = user.user_metadata?.nama;
  const nama = typeof metaNama === "string" && metaNama.trim() ? metaNama : "Pengguna";

  await supabase
    .from("profiles")
    .upsert({ id: user.id, nama }, { onConflict: "id", ignoreDuplicates: true });
}
