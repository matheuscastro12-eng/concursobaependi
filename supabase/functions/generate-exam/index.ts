import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXAM_PROMPT = `# PAPEL
Você é um especialista em elaboração de questões para concursos públicos municipais com vasta experiência nas principais bancas (VUNESP, FCC, IBAM, CESPE/Cebraspe, OBJETIVA, AVANÇA SP, FUNDATEC e similares).

# REGRA ABSOLUTA DE QUANTIDADE
⚠️ REGRA INVIOLÁVEL: Você DEVE gerar EXATAMENTE {{quantidade}} questões. NÃO gere menos. NÃO gere mais. Numere de 1 a {{quantidade}}.

# INPUTS
- **Tema/Matéria:** [Fornecido pelo usuário]
- **Banca:** {{banca}}
- **Cargo:** {{cargo}}
- **Quantidade de Questões:** {{quantidade}} (EXATAMENTE este número)
- **Nível de Dificuldade:** {{nivel}}

# REQUISITOS DAS QUESTÕES
- {{num_alternativas}} alternativas ({{alt_letras}}) — apenas UMA correta
- Linguagem formal e objetiva, típica de concurso público
- Distratores plausíveis que exijam conhecimento real (não pegadinhas superficiais)
- {{banca_instrucao}}

# DIRETRIZES POR NÍVEL

## Nível Médio:
- Conhecimentos básicos da área, lei seca, conceitos fundamentais
- Questões diretas com vocabulário acessível
- Alternativas com contraste claro entre correto e incorreto

## Nível Superior:
- Interpretação de normas, casos práticos, jurisprudência, exceções legais
- Situações-problema que exijam análise e raciocínio
- Distratores que explorem nuances e exceções da legislação

# FORMATO DE SAÍDA OBRIGATÓRIO

Use EXATAMENTE este formato para CADA questão. NÃO altere o formato.

---

## Questão X
*Tipo: Múltipla Escolha | Tema: [tema] | Nível: [nível]*

[Enunciado completo da questão]

**A)** [alternativa]
**B)** [alternativa]
**C)** [alternativa]
**D)** [alternativa]{{alt_e}}

<details>
<summary>📋 Gabarito e Explicação</summary>

**Gabarito: [LETRA]**

**Por que a alternativa [LETRA] está correta:**
[Explicação clara e objetiva, citando o fundamento legal/teórico]

**Por que as demais estão incorretas:**
- A) [explicação]
- B) [explicação]
- C) [explicação]
- D) [explicação]{{alt_e_wrong}}

**💡 Dica de prova:** [ponto de atenção, pegadinha comum ou regra mnemônica]

</details>

---

# IMPORTANTE
- Gere EXATAMENTE {{quantidade}} questões numeradas de 1 a {{quantidade}}
- NÃO pare antes de completar todas as {{quantidade}} questões
- Adeque o estilo à banca informada quando possível`;

const buildBancaInstruction = (banca: string): string => {
  if (/inepam/i.test(banca)) {
    return `Siga o padrão INEPAM: banca de concursos municipais, enunciados diretos, forte aderência ao edital e questões inéditas calibradas por padrões observados em provas e julgamentos de recurso da banca. Em Português, priorize gramática normativa e interpretação literal: ortografia, crase, fonemas, concordância, classes de palavras, predicado, verbo, sentido contextual e texto curto. Em Matemática/Raciocínio Lógico, use cálculo direto: juros simples, porcentagem, radicais, operações, razão/proporção, regra de três e tabelas simples. Em Conhecimentos Específicos, prefira definição, procedimento, atendimento ao público, legislação seca, documentos oficiais e aplicação direta ao cargo municipal. Evite casos longos, doutrina excessiva e jurisprudência sofisticada em nível médio. Distratores devem errar por troca pontual: grafia, conceito próximo, prazo, competência, requisito, cálculo comum ou termo gramatical. A banca pode usar alternativa residual, como "Nenhuma das alternativas"; use com moderação quando fizer sentido.`;
  }

  return banca
    ? `Siga o estilo da banca ${banca}: enunciados objetivos, alternativas com tamanho semelhante, cobrança aderente ao edital e distratores tecnicamente plausíveis.`
    : "Use estilo neutro e objetivo de concurso público municipal, com cobrança literal do edital, alternativas homogêneas e uma única resposta sem ambiguidade.";
};

