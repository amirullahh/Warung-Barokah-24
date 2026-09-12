"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Wallet, Package, HandCoins, FileText, type LucideIcon } from "lucide-react";
import { NAV_ITEMS, isNavActive } from "@/lib/nav";

const ICON_MAP: Record<string, LucideIcon> = {
  "/": Home,
  "/transaksi": Receipt,
  "/budget": Wallet,
  "/stok": Package,
  "/hutang": HandCoins,
  "/laporan": FileText,
};

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Navigasi utama"
        className="print:hidden hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:border-neutral-200 md:bg-white md:p-4"
      >
        <p className="mb-2 px-2 text-sm font-bold text-amber-900">Barokah 24</p>
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.href];
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 font-medium ${
                active ? "bg-amber-600 text-white" : "text-neutral-700 hover:bg-amber-50"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav
        aria-label="Navigasi utama"
        className="print:hidden fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-200 bg-white md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.href];
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                active ? "text-amber-700" : "text-neutral-500"
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
