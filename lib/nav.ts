export type NavItem = { href: string; label: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/transaksi", label: "Transaksi" },
  { href: "/budget", label: "Budget" },
  { href: "/stok", label: "Stok" },
  { href: "/hutang", label: "Hutang" },
  { href: "/laporan", label: "Laporan" },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
