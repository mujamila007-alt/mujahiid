-- ============================================================
-- SETUP SUPABASE STORAGE UNTUK PORTAL BLK
-- Jalankan SELURUH isi file ini di:
-- Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

-- 1. Buat bucket publik untuk file materi dan contoh foto.
-- Maksimal file bucket 50 MB agar masih sesuai batas maksimum Free Plan.
insert into storage.buckets (id, name, public, file_size_limit)
values ('blk-assets', 'blk-assets', true, 52428800)
on conflict (id) do update
set public = true,
    file_size_limit = 52428800;

-- 2. Hapus policy lama dengan nama yang sama jika setup dijalankan ulang.
drop policy if exists "BLK admin can view objects" on storage.objects;
drop policy if exists "BLK admin can upload objects" on storage.objects;
drop policy if exists "BLK admin can update objects" on storage.objects;
drop policy if exists "BLK admin can delete objects" on storage.objects;

-- 3. Hanya user Supabase Auth yang sudah login yang boleh mengelola file.
-- Peserta tidak login ke Supabase, jadi tidak memiliki hak upload/edit/hapus.
create policy "BLK admin can view objects"
on storage.objects
for select
to authenticated
using (bucket_id = 'blk-assets');

create policy "BLK admin can upload objects"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'blk-assets');

create policy "BLK admin can update objects"
on storage.objects
for update
to authenticated
using (bucket_id = 'blk-assets')
with check (bucket_id = 'blk-assets');

create policy "BLK admin can delete objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'blk-assets');

-- Bucket dibuat PUBLIC hanya agar foto/file dapat dibuka oleh peserta melalui URL.
-- Hak upload, update, dan delete tetap dibatasi oleh policy authenticated di atas.
