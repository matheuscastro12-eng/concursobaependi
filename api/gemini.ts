// Vercel Serverless Function — proxy para Gemini (esconde a API key do front).
// Em dev local (sem VITE_API_BASE_URL), o front continua chamando o Gemini direto.
// Em produção, o front bate aqui e a API key vive só no servidor.

export const config = {
  runtime: 'edge',
};

const GEMINI_MODEL = 'gemini-2.5-flash';
const UPSTREAM = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
    );
  }

  // A key vive APENAS no servidor (Vercel env var, não exposta no bundle).
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GOOGLE_AI_API_KEY not configured on server' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
    );
  }

  const bodyStr = JSON.stringify(body);

  // Retry com backoff exponencial pra erros transientes do Gemini.
  // 503 = "high demand" (mais comum), 429 = rate limit, 500 = server error.
  // Faz até 3 tentativas: 0ms, 800ms, 2000ms (~3s no pior caso).
  const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
  const DELAYS_MS = [0, 800, 2000];

  let upstream: Response | null = null;
  let lastErrorBody = '';

  for (const delay of DELAYS_MS) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));

    upstream = await fetch(`${UPSTREAM}&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
    });

    if (upstream.ok) break;

    if (!TRANSIENT_STATUSES.has(upstream.status)) {
      // Erro permanente (400, 401, 403...) — não adianta retry.
      break;
    }

    // Lê body do erro pra logar/propagar (clona pra não consumir o real).
    try {
      lastErrorBody = await upstream.clone().text();
    } catch {
      /* ignora */
    }
  }

  if (!upstream || (!upstream.ok && TRANSIENT_STATUSES.has(upstream.status))) {
    // Após N tentativas, ainda transiente — devolve erro estruturado pro client
    // mostrar mensagem amigável.
    return new Response(
      JSON.stringify({
        error: 'gemini_overloaded',
        message:
          'A IA está com alta demanda agora. Aguarde alguns segundos e tente de novo.',
        upstream_status: upstream?.status ?? null,
        details: lastErrorBody.slice(0, 300) || null,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      }
    );
  }

  // Streaming SSE: faz pass-through do body cru.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...corsHeaders(),
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
