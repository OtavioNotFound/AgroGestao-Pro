const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Usuario nao autenticado.' }, 401);
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return json({ error: 'GEMINI_API_KEY nao configurada nos secrets da Edge Function.' }, 500);
    }

    const { message, context } = await req.json();
    if (!message || typeof message !== 'string') {
      return json({ error: 'Mensagem obrigatoria.' }, 400);
    }

    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';
    const prompt = [
      'Voce e um assistente agricola senior para um SaaS chamado AgroGestao Pro.',
      'Responda em portugues do Brasil, seja pratico e objetivo.',
      'Use os dados da fazenda quando existirem e deixe claro quando estiver fazendo uma inferencia.',
      'Foque em custos, safras, estoque, maquinas, calendario, produtividade e melhorias operacionais.',
      '',
      `Contexto da operacao agricola em JSON:\n${JSON.stringify(context || {}, null, 2)}`,
      '',
      `Pergunta do usuario:\n${message}`,
    ].join('\n');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 700,
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return json({ error: payload?.error?.message || 'Falha ao consultar Gemini.' }, response.status);
    }

    return json({
      answer: extractGeminiText(payload) || 'Nao consegui gerar uma resposta agora.',
      model,
    });
  } catch (error) {
    return json({ error: error.message || 'Erro inesperado na IA.' }, 500);
  }
});

function extractGeminiText(payload: Record<string, unknown>) {
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  return candidates
    .flatMap((candidate) => {
      const content = candidate.content;
      return Array.isArray(content?.parts) ? content.parts : [];
    })
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
