MUJA AI FIX - RATE LIMIT / OFFLINE PALSU

Timpa 3 file berikut di project/GitHub:
1. api/ai.js
2. ai-chat-global.js
3. ai-web-config.js

Lalu commit dan tunggu Vercel deploy otomatis.
GROQ_API_KEY tidak perlu diganti jika masih valid.

Perbaikan:
- model server: openai/gpt-oss-20b
- prompt MujaPrime dipadatkan agar jauh lebih hemat token
- history chat dibatasi ke 2 putaran terakhir
- output AI dibatasi agar TPM lebih hemat
- klik kirim ganda dicegah
- error 429 ditampilkan sebagai "AI sedang sibuk", bukan "offline"
- timeout dan error auth/config dibedakan
