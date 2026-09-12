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


-- ============================================
-- Tambahan: RLS policies, is_owner helper, index, check, views
-- (melengkapi schema.sql — jalankan setelah blok di atas, tidak mengubah tabel yang sudah ada)
-- ============================================

create or replace function is_owner(p_usaha uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from anggota_usaha a where a.usaha_id = p_usaha and a.user_id = auth.uid() and a.role = 'owner'
  ) or exists (
    select 1 from usaha u where u.id = p_usaha and u.owner_id = auth.uid()
  );
$$;

create policy "self read profiles" on profiles for select using (id = auth.uid());
create policy "self update profiles" on profiles for update using (id = auth.uid());
create policy "self insert profiles" on profiles for insert with check (id = auth.uid());

create policy "member read usaha" on usaha for select using (is_member(id));
create policy "owner update usaha" on usaha for update using (is_owner(id));
create policy "owner delete usaha" on usaha for delete using (is_owner(id));
create policy "owner insert usaha" on usaha for insert with check (owner_id = auth.uid());

create policy "member read anggota_usaha" on anggota_usaha for select using (is_member(usaha_id));
create policy "owner insert anggota_usaha" on anggota_usaha for insert with check (is_owner(usaha_id));
create policy "owner update anggota_usaha" on anggota_usaha for update using (is_owner(usaha_id));
create policy "owner delete anggota_usaha" on anggota_usaha for delete using (is_owner(usaha_id));

create policy "member read kategori" on kategori for select using (is_member(usaha_id));
create policy "member insert kategori" on kategori for insert with check (is_member(usaha_id));
create policy "member update kategori" on kategori for update using (is_member(usaha_id));
create policy "owner delete kategori" on kategori for delete using (is_owner(usaha_id));

create policy "member read transaksi" on transaksi for select using (is_member(usaha_id));
create policy "member insert transaksi" on transaksi for insert with check (is_member(usaha_id));
create policy "member update transaksi" on transaksi for update using (is_member(usaha_id));
create policy "owner delete transaksi" on transaksi for delete using (is_owner(usaha_id));

create policy "member read budget" on budget for select using (is_member(usaha_id));
create policy "owner insert budget" on budget for insert with check (is_owner(usaha_id));
create policy "owner update budget" on budget for update using (is_owner(usaha_id));
create policy "owner delete budget" on budget for delete using (is_owner(usaha_id));

create policy "member read hutang_piutang" on hutang_piutang for select using (is_member(usaha_id));
create policy "member insert hutang_piutang" on hutang_piutang for insert with check (is_member(usaha_id));
create policy "member update hutang_piutang" on hutang_piutang for update using (is_member(usaha_id));
create policy "owner delete hutang_piutang" on hutang_piutang for delete using (is_owner(usaha_id));

create policy "member read produk" on produk for select using (is_member(usaha_id));
create policy "owner insert produk" on produk for insert with check (is_owner(usaha_id));
create policy "owner update produk" on produk for update using (is_owner(usaha_id));
create policy "owner delete produk" on produk for delete using (is_owner(usaha_id));

create policy "member read stok_gerak" on stok_gerak for select using (is_member(usaha_id));
create policy "member insert stok_gerak" on stok_gerak for insert with check (is_member(usaha_id));
create policy "owner update stok_gerak" on stok_gerak for update using (is_owner(usaha_id));
create policy "owner delete stok_gerak" on stok_gerak for delete using (is_owner(usaha_id));

create index idx_budget_usaha_bulan on budget(usaha_id, bulan);

alter table transaksi add constraint chk_transaksi_tanggal check (tanggal <= current_date + interval '1 day');
alter table stok_gerak add constraint chk_stok_tanggal check (tanggal <= current_date + interval '1 day');

-- security_invoker=true WAJIB di Postgres 15+/Supabase, supaya view ikut tunduk RLS
-- pemanggilnya (tanpa ini, view jalan dengan privilege pembuat view & bisa BOCOR data antar usaha).
create or replace view v_laba_harian with (security_invoker = true) as
select usaha_id, tanggal,
  sum(case when tipe = 'masuk' then nominal else 0 end) as masuk,
  sum(case when tipe = 'keluar' then nominal else 0 end) as keluar,
  sum(case when tipe = 'masuk' then nominal else -nominal end) as laba
from transaksi
group by usaha_id, tanggal;

create or replace view v_budget_realisasi with (security_invoker = true) as
select b.usaha_id, b.bulan, b.kategori_id, b.pagu,
  coalesce(sum(t.nominal), 0) as terpakai
from budget b
left join transaksi t
  on t.usaha_id = b.usaha_id
  and t.kategori_id = b.kategori_id
  and t.tipe = 'keluar'
  and date_trunc('month', t.tanggal) = b.bulan
group by b.usaha_id, b.bulan, b.kategori_id, b.pagu;

create or replace view v_stok_sisa with (security_invoker = true) as
select p.usaha_id, p.id as produk_id, p.nama, p.satuan, p.stok_minimum,
  coalesce(sum(case when s.arah = 'masuk' then s.qty else -s.qty end), 0) as sisa,
  coalesce(sum(case when s.arah = 'masuk' then s.qty else -s.qty end), 0) <= p.stok_minimum as menipis
from produk p
left join stok_gerak s on s.produk_id = p.id
group by p.usaha_id, p.id, p.nama, p.satuan, p.stok_minimum;
