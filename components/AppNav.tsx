"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Wallet, Package, HandCoins, FileText, Settings, type LucideIcon } from "lucide-react";
import { navItemsUntukRole, isNavActive } from "@/lib/nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";

const ICON_MAP: Record<string, LucideIcon> = {
  "/dashboard": Home,
  "/transaksi": Receipt,
  "/budget": Wallet,
  "/stok": Package,
  "/hutang": HandCoins,
  "/laporan": FileText,
  "/pengaturan": Settings,
};

type AppNavProps = {
  role?: string;
  namaUsaha?: string;
  logoUrl?: string | null;
};

export function AppNav({ role, namaUsaha, logoUrl }: AppNavProps) {
  const pathname = usePathname();
  const items = navItemsUntukRole(role);
  const nama = namaUsaha ?? "Barokah 24";

  return (
    <>
      <nav
        aria-label="Navigasi utama"
        className="print:hidden hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col md:border-r md:border-neutral-200 md:bg-white dark:md:border-neutral-800 dark:md:bg-neutral-900"
      >
        <div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-4">
          {logoUrl ? (
            // URL logo dari Supabase Storage (domain dinamis per-project), <img> polos
            // menghindari perlu setup next/image remotePatterns untuk satu logo kecil ini.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full border border-white/40 object-cover"
            />
          ) : null}
          <p className="truncate text-sm font-bold text-white">{nama}</p>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = ICON_MAP[item.href];
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 font-medium transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-neutral-700 hover:bg-brand-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800">
          <ThemeToggle />
          <LogoutButton className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800" />
        </div>
      </nav>

      {/* Mobile: toggle tema mengambang di kanan atas — sidebar desktop di atas gak kelihatan di layar kecil */}
      <div className="print:hidden fixed right-3 top-3 z-30 md:hidden">
        <ThemeToggle />
      </div>

      <nav
        aria-label="Navigasi utama"
        className="print:hidden fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:hidden"
      >
        {items.map((item) => {
          const Icon = ICON_MAP[item.href];
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                active ? "text-brand-700 dark:text-brand-300" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
