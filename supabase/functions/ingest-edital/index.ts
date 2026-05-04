// Edge Function: Ingest Edital
// Recebe um edital_id (PDF já foi upado em storage 'editais-pdfs').
// Lê o PDF, manda pro Gemini, extrai as matérias/disciplinas cobradas
// e salva em edital_materias.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

interface Materia {
  nome: string;
  num_questoes: number | null;
  peso: number | null;
}

interface ExtractionResult {
  materias: Materia[];
}

const EXTRACTION_PROMPT = `Você recebe o texto ou PDF de um edital de concurso público municipal.
Sua tarefa: extrair TODAS as matérias/disciplinas cobradas na prova.

REGRAS:
1. Para cada matéria, extraia:
   - "nome": nome da disciplina/matéria exatamente como aparece no edital
   - "num_questoes": número de questões desta matéria na prova (null se não informado)
   - "peso": peso/nota desta matéria (null se não informado)

2. Agrupe sub-tópicos no mesmo item se fizerem parte da mesma disciplina (ex: "Língua Portuguesa" engloba ortografia, gramática, interpretação).

3. Se o edital tem várias provas/etapas, extraia apenas as matérias da prova objetiva (de múltipla escolha).

4. Se não conseguir identificar matérias claramente, retorne o que encontrar.

FORMATO DE SAÍDA — APENAS JSON válido, SEM markdown ou texto adicional:

{
  "materias": [
    {
      "nome": "Língua Portuguesa",
      "num_questoes": 15,
      "peso": null
    },
    {
      "nome": "Raciocínio Lógico",
      "num_questoes": 10,
      "peso": null
    }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Autenticação necessária" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.replace("Bearer ", "");

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) {
    return new Response(JSON.stringify({ error: "Token inválido" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Parse body
  let body: { edital_id?: string; pages?: Array<{ page_num: number; text: string }> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const editalId = body.edital_id;
  if (!editalId) {
    return new Response(JSON.stringify({ error: "edital_id obrigatório" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Carrega edital e valida ownership
  const { data: edital, error: editalError } = await adminClient
    .from("editais")
    .select("*")
    .eq("id", editalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (editalError || !edital) {
    return new Response(
      JSON.stringify({ error: "Edital não encontrado ou não pertence ao usuário" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Marca como extracting
  await adminClient
    .from("editais")
    .update({ status: "extracting", status_message: null })
    .eq("id", editalId);

  try {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY não configurada");

    let userParts: Array<Record<string, unknown>>;

    // Se o caller mandou texto extraído (modo preferido para PDFs digitais)
    if (Array.isArray(body.pages) && body.pages.length > 0) {
      const pagesText = body.pages
        .map((p) => `=== PÁGINA ${p.page_num} ===\n${(p.text ?? "").trim()}`)
        .join("\n\n");
      userParts = [
        { text: pagesText },
        { text: "Extraia todas as matérias cobradas neste edital seguindo as regras do sistema." },
      ];
    } else if (edital.pdf_storage_path) {
      // Fallback: baixa o PDF e manda via Vision
      const { data: pdfBlob, error: dlError } = await adminClient
        .storage.from("editais-pdfs")
        .download(edital.pdf_storage_path);

      if (dlError || !pdfBlob) {
        throw new Error(`Falha ao baixar PDF: ${dlError?.message ?? "blob vazio"}`);
      }
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();
      if (pdfArrayBuffer.byteLength > MAX_PDF_SIZE_BYTES) {
        throw new Error(`PDF muito grande (${(pdfArrayBuffer.byteLength / 1024 / 1024).toFixed(1)} MB). Limite: ${MAX_PDF_SIZE_BYTES / 1024 / 1024} MB.`);
      }
      const u8 = new Uint8Array(pdfArrayBuffer);
      let binary = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < u8.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + CHUNK)));
      }
      const pdfBase64 = btoa(binary);
      userParts = [
        { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
        { text: "Extraia todas as matérias cobradas neste edital seguindo as regras do sistema." },
      ];
    } else {
      throw new Error("Nem páginas de texto nem PDF disponível para extração");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: EXTRACTION_PROMPT }] },
        contents: [{ role: "user", parts: userParts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API ${response.status}: ${errText.slice(0, 300)}`);
    }

    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini retornou resposta vazia");

    const result: ExtractionResult = JSON.parse(text);
    if (!Array.isArray(result.materias) || result.materias.length === 0) {
      throw new Error("Nenhuma matéria encontrada no edital");
    }

    // Apaga matérias anteriores (caso seja re-ingestão)
    await adminClient.from("edital_materias").delete().eq("edital_id", editalId);

    // Insere matérias
    const rows = result.materias.map((m) => ({
      edital_id: editalId,
      user_id: userId,
      nome: String(m.nome ?? "").trim(),
      num_questoes: typeof m.num_questoes === "number" ? m.num_questoes : null,
      peso: typeof m.peso === "number" ? m.peso : null,
    })).filter((r) => r.nome.length > 0);

    const { error: insError } = await adminClient.from("edital_materias").insert(rows);
    if (insError) throw new Error(`Falha ao inserir matérias: ${insError.message}`);

    await adminClient
      .from("editais")
      .update({ status: "ready" })
      .eq("id", editalId);

    return new Response(
      JSON.stringify({ success: true, edital_id: editalId, materias_extraidas: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = (err as Error).message ?? "Erro desconhecido";
    console.error("ingest-edital fail:", msg);
    await adminClient
      .from("editais")
      .update({ status: "failed", status_message: msg.slice(0, 500) })
      .eq("id", editalId);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
