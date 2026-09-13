// Menentukan status akses user setelah login: apakah dia sudah jadi anggota
// (owner/kasir) di sebuah usaha, atau masih menunggu di-assign oleh owner.
// Dipisah jadi fungsi pure supaya gampang di-unit test tanpa perlu Supabase client.
export type StatusAnggota = "member" | "pending-assignment";

export function tentukanStatusAnggota(
  anggota: { usaha_id: string; role: string } | null
): StatusAnggota {
  return anggota ? "member" : "pending-assignment";
}
