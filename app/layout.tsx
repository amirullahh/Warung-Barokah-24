import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Warung Madura Barokah 24 — Perencana Keuangan",
  description: "Aplikasi pencatatan & perencana keuangan UMKM Warung Madura Barokah 24",
};

// Skrip anti-FOUC: pasang class "dark" ke <html> SEBELUM React hydrate / halaman sempat
// ke-paint, supaya user yang sudah pilih dark mode gak lihat kedipan putih sekilas dulu.
// Logikanya sengaja dibuat identik dengan lib/theme.ts#tentukanThemeAwal (yang di-unit-test) —
// tidak bisa import module TS langsung di sini karena harus jalan sebagai skrip polos paling
// awal, jadi diulis manual dalam JS biasa dan wajib diubah bareng kalau logikanya berubah.
const ANTI_FOUC_THEME_SCRIPT = `
(function () {
  try {
    var tersimpan = localStorage.getItem("theme");
    var sistemGelap = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var gelap = tersimpan === "dark" || tersimpan === "light" ? tersimpan === "dark" : sistemGelap;
    if (gelap) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC_THEME_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
