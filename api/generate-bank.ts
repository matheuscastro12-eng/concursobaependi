// Vercel Serverless Function (Node, NÃO Edge — Edge tem limite de 25s no Hobby
// e 30 questões podem passar disso). Node serverless aceita até 60s no Hobby.
// Gera N questões via Gemini em UMA chamada, parseia o markdown em rows
// atômicas e insere em public.question_bank.
//
// Auth: precisa do bearer token de um admin.

export const config = {
  maxDuration: 60,
};

interface BodyPayload {
  cargo_slug?: string | null;
  materia_id: string;
  materia_nome: string;
  materia_conteudo: string;
  categoria: 'gerais' | 'educacao' | 'saude' | 'especifico';
  nivel: 'basico' | 'avancado';
  num_alternativas?: 4 | 5;
  banca?: string;
  cargo_nome?: string;
  quantidade?: number;
}

interface ParsedQuestion {
  enunciado: string;
  alternativas: { letter: string; text: string }[];
  gabarito: string;
  comentario: string;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const STRIPE_MAX_BATCH = 50;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });

// ── Prompt builder (espelha useExamGenerator com leve adaptação pro banco) ──
function buildPrompt(body: BodyPayload, n: number): string {
  const numAlt = body.num_alternativas ?? 5;
  const letras = numAlt === 4 ? 'A, B, C, D' : 'A, B, C, D, E';
  const banca = (body.banca || 'INEPAM').trim();
  const cargo = (body.cargo_nome || 'cargo público municipal').trim();
  const nivelLabel = body.nivel === 'basico' ? 'Nível Médio' : 'Nível Superior';

  const dificuldadeBlock =
    body.nivel === 'basico'
      ? `NÍVEL: alto para concurso de Ensino Médio. Aplicação prática, detalhes específicos da legislação (datas, prazos, exceções), pegadinhas clássicas (troca sutil de palavras, prazo errado por pouco, agente competente trocado).`
      : `NÍVEL: alto para Ensino Superior — equivalente a banca tradicional (FCC/VUNESP/CESPE). Casos práticos com 2-4 fatos, jurisprudência consolidada (STF/STJ/TCU/CNJ), distratores tecnicamente verossímeis errando em detalhe normativo.`;

  return `Você é um elaborador SÊNIOR de questões para concursos públicos brasileiros. Banca: ${banca}. Cargo: ${cargo}.

Gere ${n} questões de múltipla escolha, com exatamente ${numAlt} alternativas (${letras}) e UMA correta, sobre o conteúdo programático abaixo. Variar enunciados, embaralhar posição da correta, distratores plausíveis.

MATÉRIA: ${body.materia_nome}
CONTEÚDO PROGRAMÁTICO: ${body.materia_conteudo}

${dificuldadeBlock}

REGRAS:
1. Português formal. Cite lei/artigo quando jurídico (Lei nº X, art. Y, §Z).
2. Cada questão é autocontida.
3. Não repita questões.
4. NÃO use "todas as anteriores"/"n.d.a.".
5. Comentário deve explicar por que a correta está certa E por que cada errada está errada (apontando o erro: prazo trocado, palavra invertida, etc.). 4-12 linhas.

FORMATO ESTRITO (o parser depende disso):

## Questão 1
[Enunciado completo, podendo ter texto-base/citação de lei.]

**A)** [alternativa]
**B)** [alternativa]
**C)** [alternativa]
**D)** [alternativa]${numAlt === 5 ? '\n**E)** [alternativa]' : ''}

**Gabarito: X**

**Comentário:** [Justificativa fundamentada conforme regra 5.]

---

## Questão 2
[…]

(Repita ATÉ ${n} questões. Use \`---\` entre cada uma. NÃO escreva nada antes da "## Questão 1" nem após a última. Gabarito DEVE ser \`**Gabarito: X**\` com asteriscos fechando DEPOIS da letra.)`;
}

