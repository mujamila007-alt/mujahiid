(function(){
  const cfg = window.AI_WEB_CONFIG;
  if(!cfg) return;

  const style = document.createElement('style');
  style.textContent = `#mujaAI{position:fixed;right:20px;bottom:20px;width:340px;background:#fff;border-radius:16px;box-shadow:0 10px 30px #0003;z-index:99999;font-family:Arial;overflow:hidden}#mujaAI h3{margin:0;padding:14px;background:#7c3aed;color:white}#mujaMsg{height:260px;overflow:auto;padding:10px;font-size:14px}.mrow{margin:8px 0;padding:8px;border-radius:10px}.bot{background:#f1f5f9}.usr{background:#ede9fe;text-align:right}#mujaForm{display:flex;padding:10px;gap:8px}#mujaInput{flex:1;padding:8px}#mujaSend{padding:8px 12px}`;
  document.head.appendChild(style);

  const box=document.createElement('div');
  box.id='mujaAI';
  box.innerHTML='<h3>AI Mujahiid</h3><div id="mujaMsg"><div class="mrow bot">Halo, saya AI Mujahiid. Ada yang bisa saya bantu?</div></div><form id="mujaForm"><input id="mujaInput" placeholder="Tulis pertanyaan..."><button id="mujaSend">Kirim</button></form>';
  document.body.appendChild(box);

  const msg=document.getElementById('mujaMsg');
  const input=document.getElementById('mujaInput');
  const form=document.getElementById('mujaForm');

  function add(t,c){const d=document.createElement('div');d.className='mrow '+c;d.textContent=t;msg.appendChild(d);msg.scrollTop=msg.scrollHeight;}

  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const q=input.value.trim();
    if(!q)return;
    input.value=''; add(q,'usr'); add('Sedang menjawab...','bot');
    const loading=msg.lastChild;
    try{
      const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.apiKey},
        body:JSON.stringify({model:cfg.model,messages:[{role:'system',content:cfg.pengetahuan},{role:'user',content:q}],temperature:0.4})
      });
      const data=await r.json();
      loading.remove();
      add(data.choices?.[0]?.message?.content || 'AI tidak memberikan jawaban.','bot');
    }catch(err){
      loading.remove();
      add('AI error. Cek API Key Groq, koneksi, atau batas penggunaan API.','bot');
      console.error(err);
    }
  });
})();
