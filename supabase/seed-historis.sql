-- Data historis 30 hari terakhir — di-generate via scripts/generate-seed-data.ts
-- (lib/seed/generateHistoris.ts, seed PRNG deterministik). Lih. DESIGN-09-SEED-HISTORIS.md.

-- 1) transaksi (yang jadi pasangan restock via CTE muncul di bagian 3, bukan di sini)
insert into transaksi (usaha_id, tanggal, tipe, kategori_id, nominal, keterangan, created_by) values
  ('10000000-0000-0000-0000-000000000001', '2026-08-14', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 4364, 'Penjualan kopi & minuman', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-16', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 5008, 'Penjualan mie instan & snack', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-16', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 67290, 'Penjualan pulsa & token PPOB', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-16', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Lain-lain'), 54245, 'Pengeluaran operasional lain-lain', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-17', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 31346, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-17', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas & Listrik'), 42455, 'Isi ulang gas / bayar token listrik', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-18', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 5163, 'Penjualan mie instan & snack', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-19', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 13196, 'Penjualan mie instan & snack', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-20', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 51544, 'Penjualan pulsa & token PPOB', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-20', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 67068, 'Penjualan pulsa & token PPOB', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-21', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 77607, 'Penjualan pulsa & token PPOB', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-22', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 57936, 'Penjualan pulsa & token PPOB', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-22', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas & Listrik'), 96809, 'Isi ulang gas / bayar token listrik', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-23', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 22495, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-23', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 92309, 'Penjualan pulsa & token PPOB', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-23', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Lain-lain'), 48714, 'Pengeluaran operasional lain-lain', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-26', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 6680, 'Penjualan mie instan & snack', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-27', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 20270, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-27', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 12389, 'Penjualan mie instan & snack', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-27', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 9775, 'Penjualan kopi & minuman', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-28', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 26364, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-28', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 23010, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-28', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 23210, 'Penjualan mie instan & snack', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-29', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 9153, 'Penjualan mie instan & snack', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-29', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 11035, 'Penjualan kopi & minuman', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-08-30', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 14561, 'Penjualan kopi & minuman', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-01', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 4323, 'Penjualan kopi & minuman', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-01', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas & Listrik'), 107461, 'Isi ulang gas / bayar token listrik', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-03', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 8122, 'Penjualan mie instan & snack', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-04', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 28695, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-04', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Lain-lain'), 19803, 'Pengeluaran operasional lain-lain', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-05', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 21834, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-06', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 27320, 'Penjualan rokok', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-06', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 24405, 'Penjualan mie instan & snack', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-06', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 49090, 'Penjualan pulsa & token PPOB', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-07', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Mie/Snack'), 7950, 'Penjualan mie instan & snack', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-07', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 9604, 'Penjualan kopi & minuman', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-09', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 5706, 'Penjualan kopi & minuman', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-10', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 28243, 'Penjualan rokok', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-10', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 11920, 'Penjualan kopi & minuman', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-10', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Pulsa/PPOB'), 72623, 'Penjualan pulsa & token PPOB', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-10', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas & Listrik'), 71390, 'Isi ulang gas / bayar token listrik', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-11', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Rokok'), 28765, 'Penjualan rokok', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-11', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 3595, 'Penjualan kopi & minuman', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-11', 'masuk', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Jual Kopi/Minuman'), 9115, 'Penjualan kopi & minuman', '73a00cc2-c91e-489e-8965-2cadd6e7ac30'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-11', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beli Stok Kopi'), 279199, 'Restock kopi sachet dari agen', '2c3bca3a-44ee-472e-8c64-59088816f4d7'),
  ('10000000-0000-0000-0000-000000000001', '2026-09-12', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beli Stok Mie/Snack'), 274732, 'Restock mie instan & snack dari agen', '73a00cc2-c91e-489e-8965-2cadd6e7ac30');

-- 2) stok_gerak yang TIDAK terkait transaksi (restock lepas / terjual-dipakai)
insert into stok_gerak (usaha_id, produk_id, tanggal, arah, qty, keterangan) values
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Mie Instan'), '2026-09-05', 'keluar', 15, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Mie Instan'), '2026-09-07', 'keluar', 12, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Mie Instan'), '2026-08-19', 'keluar', 10, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Mie Instan'), '2026-08-22', 'keluar', 5, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Kopi Sachet'), '2026-09-11', 'masuk', 15, 'Restock tambahan'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Kopi Sachet'), '2026-09-02', 'keluar', 10, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Kopi Sachet'), '2026-08-23', 'keluar', 8, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas 3kg'), '2026-09-03', 'masuk', 6, 'Restock gas 3kg'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas 3kg'), '2026-08-16', 'keluar', 2, 'Terjual ke pelanggan'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas 3kg'), '2026-09-10', 'keluar', 2, 'Terjual ke pelanggan'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Gas 3kg'), '2026-09-10', 'keluar', 2, 'Terjual ke pelanggan'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Telur'), '2026-08-28', 'masuk', 6, 'Restock telur'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Telur'), '2026-08-29', 'keluar', 2, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Telur'), '2026-08-18', 'keluar', 2, 'Terjual'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beras'), '2026-09-01', 'masuk', 20, 'Restock beras'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beras'), '2026-09-04', 'masuk', 10, 'Restock beras'),
  ('10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beras'), '2026-08-29', 'keluar', 10, 'Terjual');

-- 3) pasangan beli-stok -> stok masuk, transaksi_id di-link via data-modifying CTE (pola STK-02)
with trx as (
  insert into transaksi (usaha_id, tanggal, tipe, kategori_id, nominal, keterangan, created_by)
  values ('10000000-0000-0000-0000-000000000001', '2026-08-30', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beli Stok Mie/Snack'), 374339, 'Restock mie instan & snack dari agen', '73a00cc2-c91e-489e-8965-2cadd6e7ac30')
  returning id
)
insert into stok_gerak (usaha_id, produk_id, tanggal, arah, qty, transaksi_id, keterangan)
select '10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Mie Instan'), '2026-08-30', 'masuk', 40, id, 'Restock dari distributor'
from trx;
with trx as (
  insert into transaksi (usaha_id, tanggal, tipe, kategori_id, nominal, keterangan, created_by)
  values ('10000000-0000-0000-0000-000000000001', '2026-09-04', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beli Stok Mie/Snack'), 418608, 'Restock mie instan & snack dari agen', '2c3bca3a-44ee-472e-8c64-59088816f4d7')
  returning id
)
insert into stok_gerak (usaha_id, produk_id, tanggal, arah, qty, transaksi_id, keterangan)
select '10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Mie Instan'), '2026-09-04', 'masuk', 35, id, 'Restock dari distributor'
from trx;
with trx as (
  insert into transaksi (usaha_id, tanggal, tipe, kategori_id, nominal, keterangan, created_by)
  values ('10000000-0000-0000-0000-000000000001', '2026-08-16', 'keluar', (select id from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Beli Stok Kopi'), 106862, 'Restock kopi sachet dari agen', '2c3bca3a-44ee-472e-8c64-59088816f4d7')
  returning id
)
insert into stok_gerak (usaha_id, produk_id, tanggal, arah, qty, transaksi_id, keterangan)
select '10000000-0000-0000-0000-000000000001', (select id from produk where usaha_id = '10000000-0000-0000-0000-000000000001' and nama = 'Kopi Sachet'), '2026-08-16', 'masuk', 30, id, 'Restock dari distributor'
from trx;

