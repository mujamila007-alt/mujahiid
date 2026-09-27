# MUJA PRIME Professional Upgrade

Versi ini mempertahankan fungsi bisnis lama, tetapi menambahkan lapisan UI/UX responsif dan beberapa penguatan fungsi frontend.

## Perubahan utama

- Layout desktop dibuat lebih proporsional dengan lebar konten konsisten.
- Bottom navigation hanya tampil di mobile, tidak lagi memenuhi desktop.
- Header, search, sidebar, hero, kategori, product grid, card, footer, modal, tabel, dan form dirapikan.
- Product grid desktop menjadi 4 kolom dan mobile 2 kolom.
- Halaman detail produk memakai layout 2 kolom di desktop dan kembali 1 kolom di mobile.
- Halaman akun, pembayaran, halaman legal, dan admin mendapat batas lebar dan spacing yang lebih rapi.
- Kontras background dikurangi agar efek aurora lama tidak menutupi konten.
- Active state bottom navigation otomatis mengikuti halaman aktif.
- Escape dapat menutup sidebar/overlay yang mendukung close handler.
- Ada notifikasi status offline/online.
- Gambar memakai lazy loading dan async decode saat memungkinkan.
- Request database READ mempunyai timeout 15 detik dan retry satu kali untuk gangguan sementara. Request WRITE tidak di-retry agar tidak membuat transaksi ganda.
- Polling snapshot berhenti sementara ketika tab browser tidak aktif.
- Header keamanan dasar Vercel ditambahkan: `X-Content-Type-Options` dan `Referrer-Policy`.
- `.gitignore` diperkuat agar `.env`, `.vercel`, `node_modules`, dan Service Account Firebase tidak masuk GitHub.

## File baru

- `professional.css`
- `professional-ui.js`
- `.env.example`

Semua halaman HTML sudah memuat `professional.css` dan `professional-ui.js` paling akhir di bagian `<head>` agar berfungsi sebagai compatibility/upgrade layer tanpa menghapus kode lama.

## Menjalankan lokal

Dari PowerShell di folder project:

```powershell
$env:DATABASE_URL='DATABASE_URL_NEON_ANDA'
vercel.cmd dev
```

Buka:

```text
http://localhost:3000
```

## Deploy

Setelah pengujian lokal selesai, commit/push seluruh source code ke GitHub. Jangan upload:

- `.env.local`
- folder `.vercel`
- `serviceAccountKey.json`
- file Firebase Admin SDK JSON lainnya
- `node_modules`

Vercel akan deploy otomatis dari repository yang sudah terhubung.
