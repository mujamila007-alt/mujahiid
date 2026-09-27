export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'AI_NOT_CONFIGURED',
      message: 'GROQ_API_KEY belum dikonfigurasi.'
    });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : (req.body || {});

    // Hemat token: simpan maksimal 2 putaran chat terakhir.
    const history = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
      .slice(-4)
      .map((m) => ({
        role: m.role,
        content: String(m.content || '').slice(0, 1800)
      }));

    // Pengetahuan MujaPrime sudah dipadatkan di ai-web-config.js.
    // Batas ini mencegah prompt besar menghabiskan TPM Groq.
    const system = String(
      body.system || 'Kamu AI MujaPrime. Jawab singkat, jelas, ramah, dan membantu pelanggan.'
    ).slice(0, 8000);

    // Model ditentukan dari server. GROQ_MODEL opsional.
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    let response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: system }, ...history],
          temperature: 0.55,
          max_completion_tokens: 350
        })
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const upstreamMessage = data?.error?.message || 'Groq API error';

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after')) || 15;
        return res.status(429).json({
          error: 'RATE_LIMIT',
          message: 'AI sedang sibuk karena batas penggunaan sementara.',
          retryAfter
        });
      }

      if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({
          error: 'AI_AUTH_ERROR',
          message: 'Akses layanan AI perlu diperiksa admin.'
        });
      }

      return res.status(response.status).json({
        error: 'AI_UPSTREAM_ERROR',
        message: upstreamMessage
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() ||
      'Maaf kak, saya belum bisa menjawab pertanyaan itu.';

    return res.status(200).json({ reply, model });
  } catch (e) {
    if (e?.name === 'AbortError') {
      return res.status(504).json({
        error: 'AI_TIMEOUT',
        message: 'Respons AI terlalu lama. Silakan coba lagi.'
      });
    }

    return res.status(500).json({
      error: 'AI_ERROR',
      message: e?.message || 'Terjadi kesalahan pada layanan AI.'
    });
  }
}
