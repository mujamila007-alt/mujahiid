# Admin BLK Fix

## Masalah lama
Halaman live yang ditunjukkan memakai Firebase email-link authentication dan menampilkan pesan bahwa domain website belum diizinkan di Firebase Authentication. Source `/admin-blk` juga tidak terdapat di arsip project ini.

## Perbaikan pada project ini
- Menambahkan `/admin-blk/` baru dengan UI responsif + animasi.
- Login memakai endpoint server-side yang sudah ada: `/api/auth/login` dan cookie sesi HttpOnly.
- Tidak lagi bergantung pada Firebase Authorized Domains untuk login BLK.
- Menggunakan akun yang sama dengan admin utama (`ADMIN_EMAIL` + `ADMIN_PASSWORD`).
- Menambahkan koleksi Firestore admin-only: `blk_modules`, `blk_files`, `blk_notes`, `blk_participants`.
- Menambahkan CRUD untuk modul, file, catatan, dan peserta.

## Environment Variables Vercel yang wajib ada
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET` (minimal 24 karakter)
- Firebase Admin variables yang sudah dipakai API database project (`FIREBASE_SERVICE_ACCOUNT_JSON` atau kombinasi `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

Setelah deploy, buka `/admin-blk/` dan login dengan akun admin yang sama dengan panel utama.
