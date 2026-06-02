// Vercel Serverless Function — proxy para Gemini (esconde a API key do front).
// Em dev local (sem VITE_API_BASE_URL), o front continua chamando o Gemini direto.
// Em produção, o front bate aqui e a API key vive só no servidor.

export const config = {
  runtime: 'edge',
};

const GEMINI_MODEL = 'gemini-2.5-flash';
const UPSTREAM = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
    );
  }

  // ── Auth: só usuários logados podem usar o proxy (evita roubo de quota).
  // Sem isso, qualquer um na internet poderia POSTar aqui e gastar a key.
  const auth = await authenticate(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ error: 'unauthorized', message: 'Faça login para usar a IA.' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
    );
  }

  // A key vive APENAS no servidor (Vercel env var, não exposta no bundle).
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GOOGLE_AI_API_KEY not configured on server' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
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
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      }
    );
  }

  // Streaming SSE: faz pass-through do body cru.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...corsHeaders(origin),
    },
  });
}

// CORS travado: reflete origens do próprio app (qualquer *.vercel.app + localhost).
// Em vez de '*', evita que outros sites usem o endpoint via browser.
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /\.vercel\.app$/.test(new URL(origin).hostname))
      ? origin
      : 'https://concursobaependi.vercel.app';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

// Valida o token Supabase do usuário. Bloqueia chamadas anônimas (roubo de quota).
// - sem Bearer → barra de cara (sem custo).
// - com Bearer → confirma no Supabase (/auth/v1/user).
// - se a infra de validação falhar (5xx/rede) → fail-open p/ não derrubar o produto.
async function authenticate(req: Request): Promise<{ ok: boolean }> {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  if (!token) return { ok: false };

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  // Sem config de validação no servidor: não dá pra verificar → fail-open
  // (mas exigimos pelo menos um token presente acima).
  if (!supabaseUrl || !anonKey) return { ok: true };

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    });
    if (res.status === 200) return { ok: true };
    if (res.status === 401 || res.status === 403) return { ok: false };
    // Erro transitório da infra de auth → não bloqueia o usuário legítimo.
    return { ok: true };
  } catch {
    return { ok: true };
  }
}
