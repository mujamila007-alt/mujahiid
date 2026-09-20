-- OPSIONAL: jalankan sekali setelah versi Firebase Login + Vercel API sudah aktif.
-- Ini menutup akses upload/hapus langsung dari Supabase Auth.
-- File publik tetap bisa dilihat karena bucket blk-assets tetap public.

drop policy if exists "BLK admin can upload objects" on storage.objects;
drop policy if exists "BLK admin can update objects" on storage.objects;
drop policy if exists "BLK admin can delete objects" on storage.objects;
