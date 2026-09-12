# UMKM Warung Madura Barokah — code

Docs lengkap: `Obsidian Vault/Projects/warung_madura_barokah/` (PRD, DESIGN, ARSITEKTUR, DATABASE, GAP-NOVELTY, ROADMAP, TESTING-DEPLOYMENT, SKILLS, CLAUDE).

## Jalankan scaffold penuh (setelah confirm)
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias "@/*"
npm i @supabase/supabase-js @supabase/ssr zod recharts lucide-react
npm i -D vitest
```

## Struktur target
- `app/(auth)/login/page.tsx`, `app/(dashboard)/...`, `app/api/forecast/route.ts`, `app/api/export/route.ts`
- `components/`, `lib/supabase/`, `lib/forecast.ts`, `lib/budget.ts`, `lib/format.ts`
- `supabase/schema.sql`, `supabase/seed.sql`, `tests/`

Lihat `SKILLS-LOCAL.md` untuk skill aktif yang dipakai sesi ini.
