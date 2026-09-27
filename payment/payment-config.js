

// ========== VARIABEL GLOBAL ==========
let paymentData = {};
let countdownInterval;
let timeLeft = 900;
let isTimeUp = false;
let uploadedImageBase64 = null;

// ========== FUNGSI-FUNGSI ==========
function formatRupiah(angka) {
    return 'Rp' + new Intl.NumberFormat('id-ID').format(angka || 0);
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = 'toast-notif';
    toast.textContent = msg;
    if (type === 'success') toast.style.borderLeft = '3px solid #00e5b4';
    if (type === 'error') toast.style.borderLeft = '3px solid #ef4444';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function loadPaymentData() {  // ✅ DITAMBAHKAN async
    paymentData = {
        productId: sessionStorage.getItem('payment_product_id'),
        productName: sessionStorage.getItem('payment_product_name'),
        price: parseInt(sessionStorage.getItem('payment_product_price')) || 0,
        method: sessionStorage.getItem('payment_method'),
        customerName: sessionStorage.getItem('payment_customer_name'),
        customerWa: sessionStorage.getItem('payment_customer_wa'),
        customerEmail: (sessionStorage.getItem('payment_customer_email') || localStorage.getItem('muja_user_email') || '').trim().toLowerCase(),
        poin: parseInt(sessionStorage.getItem('payment_poin')) || 0,
        redirectPage: sessionStorage.getItem('payment_redirect_page') || ''
    };
    
    if (!paymentData.productId || !paymentData.method) {
        showToast('❌ Data pembayaran tidak ditemukan!', 'error');
        setTimeout(() => { window.location.href = '/'; }, 1500);
        return false;
    }
    
    document.getElementById('productName').textContent = paymentData.productName;
    document.getElementById('totalAmount').textContent = formatRupiah(paymentData.price);
    document.getElementById('poinReward').textContent = '+' + paymentData.poin.toLocaleString('id-ID') + ' Poin';
    
  // Redirect page biasanya sudah dibawa dari halaman detail, jadi payment bisa tampil tanpa menunggu database.
    if (!paymentData.redirectPage) {
        try {
            const [productSnap, itemSnap] = await Promise.all([
                db.collection('products').doc(paymentData.productId).get(),
                db.collection('collection_items').doc(paymentData.productId).get()
            ]);
            const source = productSnap.exists ? productSnap : itemSnap;
            if (source.exists) {
                const sourceData = source.data();
                paymentData.redirectPage = sourceData.redirectPage || 'status-aktif';
                if (sourceData.poinReward && !paymentData.poin) {
                    paymentData.poin = sourceData.poinReward || 0;
                    document.getElementById('poinReward').textContent = '+' + paymentData.poin.toLocaleString('id-ID') + ' Poin';
                }
            } else {
                paymentData.redirectPage = 'status-aktif';
            }
        } catch(e) {
            console.warn('Redirect payment fallback:', e);
            paymentData.redirectPage = 'status-aktif';
        }
    }
    
    renderPaymentDetail();
    startCountdown();
    return true;
}

function renderPaymentDetail() {
    const container = document.getElementById('paymentDetail');
    const method = paymentData.method;
    const productName = paymentData.productName;
    
    let html = '';
    
    const paymentImages = {
        'gopay': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjF9CKPPKvCqtiM8xIUWh0INNeLn8FJrLK5ow3mFxMFLXcMJpCQzX8o1ki2uyd00ygUBXTwWZi6DDbicr708CJHaVACwDBhuc6mfktzjytkv8QWzbW9X0zz2aKJgbh50QptYAA1Cxa72yhuVOzilVL0kdV86VuE3S3q2PsyUB_MNc5ySN6fn-5Y46NIR-g/s500/Desain%20tanpa%20judul%20%281%29.png',
        'dana': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqiQ42Was703xRUW38qRGy4iyOPAvMBee4hWn9XwMF1OQRuPwFVFLt8d4Dkt7uhWBC_TUzOSj1sQLAiJhqiDvsHTZDQpYE2EGMvC5vilfhiALgGR5tryOlZFh2mEvrvly0lrUKTkTslNkNGXJOpThoycYcP-E3ZDXLIXcZTptu2D1P1xs6N9tuc5CeB_c/s500/Desain%20tanpa%20judul%20%282%29.png',
        'bsi': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjxR0X9DFugEYMsVIw5XaV2sAHy9-6D2TUtQ3a5nKp46f1j5ClxqFC7UDCNJTzp0wiNkVS7oAW9x5uTl0BKglLw7C1dBXSdlrSnASt8rDo2BJFi2OctelPgt2eCSSq3ix8r2NY5N9VH2RCc5pU8EybkjKP1nb7ROX5x24R0Ct01xH9u3ksk13e_P-qghRw/s500/Desain%20tanpa%20judul%20%283%29.png',
        'qris': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhDhVzZma3F9eNcWWQjdV0gFI-MRhKgM2J0tySxA9XK1Pp4O3g3frGR4KmB26f3_FVCy7WMTlQeDR_8939eIX-azjwklCFyfntx5BobMfHujVfT6UWm-RbbwdRLgknOixtO8_-jAffipbdZi8YXjILeO8bGGsQcPwmHv986ckbbc-U0edmA3-E61Tbl41c/s500/Desain%20tanpa%20judul%20%284%29.png'
    };
    
    // ✅ Style untuk payment-number (TIMPA liquid-glass)
    const numberStyle = 'style="font-size:28px;font-weight:800;color:#ffffff !important;letter-spacing:2px;margin:10px 0;text-shadow:0 0 10px rgb(0 0 0 / 40%);background:linear-gradient(135deg, #ffffff, #ffffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;"';
    
    if (method === 'dana') {
        html = `
            <img src="${paymentImages.dana}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 12px;">
            <h3 style="margin-bottom: 12px;">Bayar dengan DANA</h3>
            <p>Bayar ke nomor DANA berikut:</p>
            <div ${numberStyle}>0823-6903-8053</div>
            <p style="font-size: 12px; margin-top: 8px;">a.n. <strong>MUJAHIDIN</strong></p>
            <p style="font-size: 12px; margin-top: 8px;">Setelah transfer, upload bukti pembayaran di bawah.</p>
        `;
    } else if (method === 'gopay') {
        html = `
            <img src="${paymentImages.gopay}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 12px;">
            <h3 style="margin-bottom: 12px;">Bayar dengan GoPay</h3>
            <p>Bayar ke nomor GoPay berikut:</p>
            <div ${numberStyle}>0823-6903-8053</div>
            <p style="font-size: 12px; margin-top: 8px;">a.n. <strong>MUJAHIDIN</strong></p>
            <p style="font-size: 12px; margin-top: 8px;">Setelah transfer, upload bukti pembayaran di bawah.</p>
        `;
    } else if (method === 'bsi') {
        html = `
            <img src="${paymentImages.bsi}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 12px;">
            <h3 style="margin-bottom: 12px;">Transfer Bank BSI</h3>
            <p>Transfer ke rekening BSI berikut:</p>
            <div ${numberStyle}>7181-6490-83</div>
            <p style="font-size: 12px;">a.n. <strong>MUJAHIDIN</strong></p>
            <p style="font-size: 12px; margin-top: 8px;">Setelah transfer, upload bukti pembayaran di bawah.</p>
        `;
    } else if (method === 'qris') {
        const qrisImagesByName = {
            'CANVA PRO TIM 1 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSJKIh4Uw_kqpNo_ZPH0vcFvYX8HGOi-c5DHAg8ido8Uo31HW8GPTLEiRCgHshOd1IbQZwEU1BfZOzDnzpbrQlae47QjDMet6ukg8OlZxscU_Bn7PbwysQqTscArb9CCxp2YQ8MRMxMG7OONKt-xTDf-SvLSzVidB_cqvBycf6srvh0uj0DPQH3xpfo-0N/s670/QRIS%203.420.jpg',
            'CANVA PRO TIM 2 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEganr42AzWExzosFMVl-DeAyX288Mh2KKzl4NOGUztqPdfbb03uI1FOgnL0HIAOfZTLelwIkHzmr_iGL-YRksNaU_dVQTaaPLdx-1t4IkSVQ8vtJMQhISgvkFVWVG-J8dXAxEjnKAnPGy1W5d82UiIsJryVDD4pFCDcNutfokxE6GPASllTBWE_Fnzob5ix/s664/QRIS%206.421.jpg',
            'CANVA PRO TIM 3 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjkUYA4LFyjkCvO0IcSSCatiqEQh87uQsLkLBhrqOiyR6sAf75_23ZKO870tEJqcW4dbYOrj38Iob5LfCqWwBIFRhY6rh7XbcYhyphenhyphenyKVWpVrJmIhxNgPSYEbCTWOsRU2iayH01_wQurEpJLsLdoJ8PLqzT2q56iAaJ_gw8vw2ripW1Pl903TCGHNUTZZBUfa/s662/QRIS%2010.452.jpg',
            'CANVA PRO TIM 4 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7EqyYTZkRdMHpCkR3aClvPecs4ndALmTwLeFSAPEBTouNurFobLzCcXu9i_MqZB1MfT7yVN0hiFNo8f8bBMI1c9wiP1rx3EjsGQZKBzm2YIgpGTNQrWF1Omq2rRHI0bEKq4hmBv6oabUyoGMfhHyKkGg0Xan07vhKTDNgzBVnHg6E03z97GJFJrdUDeED/s660/QRIS%2012.420.jpg',
            'CANVA PRO PRIVATE 1 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj8v45HiLLc969kunxDT58O19SQXZ06l7xdMA6YeoWPGrQRlfzqyy5-P0t449FKyb6AROYq4Y8Mp3zNpOn08oy3DEX1Kvgzag1ZGt_sveXHxcSEZJQ8F1pkcCfP-7QbbC9nq233Z6Qqxhj51ax-jMOFAbIC3jrZ7OlcD-zFSAn70qdIidYb2WvUPjHajbk/s659/QRIS%20MUJAHIID.jpeg',
            'CANVA PRO PRIVATE 2 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg_0-n8Czrd_16VL2hCiDF3utYGgOOjVLKqRxxJvhETRgTKkUvbvx2P20T0faERBxQ93NEL8N2rRQZgeJD4hKbsYIq3XrnEZOhqk0cGUNKgYRKQ5xKVkFPdz7bhhxYU8WYFrQNrVZ3zkr8tMlbAlpHpEhfGn4PI4J0GBJsIRKDzbWE2xTfRpNkJwmhDYGfA/s666/30.570.jpg',
            'CANVA PRO PRIVATE 3 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjeTpbO9JZGunwkY6oW5FgQ0iDc3-UH1ux85LUl96oXqGz-_9L_1QzZima7QWGmU6EXqDLldpwTxQVG2-asSenoRp6nMl_VC7IJkesj709gKks2dbZ06ceZHhCdt-vwGW8456ErdqT0AAcDwbnpB2YPm6c068YWw2zan1vNhtJHWQafhrLqdVTtgvKhWT-s/s665/40.625.jpg',
            'CANVA PRO PRIVATE 4 BULAN': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjMa3WM9-jgC203dn01uhI451CaIQqobZC7MVQU7vE1kpOrWjjJfs8e6ODA6uEUNR9LxfPeUgMzqJxzrAMsxZVje28YhXlHoqw0lKlsY3orVHt8VXPIKModfHRiKLLYLdVMZby1iFFuOO0TVIFYEBAJf14HgLhnuxI_cdgLA9RxPEzfwsP87oQ_Vww8v7Ed/s668/50.870.jpg'
        };
        
        const qrisNominals = {
            'CANVA PRO TIM 1 BULAN': 'Rp3.420',
            'CANVA PRO TIM 2 BULAN': 'Rp6.421',
            'CANVA PRO TIM 3 BULAN': 'Rp10.452',
            'CANVA PRO TIM 4 BULAN': 'Rp12.420'
        };
        
        let qrisImageUrl = qrisImagesByName[productName];
        if (!qrisImageUrl) {
            qrisImageUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjcXHBCrH4UH0a_2E88s4AZOJ6WbHdR583Zwa-1quJCnKzYigEqsJmdfuLT2ni8eZvQAvz5Cyt9OZAwDJ4vybHVuR0J14hBRjA6GAn0ySUs6f9e7d3gIaCcX-E-oFq-JAlyk_eptN2nh8B6w1s-HuCqlfgFNUf7ekD5cAlbJ_VGZEljsJOjaRhoJ23Zfcox/s971/WhatsApp%20Image%202026-05-24%20at%2015.25.50.jpeg';
        }
        
        let nominalText = qrisNominals[productName] || '';
        let nominalHtml = nominalText ? `<div style="font-size: 28px; font-weight: 800; color: var(--gold-400); margin: 12px 0; letter-spacing: 1px;">${nominalText}</div>` : '';
        
        html = `
            <img src="${paymentImages.qris}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 12px;">
            <h3 style="margin-bottom: 8px;">Scan QRIS</h3>
            <p style="margin-bottom: 4px;">Scan QR Code berikut untuk melakukan pembayaran:</p>
            ${nominalHtml}
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">Nominal yang harus dibayar</p>
            <img src="${qrisImageUrl}" class="qris-image" onerror="this.src='https://placehold.co/250x250/1e1e2b/666?text=QRIS'">
            <p style="font-size: 12px; margin-top: 8px;">Paket: <strong>${productName}</strong></p>
            <p style="font-size: 12px;">Setelah scan QRIS dan transfer, upload bukti pembayaran di bawah.</p>
        `;
    }
    
    container.innerHTML = html;
}

function startCountdown() {
    timeLeft = 900;
    const timerElement = document.getElementById('countdownTimer');
    timerElement.textContent = '15:00';
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            isTimeUp = true;
            timerElement.textContent = '00:00';
            document.getElementById('verifyBtn').disabled = true;
            document.getElementById('warningText').textContent = '⚠️ Waktu pembayaran habis! Silakan ulangi pesanan.';
            showToast('⏰ Waktu pembayaran habis!', 'error');
        }
    }, 1000);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ Ukuran file maksimal 2MB!');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            const maxSize = 700;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.68);
            
            const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
            if (compressedSize > 700 * 1024) {
                alert('⚠️ Gambar masih terlalu besar setelah kompresi! Silakan pilih gambar yang lebih kecil.');
                event.target.value = '';
                return;
            }
            
            uploadedImageBase64 = compressedDataUrl;
            
            const previewImg = document.getElementById('previewImg');
            const previewContainer = document.getElementById('previewContainer');
            const uploadSection = document.getElementById('uploadSection');
            
            previewImg.src = compressedDataUrl;
            previewContainer.style.display = 'block';
            uploadSection.classList.add('has-image');
            
            if (!isTimeUp) {
                document.getElementById('verifyBtn').disabled = false;
                document.getElementById('warningText').textContent = '';
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    event.target.value = '';
}

