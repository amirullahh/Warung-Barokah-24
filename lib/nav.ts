export type NavItem = { href: string; label: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/transaksi", label: "Transaksi" },
  { href: "/budget", label: "Budget" },
  { href: "/stok", label: "Stok" },
  { href: "/hutang", label: "Hutang" },
  { href: "/laporan", label: "Laporan" },
];

// href === "/" tetap ditangani khusus (exact-match, tidak prefix-match) walau saat ini
// tidak ada item nav yang memakainya lagi ("/" sekarang landing page publik) — fungsi ini
// generik dan dipertahankan supaya benar juga kalau dipakai di luar NAV_ITEMS.
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
