"use client";

import { useRef, useState } from "react";
import { validasiStruk } from "@/lib/core";

type ReceiptUploadProps = {
  onFileSelected: (file: File | null) => void;
};

export function ReceiptUpload({ onFileSelected }: ReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [namaFile, setNamaFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setNamaFile(null);
      setError(null);
      onFileSelected(null);
      return;
    }
    const pesan = validasiStruk(file);
    if (pesan) {
      setError(pesan);
      setNamaFile(null);
      onFileSelected(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError(null);
    setNamaFile(file.name);
    onFileSelected(file);
  }

  return (
    <div>
      <label htmlFor="struk-file" className="mb-1 block text-sm font-medium dark:text-neutral-200">
        Foto struk (opsional)
      </label>
      <input
        id="struk-file"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="block w-full text-sm dark:text-neutral-300"
      />
      {namaFile && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Terpilih: {namaFile}</p>}
      {error && <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