function removeUploadedImage() {
    uploadedImageBase64 = null;
    const previewContainer = document.getElementById('previewContainer');
    const uploadSection = document.getElementById('uploadSection');
    const previewImg = document.getElementById('previewImg');
    
    previewContainer.style.display = 'none';
    uploadSection.classList.remove('has-image');
    previewImg.src = '';
    
    document.getElementById('verifyBtn').disabled = true;
    document.getElementById('warningText').textContent = '';
    showToast('Foto dihapus, silakan upload ulang', 'info');
}

// Helper: ambil durasi dari nama produk
function getDurationFromName(productName) {
    const match = productName.match(/(\d+)/);
    return match ? match[1] : '1';
}

// Helper: tentukan tipe produk (tim/private)
function getProductType(productName) {
    const name = productName.toUpperCase().trim();
    if (name.includes('PRIVATE')) return 'private';
    return 'tim';
}

async function getRedirectUrl(productName) {
    const duration = getDurationFromName(productName);
    const type = getProductType(productName);
    
    // ✅ DEFAULT: status-aktif
    let targetPage = 'status-aktif';
    
    // ✅ Cek dari data produk yang sudah diambil
    if (paymentData.redirectPage) {
        targetPage = paymentData.redirectPage;
    }
    
    return '/' + targetPage +
        '?product=' + encodeURIComponent(productName) +
        '&price=' + paymentData.price +
        '&duration=' + duration +
        '&method=' + paymentData.method +
        '&type=' + type +
        '&name=' + encodeURIComponent(paymentData.customerName) +
        '&wa=' + encodeURIComponent(paymentData.customerWa) +
        '&email=' + encodeURIComponent(paymentData.customerEmail || '') +
        '&poin=' + encodeURIComponent(paymentData.poin || 0);
}