// Input validation
const MAX_CONTENT_LENGTH = 200000;
const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 100;
const VALID_LEVELS = ["basico", "avancado"];
const RATE_LIMIT_WINDOW_MINUTES = 5;
const RATE_LIMIT_MAX_REQUESTS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Token de autenticação inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("status, plan_type, access_expires_at")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    const { data: userRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!userRole;
    const isExpired = subscription?.access_expires_at
      ? new Date(subscription.access_expires_at).getTime() < Date.now()
      : false;
    const hasActiveSubscription = !isExpired && (
      subscription?.status === "active" || subscription?.plan_type === "free_access"
    );

    if (!hasActiveSubscription && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Assinatura ativa necessária" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await serviceClient
      .from("generation_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.user.id)
      .eq("function_name", "generate-exam")
      .gte("created_at", windowStart);

    if (!isAdmin && (count ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: `Limite de ${RATE_LIMIT_MAX_REQUESTS} gerações a cada ${RATE_LIMIT_WINDOW_MINUTES} minutos. Aguarde e tente novamente.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await serviceClient.from("generation_logs").insert({
      user_id: userData.user.id,
      function_name: "generate-exam",
    });

    // Parse and validate input
    const body = await req.json();
    const { conteudo, quantidade, nivel, banca = "", cargo = "", num_alternativas = 5 } = body;

    if (!conteudo || typeof conteudo !== "string" || !conteudo.trim()) {
      return new Response(
        JSON.stringify({ error: "Conteúdo/tema é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sanitizedConteudo = conteudo;
    if (conteudo.length > MAX_CONTENT_LENGTH) {
      sanitizedConteudo = conteudo.slice(0, MAX_CONTENT_LENGTH);
    }

    const numQuestions = typeof quantidade === "number"
      ? Math.min(Math.max(quantidade, MIN_QUESTIONS), MAX_QUESTIONS)
      : 20;
    const sanitizedNivel = (typeof nivel === "string" && VALID_LEVELS.includes(nivel.toLowerCase().trim()))
      ? nivel.toLowerCase().trim()
      : "basico";
    const sanitizedBanca = typeof banca === "string" ? banca.trim().slice(0, 100) : "";
    const sanitizedCargo = typeof cargo === "string" ? cargo.trim().slice(0, 200) : "";
    const numAlt = num_alternativas === 4 ? 4 : 5;

    sanitizedConteudo = sanitizedConteudo.trim().replace(/[\x00-\x1F\x7F]/g, "");

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const nivelLabel = sanitizedNivel === "basico" ? "Nível Médio" : "Nível Superior";
    const bancaLabel = sanitizedBanca || "INEPAM";
    const cargoLabel = sanitizedCargo || "Não especificado";
    const altLetras = numAlt === 4 ? "A, B, C, D" : "A, B, C, D, E";
    const bancaInstrucao = buildBancaInstruction(bancaLabel);
    const altE = numAlt === 5 ? "\n**E)** [alternativa]" : "";
    const altEWrong = numAlt === 5 ? "\n- E) [explicação]" : "";

    const systemPrompt = EXAM_PROMPT
      .replace(/{{quantidade}}/g, String(numQuestions))
      .replace(/{{nivel}}/g, nivelLabel)
      .replace(/{{banca}}/g, bancaLabel)
      .replace(/{{cargo}}/g, cargoLabel)
      .replace(/{{num_alternativas}}/g, String(numAlt))
      .replace(/{{alt_letras}}/g, altLetras)
      .replace(/{{banca_instrucao}}/g, bancaInstrucao)
      .replace(/{{alt_e}}/g, altE)
      .replace(/{{alt_e_wrong}}/g, altEWrong);

    const userPrompt = `**Quantidade de Questões:** EXATAMENTE ${numQuestions}
**Nível de Dificuldade:** ${nivelLabel}
**Banca:** ${bancaLabel}
**Cargo:** ${cargoLabel}

**Tema/Matéria base para elaboração das questões:**

${sanitizedConteudo}

---

⚠️ ATENÇÃO: Elabore EXATAMENTE ${numQuestions} questões numeradas de 1 a ${numQuestions}.
- Você DEVE gerar TODAS as ${numQuestions} questões, sem exceção.
- CADA questão DEVE ter gabarito e explicação dentro de tags <details>
- Use linguagem formal e objetiva, adequada a concurso público
- NÃO pare antes de completar a questão ${numQuestions}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GOOGLE_AI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          { role: "user", parts: [{ text: userPrompt }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 65536,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Gemini API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erro ao gerar conteúdo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform Gemini SSE to OpenAI-compatible format
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              const openAiChunk = { choices: [{ delta: { content } }] };
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(openAiChunk)}\n\n`)
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
      },
      flush(controller) {
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      },
    });

    return new Response(response.body!.pipeThrough(transformStream), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-exam error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
