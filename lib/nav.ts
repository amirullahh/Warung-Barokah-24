export type NavItem = { href: string; label: string };

export const NAV_ITEM_PENGATURAN: NavItem = { href: "/pengaturan", label: "Pengaturan" };

// Pengaturan (profil usaha: nama/alamat/logo) cuma relevan & bisa diedit owner (RLS
// "owner update usaha" di schema.sql) — disembunyikan dari nav kasir, bukan cuma dilarang
// di server. Dipisah dari NAV_ITEMS (bukan dimasukkan langsung) supaya NAV_ITEMS tetap jadi
// daftar menu inti yang sama untuk semua role, dan gampang di-unit-test terpisah.
export function navItemsUntukRole(role: string | undefined): NavItem[] {
  return role === "owner" ? [...NAV_ITEMS, NAV_ITEM_PENGATURAN] : NAV_ITEMS;
}

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
