"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { pengaturanUsahaSchema } from "@/lib/schemas/usaha";
import { validasiLogo } from "@/lib/core";

type PengaturanUsahaFormProps = {
  usahaId: string;
  namaAwal: string;
  alamatAwal: string;
  jamOperasionalAwal: string;
  logoUrlAwal: string | null;
};

export function PengaturanUsahaForm({
  usahaId,
  namaAwal,
  alamatAwal,
  jamOperasionalAwal,
  logoUrlAwal,
}: PengaturanUsahaFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState(namaAwal);
  const [alamat, setAlamat] = useState(alamatAwal);
  const [jamOperasional, setJamOperasional] = useState(jamOperasionalAwal);
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrlAwal);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSukses(false);
    if (!file) {
      setLogoFile(null);
      return;
    }
    const pesan = validasiLogo(file);
    if (pesan) {
      setError(pesan);
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSukses(false);

    const parsed = pengaturanUsahaSchema.safeParse({ nama, alamat, jam_operasional: jamOperasional });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: dbError } = await supabase
      .from("usaha")
      .update({
        nama: parsed.data.nama,
        alamat: parsed.data.alamat || null,
        jam_operasional: parsed.data.jam_operasional || null,
      })
      .eq("id", usahaId);

    if (dbError) {
      setLoading(false);
      setError("Gagal menyimpan profil warung. Coba lagi.");
      return;
    }

    if (logoFile) {
      const path = `${usahaId}/logo`;
      const { error: uploadError } = await supabase.storage
        .from("logo-usaha")
        .upload(path, logoFile, { upsert: true });

      if (uploadError) {
        setLoading(false);
        // Data warung (nama/alamat/jam) sudah tersimpan di atas — cuma logo yang gagal,
        // jadi bukan error fatal. Kemungkinan besar: bucket "logo-usaha" belum dibuat
        // (migrasi belum dijalankan di Supabase).
        setError("Nama/alamat tersimpan, tapi gagal upload logo. Pastikan migrasi Pengaturan sudah dijalankan.");
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("logo-usaha").getPublicUrl(path);
      // Tambah query param acak supaya browser tidak menampilkan logo lama dari cache
      // (path selalu sama: {usahaId}/logo, jadi URL publiknya juga selalu sama persis).
      const logoUrlBaru = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      await supabase.from("usaha").update({ logo_url: logoUrlBaru }).eq("id", usahaId);
    }

    setLoading(false);
    setSukses(true);
    setLogoFile(null);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-4 rounded-2xl bg-white p-4 shadow dark:bg-neutral-900"
    >
      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Logo warung</span>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL logo dari Supabase Storage (domain dinamis)
            <img
              src={logoPreview}
              alt="Logo warung"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border border-neutral-200 object-cover dark:border-neutral-700"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700 dark:bg-neutral-800 dark:text-brand-300">
              Belum ada
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleLogoChange}
            className="block text-sm text-neutral-700 dark:text-neutral-300"
          />
        </div>
      </div>

      <div>
        <label htmlFor="usaha-nama" className="mb-1 block text-sm font-medium dark:text-neutral-200">Nama warung</label>
        <input
          id="usaha-nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="usaha-alamat" className="mb-1 block text-sm font-medium dark:text-neutral-200">Alamat</label>
        <input
          id="usaha-alamat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="usaha-jam" className="mb-1 block text-sm font-medium dark:text-neutral-200">Jam operasional</label>
        <input
          id="usaha-jam"
          value={jamOperasional}
          onChange={(e) => setJamOperasional(e.target.value)}
          placeholder="Contoh: 24 jam"
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {sukses && !error && <p className="text-sm text-emerald-700 dark:text-emerald-400">Profil warung tersimpan.</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-lg bg-brand-600 px-4 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}
