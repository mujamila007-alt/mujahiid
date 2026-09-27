/*
  THEME.JS - Mujahiid
  Theme mode + manual multilingual translate + Live Chat AI.
*/

(function () {
  "use strict";

  const THEME_STORAGE_KEY = "muja_theme_mode";
  const LANG_STORAGE_KEY = "muja_language_mode";
  const DEFAULT_THEME = "dark";
  const DEFAULT_LANG = "id";
  const TRANSLATE_ENDPOINTS = [];
  const CHAT_ENDPOINTS = [];
  const TRANSLATE_CACHE_PREFIX = "muja_translate_cache_v3_";

  const LANGUAGES = [
    { code: "id", short: "ID", label: "Indonesia", apiName: "Indonesian", dir: "ltr" },
    { code: "en", short: "EN", label: "English", apiName: "English", dir: "ltr" },
    { code: "ar", short: "AR", label: "العربية", apiName: "Arabic", dir: "rtl" },
    { code: "pt", short: "PT", label: "Português", apiName: "European Portuguese", dir: "ltr" },
    { code: "pt-br", short: "BR", label: "Brasil", apiName: "Brazilian Portuguese", dir: "ltr" },
    { code: "es", short: "ES", label: "Español", apiName: "Spanish", dir: "ltr" },
    { code: "fr", short: "FR", label: "Français", apiName: "French", dir: "ltr" },
    { code: "de", short: "DE", label: "Deutsch", apiName: "German", dir: "ltr" },
    { code: "tr", short: "TR", label: "Türkçe", apiName: "Turkish", dir: "ltr" },
    { code: "hi", short: "HI", label: "हिन्दी", apiName: "Hindi", dir: "ltr" },
    { code: "zh", short: "ZH", label: "中文", apiName: "Simplified Chinese", dir: "ltr" },
    { code: "ja", short: "JA", label: "日本語", apiName: "Japanese", dir: "ltr" },
    { code: "ko", short: "KO", label: "한국어", apiName: "Korean", dir: "ltr" },
    { code: "ms", short: "MS", label: "Melayu", apiName: "Malay", dir: "ltr" }
  ];

  const LANGUAGE_MAP = LANGUAGES.reduce((acc, item) => { acc[item.code] = item; return acc; }, {});

  function resolveMujaEndpoints(filename) {
    const endpoints = [];
    const add = (url) => {
      if (url && !endpoints.includes(url)) endpoints.push(url);
    };

    const customKey = filename.includes("chat") ? "MUJA_AI_ENDPOINT" : "MUJA_TRANSLATE_ENDPOINT";
    if (window[customKey]) add(String(window[customKey]));

    const script = document.currentScript || document.querySelector('script[src*="theme.js"]');
    if (script && script.src) {
      try { add(new URL(filename, script.src).toString()); } catch (error) {}
    }

    try { add(new URL('/' + filename, window.location.origin).toString()); } catch (error) { add('/' + filename); }
    add(filename);
    add('./' + filename);
    add('../' + filename);
    return endpoints;
  }

  async function mujaPostJson(endpoints, payload) {
    let lastError = null;
    for (const endpoint of endpoints) {
      const controller = window.AbortController ? new AbortController() : null;
      const timeout = controller ? window.setTimeout(() => controller.abort(), 18000) : null;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
          credentials: "same-origin",
          signal: controller ? controller.signal : undefined
        });
        if (timeout) window.clearTimeout(timeout);
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          return { ok: true, response, data, endpoint };
        }
        lastError = data && data.error ? data.error : `HTTP ${response.status}`;
        if (![404, 405].includes(response.status)) {
          return { ok: false, response, data, endpoint, error: lastError };
        }
      } catch (error) {
        if (timeout) window.clearTimeout(timeout);
        lastError = error && error.name === "AbortError" ? "Request timeout" : error;
      }
    }
    return { ok: false, data: {}, endpoint: endpoints[0] || '', error: lastError || 'Endpoint tidak ditemukan' };
  }

  const originalTextNodes = new WeakMap();
  const translationMemory = {};
  let originalTitle = "";
  let isLanguageChanging = false;
  let languageObserver = null;
  let translateTimer = null;
  let isRemoteTranslating = false;
  let chatHistory = [];

  const ID_TO_EN = {
    "Canva Pro — Akses Gratis & VIP": "Canva Pro — Free & VIP Access",
    "Metode Akses Canva Pro - Mujahiid": "Canva Pro Access Method - Mujahiid",
    "Verifikasi Canva Pro - Mujahiid": "Canva Pro Verification - Mujahiid",

    "Gratis": "Free",
    "Gratis & VIP Access": "Free & VIP Access",
    "Akses desain lebih mudah": "Easier design access",
    "Desain Tanpa Batas dengan": "Unlimited Design with",
    "Pilih akses gratis melalui panduan video atau masuk sebagai member VIP untuk layanan prioritas. Semua tombol diarahkan ke halaman akses dan komunitas yang sudah disiapkan.": "Choose free access through the video guide or join as a VIP member for priority service. All buttons are directed to the prepared access and community pages.",
    "Password 3 huruf. Password pertama muncul di menit ke-11. Jangan skip video agar tidak melewatkan password berikutnya.": "Three-letter password. The first password appears at minute 11. Do not skip the video so you do not miss the next password.",
    "Bergabung dengan komunitas": "Join the community",
    "Catatan:": "Note:",
    "Catatan": "Note",
    "Pilih": "Choose",
    "Akses Free": "Free Access",
    "untuk mengikuti panduan video Canva Pro gratis. Jika ingin layanan lebih cepat, prioritas, dan dibantu admin, pilih": "to follow the free Canva Pro video guide. For faster, priority service with admin assistance, choose",
    ". Pastikan mengikuti instruksi password dengan teliti agar proses masuk berjalan lancar.": ". Make sure to follow the password instructions carefully so the login process runs smoothly.",
    "Pastikan mengikuti instruksi password dengan teliti agar proses masuk berjalan lancar.": "Make sure to follow the password instructions carefully so the login process runs smoothly.",
    "Canva Pro Free": "Canva Pro Free",
    "Akses Canva Pro gratis untuk semua pengguna. Ikuti panduan video dan ambil password sesuai instruksi.": "Free Canva Pro access for all users. Follow the video guide and take the password according to the instructions.",
    "Tanpa biaya": "No cost",
    "Panduan video": "Video guide",
    "Cocok untuk belajar": "Good for learning",
    "Lihat Password": "View Password",
    "VIP Member": "VIP Member",
    "Canva Pro VIP": "Canva Pro VIP",
    "Akses prioritas untuk member VIP dengan proses lebih rapi, cepat, dan eksklusif.": "Priority access for VIP members with a cleaner, faster, and more exclusive process.",
    "Akses prioritas": "Priority access",
    "Layanan eksklusif": "Exclusive service",
    "Dukungan admin": "Admin support",
    "Apk Mujahiid": "Mujahiid APK",
    "Grup WhatsApp": "WhatsApp Group",
    "Grup Telegram": "Telegram Group",

    "Canva Pro Access Center": "Canva Pro Access Center",
    "Online": "Online",
    "Akses resmi Mujahiid": "Official Mujahiid access",
    "Pilih cara masuk yang paling mudah. Bisa via password, lewati iklan tanpa password, atau upgrade VIP untuk akses prioritas.": "Choose the easiest way to enter. Use a password, skip ads without a password, or upgrade to VIP for priority access.",
    "Password 3 huruf muncul di video. Untuk metode iklan, satu device hanya bisa daftar satu kali per 24 jam.": "The three-letter password appears in the video. For the ad method, one device can only register once every 24 hours.",
    "Password atau Iklan": "Password or Ads",
    "VIP Access": "VIP Access",
    "Prioritas Admin": "Admin Priority",
    "Password": "Password",
    "Metode 1": "Method 1",
    "Via Password": "Via Password",
    "Isi password 3 huruf untuk masuk ke Canva Pro gratis.": "Enter the three-letter password to access free Canva Pro.",
    "Cocok untuk akses manual": "Suitable for manual access",
    "Ikuti instruksi video": "Follow the video instructions",
    "Join Canva": "Join Canva",
    "Iklan": "Ads",
    "Metode 2": "Method 2",
    "Via Iklan": "Via Ads",
    "Lewati iklan tanpa password untuk masuk ke Canva Pro.": "Skip ads without a password to enter Canva Pro.",
    "Tanpa password": "No password",
    "Kuota mengikuti sistem": "Quota follows the system",
    "Tutorial": "Tutorial",
    "Upgrade Premium": "Upgrade Premium",
    "Jadi bagian dari member admin: tanpa password, tanpa iklan, proses lebih cepat, dan lebih rapi untuk pemakaian jangka panjang.": "Become an admin member: no password, no ads, faster process, and cleaner for long-term use.",
    "Akses Instan": "Instant Access",
    "Tanpa Iklan": "No Ads",
    "Tanpa Password": "No Password",
    "Kumpulkan Poin": "Collect Points",
    "Download Apk": "Download APK",
    "Komunitas": "Community",
    "Gabung Grup Kami": "Join Our Group",
    "Dapat update password, info kuota, dan tips terbaru agar akses Canva Pro tetap mudah.": "Get password updates, quota info, and the latest tips so Canva Pro access stays easy.",
    "Grup resmi": "Official group",
    "Channel update": "Update channel",
    "Mujahiid · Canva Pro Access Center": "Mujahiid · Canva Pro Access Center",

    "Sudah Terdaftar": "Already Registered",
    "Anda sudah memakai metode iklan hari ini.": "You have already used the ad method today.",
    "Gunakan metode password untuk akses tambahan.": "Use the password method for additional access.",
    "Tersedia lagi dalam": "Available again in",
    "Akses Metode Password": "Access Password Method",
    "Tutup": "Close",
    "Metode Lewati Iklan": "Skip Ads Method",
    "Daftar email untuk lanjut akses Canva Pro gratis tanpa password.": "Register your email to continue free Canva Pro access without a password.",
    "1 device hanya bisa daftar 1 kali per 24 jam": "One device can only register once every 24 hours",
    "Kuota tersedia": "Available quota",
    "Masukkan email Anda": "Enter your email",
    "Lanjutkan": "Continue",
    "Pastikan email aktif agar data pendaftaran tersimpan.": "Make sure your email is active so registration data is saved.",
    "Memproses": "Processing",
    "Metode iklan sedang dinonaktifkan sementara. Coba lagi nanti.": "The ad method is temporarily disabled. Please try again later.",
    "Gagal memproses. Silakan coba lagi.": "Failed to process. Please try again.",
    "Berhasil Terdaftar": "Successfully Registered",
    "Klik tombol di bawah untuk memulai lewati iklan dan masuk Canva Pro.": "Click the button below to start skipping ads and enter Canva Pro.",
    "Lewati Iklan Sekarang": "Skip Ads Now",
    "Kuota Habis": "Quota Finished",
    "Kuota hari ini sudah penuh. Coba besok atau bergabung ke grup untuk info update.": "Today's quota is full. Try tomorrow or join the group for updates.",
    "Memeriksa": "Checking",
    "Metode iklan sedang dinonaktifkan. Silakan gunakan metode lain.": "The ad method is disabled. Please use another method.",
    "Terjadi kesalahan. Silakan coba lagi.": "An error occurred. Please try again.",

    "Canva Pro Verification": "Canva Pro Verification",
    "Akses Aktif": "Access Active",
    "Verifikasi resmi": "Official verification",
    "Aktivasi": "Activation",
    "Selesaikan verifikasi video, masukkan email Gmail dan WhatsApp, lalu konfirmasi password untuk membuka akses Canva Pro.": "Complete the video verification, enter your Gmail and WhatsApp, then confirm the password to open Canva Pro access.",
    "Gunakan email Gmail aktif. Sistem akan menolak spam email dan device yang terdeteksi melanggar aturan.": "Use an active Gmail address. The system will reject spam emails and devices detected as violating the rules.",
    "Video Check": "Video Check",
    "Like & komentar": "Like & comment",
    "Konfirmasi akhir": "Final confirmation",
    "Status Kuota": "Quota Status",
    "Kuota tersisa": "Remaining quota",
    "Canva Pro Sudah Full": "Canva Pro Is Full",
    "Tunggu beberapa menit atau beberapa jam sampai halaman terbuka kembali. Join grup untuk info pembaruan Canva Pro hari ini.": "Wait a few minutes or a few hours until the page opens again. Join the group for today's Canva Pro updates.",
    "Device Diblokir": "Device Blocked",
    "Terdeteksi aktivitas spam dengan beberapa email berbeda di device yang sama.": "Spam activity was detected with several different emails on the same device.",
    "Peringatan Spam": "Spam Warning",
    "Jangan spam email. Jika join lagi pada device yang sama untuk ke-3 kalinya, sistem akan memblokir Anda selama 1 bulan.": "Do not spam emails. If you join again on the same device for the 3rd time, the system will block you for 1 month.",
    "Saya Mengerti": "I Understand",
    "Tahap 1": "Step 1",
    "Verifikasi Video": "Video Verification",
    "Buka video, lalu lakukan like dan komentar sebagai bukti verifikasi.": "Open the video, then like and comment as verification proof.",
    "Wajib like dan komentar video sebagai bukti verifikasi.": "You must like and comment on the video as verification proof.",
    "Join Grup": "Join Group",
    "Verifikasi video": "Video verification",
    "Konfirmasi email & WhatsApp": "Confirm email & WhatsApp",
    "Masukkan password": "Enter password",
    "Aktivasi Canva Pro": "Activate Canva Pro",
    "Lapor Masalah": "Report Problem",
    "Masukkan Email & WhatsApp": "Enter Email & WhatsApp",
    "Konfirmasi Email & WA": "Confirm Email & WA",
    "Masukkan Ulang Password": "Re-enter Password",
    "Konfirmasi Password": "Confirm Password",
    "Password ada di dalam video. Tiga huruf berada di waktu yang berbeda.": "The password is in the video. The three letters appear at different times.",
    "Berhasil, Aktifkan Canva Pro": "Success, Activate Canva Pro",
    "Tekan tombol di bawah untuk membuka akses premium.": "Press the button below to open premium access.",
    "Aktifkan Sekarang": "Activate Now",
    "Email Sudah Terdaftar": "Email Already Registered",
    "Bergabung Dengan Komunitas": "Join the Community",
    "Dapatkan info update dan berita terbaru.": "Get update info and the latest news.",
    "Canva Unlock • Verifikasi Email, WA, dan Password": "Canva Unlock • Email, WA, and Password Verification",
    "contoh: nama@gmail.com": "example: name@gmail.com",
    "Nomor WA contoh: 628123456789": "WA number example: 628123456789",
    "Ketik password": "Type password",
    "Thumbnail": "Thumbnail",

    "Memulai Verifikasi": "Starting Verification",
    "Verifikasi video dimulai. Like dan komentar video sebagai bukti.": "Video verification started. Like and comment on the video as proof.",
    "Video dibuka. Verifikasi berlangsung 10 detik.": "Video opened. Verification takes 10 seconds.",
    "Menunggu Like & Komentar": "Waiting for Like & Comment",
    "Verifikasi sukses. Sekarang masukkan email dan WhatsApp.": "Verification successful. Now enter your email and WhatsApp.",
    "Verifikasi video dulu.": "Verify the video first.",
    "Email tidak boleh kosong.": "Email cannot be empty.",
    "Nomor WhatsApp tidak boleh kosong.": "WhatsApp number cannot be empty.",
    "Format nomor WhatsApp tidak valid. Minimal 10 digit.": "Invalid WhatsApp number format. Minimum 10 digits.",
    "Memeriksa Data": "Checking Data",
    "Data berhasil diverifikasi. Sekarang masukkan password.": "Data verified successfully. Now enter the password.",
    "Password tidak boleh kosong.": "Password cannot be empty.",
    "Password salah. Lihat petunjuk di bawah.": "Wrong password. See the hint below.",
    "Password benar. Silakan aktivasi Canva Pro.": "Password correct. Please activate Canva Pro.",
    "Video dibuka. Password 3 huruf ada di dalam video.": "Video opened. The three-letter password is in the video.",
    "Verifikasi gagal, ulangi proses.": "Verification failed, repeat the process.",
    "Email tidak ditemukan.": "Email not found.",
    "Mengecek Kuota": "Checking Quota",
    "Device Anda diblokir. Refresh halaman.": "Your device is blocked. Refresh the page.",
    "Maaf, kuota sudah penuh. Refresh halaman.": "Sorry, the quota is full. Refresh the page.",
    "Email sudah terdaftar. Membuka Canva Pro.": "Email already registered. Opening Canva Pro.",
    "Selamat, akses Canva Pro dibuka.": "Congratulations, Canva Pro access is open.",
    "Terjadi kesalahan:": "An error occurred:",
    "Gagal:": "Failed:",
    "Email belum dimasukkan.": "Email has not been entered.",
    "Email terdaftar:": "Registered email:",
    "Sisa masa tunggu:": "Remaining waiting time:",
    "hari": "days",
    "jam": "hours",

    "Ganti tema": "Change theme",
    "Ganti ke mode gelap": "Switch to dark mode",
    "Ganti ke mode terang": "Switch to light mode",
    "Mode gelap": "Dark mode",
    "Mode terang": "Light mode",
    "Navigasi utama": "Main navigation",
    "Pilihan akses Canva Pro": "Canva Pro access options",
    "Metode akses": "Access methods",
    "Brand": "Brand"
  };



  const LOCAL_PAGE_TRANSLATIONS = {
    "ar": {
      "Canva Pro — Akses Gratis & VIP": "Canva Pro — وصول مجاني وVIP",
      "Metode Akses Canva Pro - Mujahiid": "طريقة الوصول إلى Canva Pro - Mujahiid",
      "Verifikasi Canva Pro - Mujahiid": "التحقق من Canva Pro - Mujahiid",
      "Gratis": "مجاني", "Akses Free": "وصول مجاني", "VIP Member": "عضو VIP", "Canva Pro Free": "Canva Pro مجاني", "Canva Pro VIP": "Canva Pro VIP",
      "Desain Tanpa Batas dengan": "تصميم بلا حدود مع", "Akses desain lebih mudah": "وصول أسهل للتصميم", "Bergabung dengan komunitas": "انضم إلى المجتمع",
      "Catatan:": "ملاحظة:", "Catatan": "ملاحظة", "Pilih": "اختر", "Lihat Password": "عرض كلمة المرور", "Tanpa biaya": "بدون تكلفة", "Panduan video": "دليل فيديو", "Cocok untuk belajar": "مناسب للتعلم",
      "Apk Mujahiid": "تطبيق Mujahiid", "Grup WhatsApp": "مجموعة WhatsApp", "Grup Telegram": "مجموعة Telegram", "Online": "متصل", "Akses resmi Mujahiid": "وصول Mujahiid الرسمي",
      "Password atau Iklan": "كلمة المرور أو الإعلانات", "Prioritas Admin": "أولوية المشرف", "Password": "كلمة المرور", "Metode 1": "الطريقة 1", "Metode 2": "الطريقة 2", "Via Password": "عبر كلمة المرور", "Via Iklan": "عبر الإعلان", "Iklan": "إعلان",
      "Isi password 3 huruf untuk masuk ke Canva Pro gratis.": "أدخل كلمة المرور المكونة من 3 أحرف للدخول إلى Canva Pro مجاناً.", "Lewati iklan tanpa password untuk masuk ke Canva Pro.": "تجاوز الإعلان بدون كلمة مرور للدخول إلى Canva Pro.",
      "Tanpa password": "بدون كلمة مرور", "Kuota mengikuti sistem": "الحصة حسب النظام", "Tutorial": "شرح", "Upgrade Premium": "ترقية مميزة", "Akses Instan": "وصول فوري", "Tanpa Iklan": "بدون إعلانات", "Tanpa Password": "بدون كلمة مرور", "Kumpulkan Poin": "اجمع النقاط", "Download Apk": "تحميل التطبيق", "Komunitas": "المجتمع", "Gabung Grup Kami": "انضم إلى مجموعتنا",
      "Sudah Terdaftar": "مسجل بالفعل", "Tutup": "إغلاق", "Lanjutkan": "متابعة", "Memproses": "جارٍ المعالجة", "Berhasil Terdaftar": "تم التسجيل بنجاح", "Lewati Iklan Sekarang": "تجاوز الإعلان الآن", "Kuota Habis": "انتهت الحصة", "Memeriksa": "جارٍ التحقق",
      "Akses Aktif": "الوصول نشط", "Verifikasi resmi": "تحقق رسمي", "Aktivasi": "تفعيل", "Status Kuota": "حالة الحصة", "Kuota tersisa": "الحصة المتبقية", "Device Diblokir": "تم حظر الجهاز", "Peringatan Spam": "تحذير من السبام", "Saya Mengerti": "فهمت", "Tahap 1": "المرحلة 1", "Verifikasi Video": "تحقق الفيديو", "Join Grup": "انضم للمجموعة", "Konfirmasi Email & WA": "تأكيد البريد وواتساب", "Masukkan Ulang Password": "أعد إدخال كلمة المرور", "Konfirmasi Password": "تأكيد كلمة المرور", "Aktifkan Sekarang": "فعّل الآن", "Email Sudah Terdaftar": "البريد مسجل بالفعل", "Bergabung Dengan Komunitas": "انضم إلى المجتمع", "Ketik password": "اكتب كلمة المرور", "Thumbnail": "صورة مصغرة"
    },
    "pt": {
      "Canva Pro — Akses Gratis & VIP": "Canva Pro — Acesso grátis e VIP", "Metode Akses Canva Pro - Mujahiid": "Método de acesso Canva Pro - Mujahiid", "Verifikasi Canva Pro - Mujahiid": "Verificação Canva Pro - Mujahiid",
      "Gratis": "Grátis", "Akses Free": "Acesso grátis", "VIP Member": "Membro VIP", "Canva Pro Free": "Canva Pro grátis", "Canva Pro VIP": "Canva Pro VIP", "Desain Tanpa Batas dengan": "Design sem limites com", "Akses desain lebih mudah": "Acesso ao design mais fácil", "Bergabung dengan komunitas": "Juntar-se à comunidade", "Catatan:": "Nota:", "Catatan": "Nota", "Pilih": "Escolher", "Lihat Password": "Ver palavra-passe", "Tanpa biaya": "Sem custo", "Panduan video": "Guia em vídeo", "Cocok untuk belajar": "Ideal para aprender",
      "Online": "Online", "Akses resmi Mujahiid": "Acesso oficial Mujahiid", "Password atau Iklan": "Palavra-passe ou anúncios", "Prioritas Admin": "Prioridade do administrador", "Password": "Palavra-passe", "Metode 1": "Método 1", "Metode 2": "Método 2", "Via Password": "Via palavra-passe", "Via Iklan": "Via anúncios", "Iklan": "Anúncios", "Tanpa password": "Sem palavra-passe", "Tutorial": "Tutorial", "Upgrade Premium": "Atualizar para Premium", "Akses Instan": "Acesso instantâneo", "Tanpa Iklan": "Sem anúncios", "Tanpa Password": "Sem palavra-passe", "Kumpulkan Poin": "Recolher pontos", "Download Apk": "Transferir APK", "Komunitas": "Comunidade", "Gabung Grup Kami": "Junte-se ao nosso grupo", "Tutup": "Fechar", "Lanjutkan": "Continuar", "Memproses": "A processar", "Memeriksa": "A verificar", "Aktifkan Sekarang": "Ativar agora", "Email Sudah Terdaftar": "Email já registado"
    },
    "pt-br": {
      "Canva Pro — Akses Gratis & VIP": "Canva Pro — Acesso grátis e VIP", "Metode Akses Canva Pro - Mujahiid": "Método de acesso ao Canva Pro - Mujahiid", "Verifikasi Canva Pro - Mujahiid": "Verificação do Canva Pro - Mujahiid",
      "Gratis": "Grátis", "Akses Free": "Acesso grátis", "VIP Member": "Membro VIP", "Canva Pro Free": "Canva Pro grátis", "Canva Pro VIP": "Canva Pro VIP", "Desain Tanpa Batas dengan": "Design sem limites com", "Akses desain lebih mudah": "Acesso mais fácil ao design", "Bergabung dengan komunitas": "Entrar na comunidade", "Catatan:": "Observação:", "Catatan": "Observação", "Pilih": "Escolher", "Lihat Password": "Ver senha", "Tanpa biaya": "Sem custo", "Panduan video": "Guia em vídeo", "Cocok untuk belajar": "Bom para aprender",
      "Apk Mujahiid": "APK Mujahiid", "Grup WhatsApp": "Grupo WhatsApp", "Grup Telegram": "Grupo Telegram", "Online": "Online", "Akses resmi Mujahiid": "Acesso oficial Mujahiid", "Password atau Iklan": "Senha ou anúncios", "Prioritas Admin": "Prioridade do admin", "Password": "Senha", "Metode 1": "Método 1", "Metode 2": "Método 2", "Via Password": "Por senha", "Via Iklan": "Por anúncios", "Iklan": "Anúncios", "Isi password 3 huruf untuk masuk ke Canva Pro gratis.": "Digite a senha de 3 letras para entrar no Canva Pro grátis.", "Lewati iklan tanpa password untuk masuk ke Canva Pro.": "Pule os anúncios sem senha para entrar no Canva Pro.", "Tanpa password": "Sem senha", "Kuota mengikuti sistem": "Cota segue o sistema", "Tutorial": "Tutorial", "Upgrade Premium": "Atualizar Premium", "Akses Instan": "Acesso instantâneo", "Tanpa Iklan": "Sem anúncios", "Tanpa Password": "Sem senha", "Kumpulkan Poin": "Juntar pontos", "Download Apk": "Baixar APK", "Komunitas": "Comunidade", "Gabung Grup Kami": "Entrar no nosso grupo", "Sudah Terdaftar": "Já registrado", "Tutup": "Fechar", "Lanjutkan": "Continuar", "Memproses": "Processando", "Berhasil Terdaftar": "Registrado com sucesso", "Lewati Iklan Sekarang": "Pular anúncios agora", "Kuota Habis": "Cota esgotada", "Memeriksa": "Verificando", "Akses Aktif": "Acesso ativo", "Verifikasi resmi": "Verificação oficial", "Aktivasi": "Ativação", "Status Kuota": "Status da cota", "Kuota tersisa": "Cota restante", "Device Diblokir": "Dispositivo bloqueado", "Peringatan Spam": "Aviso de spam", "Saya Mengerti": "Entendi", "Tahap 1": "Etapa 1", "Verifikasi Video": "Verificação do vídeo", "Join Grup": "Entrar no grupo", "Konfirmasi Email & WA": "Confirmar email e WhatsApp", "Masukkan Ulang Password": "Digite a senha novamente", "Konfirmasi Password": "Confirmar senha", "Aktifkan Sekarang": "Ativar agora", "Email Sudah Terdaftar": "Email já registrado", "Bergabung Dengan Komunitas": "Entrar na comunidade", "Ketik password": "Digite a senha", "Thumbnail": "Miniatura"
    },
    "es": { "Gratis":"Gratis", "Akses Free":"Acceso gratis", "VIP Member":"Miembro VIP", "Password":"Contraseña", "Iklan":"Anuncios", "Tutorial":"Tutorial", "Komunitas":"Comunidad", "Tutup":"Cerrar", "Lanjutkan":"Continuar", "Memproses":"Procesando", "Memeriksa":"Comprobando", "Aktifkan Sekarang":"Activar ahora", "Email Sudah Terdaftar":"Email ya registrado", "Verifikasi Video":"Verificación de video", "Konfirmasi Password":"Confirmar contraseña", "Download Apk":"Descargar APK", "Tanpa Iklan":"Sin anuncios", "Tanpa Password":"Sin contraseña" },
    "fr": { "Gratis":"Gratuit", "Akses Free":"Accès gratuit", "VIP Member":"Membre VIP", "Password":"Mot de passe", "Iklan":"Publicités", "Tutorial":"Tutoriel", "Komunitas":"Communauté", "Tutup":"Fermer", "Lanjutkan":"Continuer", "Memproses":"Traitement", "Memeriksa":"Vérification", "Aktifkan Sekarang":"Activer maintenant", "Email Sudah Terdaftar":"Email déjà enregistré", "Verifikasi Video":"Vérification vidéo", "Konfirmasi Password":"Confirmer le mot de passe", "Download Apk":"Télécharger l’APK", "Tanpa Iklan":"Sans publicités", "Tanpa Password":"Sans mot de passe" },
    "de": { "Gratis":"Kostenlos", "Akses Free":"Kostenloser Zugang", "VIP Member":"VIP-Mitglied", "Password":"Passwort", "Iklan":"Anzeigen", "Tutorial":"Tutorial", "Komunitas":"Community", "Tutup":"Schließen", "Lanjutkan":"Weiter", "Memproses":"Verarbeitung", "Memeriksa":"Prüfen", "Aktifkan Sekarang":"Jetzt aktivieren", "Email Sudah Terdaftar":"E-Mail bereits registriert", "Verifikasi Video":"Video-Verifizierung", "Konfirmasi Password":"Passwort bestätigen", "Download Apk":"APK herunterladen", "Tanpa Iklan":"Ohne Anzeigen", "Tanpa Password":"Ohne Passwort" },
    "tr": { "Gratis":"Ücretsiz", "Akses Free":"Ücretsiz erişim", "VIP Member":"VIP üye", "Password":"Şifre", "Iklan":"Reklamlar", "Tutorial":"Eğitim", "Komunitas":"Topluluk", "Tutup":"Kapat", "Lanjutkan":"Devam et", "Memproses":"İşleniyor", "Memeriksa":"Kontrol ediliyor", "Aktifkan Sekarang":"Şimdi etkinleştir", "Email Sudah Terdaftar":"E-posta zaten kayıtlı", "Verifikasi Video":"Video doğrulama", "Konfirmasi Password":"Şifreyi onayla", "Download Apk":"APK indir", "Tanpa Iklan":"Reklamsız", "Tanpa Password":"Şifresiz" },
    "hi": { "Gratis":"मुफ़्त", "Akses Free":"मुफ़्त एक्सेस", "VIP Member":"VIP सदस्य", "Password":"पासवर्ड", "Iklan":"विज्ञापन", "Tutorial":"ट्यूटोरियल", "Komunitas":"समुदाय", "Tutup":"बंद करें", "Lanjutkan":"जारी रखें", "Memproses":"प्रोसेस हो रहा है", "Memeriksa":"जांच हो रही है", "Aktifkan Sekarang":"अभी सक्रिय करें", "Email Sudah Terdaftar":"ईमेल पहले से पंजीकृत है", "Verifikasi Video":"वीडियो सत्यापन", "Konfirmasi Password":"पासवर्ड पुष्टि करें", "Download Apk":"APK डाउनलोड करें", "Tanpa Iklan":"बिना विज्ञापन", "Tanpa Password":"बिना पासवर्ड" },
    "zh": { "Gratis":"免费", "Akses Free":"免费访问", "VIP Member":"VIP会员", "Password":"密码", "Iklan":"广告", "Tutorial":"教程", "Komunitas":"社区", "Tutup":"关闭", "Lanjutkan":"继续", "Memproses":"处理中", "Memeriksa":"检查中", "Aktifkan Sekarang":"立即激活", "Email Sudah Terdaftar":"邮箱已注册", "Verifikasi Video":"视频验证", "Konfirmasi Password":"确认密码", "Download Apk":"下载APK", "Tanpa Iklan":"无广告", "Tanpa Password":"无密码" },
    "ja": { "Gratis":"無料", "Akses Free":"無料アクセス", "VIP Member":"VIPメンバー", "Password":"パスワード", "Iklan":"広告", "Tutorial":"チュートリアル", "Komunitas":"コミュニティ", "Tutup":"閉じる", "Lanjutkan":"続行", "Memproses":"処理中", "Memeriksa":"確認中", "Aktifkan Sekarang":"今すぐ有効化", "Email Sudah Terdaftar":"メールは登録済みです", "Verifikasi Video":"動画確認", "Konfirmasi Password":"パスワード確認", "Download Apk":"APKをダウンロード", "Tanpa Iklan":"広告なし", "Tanpa Password":"パスワードなし" },
    "ko": { "Gratis":"무료", "Akses Free":"무료 접속", "VIP Member":"VIP 회원", "Password":"비밀번호", "Iklan":"광고", "Tutorial":"튜토리얼", "Komunitas":"커뮤니티", "Tutup":"닫기", "Lanjutkan":"계속", "Memproses":"처리 중", "Memeriksa":"확인 중", "Aktifkan Sekarang":"지금 활성화", "Email Sudah Terdaftar":"이메일이 이미 등록됨", "Verifikasi Video":"동영상 인증", "Konfirmasi Password":"비밀번호 확인", "Download Apk":"APK 다운로드", "Tanpa Iklan":"광고 없음", "Tanpa Password":"비밀번호 없음" },
    "ms": { "Gratis":"Percuma", "Akses Free":"Akses percuma", "VIP Member":"Ahli VIP", "Password":"Kata laluan", "Iklan":"Iklan", "Tutorial":"Tutorial", "Komunitas":"Komuniti", "Tutup":"Tutup", "Lanjutkan":"Teruskan", "Memproses":"Memproses", "Memeriksa":"Memeriksa", "Aktifkan Sekarang":"Aktifkan sekarang", "Email Sudah Terdaftar":"Email sudah didaftarkan", "Verifikasi Video":"Pengesahan video", "Konfirmasi Password":"Sahkan kata laluan", "Download Apk":"Muat turun APK", "Tanpa Iklan":"Tanpa iklan", "Tanpa Password":"Tanpa kata laluan" }
  };

  const REGEX_TO_EN = [
    [/^Anda diblokir\s+(\d+)\s+hari lagi\.$/i, "You are blocked for $1 more days."],
    [/^Tersedia lagi dalam\s+(\d+)\s+jam$/i, "Available again in $1 hours"],
    [/^Device diblokir 1 bulan\. Terdeteksi\s+(\d+)\s+email berbeda\.$/i, "Device blocked for 1 month. $1 different emails detected."],
    [/^Email "(.+)" sudah pernah mendaftar\.$/i, 'Email "$1" has already registered.'],
    [/^Sisa masa tunggu:\s*(.+)$/i, "Remaining waiting time: $1"],
    [/^Email terdaftar:\s*(.+)$/i, "Registered email: $1"],
    [/^Gagal:\s*(.+)$/i, "Failed: $1"],
    [/^Terjadi kesalahan:\s*(.+)$/i, "An error occurred: $1"]
  ];

  const MANUAL_TRANSLATIONS = {
  "en": {
    "Pilih bahasa": "Choose language",
    "Bahasa": "Language",
    "Ganti bahasa": "Change language",
    "Indonesia": "Indonesian",
    "Inggris": "English",
    "Arab": "Arabic",
    "Portugis": "Portuguese",
    "Portugis Brasil": "Brazilian Portuguese",
    "Spanyol": "Spanish",
    "Prancis": "French",
    "Jerman": "German",
    "Turki": "Turkish",
    "Hindi": "Hindi",
    "China": "Chinese",
    "Jepang": "Japanese",
    "Korea": "Korean",
    "Melayu": "Malay",
    "Chat AI": "AI Chat",
    "Asisten Mujahiid": "Mujahiid Assistant",
    "Tanya tentang situs ini...": "Ask about this site...",
    "Kirim": "Send",
    "Online siap membantu": "Online, ready to help",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "Hi! I am Mujahiid AI. Ask about free Canva Pro, video passwords, ads, verification, quota, groups, or site issues.",
    "Sedang mengetik...": "Typing...",
    "Tulis pertanyaan dulu.": "Please write a question first.",
    "Buka chat AI": "Open AI chat",
    "Tutup chat": "Close chat",
    "Minimalkan": "Minimize"
  },
  "ar": {
    "Pilih bahasa": "اختر اللغة",
    "Bahasa": "اللغة",
    "Ganti bahasa": "تغيير اللغة",
    "Indonesia": "الإندونيسية",
    "Inggris": "الإنجليزية",
    "Arab": "العربية",
    "Portugis": "البرتغالية",
    "Portugis Brasil": "البرتغالية البرازيلية",
    "Spanyol": "الإسبانية",
    "Prancis": "الفرنسية",
    "Jerman": "الألمانية",
    "Turki": "التركية",
    "Hindi": "الهندية",
    "China": "الصينية",
    "Jepang": "اليابانية",
    "Korea": "الكورية",
    "Melayu": "الملايوية",
    "Chat AI": "دردشة الذكاء الاصطناعي",
    "Asisten Mujahiid": "مساعد Mujahiid",
    "Tanya tentang situs ini...": "اسأل عن هذا الموقع...",
    "Kirim": "إرسال",
    "Online siap membantu": "متصل وجاهز للمساعدة",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "مرحباً! أنا مساعد Mujahiid. اسأل عن Canva Pro المجاني، كلمة مرور الفيديو، الإعلانات، التحقق، الحصة، المجموعات، أو مشاكل الموقع.",
    "Sedang mengetik...": "يكتب الآن...",
    "Tulis pertanyaan dulu.": "اكتب سؤالك أولاً.",
    "Buka chat AI": "فتح دردشة الذكاء الاصطناعي",
    "Tutup chat": "إغلاق الدردشة",
    "Minimalkan": "تصغير"
  },
  "pt": {
    "Pilih bahasa": "Escolher idioma",
    "Bahasa": "Idioma",
    "Ganti bahasa": "Alterar idioma",
    "Indonesia": "Indonésio",
    "Inggris": "Inglês",
    "Arab": "Árabe",
    "Portugis": "Português",
    "Portugis Brasil": "Português do Brasil",
    "Spanyol": "Espanhol",
    "Prancis": "Francês",
    "Jerman": "Alemão",
    "Turki": "Turco",
    "Hindi": "Hindi",
    "China": "Chinês",
    "Jepang": "Japonês",
    "Korea": "Coreano",
    "Melayu": "Malaio",
    "Chat AI": "Chat IA",
    "Asisten Mujahiid": "Assistente Mujahiid",
    "Tanya tentang situs ini...": "Pergunte sobre este site...",
    "Kirim": "Enviar",
    "Online siap membantu": "Online, pronto para ajudar",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "Olá! Sou a IA Mujahiid. Pergunte sobre Canva Pro grátis, senha do vídeo, anúncios, verificação, cota, grupos ou problemas do site.",
    "Sedang mengetik...": "A escrever...",
    "Tulis pertanyaan dulu.": "Escreva uma pergunta primeiro.",
    "Buka chat AI": "Abrir chat IA",
    "Tutup chat": "Fechar chat",
    "Minimalkan": "Minimizar"
  },
  "pt-br": {
    "Pilih bahasa": "Escolher idioma",
    "Bahasa": "Idioma",
    "Ganti bahasa": "Trocar idioma",
    "Indonesia": "Indonésio",
    "Inggris": "Inglês",
    "Arab": "Árabe",
    "Portugis": "Português",
    "Portugis Brasil": "Português do Brasil",
    "Spanyol": "Espanhol",
    "Prancis": "Francês",
    "Jerman": "Alemão",
    "Turki": "Turco",
    "Hindi": "Hindi",
    "China": "Chinês",
    "Jepang": "Japonês",
    "Korea": "Coreano",
    "Melayu": "Malaio",
    "Chat AI": "Chat IA",
    "Asisten Mujahiid": "Assistente Mujahiid",
    "Tanya tentang situs ini...": "Pergunte sobre este site...",
    "Kirim": "Enviar",
    "Online siap membantu": "Online, pronto para ajudar",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "Olá! Eu sou a IA Mujahiid. Pergunte sobre Canva Pro grátis, senha do vídeo, anúncios, verificação, cota, grupos ou problemas do site.",
    "Sedang mengetik...": "Digitando...",
    "Tulis pertanyaan dulu.": "Escreva uma pergunta primeiro.",
    "Buka chat AI": "Abrir chat IA",
    "Tutup chat": "Fechar chat",
    "Minimalkan": "Minimizar"
  },
  "es": {
    "Pilih bahasa": "Elegir idioma",
    "Bahasa": "Idioma",
    "Ganti bahasa": "Cambiar idioma",
    "Chat AI": "Chat IA",
    "Asisten Mujahiid": "Asistente Mujahiid",
    "Tanya tentang situs ini...": "Pregunta sobre este sitio...",
    "Kirim": "Enviar",
    "Online siap membantu": "En línea, listo para ayudar",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "¡Hola! Soy la IA de Mujahiid. Pregunta sobre Canva Pro gratis, contraseña del video, anuncios, verificación, cupo, grupos o problemas del sitio.",
    "Sedang mengetik...": "Escribiendo...",
    "Buka chat AI": "Abrir chat IA",
    "Tutup chat": "Cerrar chat",
    "Minimalkan": "Minimizar"
  },
  "fr": {
    "Pilih bahasa": "Choisir la langue",
    "Bahasa": "Langue",
    "Ganti bahasa": "Changer de langue",
    "Chat AI": "Chat IA",
    "Asisten Mujahiid": "Assistant Mujahiid",
    "Tanya tentang situs ini...": "Posez une question sur ce site...",
    "Kirim": "Envoyer",
    "Online siap membantu": "En ligne, prêt à aider",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "Bonjour ! Je suis l’IA Mujahiid. Demandez au sujet de Canva Pro gratuit, du mot de passe vidéo, des publicités, de la vérification, du quota, des groupes ou des problèmes du site.",
    "Sedang mengetik...": "Écriture...",
    "Buka chat AI": "Ouvrir le chat IA",
    "Tutup chat": "Fermer le chat",
    "Minimalkan": "Réduire"
  },
  "de": {
    "Pilih bahasa": "Sprache wählen",
    "Bahasa": "Sprache",
    "Ganti bahasa": "Sprache ändern",
    "Chat AI": "KI-Chat",
    "Asisten Mujahiid": "Mujahiid Assistent",
    "Tanya tentang situs ini...": "Frage zu dieser Website...",
    "Kirim": "Senden",
    "Online siap membantu": "Online und bereit zu helfen",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "Hallo! Ich bin die Mujahiid KI. Frage zu kostenlosem Canva Pro, Video-Passwort, Werbung, Verifizierung, Quote, Gruppen oder Website-Problemen.",
    "Sedang mengetik...": "Tippt...",
    "Buka chat AI": "KI-Chat öffnen",
    "Tutup chat": "Chat schließen",
    "Minimalkan": "Minimieren"
  },
  "tr": {
    "Pilih bahasa": "Dil seç",
    "Bahasa": "Dil",
    "Ganti bahasa": "Dili değiştir",
    "Chat AI": "AI Sohbet",
    "Asisten Mujahiid": "Mujahiid Asistanı",
    "Tanya tentang situs ini...": "Bu site hakkında sorun...",
    "Kirim": "Gönder",
    "Online siap membantu": "Çevrimiçi, yardıma hazır",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "Merhaba! Ben Mujahiid AI. Ücretsiz Canva Pro, video şifresi, reklamlar, doğrulama, kota, gruplar veya site sorunları hakkında sorabilirsiniz.",
    "Sedang mengetik...": "Yazıyor...",
    "Buka chat AI": "AI sohbeti aç",
    "Tutup chat": "Sohbeti kapat",
    "Minimalkan": "Küçült"
  },
  "hi": {
    "Pilih bahasa": "भाषा चुनें",
    "Bahasa": "भाषा",
    "Ganti bahasa": "भाषा बदलें",
    "Chat AI": "AI चैट",
    "Asisten Mujahiid": "Mujahiid सहायक",
    "Tanya tentang situs ini...": "इस साइट के बारे में पूछें...",
    "Kirim": "भेजें",
    "Online siap membantu": "ऑनलाइन, मदद के लिए तैयार",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "नमस्ते! मैं Mujahiid AI हूँ। मुफ्त Canva Pro, वीडियो पासवर्ड, विज्ञापन, सत्यापन, कोटा, समूह या साइट समस्या के बारे में पूछें।",
    "Sedang mengetik...": "टाइप कर रहा है...",
    "Buka chat AI": "AI चैट खोलें",
    "Tutup chat": "चैट बंद करें",
    "Minimalkan": "छोटा करें"
  },
  "zh": {
    "Pilih bahasa": "选择语言",
    "Bahasa": "语言",
    "Ganti bahasa": "更改语言",
    "Chat AI": "AI 聊天",
    "Asisten Mujahiid": "Mujahiid 助手",
    "Tanya tentang situs ini...": "询问有关此网站的问题...",
    "Kirim": "发送",
    "Online siap membantu": "在线，随时帮助",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "你好！我是 Mujahiid AI。你可以询问免费 Canva Pro、视频密码、广告、验证、名额、群组或网站问题。",
    "Sedang mengetik...": "正在输入...",
    "Buka chat AI": "打开 AI 聊天",
    "Tutup chat": "关闭聊天",
    "Minimalkan": "最小化"
  },
  "ja": {
    "Pilih bahasa": "言語を選択",
    "Bahasa": "言語",
    "Ganti bahasa": "言語を変更",
    "Chat AI": "AIチャット",
    "Asisten Mujahiid": "Mujahiidアシスタント",
    "Tanya tentang situs ini...": "このサイトについて質問...",
    "Kirim": "送信",
    "Online siap membantu": "オンライン、サポート可能",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "こんにちは！Mujahiid AIです。無料Canva Pro、動画パスワード、広告、確認、枠、グループ、サイトの問題について質問できます。",
    "Sedang mengetik...": "入力中...",
    "Buka chat AI": "AIチャットを開く",
    "Tutup chat": "チャットを閉じる",
    "Minimalkan": "最小化"
  },
  "ko": {
    "Pilih bahasa": "언어 선택",
    "Bahasa": "언어",
    "Ganti bahasa": "언어 변경",
    "Chat AI": "AI 채팅",
    "Asisten Mujahiid": "Mujahiid 도우미",
    "Tanya tentang situs ini...": "이 사이트에 대해 질문...",
    "Kirim": "보내기",
    "Online siap membantu": "온라인, 도움 준비 완료",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "안녕하세요! 저는 Mujahiid AI입니다. 무료 Canva Pro, 동영상 비밀번호, 광고, 인증, 할당량, 그룹 또는 사이트 문제를 질문하세요.",
    "Sedang mengetik...": "입력 중...",
    "Buka chat AI": "AI 채팅 열기",
    "Tutup chat": "채팅 닫기",
    "Minimalkan": "최소화"
  },
  "ms": {
    "Pilih bahasa": "Pilih bahasa",
    "Bahasa": "Bahasa",
    "Ganti bahasa": "Tukar bahasa",
    "Chat AI": "Sembang AI",
    "Asisten Mujahiid": "Pembantu Mujahiid",
    "Tanya tentang situs ini...": "Tanya tentang laman ini...",
    "Kirim": "Hantar",
    "Online siap membantu": "Online, sedia membantu",
    "Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis, halaman metode, verifikasi Canva, password video, iklan, kuota, device diblokir, atau pilihan VIP di MujaPrime.": "Hai! Saya AI Mujahiid. Tanya tentang Canva Pro percuma, kata laluan video, iklan, pengesahan, kuota, grup atau masalah laman.",
    "Sedang mengetik...": "Sedang menaip...",
    "Buka chat AI": "Buka sembang AI",
    "Tutup chat": "Tutup sembang",
    "Minimalkan": "Minimumkan"
  }
};

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getLanguageInfo(lang) {
    return LANGUAGE_MAP[lang] || LANGUAGE_MAP[DEFAULT_LANG];
  }

  function isSupportedLanguage(lang) {
    return Boolean(LANGUAGE_MAP[lang]);
  }

  function getMemory(lang) {
    if (translationMemory[lang]) return translationMemory[lang];
    let stored = {};
    try {
      const raw = localStorage.getItem(TRANSLATE_CACHE_PREFIX + lang);
      if (raw) stored = JSON.parse(raw) || {};
    } catch (error) { stored = {}; }
    translationMemory[lang] = stored;
    return stored;
  }

  function saveMemory(lang) {
    try {
      const memory = getMemory(lang);
      const entries = Object.entries(memory).slice(-700);
      localStorage.setItem(TRANSLATE_CACHE_PREFIX + lang, JSON.stringify(Object.fromEntries(entries)));
    } catch (error) {}
  }

  function getManualTranslatedText(value, lang) {
    const normalized = normalizeText(value);
    if (!normalized || lang === "id") return value;

    const direct = MANUAL_TRANSLATIONS[lang] || {};
    if (Object.prototype.hasOwnProperty.call(direct, normalized)) return direct[normalized];

    const localPage = LOCAL_PAGE_TRANSLATIONS[lang] || {};
    if (Object.prototype.hasOwnProperty.call(localPage, normalized)) return localPage[normalized];

    if (lang === "en") {
      if (Object.prototype.hasOwnProperty.call(ID_TO_EN, normalized)) return ID_TO_EN[normalized];
      for (const [pattern, replacement] of REGEX_TO_EN) {
        if (pattern.test(normalized)) return normalized.replace(pattern, replacement);
      }
    }

    const memory = getMemory(lang);
    if (Object.prototype.hasOwnProperty.call(memory, normalized)) return memory[normalized];

    // Fallback sementara agar halaman tidak kosong ketika terjemahan AI masih diproses.
    if (Object.prototype.hasOwnProperty.call(ID_TO_EN, normalized)) return ID_TO_EN[normalized];
    return value;
  }

  function getTranslatedText(value, lang) {
    return getManualTranslatedText(value, lang || getSavedLanguage());
  }

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (error) {}
    return DEFAULT_THEME;
  }

  function setTheme(theme) {
    const selectedTheme = theme === "light" ? "light" : "dark";
    document.body.setAttribute("data-muja-theme", selectedTheme);
    document.documentElement.setAttribute("data-muja-theme", selectedTheme);
    try { localStorage.setItem(THEME_STORAGE_KEY, selectedTheme); } catch (error) {}
    updateThemeToggle(selectedTheme);
  }

  function updateThemeToggle(theme) {
    const button = document.getElementById("mujaThemeToggle");
    if (!button) return;
    const isLight = theme === "light";
    const currentLang = getSavedLanguage();
    const label = isLight ? getTranslatedText("Ganti ke mode gelap", currentLang) : getTranslatedText("Ganti ke mode terang", currentLang);
    const title = isLight ? getTranslatedText("Mode gelap", currentLang) : getTranslatedText("Mode terang", currentLang);
    button.setAttribute("aria-pressed", isLight ? "true" : "false");
    button.setAttribute("aria-label", label);
    button.setAttribute("title", title);
  }

  function toggleTheme(event) {
    const currentTheme = document.body.getAttribute("data-muja-theme") || DEFAULT_THEME;
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    const button = document.getElementById("mujaThemeToggle");
    if (button && event) {
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--theme-x", `${event.clientX - rect.left}px`);
      button.style.setProperty("--theme-y", `${event.clientY - rect.top}px`);
      button.classList.remove("is-rippling");
      void button.offsetWidth;
      button.classList.add("is-rippling");
    }
    setTheme(nextTheme);
  }

  function initTheme() {
    setTheme(getSavedTheme());
    const button = document.getElementById("mujaThemeToggle");
    if (button) button.addEventListener("click", toggleTheme);
  }

  function getSavedLanguage() {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (isSupportedLanguage(saved)) return saved;
    } catch (error) {}
    return DEFAULT_LANG;
  }

  function saveLanguage(lang) {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (error) {}
  }

  function createLanguageButton() {
    if (document.getElementById("mujaLangMenu")) return;
    const actions = document.querySelector(".muja-top-actions");
    if (!actions) return;

    const wrap = document.createElement("div");
    wrap.className = "muja-lang-menu";
    wrap.id = "mujaLangMenu";
    wrap.setAttribute("data-muja-no-translate", "true");
    wrap.innerHTML = `
      <button type="button" class="muja-lang-toggle" id="mujaLangToggle" aria-haspopup="listbox" aria-expanded="false" title="Pilih bahasa">
        <svg class="muja-lang-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M3 12h18M12 3c2.2 2.45 3.25 5.45 3.25 9S14.2 18.55 12 21M12 3C9.8 5.45 8.75 8.45 8.75 12S9.8 18.55 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="muja-lang-current">ID</span>
      </button>
      <div class="muja-lang-panel" id="mujaLangPanel" role="listbox" aria-label="Pilih bahasa">
        ${LANGUAGES.map((lang) => `<button type="button" class="muja-lang-option" data-lang="${lang.code}" role="option"><span>${lang.short}</span><strong>${lang.label}</strong></button>`).join("")}
      </div>
    `;

    // Letakkan tombol Translate di sebelah kiri tombol Dark/Light.
    const themeButton = actions.querySelector("#mujaThemeToggle, .muja-theme-toggle");
    const status = actions.querySelector(".muja-status");
    if (themeButton) {
      actions.insertBefore(wrap, themeButton);
    } else if (status) {
      actions.insertBefore(wrap, status);
    } else {
      actions.appendChild(wrap);
    }

    const toggle = wrap.querySelector("#mujaLangToggle");
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const rect = toggle.getBoundingClientRect();
      toggle.style.setProperty("--lang-x", `${event.clientX - rect.left}px`);
      toggle.style.setProperty("--lang-y", `${event.clientY - rect.top}px`);
      toggle.classList.remove("is-rippling");
      void toggle.offsetWidth;
      toggle.classList.add("is-rippling");
      const isOpen = wrap.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    wrap.querySelectorAll(".muja-lang-option").forEach((btn) => {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        wrap.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        setLanguage(btn.getAttribute("data-lang") || DEFAULT_LANG);
      });
    });

    document.addEventListener("click", function () {
      wrap.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function updateLanguageButton(lang) {
    const info = getLanguageInfo(lang);
    const button = document.getElementById("mujaLangToggle");
    if (button) {
      const current = button.querySelector(".muja-lang-current");
      button.setAttribute("aria-label", `${getTranslatedText("Bahasa", lang)}: ${info.label}`);
      button.setAttribute("title", getTranslatedText("Pilih bahasa", lang));
      if (current) current.textContent = info.short;
    }
    document.querySelectorAll(".muja-lang-option").forEach((option) => {
      const active = option.getAttribute("data-lang") === lang;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function shouldSkipNode(node) {
    if (!node) return true;
    const parent = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!parent) return true;
    return Boolean(parent.closest("script, style, svg, noscript, textarea, code, pre, [data-muja-no-translate], .muja-no-translate"));
  }

  function translateTextNode(node, lang) {
    if (!node || shouldSkipNode(node)) return;
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
    const original = originalTextNodes.get(node);
    if (lang === "id") { node.nodeValue = original; return; }
    const leading = String(original).match(/^\s*/)[0] || "";
    const trailing = String(original).match(/\s*$/)[0] || "";
    const translated = getTranslatedText(original, lang);
    node.nodeValue = leading + normalizeText(translated || original) + trailing;
  }

  function translateAttributes(element, lang) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE || shouldSkipNode(element)) return;
    ["placeholder", "title", "aria-label", "alt"].forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      const originalAttr = `data-muja-original-${attr}`;
      if (!element.hasAttribute(originalAttr)) element.setAttribute(originalAttr, element.getAttribute(attr) || "");
      const original = element.getAttribute(originalAttr) || "";
      element.setAttribute(attr, lang === "id" ? original : getTranslatedText(original, lang));
    });
  }

  function walkAndTranslate(root, lang) {
    if (!root || !document.body) return;
    if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root, lang); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document.body) return;
    if (shouldSkipNode(root)) return;
    translateAttributes(root, lang);
    const attrElements = root.querySelectorAll ? root.querySelectorAll("[placeholder], [title], [aria-label], [alt]") : [];
    attrElements.forEach((el) => translateAttributes(el, lang));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return normalizeText(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let node = walker.nextNode();
    while (node) { translateTextNode(node, lang); node = walker.nextNode(); }
  }

  function collectOriginalTexts(root) {
    const values = new Set();
    if (!root || shouldSkipNode(root)) return [];
    const pushValue = (value) => {
      const text = normalizeText(value);
      if (!text || text.length < 2 || text.length > 260) return;
      if (/^https?:\/\//i.test(text)) return;
      values.add(text);
    };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return normalizeText(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let node = walker.nextNode();
    while (node) {
      const original = originalTextNodes.get(node) || node.nodeValue;
      pushValue(original);
      node = walker.nextNode();
    }
    root.querySelectorAll?.("[placeholder], [title], [aria-label], [alt]").forEach((el) => {
      if (shouldSkipNode(el)) return;
      ["placeholder", "title", "aria-label", "alt"].forEach((attr) => {
        if (el.hasAttribute(attr)) pushValue(el.getAttribute(`data-muja-original-${attr}`) || el.getAttribute(attr));
      });
    });
    return Array.from(values);
  }

  function scheduleRemoteTranslate(lang) {
    if (lang === "id" || isRemoteTranslating) return;
    window.clearTimeout(translateTimer);
    translateTimer = window.setTimeout(() => remoteTranslateMissing(lang), 450);
  }

  async function remoteTranslateMissing(lang) {
    if (lang === "id" || isRemoteTranslating) return;
    const memory = getMemory(lang);
    const manual = MANUAL_TRANSLATIONS[lang] || {};
    const missing = collectOriginalTexts(document.body).filter((text) => !memory[text] && !manual[text] && !(lang === "en" && ID_TO_EN[text])).slice(0, 70);
    if (!missing.length) return;
    isRemoteTranslating = true;
    try {
      const result = await mujaPostJson(TRANSLATE_ENDPOINTS, { target: lang, items: missing, page: location.pathname });
      const data = result.data || {};
      if (result.ok && data && data.translations) {
        Object.assign(memory, data.translations);
        saveMemory(lang);
        if (getSavedLanguage() === lang) {
          isLanguageChanging = true;
          walkAndTranslate(document.body, lang);
          window.setTimeout(() => { isLanguageChanging = false; }, 0);
        }
      }
    } catch (error) {
      console.warn("Muja translate error:", error);
    } finally {
      isRemoteTranslating = false;
    }
  }

  function updateChatTexts(lang) {
    const root = document.getElementById("mujaAiChat");
    if (!root) return;
    root.querySelectorAll("[data-muja-ui-text]").forEach((el) => {
      const key = el.getAttribute("data-muja-ui-text");
      el.textContent = getTranslatedText(key, lang);
    });
    root.querySelectorAll("[data-muja-ui-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-muja-ui-placeholder");
      el.setAttribute("placeholder", getTranslatedText(key, lang));
    });
    root.querySelectorAll("[data-muja-ui-title]").forEach((el) => {
      const key = el.getAttribute("data-muja-ui-title");
      el.setAttribute("title", getTranslatedText(key, lang));
      el.setAttribute("aria-label", getTranslatedText(key, lang));
    });
  }

  function setLanguage(lang) {
    const selectedLang = isSupportedLanguage(lang) ? lang : DEFAULT_LANG;
    const info = getLanguageInfo(selectedLang);
    saveLanguage(selectedLang);
    document.documentElement.classList.add("notranslate");
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.setAttribute("lang", selectedLang === "pt-br" ? "pt-BR" : selectedLang);
    document.documentElement.setAttribute("dir", info.dir || "ltr");
    document.documentElement.setAttribute("data-muja-lang", selectedLang);
    document.body.setAttribute("data-muja-lang", selectedLang);
    document.body.setAttribute("dir", info.dir || "ltr");

    isLanguageChanging = true;
    walkAndTranslate(document.body, selectedLang);
    if (!originalTitle) originalTitle = document.title;
    document.title = selectedLang === "id" ? originalTitle : getTranslatedText(originalTitle, selectedLang);
    updateLanguageButton(selectedLang);
    updateThemeToggle(document.body.getAttribute("data-muja-theme") || DEFAULT_THEME);
    updateChatTexts(selectedLang);
    window.setTimeout(() => { isLanguageChanging = false; }, 0);
    scheduleRemoteTranslate(selectedLang);
  }

  function observeLanguageMutations() {
    if (languageObserver || !document.body) return;
    languageObserver = new MutationObserver((mutations) => {
      const lang = getSavedLanguage();
      if (isLanguageChanging || lang === "id") return;
      isLanguageChanging = true;
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") mutation.addedNodes.forEach((node) => walkAndTranslate(node, lang));
        if (mutation.type === "characterData") { originalTextNodes.delete(mutation.target); translateTextNode(mutation.target, lang); }
        if (mutation.type === "attributes") translateAttributes(mutation.target, lang);
      });
      window.setTimeout(() => { isLanguageChanging = false; scheduleRemoteTranslate(lang); }, 0);
    });
    languageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label", "alt"]
    });
  }

  function initLanguage() {
    originalTitle = document.title;
    createLanguageButton();
    setLanguage(getSavedLanguage());
    observeLanguageMutations();
  }

  function appendChatMessage(role, text) {
    const list = document.getElementById("mujaAiChatMessages");
    if (!list) return null;
    const item = document.createElement("div");
    item.className = `muja-ai-msg muja-ai-msg-${role}`;
    item.textContent = text;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
    return item;
  }

  function setChatLoading(isLoading) {
    const button = document.getElementById("mujaAiSend");
    const input = document.getElementById("mujaAiInput");
    if (button) button.disabled = isLoading;
    if (input) input.disabled = isLoading;
  }


  function getMujaClientFallbackReply(message, lang, error) {
    const raw = String(message || "").trim();
    const text = raw.toLowerCase();
    const isEn = lang === "en";
    const has = (words) => words.some((word) => text.includes(String(word).toLowerCase()));
    const make = (titleId, bodyId, titleEn, bodyEn) => isEn ? `${titleEn}\n\n${bodyEn}` : `${titleId}\n\n${bodyId}`;

    if (!raw) {
      return make(
        "Pertanyaan kosong",
        "Silakan tulis pertanyaan lebih jelas ya kak. Contoh: password Canva salah, iklan tidak terbuka, email sudah terdaftar, device diblokir, kuota penuh, atau verifikasi Canva gagal.",
        "Empty question",
        "Please write the question more clearly. Example: Canva password is wrong, ads do not open, email already registered, device blocked, quota full, or Canva verification failed."
      );
    }

    if (has(["halo", "hai", "assalamualaikum", "pagi", "siang", "malam", "min", "admin"])) {
      return make(
        "Halo, selamat datang di Mujahiid",
        "Saya AI Mujahiid. Saya bantu masalah Canva Pro Gratis, password video, iklan, verifikasi email, kuota, device dibatasi, grup WhatsApp/Telegram, dan kendala halaman situs ini. Tulis kendalanya ya kak, nanti saya jawab sesuai penyebab dan solusinya.",
        "Hello, welcome to Mujahiid",
        "I am Mujahiid AI. I can help with free Canva Pro access, video passwords, ads, email verification, quota, device limitations, WhatsApp/Telegram groups, and site issues. Tell me the issue and I will answer with the cause and solution."
      );
    }

    if (has(["apa itu mujahiid", "mujahiid itu", "tentang mujahiid", "situs ini apa", "ini situs apa", "mujahid"])) {
      return make(
        "Tentang situs Mujahiid",
        "Mujahiid adalah situs khusus panduan akses Canva Pro Gratis. Situs ini bukan MujaPrime berbayar; MujaPrime.biz.id khusus layanan Canva Pro berbayar.",
        "About Mujahiid",
        "Mujahiid is a site for free Canva Pro access guidance. This site is not paid MujaPrime; MujaPrime.biz.id is for paid Canva Pro services."
      );
    }

    if (has(["mujaprime", "muja prime", "canva berbayar", "canva bayar", "paket berbayar", "tim private", "canva tim", "canva private", "canva pro tim", "canva pro private"])) {
      return make(
        "Perbedaan Mujahiid dan MujaPrime",
        "Situs ini adalah Mujahiid untuk Canva Pro Gratis. Kalau kakak mencari paket Canva Pro berbayar, VIP, Tim/Private, pembayaran, atau poin pembelian, itu ada di MujaPrime.biz.id. Di MujaPrime kakak bisa membeli Canva Pro VIP/berbayar, mengumpulkan poin, lalu menukarkan poin sesuai paket/reward yang tersedia di sana.",
        "Difference between Mujahiid and MujaPrime",
        "This site is Mujahiid for free Canva Pro. Paid/VIP Canva Pro, Team/Private packages, payments, and purchase points are on MujaPrime.biz.id. On MujaPrime, users can buy VIP/paid Canva Pro, collect points, and redeem points according to available rewards there."
      );
    }

    if (has(["halaman metode", "metode akses", "via password", "via iklan", "metode password", "metode iklan", "lewati iklan", "join canva tidak", "lihat password tidak"])) {
      return make(
        "Solusi halaman metode",
        "Di halaman metode ada 2 jalan gratis: Via Password dan Via Iklan. Via Password: klik Join Canva lalu lanjut ke halaman verifikasi, sedangkan Lihat Password membuka video untuk mendapatkan password 3 huruf. Via Iklan: isi email, pastikan kuota tersedia, izinkan pop-up/cookie, matikan VPN/adblock, lalu klik Lewati Iklan Sekarang. Jika metode iklan dinonaktifkan/kuota penuh/device sudah pernah daftar, gunakan metode password atau coba lagi nanti; kalau butuh cepat, pilih Canva Pro VIP di MujaPrime.biz.id.",
        "Method page solution",
        "The method page has 2 free routes: Password and Ads. Password: tap Join Canva and continue to verification, while See Password opens the video for the 3-letter password. Ads: enter email, make sure quota is available, allow pop-ups/cookies, disable VPN/adblock, then tap Skip Ads Now. If ads are disabled/quota full/device already registered, use password method or try later; for faster access choose VIP Canva Pro on MujaPrime.biz.id."
      );
    }

    if (has(["canva gratis", "canva free", "akses gratis", "free canva", "canva pro gratis", "cara masuk canva", "join canva", "cara dapat canva", "cara ambil canva"])) {
      return make(
        "Cara akses Canva Pro Gratis",
        "Langkahnya:\n1. Buka halaman Canva Pro Gratis di situs Mujahiid.\n2. Pilih metode yang tersedia, misalnya password video atau metode iklan.\n3. Kalau pakai password, tonton video panduan dan ambil password sesuai instruksi.\n4. Masukkan password di halaman akses/verifikasi.\n5. Isi email Gmail aktif dan nomor WhatsApp jika diminta halaman.\n\nJangan skip instruksi karena password atau syarat verifikasi bisa muncul di bagian tertentu.",
        "How to access free Canva Pro",
        "Steps:\n1. Open the Free Canva Pro page on Mujahiid.\n2. Choose the available method, such as video password or ads.\n3. If using a password, watch the guide video and take the password as instructed.\n4. Enter it on the access/verification page.\n5. Fill active Gmail and WhatsApp if requested.\n\nDo not skip the instructions because the password or verification requirement may appear in a specific part."
      );
    }

    if (has(["verifikasi video", "video tidak lanjut", "video gagal", "verifikasi gagal", "konfirmasi email", "konfirmasi wa", "konfirmasi whatsapp", "aktifkan sekarang", "aktivasi", "halaman verifikasi", "verifikasi canva"])) {
      return make(
        "Solusi halaman verifikasi Canva",
        "Alurnya: 1) klik Verifikasi Video dan tunggu sekitar 10 detik setelah video terbuka, 2) kembali ke halaman lalu isi Gmail aktif dan nomor WhatsApp yang valid, 3) masukkan password 3 huruf dari video, 4) klik Aktifkan Sekarang. Kalau macet, pakai Chrome, matikan VPN/adblock, izinkan pop-up, refresh/Ctrl+F5, lalu ulangi dari awal. Jika kuota penuh atau device diblokir, tunggu masa tunggu/kuota baru; kalau ingin cepat tanpa menunggu, gunakan Canva Pro VIP di MujaPrime.biz.id.",
        "Canva verification page solution",
        "Flow: 1) tap Video Verification and wait about 10 seconds after the video opens, 2) return to the page and enter active Gmail plus valid WhatsApp number, 3) enter the 3-letter password from the video, 4) tap Activate Now. If stuck, use Chrome, turn off VPN/adblock, allow pop-ups, force refresh, and retry. If quota is full or device is limited, wait for quota/unblock; for faster access use VIP Canva Pro on MujaPrime.biz.id."
      );
    }

    if (has(["password", "pasword", "sandi", "kata sandi", "pass", "pw", "kode 3 huruf", "3 huruf", "salah password"])) {
      return make(
        "Password Canva tidak bisa atau tidak terlihat",
        "Penyebab:\n- Video panduan diskip atau belum ditonton sampai bagian password.\n- Password 3 huruf salah ketik.\n- Huruf besar/kecil atau urutan password tidak sesuai.\n- Password yang dipakai bukan dari video/halaman terbaru.\n\nSolusi:\n1. Tonton ulang video panduan dari awal sampai bagian password.\n2. Jangan skip video.\n3. Ketik password persis seperti yang muncul.\n4. Refresh halaman lalu coba ulang.\n5. Jika tetap gagal, cek update terbaru di grup/YouTube atau hubungi admin.",
        "Canva password does not work or is not visible",
        "Cause:\n- The guide video was skipped or not watched until the password section.\n- The 3-letter password was mistyped.\n- Letter case or order does not match.\n- The password is not from the latest video/page.\n\nSolution:\n1. Rewatch the guide video from the start until the password part.\n2. Do not skip.\n3. Type the password exactly as shown.\n4. Refresh and try again.\n5. If it still fails, check group/YouTube updates or contact admin."
      );
    }

    if (has(["iklan", "ads", "adsterra", "skip iklan", "lewati iklan", "iklan tidak terbuka", "tidak bisa daftar", "daftar gagal", "link iklan"])) {
      return make(
        "Metode iklan tidak bisa dibuka",
        "Penyebab:\n- Browser memblokir pop-up, cookie, atau redirect iklan.\n- Adblock/VPN aktif.\n- Kuota iklan sedang penuh.\n- Device sudah pernah daftar atau terlalu banyak mencoba.\n\nSolusi:\n1. Pakai Chrome.\n2. Matikan adblock dan VPN sementara.\n3. Izinkan pop-up/cookie.\n4. Jangan spam klik/daftar dari device yang sama.\n5. Jika sudah pernah daftar, tunggu 24 jam atau gunakan metode password bila tersedia.",
        "Ads method cannot open",
        "Cause:\n- Browser blocks pop-ups, cookies, or ad redirects.\n- Adblock/VPN is active.\n- Ads quota is full.\n- The device has registered before or tried too many times.\n\nSolution:\n1. Use Chrome.\n2. Temporarily disable adblock and VPN.\n3. Allow pop-ups/cookies.\n4. Do not spam clicks/registration from the same device.\n5. If already registered, wait 24 hours or use password method if available."
      );
    }

    if (has(["email sudah terdaftar", "email terdaftar", "email sudah digunakan", "email dipakai", "already registered", "gmail sudah", "email gagal"])) {
      return make(
        "Email sudah terdaftar",
        "Penyebab:\n- Email Gmail itu sudah pernah dipakai untuk akses/verifikasi.\n- Sistem mendeteksi pendaftaran berulang.\n- Data lama masih tersimpan di browser/cache.\n\nSolusi:\n1. Gunakan email Gmail aktif yang benar-benar belum pernah dipakai.\n2. Jangan membuat banyak email dari device yang sama secara berulang.\n3. Coba refresh atau buka mode Incognito.\n4. Jika email penting sudah terlanjur terdaftar tapi akses belum masuk, tunggu masa tunggu yang tampil.\n5. Kalau ingin lebih cepat, pilih Canva Pro VIP di MujaPrime.biz.id.",
        "Email already registered",
        "Cause:\n- That Gmail has already been used for access/verification.\n- The system detects repeated registration.\n- Old data is still stored in browser/cache.\n\nSolution:\n1. Use an active Gmail that has not been used.\n2. Do not repeatedly create many emails from the same device.\n3. Refresh or open Incognito.\n4. If an important email is already registered but access is not active, contact admin with a screenshot."
      );
    }

    if (has(["device diblokir", "perangkat diblokir", "device block", "diblokir", "spam", "terdeteksi spam", "akses dibatasi", "perangkat dibatasi"])) {
      return make(
        "Device/perangkat dibatasi",
        "Penyebab:\nSistem bisa membatasi perangkat jika terlalu banyak mencoba email berbeda, daftar berulang, spam klik, atau aktivitas terlihat tidak normal.\n\nSolusi:\n1. Berhenti mencoba berulang-ulang dari perangkat yang sama.\n2. Tunggu masa pembatasan, biasanya coba lagi setelah beberapa waktu/24 jam.\n3. Gunakan Gmail aktif yang benar.\n4. Jangan memakai VPN/adblock saat proses.\n5. Kalau masih dibatasi, tunggu masa blokir selesai. Jika tidak mau menunggu, gunakan Canva Pro VIP di MujaPrime.biz.id.",
        "Device limited",
        "Cause:\nThe system may limit a device if it tries too many different emails, repeats registration, spams clicks, or has unusual activity.\n\nSolution:\n1. Stop repeated attempts from the same device.\n2. Wait for the limit period, usually try again later/after 24 hours.\n3. Use a valid active Gmail.\n4. Do not use VPN/adblock during the process.\n5. If still limited, contact admin with a screenshot."
      );
    }

    if (has(["kuota habis", "kuota penuh", "quota", "penuh", "tidak tersedia", "slot habis", "link penuh", "canva penuh"])) {
      return make(
        "Kuota Canva Pro Gratis penuh",
        "Penyebab:\n- Kuota akses gratis sedang penuh.\n- Link tim/akses Canva sedang diperbarui.\n- Admin menutup akses sementara agar tidak error.\n\nSolusi:\n1. Coba lagi beberapa saat kemudian.\n2. Ikuti grup WhatsApp/Telegram untuk info kuota baru.\n3. Cek YouTube @Mujahiid007 untuk update panduan terbaru.\n4. Jangan spam daftar karena bisa membuat perangkat dibatasi.",
        "Free Canva Pro quota is full",
        "Cause:\n- Free access quota is full.\n- Canva access link is being updated.\n- Admin temporarily closes access to prevent errors.\n\nSolution:\n1. Try again later.\n2. Follow WhatsApp/Telegram group for new quota info.\n3. Check YouTube @Mujahiid007 for the latest guide.\n4. Do not spam registration because the device can be limited."
      );
    }

    if (has(["verifikasi", "verify", "aktivasi", "aktifkan", "tidak aktif", "belum aktif", "gagal verifikasi", "kode verifikasi"])) {
      return make(
        "Verifikasi Canva gagal atau belum aktif",
        "Penyebab:\n- Data email/WhatsApp belum lengkap.\n- Password/verifikasi tidak sesuai instruksi.\n- Kuota sedang penuh atau link akses sedang diperbarui.\n- Browser menyimpan data lama.\n\nSolusi:\n1. Pastikan email Gmail aktif dan nomor WhatsApp benar.\n2. Ulangi instruksi dari halaman verifikasi.\n3. Refresh halaman atau buka Incognito.\n4. Jika tetap gagal, kirim screenshot ke admin agar bisa dicek.",
        "Canva verification failed or not active",
        "Cause:\n- Email/WhatsApp data is incomplete.\n- Password/verification does not match instructions.\n- Quota is full or the access link is being updated.\n- Browser stores old data.\n\nSolution:\n1. Make sure Gmail and WhatsApp are correct.\n2. Repeat the instructions from the verification page.\n3. Refresh or open Incognito.\n4. If it still fails, send a screenshot to admin."
      );
    }

    if (has(["grup", "group", "whatsapp", "wa", "telegram", "komunitas"])) {
      return make(
        "Grup update Canva Pro Gratis",
        "Untuk info kuota, password terbaru, dan panduan Canva Pro Gratis, kakak bisa cek tombol grup WhatsApp/Telegram yang tersedia di situs atau hubungi admin. Biasanya info terbaru juga dibagikan lewat YouTube @Mujahiid007.",
        "Free Canva Pro update group",
        "For quota info, latest password, and free Canva Pro guide, check the WhatsApp/Telegram group button on the site or contact admin. Updates are usually also shared on YouTube @Mujahiid007."
      );
    }

    if (has(["youtube", "yt", "video", "tutorial", "channel", "mujahiid007"])) {
      return make(
        "YouTube panduan Mujahiid",
        "Untuk panduan Canva Pro Gratis, cek Channel YouTube @Mujahiid007. Tonton video sesuai instruksi dari halaman, jangan diskip, karena password atau langkah penting bisa muncul di bagian tertentu.",
        "Mujahiid YouTube guide",
        "For free Canva Pro guidance, check YouTube channel @Mujahiid007. Watch the video according to the page instructions and do not skip, because passwords or important steps may appear in a specific part."
      );
    }

    if (has(["vip", "member", "prioritas", "tanpa iklan", "cepat"])) {
      return make(
        "VIP/Member jika tersedia",
        "VIP adalah alternatif kalau kakak tidak mau ribet password, iklan, kuota penuh, atau device sedang dibatasi. Untuk VIP/berbayar, masuk ke MujaPrime.biz.id; di sana kakak bisa membeli Canva Pro VIP, memakai layanan yang lebih cepat/stabil, mengumpulkan poin, lalu menukar poin sesuai paket/reward yang tersedia. Harga dan stok jangan ditebak di chat, cek langsung di halaman MujaPrime.",
        "VIP/Member option",
        "VIP is an alternative if users do not want password, ads, full quota, or device limitation issues. For VIP/paid access, go to MujaPrime.biz.id; users can buy VIP Canva Pro, use faster/stabler service, collect points, and redeem them according to available rewards. Prices and stock should be checked directly on MujaPrime."
      );
    }

    if (has(["bayar", "pembayaran", "qris", "qr", "dana", "gopay", "bsi", "transfer", "bukti", "upload bukti", "nominal", "harga", "paket"])) {
      return make(
        "Pertanyaan pembayaran atau paket",
        "Situs ini adalah Mujahiid untuk Canva Pro Gratis, bukan toko Canva Pro berbayar. Jika kakak mencari layanan Canva Pro berbayar/paket Tim/Private, itu masuk ke MujaPrime.biz.id atau tanyakan ke admin. Kalau di situs Mujahiid ada menu VIP/Member, ikuti instruksi halaman dan jangan kirim data pribadi di chat AI.",
        "Payment or package question",
        "This site is Mujahiid for free Canva Pro, not a paid Canva Pro shop. If you are looking for paid Canva Pro/Team/Private packages, use MujaPrime.biz.id or ask admin. If Mujahiid has a VIP/Member menu, follow the page instructions and do not send personal data in AI chat."
      );
    }

    if (has(["poin", "tukar poin", "reward", "hadiah", "klaim poin"])) {
      return make(
        "Poin/reward",
        "Untuk situs Mujahiid Canva Pro Gratis, fokus utamanya adalah akses gratis melalui panduan/password/iklan. Jika kakak melihat fitur poin atau reward di halaman tertentu, ikuti instruksi yang tampil di halaman. Jika poin tidak terbaca atau error, kirim screenshot ke admin karena perlu dicek manual.",
        "Points/reward",
        "For Mujahiid free Canva Pro, the main focus is free access through guide/password/ads. If you see points or rewards on a page, follow the instructions shown there. If points are not readable or error, send a screenshot to admin for manual checking."
      );
    }

    if (has(["login", "daftar akun", "akun", "logout", "profil", "tidak bisa masuk", "lupa akun"])) {
      return make(
        "Masalah akun/login",
        "Penyebab:\n- Email akun berbeda.\n- Data browser/cache masih menyimpan data lama.\n- Akun belum terdaftar atau data belum sinkron.\n\nSolusi:\n1. Pastikan memakai email yang benar.\n2. Logout lalu login ulang.\n3. Hapus cache atau buka Incognito.\n4. Jika masih gagal, hubungi admin dengan screenshot, email akun, dan nomor WhatsApp.",
        "Account/login issue",
        "Cause:\n- Different account email.\n- Browser/cache still stores old data.\n- Account is not registered or data is not synced.\n\nSolution:\n1. Make sure the email is correct.\n2. Logout and login again.\n3. Clear cache or open Incognito.\n4. If it still fails, contact admin with screenshot, account email, and WhatsApp number."
      );
    }

    if (has(["apk", "aplikasi", "install", "download aplikasi", "android"])) {
      return make(
        "Aplikasi/instalasi",
        "Jika situs menyediakan aplikasi Mujahiid, pastikan memakai versi terbaru, koneksi internet aktif, dan tidak memakai VPN/adblock saat proses akses. Kalau data lama masih tampil, tutup aplikasi lalu buka ulang. Jika tetap error, kirim screenshot dan jenis HP ke admin.",
        "App/installation",
        "If the site provides a Mujahiid app, make sure it is updated, internet is active, and VPN/adblock is off during access. If old data still appears, close and reopen the app. If it still errors, send screenshot and phone type to admin."
      );
    }

    if (has(["cache", "halaman lama", "tidak update", "error 500", "blank", "loading", "tidak terbuka", "bug", "rusak", "tombol tidak bisa", "tidak bisa diklik"])) {
      return make(
        "Halaman error atau data lama",
        "Penyebab:\n- Browser masih menyimpan cache lama.\n- Koneksi internet tidak stabil.\n- Server/hosting sedang lambat.\n- File situs belum terupload sempurna.\n\nSolusi:\n1. Tekan Ctrl+F5 atau buka mode Incognito.\n2. Hapus cache browser untuk situs ini.\n3. Coba browser Chrome.\n4. Jika error 500/blank/tombol tidak bisa diklik setelah semua cara dicoba, baru kirim screenshot agar file server bisa dicek.",
        "Page error or old data",
        "Cause:\n- Browser still stores old cache.\n- Internet connection is unstable.\n- Server/hosting is slow.\n- Site files are not fully uploaded.\n\nSolution:\n1. Press Ctrl+F5 or open Incognito.\n2. Clear browser cache for this site.\n3. Try Chrome.\n4. If error 500/blank/buttons cannot click, send screenshot to admin for server file checking."
      );
    }

    if (has(["bahasa", "translate", "terjemahan", "arab", "portugis", "english", "inggris"])) {
      return make(
        "Fitur bahasa/translate",
        "Gunakan tombol bahasa di bagian atas halaman. Translate di situs Mujahiid memakai terjemahan manual yang tersedia di theme.js. Jika sebagian teks belum berubah, refresh halaman dan pastikan theme.js terbaru sudah terupload.",
        "Language/translate feature",
        "Use the language button at the top of the page. Translation on Mujahiid uses the manual translations available in theme.js. If some text does not change, refresh and make sure theme.js is updated."
      );
    }

    return make(
      "Bantuan Mujahiid",
      `Saya paham pertanyaan kakak: "${raw}".\n\nJawaban umum untuk situs Mujahiid:\n- Jika masalah Canva Pro Gratis, cek metode password/video atau iklan.\n- Jika password salah, tonton ulang video tanpa skip.\n- Jika iklan/daftar gagal, matikan adblock/VPN, izinkan pop-up/cookie, dan cek kuota.\n- Jika email sudah terdaftar atau device dibatasi, jangan spam daftar; tunggu atau hubungi admin.\n- Jika halaman error, refresh paksa atau hapus cache.\n\nAgar saya jawab lebih tepat, tulis bagian yang bermasalah: password, iklan, email terdaftar, device diblokir, kuota, verifikasi, grup, YouTube, akun, atau halaman error.`,
      "Mujahiid help",
      `I understand your question: "${raw}".\n\nGeneral answer for Mujahiid:\n- For free Canva Pro issues, check password/video or ads method.\n- If password is wrong, rewatch the video without skipping.\n- If ads/registration fails, disable adblock/VPN, allow pop-ups/cookies, and check quota.\n- If email is registered or device limited, do not spam; wait or contact admin.\n- If page errors, force refresh or clear cache.\n\nFor a more accurate answer, mention the problem: password, ads, registered email, blocked device, quota, verification, group, YouTube, account, or page error.`
    );
  }



  function getMujaLanguageName(lang) {
    const info = getLanguageInfo(lang || getSavedLanguage());
    return info.apiName || info.label || "Indonesian";
  }

  function getAiWebConfig() {
    const cfg = window.AI_WEB_CONFIG || {};
    return {
      apiKey: String(cfg.apiKey || cfg.groqApiKey || cfg.key || "").trim(),
      model: String(cfg.model || "llama-3.3-70b-versatile").trim(),
      fallbackModel: String(cfg.fallbackModel || "llama-3.1-8b-instant").trim(),
      pengetahuan: String(cfg.pengetahuan || cfg.systemPrompt || "").trim()
    };
  }

  function isUsableGroqKey(key) {
    return !!key && key.length > 20 && !/ISI_|GANTI|PASTE|YOUR_|API_KEY/i.test(key);
  }

  async function mujaFetchGroq(model, messages, cfg) {
    const controller = window.AbortController ? new AbortController() : null;
    const timeout = controller ? window.setTimeout(() => controller.abort(), 22000) : null;
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + cfg.apiKey
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.45,
          max_tokens: 650,
          top_p: 0.9,
          stream: false
        }),
        signal: controller ? controller.signal : undefined
      });
      if (timeout) window.clearTimeout(timeout);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const err = data && data.error && data.error.message ? data.error.message : "HTTP " + response.status;
        throw new Error(err);
      }
      const reply = data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "";
      if (!reply || !String(reply).trim()) throw new Error("Jawaban Groq kosong");
      return String(reply).trim();
    } catch (error) {
      if (timeout) window.clearTimeout(timeout);
      throw error;
    }
  }

  async function mujaAskGroqDirect(message, lang) {
    const cfg = getAiWebConfig();
    if (!isUsableGroqKey(cfg.apiKey)) throw new Error("API key Groq belum ada di ai-web-config.js");

    const languageName = getMujaLanguageName(lang);
    const systemPrompt = cfg.pengetahuan || `Kamu adalah AI customer service situs Mujahiid. Situs ini khusus Canva Pro Gratis, bukan MujaPrime berbayar. Jawab singkat, ramah, akurat, dan sesuai pertanyaan pelanggan.`;
    const messages = [
      {
        role: "system",
        content: systemPrompt + `\n\nJawab pelanggan dalam bahasa: ${languageName}. Jangan menjawab sebagai MujaPrime kecuali pelanggan bertanya paket berbayar/VIP/poin pembelian atau untuk menjelaskan perbedaannya. Untuk masalah halaman metode dan verifikasi-canva, beri solusi tuntas dulu: penyebab, langkah perbaikan, lalu opsi terakhir. Jangan langsung menyuruh ke admin. Jika tidak tahu data khusus seperti password terbaru, kuota pasti, harga VIP, stok, atau status akun, jangan mengarang. Jika solusi gratis sudah mentok, sarankan Canva Pro VIP di MujaPrime.biz.id; jelaskan bahwa di sana pelanggan bisa membeli produk, mengumpulkan poin, lalu menukar poin sesuai paket/reward yang tersedia.`
      }
    ];

    chatHistory.slice(-8).forEach((item) => {
      if (!item || !item.role || !item.content) return;
      if (!["user", "assistant"].includes(item.role)) return;
      messages.push({ role: item.role, content: String(item.content).slice(0, 1200) });
    });
    messages.push({
      role: "user",
      content: `Halaman saat ini: ${location.pathname}\nJudul halaman: ${document.title}\nPertanyaan pelanggan: ${message}`
    });

    try {
      return await mujaFetchGroq(cfg.model, messages, cfg);
    } catch (firstError) {
      if (cfg.fallbackModel && cfg.fallbackModel !== cfg.model) {
        return await mujaFetchGroq(cfg.fallbackModel, messages, cfg);
      }
      throw firstError;
    }
  }

  function detectAiActionButtons(text) {
    const value = String(text || "").toLowerCase();
    const has = (words) => words.some((word) => value.includes(word));
    return {
      youtube: has(["youtube", "yt", "video", "tutorial", "password", "canva gratis", "gratis"]),
      admin: has(["admin", "wa", "whatsapp", "kontak", "cs", "customer service", "bantuan admin", "nomor admin"]),
      group: has(["grup", "group", "telegram", "whatsapp", "kuota", "update"]),
      prime: has(["mujaprime", "muja prime", "vip", "berbayar", "bayar", "beli", "poin", "reward", "tim", "private", "kuota penuh", "device diblokir", "tanpa iklan", "tanpa password"])
    };
  }

  function appendAiActionButtons(flags) {
    const list = document.getElementById("mujaAiChatMessages");
    if (!list || !flags || (!flags.youtube && !flags.admin && !flags.group && !flags.prime)) return;
    const wrap = document.createElement("div");
    wrap.className = "muja-ai-actions";
    const add = (cls, href, text) => {
      const a = document.createElement("a");
      a.className = "muja-ai-action " + cls;
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = text;
      wrap.appendChild(a);
    };
    if (flags.youtube) add("yt", "https://www.youtube.com/@Mujahiid007", "YouTube");
    if (flags.group) add("group", "https://regionoure.blogspot.com/p/grup-mujahiid.html", "Grup");
    if (flags.prime) add("prime", "https://mujaprime.biz.id", "MujaPrime VIP");
    list.appendChild(wrap);
    list.scrollTop = list.scrollHeight;
  }

  async function sendAiChat() {
    const input = document.getElementById("mujaAiInput");
    if (!input) return;
    const lang = getSavedLanguage();
    const message = input.value.trim();
    if (!message) {
      appendChatMessage("bot", getTranslatedText("Tulis pertanyaan dulu.", lang));
      return;
    }

    input.value = "";
    appendChatMessage("user", message);
    const typing = appendChatMessage("bot", getTranslatedText("AI mengetik...", lang));
    setChatLoading(true);

    let reply = "";
    let usedOnlineAi = false;
    let lastError = null;

    try {
      // Mode utama: sama seperti contoh situs MujaPrime yang Anda kirim,
      // yaitu Groq langsung dari browser memakai window.AI_WEB_CONFIG.
      reply = await mujaAskGroqDirect(message, lang);
      usedOnlineAi = true;
    } catch (directError) {
      lastError = directError;
      console.warn("Groq direct browser gagal:", directError && directError.message ? directError.message : directError);

      // Gunakan fallback lokal jika AI browser gagal.
    }

    if (!reply) {
      reply = getMujaClientFallbackReply(message, lang, lastError);
      console.warn("AI online belum aktif, fallback lokal dipakai:", lastError && lastError.message ? lastError.message : lastError);
    }

    if (typing) typing.textContent = reply;
    chatHistory.push({ role: "user", content: message });
    chatHistory.push({ role: "assistant", content: reply });
    chatHistory = chatHistory.slice(-12);

    const actions = detectAiActionButtons(message + "\n" + reply);
    if (actions.youtube || actions.admin || actions.group || actions.prime) {
      window.setTimeout(() => appendAiActionButtons(actions), 180);
    }

    setChatLoading(false);
    input.focus();
  }

  function initAiChat() {
    if (document.getElementById("mujaAiChat")) return;
    const root = document.createElement("section");
    root.id = "mujaAiChat";
    root.className = "muja-ai-chat";
    root.setAttribute("data-muja-no-translate", "true");
    root.innerHTML = `
      <button type="button" class="muja-ai-fab" id="mujaAiFab" data-muja-ui-title="Buka chat AI" aria-label="Buka chat AI">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.8A3.8 3.8 0 017.8 2h8.4A3.8 3.8 0 0120 5.8v6.9a3.8 3.8 0 01-3.8 3.8h-3.85L7.2 21v-4.5A3.8 3.8 0 014 12.7V5.8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 8h8M8 12h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span data-muja-ui-text="Chat AI">Chat AI</span>
      </button>
      <div class="muja-ai-window" id="mujaAiWindow" aria-live="polite">
        <div class="muja-ai-head">
          <div class="muja-ai-avatar"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.35 4.05L17.5 8.4l-4.15 1.35L12 14l-1.35-4.25L6.5 8.4l4.15-1.35L12 3z" fill="currentColor"/><path d="M6 14.5l.75 2.25L9 17.5l-2.25.75L6 20.5l-.75-2.25L3 17.5l2.25-.75L6 14.5zM18 13l.95 2.85L22 16.8l-3.05.95L18 21l-.95-3.25L14 16.8l3.05-.95L18 13z" fill="currentColor"/></svg></div>
          <div><strong data-muja-ui-text="Asisten Mujahiid">Asisten Mujahiid</strong><small data-muja-ui-text="Online siap membantu">Online siap membantu</small><div class="muja-ai-online-note">AI aktif Sekarang</div></div>
          <button type="button" class="muja-ai-close" id="mujaAiClose" data-muja-ui-title="Minimalkan" aria-label="Minimalkan">×</button>
        </div>
        <div class="muja-ai-messages" id="mujaAiChatMessages">
          <div class="muja-ai-msg muja-ai-msg-bot" data-muja-ui-text="Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis.">Halo! Saya AI Mujahiid. Silakan tanya masalah Canva Pro Gratis.</div>
        </div>
        <div class="muja-ai-form">
          <textarea id="mujaAiInput" rows="1" data-muja-ui-placeholder="Tanya tentang situs ini..." placeholder="Tanya tentang situs ini..."></textarea>
          <button type="button" id="mujaAiSend" data-muja-ui-title="Kirim" aria-label="Kirim"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12L20 4l-4 16-3.5-6.5L4 12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M20 4l-7.5 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    const fab = document.getElementById("mujaAiFab");
    const close = document.getElementById("mujaAiClose");
    const send = document.getElementById("mujaAiSend");
    const input = document.getElementById("mujaAiInput");
    fab?.addEventListener("click", () => { root.classList.add("is-open"); input?.focus(); });
    close?.addEventListener("click", () => root.classList.remove("is-open"));
    send?.addEventListener("click", sendAiChat);
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendAiChat(); }
    });
    updateChatTexts(getSavedLanguage());
  }


  function getMujaVisitorId() {
    const key = "muja_total_visitor_id";
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        const cryptoId = window.crypto && typeof window.crypto.randomUUID === "function" ? window.crypto.randomUUID() : null;
        id = cryptoId || (Date.now().toString(36) + "_" + Math.random().toString(36).slice(2) + "_" + Math.random().toString(36).slice(2));
        localStorage.setItem(key, id);
      }
      return id;
    } catch (error) {
      return Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
    }
  }

  function initVisitorCounter() {
    try {
      if (window.__mujaVisitorCounterStarted) return;
      window.__mujaVisitorCounterStarted = true;

      localStorage.setItem('muja_last_visit', new Date().toISOString());
    } catch (error) {}
  }

  function initAll() {
    document.documentElement.classList.add("notranslate");
    document.documentElement.setAttribute("translate", "no");
    initTheme();
    initLanguage();
    initVisitorCounter();
    initAiChat();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAll); else initAll();
})();
