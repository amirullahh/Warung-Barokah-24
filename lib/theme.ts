// Logika pure penentu tema awal — dipakai baik oleh script anti-FOUC di <head>
// (app/layout.tsx, ditulis ulang manual dalam JS polos karena harus jalan sebelum
// hydration/tanpa import module) maupun oleh ThemeToggle.tsx saat mount. Konvensi kunci
// localStorage: "theme", nilai "dark" | "light".
export type Theme = "dark" | "light";

export function tentukanThemeAwal(
  tersimpan: string | null,
  sistemLebihSukaGelap: boolean
): Theme {
  if (tersimpan === "dark" || tersimpan === "light") return tersimpan;
  return sistemLebihSukaGelap ? "dark" : "light";
}
