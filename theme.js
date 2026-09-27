// theme.js - Muja Prime Theme (LOAD LAST)
(function() {
    'use strict';

    var moon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="20" height="20"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.63 20a9 9 0 0 1-9.12-8.78A8.61 8.61 0 0 1 14.17 5 10.17 10.17 0 0 0 5 15a10.23 10.23 0 0 0 10.42 10A10.43 10.43 0 0 0 25 18.9a9.3 9.3 0 0 1-4.37 1.1Z"></path></svg>';
    var sun = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="20" height="20"><circle cx="15" cy="15" r="6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="15" y1="2" x2="15" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="25" x2="15" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="2" y1="15" x2="5" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="15" x2="28" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6.22" y1="6.22" x2="8.34" y2="8.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21.66" y1="21.66" x2="23.78" y2="23.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6.22" y1="23.78" x2="8.34" y2="21.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21.66" y1="8.34" x2="23.78" y2="6.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    function ls(k,d){ try{var v=localStorage.getItem(k);return v!==null?v:d;}catch(e){return d;} }
    function lss(k,v){ try{localStorage.setItem(k,v);}catch(e){} }
    function qs(id){ return document.getElementById(id); }

    // Manual accent color chosen from Akun Saya > Pengaturan.
    var MUJA_ACCENT_MAP = {
        orange: { ember300:'#ffb088', ember400:'#ff8855', ember500:'#ff6b2b', ember600:'#e0521b', gold400:'#f7d46a', gold500:'#f5c528' },
        yellow: { ember300:'#fde68a', ember400:'#facc15', ember500:'#eab308', ember600:'#ca8a04', gold400:'#fef08a', gold500:'#facc15' },
        red: { ember300:'#fca5a5', ember400:'#f87171', ember500:'#ef4444', ember600:'#dc2626', gold400:'#fecaca', gold500:'#f87171' },
        green: { ember300:'#86efac', ember400:'#4ade80', ember500:'#22c55e', ember600:'#16a34a', gold400:'#bbf7d0', gold500:'#4ade80' },
        blue: { ember300:'#93c5fd', ember400:'#60a5fa', ember500:'#3b82f6', ember600:'#2563eb', gold400:'#bfdbfe', gold500:'#60a5fa' },
        purple: { ember300:'#d8b4fe', ember400:'#c084fc', ember500:'#a855f7', ember600:'#9333ea', gold400:'#e9d5ff', gold500:'#c084fc' },
        pink: { ember300:'#f9a8d4', ember400:'#f472b6', ember500:'#ec4899', ember600:'#db2777', gold400:'#fbcfe8', gold500:'#f472b6' },
        cyan: { ember300:'#67e8f9', ember400:'#22d3ee', ember500:'#06b6d4', ember600:'#0891b2', gold400:'#a5f3fc', gold500:'#22d3ee' }
    };
    function ensureAccentOverrideStyle(){
        if (document.getElementById('muja-global-accent-style')) return;
        var st = document.createElement('style');
        st.id = 'muja-global-accent-style';
        st.textContent = `
/* Global accent color from Akun Saya > Pengaturan */
:root{
  --muja-primary: var(--ember-500);
  --muja-primary-2: var(--ember-400);
  --muja-secondary: var(--gold-500);
  --muja-secondary-2: var(--gold-400);
  --muja-accent-grad: linear-gradient(135deg,var(--ember-500),var(--gold-500));
  --muja-accent-grad-soft: linear-gradient(135deg,rgba(var(--muja-rgb-primary),.18),rgba(var(--muja-rgb-secondary),.10));
  --muja-accent-glow: rgba(var(--muja-rgb-primary),.24);
}
.muaja-force-accent, .btn-primary, .btn-shop-wide, .btn-submit, .join-btn, .payment-btn,
.product-btn, .checkout-btn, .pay-button, .add-cart-btn, .order-btn, .btn-accent,
.hero-cta, .floating-btn, .ai-chat-btn, .ai-chat-header, .ai-send, .settings-tab.active,
.lang-choice.active,
button[class*="primary"], a[class*="primary"]{
  background:var(--muja-accent-grad)!important;
  border-color:transparent!important;
}
.mobile-nav-item.active, .nav-item.active, .bottom-nav .active{
  color:var(--ember-400)!important;
  background:linear-gradient(135deg,rgba(var(--muja-rgb-primary),.18),rgba(var(--muja-rgb-secondary),.10))!important;
  border:1px solid rgba(var(--muja-rgb-primary),.26)!important;
  box-shadow:0 8px 24px rgba(var(--muja-rgb-primary),.16), inset 0 1px 0 rgba(255,255,255,.14)!important;
  backdrop-filter:blur(16px)!important;
  -webkit-backdrop-filter:blur(16px)!important;
}
.ai-msg.user, .badge, .product-badge, .price-badge, .status-badge, .poin-badge,
.product-poin-badge span, .stat-icon, .card-icon, .icon-circle, .header-logo-icon{
  background:var(--muja-accent-grad)!important;
}
.theme-toggle, .cart-btn, .icon-btn, .quick-action svg, .nav-item:hover, .mobile-nav-item:hover,
.product-price, .history-value, .poin-value, .saved-price, .brand-accent, .text-accent,
a:hover, .ai-input:focus + .ai-send{
  color:var(--ember-400)!important;
}
input:focus, textarea:focus, select:focus, .color-choice.active, .quick-action:hover, .setting-card:hover,
.product-card:hover, .glass-card:hover, .info-row:hover{
  border-color:var(--ember-400)!important;
  box-shadow:0 0 0 3px rgba(var(--muja-rgb-primary),.13)!important;
}
::-webkit-scrollbar-thumb{ background:var(--ember-600)!important; }
.ai-input:focus{ border-color:var(--ember-500)!important; }
`;
        document.head.appendChild(st);
    }
    function hexToRgbTriplet(hex){
        hex = String(hex || '').replace('#','');
        if(hex.length === 3) hex = hex.split('').map(function(x){ return x+x; }).join('');
        var n = parseInt(hex,16);
        if(isNaN(n)) return '255,107,43';
        return ((n>>16)&255)+','+((n>>8)&255)+','+(n&255);
    }
    function saveAccentAliases(key){
        try {
            localStorage.setItem('muja_account_color_theme', key);
            localStorage.setItem('muja_accent_color', key);
            localStorage.setItem('muja_color_theme', key);
        } catch(e) {}
    }
    function applyAccentColor(name){
        var key = MUJA_ACCENT_MAP[name] ? name : 'orange';
        saveAccentAliases(key);
        var c = MUJA_ACCENT_MAP[key];
        var r = document.documentElement;
        r.style.setProperty('--ember-300', c.ember300);
        r.style.setProperty('--ember-400', c.ember400);
        r.style.setProperty('--ember-500', c.ember500);
        r.style.setProperty('--ember-600', c.ember600);
        r.style.setProperty('--gold-400', c.gold400);
        r.style.setProperty('--gold-500', c.gold500);
        r.style.setProperty('--ember-glow', 'rgba(' + hexToRgbTriplet(c.ember500) + ',0.18)');
        r.style.setProperty('--gold-glow', 'rgba(' + hexToRgbTriplet(c.gold500) + ',0.15)');
        r.style.setProperty('--muja-rgb-primary', hexToRgbTriplet(c.ember500));
        r.style.setProperty('--muja-rgb-secondary', hexToRgbTriplet(c.gold500));
        r.style.setProperty('--lg-hot', c.ember500);
        r.style.setProperty('--lg-orange', c.ember400);
        r.style.setProperty('--lg-gold', c.gold500);
        if (document.body) {
            document.body.setAttribute('data-muja-accent', key);
        }
        ensureAccentOverrideStyle();
        document.querySelectorAll('.color-choice').forEach(function(btn){
            btn.classList.toggle('active', btn.getAttribute('data-color') === key);
        });
    }
    window.MujaApplyAccentColor = applyAccentColor;
    // Terapkan warna SEGERA saat theme.js dimuat, bukan menunggu halaman selesai.
    // Ini membuat warna pilihan tetap aktif ketika pindah dari Akun Saya ke Beranda.
    applyAccentColor(ls('muja_account_color_theme', ls('muja_accent_color', ls('muja_color_theme','orange'))));

    // Theme
    function updateIcons(light){
        var m=qs('themeToggleMobile'), d=qs('themeToggleDesktop');
        if(light){ if(m&&m.querySelector('span:first-child')) m.querySelector('span:first-child').innerHTML=sun; if(d) d.innerHTML=sun; }
        else { if(m&&m.querySelector('span:first-child')) m.querySelector('span:first-child').innerHTML=moon; if(d) d.innerHTML=moon; }
    }
    window.toggleTheme=function(){
        var light=document.body.classList.toggle('light-mode');
        lss('muja_theme',light?'light':'dark');
        updateIcons(light);
    };
    function loadTheme(){
        var t=ls('muja_theme','dark');
        if(t==='light'){ document.body.classList.add('light-mode'); updateIcons(true); }
        else { document.body.classList.remove('light-mode'); updateIcons(false); }
    }

    // Cart — diperkuat agar tulisan "Tersimpan" dan angka jumlah selalu muncul
    function escHtml(v){
        return String(v == null ? '' : v).replace(/[&<>"']/g,function(ch){
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
        });
    }
    function escJs(v){ return String(v == null ? '' : v).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
    function normId(v){ return String(v == null ? '' : v); }
    function safeCartArray(value){ return Array.isArray(value) ? value : []; }
    function getCart(){
        try { return safeCartArray(JSON.parse(ls('mujaCart','[]'))).filter(function(i){ return i && i.id != null; }); }
        catch(e){ return []; }
    }
    function saveCart(c){
        c = safeCartArray(c);
        lss('mujaCart', JSON.stringify(c));
        try {
            window.dispatchEvent(new CustomEvent('muja:cart-updated', { detail:{ count:c.length, cart:c } }));
        } catch(e) {}
    }
    function ensureCartStyle(){
        if(document.getElementById('muja-cart-fix-style')) return;
        var st=document.createElement('style');
        st.id='muja-cart-fix-style';
        st.textContent='\
.muja-cart-shortcut{position:fixed;right:14px;bottom:92px;z-index:230;display:flex;align-items:center;gap:7px;padding:9px 12px;border-radius:999px;background:linear-gradient(135deg,var(--ember-500,#ff6b2b),var(--gold-500,#f5c528));color:#fff;border:1px solid rgba(255,255,255,.26);box-shadow:0 12px 35px rgba(255,107,43,.28);font-weight:800;font-size:12px;cursor:pointer}\
.muja-cart-shortcut svg{width:17px;height:17px}.muja-cart-floating-badge,.cart-badge,.cart-dot,[data-cart-badge]{align-items:center;justify-content:center}\
.muja-cart-floating-badge{min-width:18px;height:18px;padding:0 6px;border-radius:999px;background:rgba(0,0,0,.22);font-size:11px}\
.muja-cart-toast{position:fixed;left:50%;bottom:94px;transform:translate(-50%,12px) scale(.96);z-index:99999;max-width:calc(100vw - 28px);padding:11px 16px;border-radius:999px;background:rgba(22,22,31,.92);color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 14px 40px rgba(0,0,0,.28);font-weight:700;font-size:12.5px;opacity:0;pointer-events:none;transition:all .26s ease;white-space:nowrap;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}\
.muja-cart-toast.show{opacity:1;transform:translate(-50%,0) scale(1)}.muja-cart-toast.success{border-color:rgba(0,229,180,.35)}.muja-cart-toast.warn{border-color:rgba(255,197,40,.35)}\
.product-card.is-cart-saved::after{content:"Tersimpan";position:absolute;top:8px;left:8px;z-index:6;padding:3px 8px;border-radius:999px;background:rgba(0,229,180,.16);border:1px solid rgba(0,229,180,.35);color:#00e5b4;font-size:10px;font-weight:800;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}\
.product-add-cart.is-saved,.btn-add.is-saved{background:linear-gradient(135deg,#00c896,#00e5b4)!important;box-shadow:0 6px 18px rgba(0,229,180,.28)!important}.btn-save.is-saved{background:linear-gradient(135deg,#00c896,#00e5b4)!important;color:#071112!important;border-color:rgba(0,229,180,.35)!important}\
@media(max-width:480px){.muja-cart-shortcut{right:10px;bottom:86px;padding:8px 10px;font-size:11px}.muja-cart-toast{bottom:86px;font-size:12px}}';
        document.head.appendChild(st);
    }
    function globalToast(msg,type){
        ensureCartStyle();
        var old=document.querySelector('.muja-cart-toast');
        if(old) old.remove();
        var t=document.createElement('div');
        t.className='muja-cart-toast '+(type||'success');
        t.textContent=msg;
        document.body.appendChild(t);
        setTimeout(function(){ t.classList.add('show'); },20);
        setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ if(t&&t.parentNode)t.remove(); },300); },2600);
    }
    function ensureCartShell(){
        ensureCartStyle();
        if(!qs('cartOverlay')){
            var overlay=document.createElement('div');
            overlay.className='cart-overlay';
            overlay.id='cartOverlay';
            overlay.addEventListener('click', function(e){ if(e.target===overlay) window.closeCart(); });
            document.body.appendChild(overlay);
        }
        if(!qs('cartSidebar')){
            var side=document.createElement('div');
            side.className='cart-sidebar';
            side.id='cartSidebar';
            side.innerHTML='<div class="cart-header"><h3>🛒 Produk Tersimpan</h3><button class="cart-close" type="button" onclick="window.closeCart()">×</button></div><div class="cart-items" id="cartItems"><div class="cart-empty"><p>Belum ada produk tersimpan</p></div></div>';
            document.body.appendChild(side);
        }
    }
    function ensureCartShortcut(){
        ensureCartStyle();
        if(document.querySelector('#cartBadge,.cart-badge,.cart-dot,[data-cart-badge]')) return;
        if(document.querySelector('.muja-cart-shortcut')) return;
        var btn=document.createElement('button');
        btn.type='button';
        btn.className='muja-cart-shortcut';
        btn.setAttribute('aria-label','Buka produk tersimpan');
        btn.onclick=function(){ window.toggleCart(); };
        btn.innerHTML='<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 4.5h2l1.6 9.5h9.9l3-6.5H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="17" cy="20" r="1.5" fill="currentColor"/></svg><span>Tersimpan</span><span class="muja-cart-floating-badge" data-cart-badge>0</span>';
        document.body.appendChild(btn);
    }
    function badgeTargets(){
        var nodes=[];
        document.querySelectorAll('#cartBadge,.cart-badge,.cart-dot,[data-cart-badge]').forEach(function(el){
            if(nodes.indexOf(el)===-1) nodes.push(el);
        });
        return nodes;
    }
    function updateBadge(){
        ensureCartShortcut();
        var n=getCart().length;
        badgeTargets().forEach(function(b){
            b.textContent=n;
            b.setAttribute('aria-label', n + ' produk tersimpan');
            b.style.setProperty('display', n>0 ? 'flex' : 'none', 'important');
        });
        var shortcut=document.querySelector('.muja-cart-shortcut');
        if(shortcut){ shortcut.style.setProperty('display', n>0 ? 'flex' : 'none', 'important'); }
    }
    function updateUI(){
        ensureCartShell();
        var el=qs('cartItems'); if(!el) return;
        var cart=getCart();
        if(!cart.length){ el.innerHTML='<div class="cart-empty"><p>Belum ada produk tersimpan</p></div>'; markSavedProducts(); return; }
        el.innerHTML=cart.map(function(i){
            var img=i.imageUrl||'https://placehold.co/68x68/1e1e2b/666';
            return '<div class="cart-item"><a href="/detail-produk.html?id='+encodeURIComponent(i.id)+'" style="display:flex;gap:12px;text-decoration:none;flex:1;color:inherit;"><div class="cart-item-image"><img src="'+escHtml(img)+'" alt="" loading="lazy"></div><div class="cart-item-info"><div class="cart-item-name">'+escHtml(i.name||'Produk')+'</div><div class="cart-item-price">Rp'+new Intl.NumberFormat('id-ID').format(i.price||0)+'</div></div></a><button class="cart-remove" type="button" onclick="window.removeFromCart(\''+escJs(i.id)+'\')">🗑️</button></div>';
        }).join('');
        markSavedProducts();
    }
    function markSavedProducts(){
        var ids={};
        getCart().forEach(function(i){ ids[normId(i.id)] = true; });
        document.querySelectorAll('[data-product-id]').forEach(function(el){
            var saved=!!ids[normId(el.getAttribute('data-product-id'))];
            el.classList.toggle('is-saved', saved);
            el.setAttribute('title', saved ? 'Produk sudah tersimpan' : (el.getAttribute('data-default-title') || el.getAttribute('title') || 'Simpan'));
            el.setAttribute('aria-label', saved ? 'Produk sudah tersimpan' : 'Simpan produk');
            var card=el.closest('.product-card');
            if(card) card.classList.toggle('is-cart-saved', saved);
            if(saved && el.classList.contains('btn-save')){
                el.innerHTML='✓ Tersimpan di Keranjang';
            }
        });
    }
    function addProductToCart(p, options){
        if(!p || p.id == null){ globalToast('Produk belum siap disimpan.', 'warn'); return false; }
        var cart=getCart();
        var pid=normId(p.id);
        if(cart.some(function(i){return normId(i.id)===pid;})){
            updateUI(); updateBadge(); markSavedProducts();
            globalToast('Produk sudah tersimpan. Total: '+cart.length, 'warn');
            return false;
        }
        cart.push({id:p.id,name:p.name||'Produk',price:Number(p.price||0),imageUrl:p.imageUrl||'',quantity:p.quantity||1});
        saveCart(cart);
        updateUI(); updateBadge(); markSavedProducts();
        globalToast('✅ Produk tersimpan. Total tersimpan: '+cart.length, 'success');
        return true;
    }
    window.addToCart=function(p){ return addProductToCart(p); };
    window.removeFromCart=function(id){
        var pid=normId(id);
        saveCart(getCart().filter(function(i){return normId(i.id)!==pid;}));
        updateUI(); updateBadge(); markSavedProducts();
        globalToast('Produk dihapus dari tersimpan.', 'warn');
    };
    window.toggleCart=function(){
        ensureCartShell();
        var s=qs('cartSidebar'), o=qs('cartOverlay');
        if(s) s.classList.toggle('open');
        if(o) o.classList.toggle('open');
        if(s&&s.classList.contains('open')) updateUI();
    };
    window.closeCart=function(){
        var s=qs('cartSidebar'), o=qs('cartOverlay');
        if(s) s.classList.remove('open'); if(o) o.classList.remove('open');
    };
    window.MujaCart={ add:addProductToCart, get:getCart, save:saveCart, updateBadge:updateBadge, updateUI:updateUI, markSaved:markSavedProducts, toast:globalToast };
    var markTimer=null;
    function scheduleMark(){ clearTimeout(markTimer); markTimer=setTimeout(function(){ updateBadge(); markSavedProducts(); },80); }
    if(window.MutationObserver){
        var mo=new MutationObserver(scheduleMark);
        if(document.body) mo.observe(document.body,{childList:true,subtree:true});
        else document.addEventListener('DOMContentLoaded',function(){ mo.observe(document.body,{childList:true,subtree:true}); });
    }
    window.addEventListener('storage', function(e){ if(e && e.key==='mujaCart'){ updateUI(); updateBadge(); markSavedProducts(); } });
    window.addEventListener('muja:cart-updated', function(){ updateUI(); updateBadge(); markSavedProducts(); });

    // Init
    function init(){
        loadTheme(); applyAccentColor(ls('muja_account_color_theme', ls('muja_accent_color', ls('muja_color_theme','orange')))); updateBadge(); updateUI();
        var dt=qs('themeToggleDesktop'), mt=qs('themeToggleMobile');
        if(dt) dt.onclick=window.toggleTheme;
        if(mt) mt.onclick=window.toggleTheme;
        var co=qs('cartOverlay');
        if(co) co.addEventListener('click',function(e){ if(e.target===co) window.closeCart(); });
        var so=document.querySelector('.sidebar-overlay');
        if(so) so.addEventListener('click',function(){ var cb=qs('sidebar-toggle'); if(cb) cb.checked=false; });
    }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
    else init();

    // Sinkronkan tema warna walaupun user pindah halaman/back-forward cache.
    window.addEventListener('storage', function(e){
        if(e && (e.key==='muja_account_color_theme' || e.key==='muja_accent_color' || e.key==='muja_color_theme')){
            applyAccentColor(ls('muja_account_color_theme', ls('muja_accent_color', ls('muja_color_theme','orange'))));
        }
    });
    window.addEventListener('pageshow', function(){
        applyAccentColor(ls('muja_account_color_theme', ls('muja_accent_color', ls('muja_color_theme','orange'))));
    });

    window.updateCartBadge=updateBadge;
    window.updateCartUI=updateUI;
})();