import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PengaturanUsahaForm } from "@/components/PengaturanUsahaForm";

// Halaman ini tergantung session user (role, usaha_id) — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: anggota } = await supabase
    .from("anggota_usaha")
    .select("usaha_id, role")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  // Hanya owner yang boleh mengubah profil warung (kasir dialihkan balik ke dashboard).
  if (anggota?.role !== "owner") {
    redirect("/dashboard");
  }

  const usahaId = anggota.usaha_id;

  // Kolom inti (nama/alamat/jam_operasional) dipisah dari logo_url: kolom logo_url baru ada
  // setelah migrasi Pengaturan dijalankan di Supabase, jadi kalau migrasi belum jalan, select
  // gabungan bakal gagal total dan bikin nama/alamat ikut kosong. Dipisah supaya form tetap
  // ke-isi nama/alamat yang benar walau logo belum bisa dipakai.
  const { data: usaha } = await supabase
    .from("usaha")
    .select("nama, alamat, jam_operasional")
    .eq("id", usahaId)
    .single();

  const { data: usahaLogo } = await supabase
    .from("usaha")
    .select("logo_url")
    .eq("id", usahaId)
    .maybeSingle();

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-200">Pengaturan warung</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Ubah nama, alamat, jam operasional, dan logo warung.
        </p>
      </div>

      <PengaturanUsahaForm
        usahaId={usahaId}
        namaAwal={usaha?.nama ?? ""}
        alamatAwal={usaha?.alamat ?? ""}
        jamOperasionalAwal={usaha?.jam_operasional ?? ""}
        logoUrlAwal={usahaLogo?.logo_url ?? null}
      />
    </main>
  );
}
