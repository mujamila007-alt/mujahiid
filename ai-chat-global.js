// ai-chat-global.js - tampilkan Chat AI Muja Prime di semua halaman situs
(function(){
  'use strict';
  if (window.MujaAIChatLoaded) return;
  window.MujaAIChatLoaded = true;

  function loadConfig(){
    if (window.AI_WEB_CONFIG) return;
    var s=document.createElement('script');
    s.src='/ai-web-config.js?v=20260603-theme-persist-v4';
    s.async=false;
    document.head.appendChild(s);
  }
  function injectStyle(){
    if(document.getElementById('muja-ai-chat-style')) return;
    var st=document.createElement('style');
    st.id='muja-ai-chat-style';
    st.textContent=''+
'.ai-chat-widget{position:fixed;bottom:80px;right:16px;z-index:9998}'+
'.ai-chat-btn{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--ember-500,#ff6b2b),var(--gold-500,#f5c842));border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(var(--muja-rgb-primary,255,107,43),.35);transition:transform .2s}'+
'.ai-chat-btn:hover{transform:scale(1.08)}.ai-chat-btn svg{width:24px;height:24px;fill:white}'+
'.ai-chat-popup{display:none;position:fixed;bottom:144px;right:16px;width:360px;max-width:90vw;height:460px;max-height:60vh;background:var(--surface-1,var(--bg-card,#16161f));border:1px solid var(--border-subtle,var(--border-1,rgba(255,255,255,.08)));border-radius:18px;box-shadow:0 8px 32px rgba(0,0,0,.42);z-index:9999;overflow:hidden;flex-direction:column}'+
'.ai-chat-popup.open{display:flex}.ai-chat-header{background:linear-gradient(135deg,var(--ember-500,#ff6b2b),var(--gold-500,#f5c842));padding:12px 14px;display:flex;align-items:center;justify-content:space-between;color:#fff;flex-shrink:0}.ai-chat-header h3{font-size:13px;font-weight:800;margin:0;display:flex;align-items:center;gap:6px}.ai-chat-close{background:rgba(0,0,0,.2);border:none;color:#fff;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}'+
'.ai-chat-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:var(--surface-2,var(--bg-card2,#1e1e2b))}.ai-msg{max-width:88%;padding:10px 12px;border-radius:14px;font-size:12px;line-height:1.5;word-break:break-word;animation:aiIn .25s ease}.ai-msg.user{background:linear-gradient(135deg,var(--ember-500,#ff6b2b),var(--ember-600,#e55520));color:#fff;align-self:flex-end;border-bottom-right-radius:4px}.ai-msg.bot{background:var(--surface-3,var(--bg-card3,#252535));color:var(--text-primary,var(--text-100,#f0f0f8));align-self:flex-start;border-bottom-left-radius:4px}.ai-msg.bot-buttons{background:transparent;padding:4px 0;display:flex;flex-wrap:wrap;gap:6px}.ai-quick-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 14px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:700;text-decoration:none;transition:all .2s;white-space:nowrap}.ai-quick-btn.yt{background:#ff0000;color:white}.ai-quick-btn.wa{background:#25D366;color:white}.ai-quick-btn:hover{transform:scale(1.03)}.ai-quick-btn svg{width:13px;height:13px;fill:currentColor}.ai-typing{display:none;align-self:flex-start;padding:8px 12px;background:var(--surface-3,var(--bg-card3,#252535));border-radius:14px;font-size:11px;color:var(--text-muted,var(--text-400,#9898b8))}.ai-typing.show{display:block}.ai-input-wrap{display:flex;gap:6px;padding:8px 10px;background:var(--surface-1,var(--bg-card,#16161f));border-top:1px solid var(--border-subtle,var(--border-1,rgba(255,255,255,.06)));flex-shrink:0}.ai-input{flex:1;padding:8px 12px;background:var(--surface-3,var(--bg-card3,#252535));border:1px solid var(--border-medium,var(--border-2,rgba(255,255,255,.1)));border-radius:20px;color:var(--text-primary,var(--text-100,#f0f0f8));font-size:12px;outline:none}.ai-input:focus{border-color:var(--ember-500,#ff6b2b)}.ai-send{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--ember-500,#ff6b2b),var(--ember-600,#e55520));border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s}.ai-send:hover{transform:scale(1.05)}.ai-send svg{width:14px;height:14px;fill:white}@keyframes aiIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(max-width:480px){.ai-chat-popup{width:92vw;max-width:92vw;height:460px;max-height:60vh;bottom:144px;right:4vw;border-radius:16px}.ai-chat-widget{bottom:90px}}';
    document.head.appendChild(st);
  }
  function injectDom(){
    if(document.getElementById('aiPopup')) return;
    var wrap=document.createElement('div');
    wrap.innerHTML='<div class="ai-chat-widget"><button class="ai-chat-btn" onclick="toggleChat()" title="Chat AI Muja"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></button></div><div class="ai-chat-popup" id="aiPopup"><div class="ai-chat-header"><h3>AI Muja Prime</h3><button class="ai-chat-close" onclick="toggleChat()">✕</button></div><div class="ai-chat-body" id="aiBody"><div class="ai-msg bot">Halo! Saya AI Muja Prime. Ada yang bisa dibantu?</div></div><div class="ai-typing" id="aiTyping">AI mengetik...</div><div class="ai-input-wrap"><input class="ai-input" id="aiInput" placeholder="Tanya sesuatu..." onkeydown="if(event.key===\'Enter\')sendChat()"><button class="ai-send" onclick="sendChat()"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div></div>';
    while(wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  var chatOpen=false, chatHistory=[], aiSending=false;
  var TRIGGER_KEYWORDS={
    youtube:['youtube','canva gratis','gratis','tutorial','video','channel','yt'],
    admin:['admin','hubungi','wa','whatsapp','kontak','bantuan','cs','customer service','komplain','masalah','error','gagal','tidak bisa','butuh bantuan','bantu dong','poin tidak bertambah','poin kurang','poin belum masuk','poin hilang','poin ga nambah','poin kok ga masuk','poin tidak ada','gak dapet poin','belum dapet poin','poin gak masuk','poin belum ditambahkan']
  };
  function $(id){return document.getElementById(id)}
  function addMsg(text,type){var body=$('aiBody'); if(!body) return; var div=document.createElement('div'); div.className='ai-msg '+type; div.textContent=text; body.appendChild(div); body.scrollTop=body.scrollHeight;}
  function detectKeywords(text){var lower=(text||'').toLowerCase(), result={youtube:false,admin:false}; TRIGGER_KEYWORDS.youtube.some(function(k){return lower.indexOf(k)>-1 ? (result.youtube=true) : false}); TRIGGER_KEYWORDS.admin.some(function(k){return lower.indexOf(k)>-1 ? (result.admin=true) : false}); return result;}
  function addButtons(keywords){var body=$('aiBody'); if(!body) return; var btnDiv=document.createElement('div'); btnDiv.className='ai-msg bot-buttons'; if(keywords.youtube){var yt=document.createElement('a'); yt.className='ai-quick-btn yt'; yt.href='https://www.youtube.com/@Mujahiid007'; yt.target='_blank'; yt.textContent='YouTube'; btnDiv.appendChild(yt);} if(keywords.admin){var wa=document.createElement('a'); wa.className='ai-quick-btn wa'; wa.href='https://wa.me/6285380176170'; wa.target='_blank'; wa.textContent='Admin WA'; btnDiv.appendChild(wa);} body.appendChild(btnDiv); body.scrollTop=body.scrollHeight;}


  // ========== SIMPAN RIWAYAT CHAT AI KE FIRESTORE ==========
  // Collection yang dibaca admin.html: ai_chat_logs
  function aiSafeGet(key){try{return localStorage.getItem(key)||'';}catch(e){return '';}}
  function aiSafeSet(key,val){try{localStorage.setItem(key,val);}catch(e){}}
  function getAiVisitorId(){
    var key='muja_ai_chat_visitor_id';
    var id=aiSafeGet(key);
    if(!id){
      id='visitor_'+Date.now()+'_'+Math.random().toString(36).slice(2,10);
      aiSafeSet(key,id);
    }
    return id;
  }
  function getAiSessionCreatedAt(){
    var key='muja_ai_chat_session_created_at';
    var v=aiSafeGet(key);
    if(!v){v=new Date().toISOString(); aiSafeSet(key,v);}
    return v;
  }
  function getAiProfile(){
    return {
      name: aiSafeGet('muja_user_name') || 'Pengunjung',
      email: (aiSafeGet('muja_user_email') || '').trim().toLowerCase(),
      whatsapp: aiSafeGet('muja_user_whatsapp') || aiSafeGet('muja_user_wa') || '',
      registered: aiSafeGet('muja_user_registered') === 'true'
    };
  }
  function getAiDb(){
    try{
      if(window.db) return window.db;
      if(window.initMujaFirebase){
        var d=window.initMujaFirebase();
        if(d) return d;
      }
      if(window.firebase && firebase.firestore){
        if(!firebase.apps.length && window.firebaseConfig) firebase.initializeApp(window.firebaseConfig);
        window.db=firebase.firestore();
        return window.db;
      }
    }catch(e){}
    return null;
  }
  async function saveAiChatLog(role, content){
    content=String(content||'').trim();
    if(!content) return;
    var db=getAiDb();
    if(!db){console.warn('[Muja AI] Firestore belum siap, log chat tidak tersimpan.');return;}
    var visitorId=getAiVisitorId();
    var profile=getAiProfile();
    var nowIso=new Date().toISOString();
    var message={role:role,content:content,at:nowIso,pageUrl:location.href};
    var data={
      sessionId: visitorId,
      visitorId: visitorId,
      userName: profile.name || 'Pengunjung',
      name: profile.name || 'Pengunjung',
      email: profile.email || '',
      whatsapp: profile.whatsapp || '',
      isRegistered: !!profile.registered,
      pageUrl: location.href,
      path: location.pathname,
      pageTitle: document.title || '',
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
      language: navigator.language || '',
      createdAt: getAiSessionCreatedAt(),
      updatedAt: nowIso,
      lastMessageAt: nowIso
    };
    if(role==='user') data.userMessage=content;
    if(role==='assistant'||role==='bot') data.aiReply=content;
    try{
      var FV=(window.firebase && firebase.firestore && firebase.firestore.FieldValue) ? firebase.firestore.FieldValue : null;
      if(FV && FV.arrayUnion){
        data.messages=FV.arrayUnion(message);
        await db.collection('ai_chat_logs').doc(visitorId).set(data,{merge:true});
      }else{
        var ref=db.collection('ai_chat_logs').doc(visitorId);
        var snap=await ref.get();
        var old=(snap.exists && Array.isArray((snap.data()||{}).messages)) ? (snap.data()||{}).messages : [];
        data.messages=old.concat([message]);
        await ref.set(data,{merge:true});
      }
    }catch(e){
      console.warn('[Muja AI] Gagal menyimpan log chat. Cek Firestore rules collection ai_chat_logs.', e);
    }
  }
  window.toggleChat=function(){chatOpen=!chatOpen; var p=$('aiPopup'); if(p) p.classList.toggle('open',chatOpen); if(chatOpen && $('aiInput')) $('aiInput').focus();};
  window.sendChat=async function(){
    var input=$('aiInput');
    if(!input || aiSending) return;
    var msg=input.value.trim();
    if(!msg) return;

    aiSending=true;
    var sendBtn=document.querySelector('.ai-send');
    if(sendBtn){sendBtn.disabled=true;sendBtn.style.opacity='.6';sendBtn.style.cursor='wait';}
    input.disabled=true;

    addMsg(msg,'user');
    saveAiChatLog('user',msg);
    input.value='';
    chatHistory.push({role:'user',content:msg});
    if(chatHistory.length>10) chatHistory=chatHistory.slice(-10);

    var keywords=detectKeywords(msg);
    var typing=$('aiTyping');
    if(typing) typing.classList.add('show');

    try{
      var response=await fetch('/api/ai',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          system:(window.AI_WEB_CONFIG && window.AI_WEB_CONFIG.pengetahuan)||'Kamu AI MujaPrime. Jawab singkat dan membantu.',
          messages:chatHistory.slice(-4)
        })
      });

      var data=await response.json().catch(function(){return {};});

      if(!response.ok){
        var err=new Error((data && data.message) || ('HTTP '+response.status));
        err.status=response.status;
        err.code=data && data.error;
        err.retryAfter=(data && data.retryAfter)||0;
        throw err;
      }

      var reply=data.reply||'Maaf kak, saya belum bisa menjawab pertanyaan itu.';
      addMsg(reply,'bot');
      saveAiChatLog('assistant',reply);
      chatHistory.push({role:'assistant',content:reply});
      if(chatHistory.length>10) chatHistory=chatHistory.slice(-10);

      if(keywords.youtube||keywords.admin){
        setTimeout(function(){addButtons(keywords)},300);
      }
    }catch(e){
      var fallback;
      if(e && (e.status===429 || e.code==='RATE_LIMIT')){
        var wait=Math.max(5,Number(e.retryAfter)||15);
        fallback='AI sedang sibuk karena batas penggunaan sementara. Tunggu sekitar '+wait+' detik lalu kirim lagi ya kak.';
      }else if(e && (e.status===401 || e.status===403 || e.code==='AI_AUTH_ERROR')){
        fallback='Layanan AI sedang perlu dicek admin. Silakan coba lagi nanti atau hubungi Admin WA.';
      }else if(e && (e.status===503 || e.code==='AI_NOT_CONFIGURED')){
        fallback='Layanan AI belum aktif dengan benar. Silakan hubungi Admin WA.';
      }else if(e && (e.status===504 || e.code==='AI_TIMEOUT')){
        fallback='Respons AI sedang lambat. Silakan coba kirim lagi beberapa saat ya kak.';
      }else{
        fallback='AI sedang mengalami gangguan koneksi. Silakan coba lagi beberapa saat.';
      }
      addMsg(fallback,'bot');
      saveAiChatLog('assistant',fallback);
      if(keywords.youtube||keywords.admin) addButtons(keywords);
    }finally{
      if(typing) typing.classList.remove('show');
      aiSending=false;
      input.disabled=false;
      if(sendBtn){sendBtn.disabled=false;sendBtn.style.opacity='';sendBtn.style.cursor='';}
      input.focus();
    }
  };

  function init(){loadConfig(); injectStyle(); injectDom();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
