-- Seed MVP — jalankan SETELAH schema.sql lengkap DAN setelah 2 user demo
-- (owner@barokah.test, kasir@barokah.test) dibuat manual di Supabase Dashboard
-- -> Authentication -> Add user. Ganti UUID di bawah dengan UUID asli mereka
-- (dapat dilihat di Authentication -> Users setelah dibuat).

insert into profiles (id, nama) values
  ('00000000-0000-0000-0000-000000000001', 'Pak Barokah (Owner)'), -- GANTI UUID
  ('00000000-0000-0000-0000-000000000002', 'Kasir Pagi'); -- GANTI UUID

insert into usaha (id, owner_id, nama, alamat, jam_operasional) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Warung Madura Barokah 24', 'Slipi, Kemanggisan, Palmerah, Jakarta Barat', '24 jam');

insert into anggota_usaha (usaha_id, user_id, role) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'kasir');

insert into kategori (usaha_id, nama, tipe) values
  ('10000000-0000-0000-0000-000000000001', 'Jual Rokok', 'masuk'),
  ('10000000-0000-0000-0000-000000000001', 'Jual Mie/Snack', 'masuk'),
  ('10000000-0000-0000-0000-000000000001', 'Jual Kopi/Minuman', 'masuk'),
  ('10000000-0000-0000-0000-000000000001', 'Jual Pulsa/PPOB', 'masuk'),
  ('10000000-0000-0000-0000-000000000001', 'Beli Stok Mie/Snack', 'keluar'),
  ('10000000-0000-0000-0000-000000000001', 'Beli Stok Kopi', 'keluar'),
  ('10000000-0000-0000-0000-000000000001', 'Gas & Listrik', 'keluar'),
  ('10000000-0000-0000-0000-000000000001', 'Lain-lain', 'keluar');

insert into produk (usaha_id, nama, satuan, stok_minimum) values
  ('10000000-0000-0000-0000-000000000001', 'Mie Instan', 'bungkus', 20),
  ('10000000-0000-0000-0000-000000000001', 'Kopi Sachet', 'bungkus', 15),
  ('10000000-0000-0000-0000-000000000001', 'Gas 3kg', 'tabung', 2),
  ('10000000-0000-0000-0000-000000000001', 'Telur', 'kg', 3),
  ('10000000-0000-0000-0000-000000000001', 'Beras', 'kg', 5);

insert into budget (usaha_id, bulan, kategori_id, pagu)
select '10000000-0000-0000-0000-000000000001', date_trunc('month', current_date), id, 1500000
from kategori where usaha_id = '10000000-0000-0000-0000-000000000001' and tipe = 'keluar';

insert into hutang_piutang (usaha_id, arah, pihak, nominal, sisa, status, jatuh_tempo) values
  ('10000000-0000-0000-0000-000000000001', 'piutang', 'Bpk. A (tetangga)', 50000, 50000, 'tempo', current_date + 7),
  ('10000000-0000-0000-0000-000000000001', 'piutang', 'Ibu B (warga)', 30000, 30000, 'tempo', current_date + 3),
  ('10000000-0000-0000-0000-000000000001', 'hutang', 'Agen Mie Grosir', 200000, 200000, 'tempo', current_date + 14),
  ('10000000-0000-0000-0000-000000000001', 'hutang', 'Agen Gas', 100000, 0, 'lunas', current_date - 2);

-- 50 transaksi 30 hari terakhir + 20 gerakan stok: dibuat via script generator
-- (scripts/generate-seed-data.ts) di sub-project data-seed berikutnya, supaya nominal &
-- tanggalnya realistis mengikuti pola warung (bukan ditulis manual 50 baris di sini).
-- Butuh UUID asli dari auth.users setelah 2 akun demo dibuat.