// ── Parser do markdown gerado ──
function parseQuestions(markdown: string, expectedAlts: number): ParsedQuestion[] {
  const blocks = markdown.split(/(?=##\s*Questão\s+\d+)/i);
  const out: ParsedQuestion[] = [];

  for (const block of blocks) {
    if (!/##\s*Questão\s+\d+/i.test(block)) continue;

    // Gabarito: **Gabarito: X**
    const gabMatch = block.match(/\*\*Gabarito:\s*([A-E])\*\*/i);
    if (!gabMatch) continue;
    const gabarito = gabMatch[1].toUpperCase();

    // Alternativas: **A)** texto…
    const alts: { letter: string; text: string }[] = [];
    const altRegex = /\*\*([A-E])\)\*\*\s*([^\n]+(?:\n(?!\*\*[A-E]\)\*\*|\*\*Gabarito|\*\*Coment)[^\n]*)*)/g;
    let m: RegExpExecArray | null;
    while ((m = altRegex.exec(block)) !== null) {
      if (!alts.some((a) => a.letter === m![1])) {
        alts.push({ letter: m[1], text: m[2].trim() });
      }
    }
    if (alts.length < expectedAlts) continue;

    // Comentário: **Comentário:** ... até próximo --- ou fim
    const comentarioMatch = block.match(/\*\*Coment[áa]rio:\*\*\s*([\s\S]*?)(?=\n---|$)/i);
    const comentario = comentarioMatch?.[1]?.trim() ?? '';
    if (!comentario) continue;

    // Enunciado: tudo entre o cabeçalho `## Questão N` e a primeira `**A)**`
    const headerEnd = block.indexOf('\n', block.indexOf('##'));
    const firstAlt = block.search(/\*\*[A-E]\)\*\*/);
    if (firstAlt < 0 || headerEnd < 0) continue;
    const enunciado = block.slice(headerEnd, firstAlt).trim();
    if (!enunciado) continue;

    out.push({ enunciado, alternativas: alts.slice(0, expectedAlts), gabarito, comentario });
  }

  return out;
}

// ── Auth: confirma que o caller é admin (via JWT do usuário logado) ──
async function isAdmin(authHeader: string | null, supabaseUrl: string, anonKey: string): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);

  // Chama /auth/v1/user pra obter o user_id do JWT
  const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!userResp.ok) return false;
  const userJson = (await userResp.json()) as { id?: string };
  if (!userJson.id) return false;

  // Verifica role admin
  const rolesResp = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userJson.id}&role=eq.admin&select=role`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }
  );
  if (!rolesResp.ok) return false;
  const rows = (await rolesResp.json()) as unknown[];
  return Array.isArray(rows) && rows.length > 0;
}

// ── Handler ──
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: 'Server not configured (missing env vars)' }, 500);
  }

  // Auth admin
  const ok = await isAdmin(req.headers.get('authorization'), supabaseUrl, anonKey);
  if (!ok) return json({ error: 'Acesso restrito a administradores.' }, 403);

  // Body
  let body: BodyPayload;
  try {
    body = (await req.json()) as BodyPayload;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!body.materia_id || !body.materia_nome || !body.materia_conteudo || !body.categoria || !body.nivel) {
    return json({ error: 'Campos obrigatórios: materia_id, materia_nome, materia_conteudo, categoria, nivel' }, 400);
  }

  const n = Math.max(1, Math.min(STRIPE_MAX_BATCH, body.quantidade ?? 30));
  const numAlt = body.num_alternativas ?? 5;
  const banca = (body.banca || 'INEPAM').trim();
  const prompt = buildPrompt(body, n);

  // Chama Gemini com retry pra erros transientes (alta demanda, etc).
  const TRANSIENT = new Set([429, 500, 502, 503, 504]);
  const DELAYS = [0, 1000, 2500];
  let geminiResp: Response | null = null;
  for (const d of DELAYS) {
    if (d) await new Promise((r) => setTimeout(r, d));
    geminiResp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: Math.min(32768, n * 800),
          thinkingConfig: { thinkingBudget: body.nivel === 'avancado' ? 4096 : 2048 },
        },
      }),
    });
    if (geminiResp.ok) break;
    if (!TRANSIENT.has(geminiResp.status)) break;
  }
  if (!geminiResp || !geminiResp.ok) {
    const errBody = geminiResp ? await geminiResp.text() : '';
    return json({ error: 'Gemini falhou', upstream_status: geminiResp?.status ?? null, details: errBody.slice(0, 300) }, 502);
  }

  const geminiJson = (await geminiResp.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const fullText = geminiJson.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ?? '';

  const parsed = parseQuestions(fullText, numAlt);
  if (parsed.length === 0) {
    return json({ error: 'Não consegui parsear nenhuma questão da resposta da IA. Tente de novo.' }, 502);
  }

  // Insere em batch via service_role
  const batchId = crypto.randomUUID();
  const rows = parsed.map((p) => ({
    cargo_slug: body.cargo_slug ?? null,
    materia_id: body.materia_id,
    categoria: body.categoria,
    nivel: body.nivel,
    banca,
    num_alternativas: numAlt,
    enunciado: p.enunciado,
    alternativas: p.alternativas,
    gabarito: p.gabarito,
    comentario: p.comentario,
    source_model: GEMINI_MODEL,
    generated_batch: batchId,
  }));

  const insertResp = await fetch(`${supabaseUrl}/rest/v1/question_bank`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (!insertResp.ok) {
    const t = await insertResp.text();
    return json({ error: 'Falha ao inserir no banco', details: t.slice(0, 300) }, 500);
  }

  return json({
    inserted: rows.length,
    requested: n,
    batch_id: batchId,
    materia_id: body.materia_id,
    nivel: body.nivel,
  });
}
