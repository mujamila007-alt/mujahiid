# Muja Prime — Firestore + Neon Images

Data utama aplikasi sekarang memakai **Cloud Firestore**. Neon hanya dipakai untuk nilai gambar (`imageUrl`, `paymentProof`, foto profil, banner, dan field gambar lain). Firebase Storage tidak digunakan.

## Environment Variables di Vercel

Pertahankan variabel admin yang sudah ada, lalu tambahkan:

```text
FIREBASE_PROJECT_ID=id-project-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
DATABASE_URL=postgresql://...neon...
```

Alternatifnya, kredensial Firebase dapat diisi sebagai satu variabel:

```text
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Jangan menaruh service account di file publik atau HTML.

## Memindahkan data lama dari Neon

Jalankan satu kali sebelum deployment final:

```bash
npm install
npm run migrate:to-firestore
```

Skrip membaca tabel lama `muja_documents`, mengirim data non-gambar ke Firestore, dan memindahkan field gambar ke tabel `muja_images` di Neon. Tabel lama tidak dihapus sehingga masih ada cadangan.

## Deployment

1. Masukkan environment variables ke Vercel untuk Production, Preview, dan Development sesuai kebutuhan.
2. Jalankan migrasi satu kali.
3. Deploy proyek.
4. Buka `/api/health`; hasil benar menampilkan `"database":"firestore"` dan `"imageStorage":"neon"`.

## Perbaikan link status pesanan

- Link pesanan baru berlaku selama tujuh hari.
- Refresh, kembali dari WhatsApp/Canva, pemulihan tab Chrome, atau membuka ulang link tidak lagi menampilkan pesan “Link Sudah Digunakan”.
- Token yang sudah diproses tetap dapat menampilkan status berhasil, tetapi aktivasi dan poin tidak dijalankan dua kali.
- Penguncian token memakai versi dokumen Firestore untuk mencegah dua tab memproses token yang sama secara bersamaan.
