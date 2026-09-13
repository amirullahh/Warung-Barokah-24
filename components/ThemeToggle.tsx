"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { tentukanThemeAwal, type Theme } from "@/lib/theme";

// Tombol ganti tema. Nilai awal ditentukan lagi di sini (bukan cuma di skrip anti-FOUC
// app/layout.tsx) supaya komponen ini konsisten kalau dipakai/di-mount di halaman mana pun,
// dan supaya logikanya (tentukanThemeAwal) tetap satu sumber yang di-unit-test.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    let tersimpan: string | null = null;
    try {
      tersimpan = localStorage.getItem("theme");
    } catch {
      // localStorage bisa gak tersedia (mode privat dll) — aman diabaikan, fallback ke sistem.
    }
    const sistemGelap = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(tentukanThemeAwal(tersimpan, sistemGelap));
    setSiap(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Aman diabaikan — toggle tetap berfungsi untuk sesi ini, cuma tidak tersimpan.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={siap && theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {siap && theme === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
