-- Schema MVP Warung Madura Barokah (Supabase Postgres)
-- Jalankan berurutan di SQL Editor.

create extension if not exists "pgcrypto";

-- profiles terhubung ke auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  created_at timestamptz default now()
);

create table usaha (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  nama text not null default 'Warung Madura Barokah 24',
  alamat text default 'Slipi, Kemanggisan, Palmerah, Jakarta Barat',
  jam_operasional text default '24 jam',
  created_at timestamptz default now()
);

create table anggota_usaha (
  usaha_id uuid references usaha(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null check (role in ('owner','kasir')),
  primary key (usaha_id, user_id)
);

create table kategori (
  id uuid primary key default gen_random_uuid(),
  usaha_id uuid not null references usaha(id) on delete cascade,
  nama text not null,
  tipe text not null check (tipe in ('masuk','keluar')),
  unique(usaha_id, nama, tipe)
);

create table transaksi (
  id uuid primary key default gen_random_uuid(),
  usaha_id uuid not null references usaha(id) on delete cascade,
  tanggal date not null default current_date,
  tipe text not null check (tipe in ('masuk','keluar')),
  kategori_id uuid references kategori(id),
  nominal integer not null check (nominal > 0),
  keterangan text,
  bukti_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create index idx_trx_usaha_tgl on transaksi(usaha_id, tanggal desc);
create index idx_trx_usaha_kat on transaksi(usaha_id, kategori_id);

create table budget (
  id uuid primary key default gen_random_uuid(),
  usaha_id uuid not null references usaha(id) on delete cascade,
  bulan date not null,
  kategori_id uuid not null references kategori(id) on delete cascade,
  pagu integer not null check (pagu > 0),
  unique(usaha_id, bulan, kategori_id)
);

create table hutang_piutang (
  id uuid primary key default gen_random_uuid(),
  usaha_id uuid not null references usaha(id) on delete cascade,
  arah text not null check (arah in ('hutang','piutang')),
  pihak text not null,
  nominal integer not null check (nominal > 0),
  sisa integer not null check (sisa >= 0),
  status text not null default 'tempo' check (status in ('tempo','lunas')),
  jatuh_tempo date,
  transaksi_lunas_id uuid references transaksi(id),
  created_at timestamptz default now()
);

-- Stok ringan (tanpa FIFO, cukup masuk/keluar + sisa)
create table produk (
  id uuid primary key default gen_random_uuid(),
  usaha_id uuid not null references usaha(id) on delete cascade,
  nama text not null,
  satuan text not null default 'pcs',
  stok_minimum integer not null default 5 check (stok_minimum >= 0),
  unique(usaha_id, nama)
);

create table stok_gerak (
  id uuid primary key default gen_random_uuid(),
  usaha_id uuid not null references usaha(id) on delete cascade,
  produk_id uuid not null references produk(id) on delete cascade,
  tanggal date not null default current_date,
  arah text not null check (arah in ('masuk','keluar')),
  qty integer not null check (qty > 0),
  transaksi_id uuid references transaksi(id),
  keterangan text,
  created_at timestamptz default now()
);
create index idx_stok_usaha_produk_tgl on stok_gerak(usaha_id, produk_id, tanggal desc);

-- RLS
alter table profiles enable row level security;
alter table usaha enable row level security;
alter table anggota_usaha enable row level security;
alter table kategori enable row level security;
alter table transaksi enable row level security;
alter table budget enable row level security;
alter table hutang_piutang enable row level security;
alter table produk enable row level security;
alter table stok_gerak enable row level security;

-- Helper membership
create or replace function is_member(p_usaha uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from anggota_usaha a where a.usaha_id = p_usaha and a.user_id = auth.uid()
  ) or exists (
    select 1 from usaha u where u.id = p_usaha and u.owner_id = auth.uid()
  );
$$;

-- Policy contoh (ulangi per tabel): member bisa baca/tulis dasar
-- create policy "member read transaksi" on transaksi for select using (is_member(usaha_id));
-- create policy "member insert transaksi" on transaksi for insert with check (is_member(usaha_id));
-- Budget write owner-only: cek anggota_usaha.role='owner' atau owner_id. (Lengkapi di Supabase.)