async function verifyPayment() {
    if (isTimeUp) {
        showToast('❌ Waktu pembayaran telah habis!', 'error');
        return;
    }
    if (!uploadedImageBase64) {
        showToast('⚠️ Silakan upload bukti pembayaran terlebih dahulu!', 'error');
        return;
    }

    const btn = document.getElementById('verifyBtn');
    if (btn.dataset.submitting === '1') return;
    btn.dataset.submitting = '1';
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<span class="loading-spinner"></span> Menyimpan pembayaran...';

    try {
        // Simpan order + token dalam SATU transaksi database. Lebih cepat dan mencegah order setengah tersimpan.
        const orderRef = db.collection('orders').doc();
        const tokenRef = db.collection('access_tokens').doc();
        const accessToken = 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        const now = firebase.firestore.FieldValue.serverTimestamp();
        const batch = db.batch();

        batch.set(orderRef, {
            productId: paymentData.productId,
            productName: paymentData.productName,
            price: paymentData.price,
            paymentMethod: paymentData.method,
            customerName: paymentData.customerName,
            customerWa: paymentData.customerWa,
            customerEmail: paymentData.customerEmail || '',
            poinReward: paymentData.poin || 0,
            status: 'success',
            paymentProof: uploadedImageBase64,
            createdAt: now
        });

        batch.set(tokenRef, {
            token: accessToken,
            orderId: orderRef.id,
            productName: paymentData.productName,
            customerName: paymentData.customerName,
            customerWa: paymentData.customerWa,
            customerEmail: paymentData.customerEmail || '',
            poinReward: paymentData.poin || 0,
            status: 'unused',
            createdAt: now,
            // Link dapat dibuka ulang selama 7 hari. Status "used" mencegah
            // pemrosesan poin/aktivasi ganda, bukan memblokir halaman pelanggan.
            expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString()
        });

        await batch.commit();

        clearInterval(countdownInterval);
        showToast('✅ Pembayaran tersimpan. Mengalihkan...', 'success');
        const redirectUrl = await getRedirectUrl(paymentData.productName) + '&token=' + encodeURIComponent(accessToken);
        setTimeout(function() { window.location.href = redirectUrl; }, 900);
    } catch(e) {
        console.error('Payment error:', e);
        let msg = e && e.message ? e.message : 'Terjadi kesalahan saat menyimpan pembayaran.';
        if (e && e.status === 413) msg = 'Foto bukti pembayaran terlalu besar. Pilih foto yang lebih kecil.';
        if (e && e.code === 'REQUEST_TIMEOUT') msg = 'Server pembayaran sedang lambat. Coba tekan verifikasi lagi.';
        showToast('❌ ' + msg, 'error');
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = '🔒 Verifikasi Pembayaran';
        btn.dataset.submitting = '0';
    }
}

// Bawahnya tetap sama
document.addEventListener('DOMContentLoaded', async () => {  // ✅ Tambahkan async
    const hasData = await loadPaymentData();  // ✅ Tambahkan await
    if (!hasData) return;
});
