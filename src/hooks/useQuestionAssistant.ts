import { useCallback, useRef, useState } from 'react';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_DIRECT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;
const GEMINI_PROXY = '/api/gemini';
const useProxy = !import.meta.env.VITE_GOOGLE_AI_API_KEY;

export interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface QuestionContext {
  enunciado: string;
  alternativas: { letter: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  banca?: string;
  cargo?: string;
  tema?: string;
}

const buildSystemContext = (ctx: QuestionContext): string => {
  const altsStr = ctx.alternativas
    .map((a) => `${a.letter}) ${a.text}`)
    .join('\n');

  return `Você é um tutor experiente de concursos públicos municipais brasileiros. Seu papel é tirar dúvidas SOBRE A QUESTÃO ABAIXO — somente sobre ela e seu conteúdo correlato.

REGRAS DE RESPOSTA:
- Responda em português, formal mas didático.
- Foco no conteúdo da questão (lei, artigo, conceito, pegadinha). Não invente fatos.
- Quando citar lei, traga artigo, parágrafo, inciso. Cite súmula ou jurisprudência quando aplicável.
- Se a pergunta for ambígua, peça esclarecimento curto antes de responder longo.
- Resposta CURTA por padrão (3-8 linhas). Aprofunde só se o usuário pedir explicitamente "explica em detalhe", "exemplos", "compare", etc.
- Evite repetir o comentário da questão; expanda, contextualize ou compare com outras hipóteses.
- Se a pergunta sair do contexto da questão (ex: "que dia é hoje?"), gentilmente recuse e ofereça voltar ao tema.
- Não use emojis. Não use markdown pesado (apenas **negrito** pontual e listas curtas quando útil).

CONTEXTO DA QUESTÃO ATUAL:
${ctx.banca ? `Banca: ${ctx.banca}` : ''}
${ctx.cargo ? `Cargo: ${ctx.cargo}` : ''}
${ctx.tema ? `Tema/Matéria: ${ctx.tema}` : ''}

ENUNCIADO:
${ctx.enunciado}

ALTERNATIVAS:
${altsStr}

GABARITO: ${ctx.correctAnswer}

COMENTÁRIO OFICIAL:
${ctx.explanation}

Agora aguarde a primeira pergunta do estudante.`;
};

export const useQuestionAssistant = () => {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStreaming(false);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const ask = useCallback(
    async (userQuestion: string, ctx: QuestionContext): Promise<void> => {
      const trimmed = userQuestion.trim();
      if (!trimmed || streaming) return;

      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      if (!useProxy && !apiKey) return;

      const userMsg: QAMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      };
      const assistantId = `a-${Date.now() + 1}`;
      const assistantMsg: QAMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: Date.now() + 1,
      };

      // Snapshot pro turno atual (system + histórico + nova pergunta)
      const turnHistory = [...messages, userMsg];

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      // Constrói o array de contents pro Gemini.
      // O Gemini não tem "system role" nativo; usamos o systemInstruction.
      const geminiContents = turnHistory.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      try {
        const url = useProxy ? GEMINI_PROXY : `${GEMINI_DIRECT}&key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: buildSystemContext(ctx) }],
            },
            generationConfig: {
              temperature: 0.6,
              topP: 0.9,
              maxOutputTokens: 2048,
              thinkingConfig: { thinkingBudget: 1024 },
            },
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          let msg = `HTTP ${response.status}`;
          try {
            const parsed = JSON.parse(errBody);
            if (parsed?.error === 'gemini_overloaded') {
              msg = parsed.message ?? 'IA com alta demanda. Tente de novo em alguns segundos.';
            } else {
              msg = parsed?.error?.message ?? parsed?.message ?? msg;
            }
          } catch {
            if (errBody) msg = errBody.slice(0, 160);
          }
          throw new Error(msg);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let acc = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const parts = parsed?.candidates?.[0]?.content?.parts;
                if (Array.isArray(parts)) {
                  for (const p of parts) {
                    if (typeof p?.text === 'string') {
                      acc += p.text;
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === assistantId ? { ...m, content: acc } : m,
                        ),
                      );
                    }
                  }
                }
              } catch {
                /* ignora chunks parciais */
              }
            }
          }
        }
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') return;
        const errMsg = error instanceof Error ? error.message : 'Falha desconhecida';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `_Não consegui responder agora (${errMsg}). Tente de novo?_` }
              : m,
          ),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming],
  );

  return { messages, streaming, ask, reset, cancel };
};
