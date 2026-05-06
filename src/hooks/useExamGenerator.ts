import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveExamProgress, clearExamProgress } from '@/lib/savedGeneratedExams';

export type DifficultyLevel = 'basico' | 'avancado';

export interface ExamConfig {
  quantidade: number;
  nivel: DifficultyLevel;
  simulationMode: boolean;
  banca?: string;
  cargo?: string;
  numAlternativas?: 4 | 5;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_DIRECT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;
const GEMINI_PROXY = '/api/gemini';

// Em dev, se houver VITE_GOOGLE_AI_API_KEY no .env.local, chama o Gemini direto.
// Em produção (Vercel), VITE_GOOGLE_AI_API_KEY não existe e a chamada vai pro proxy
// serverless /api/gemini que esconde a key server-side.
const useProxy = !import.meta.env.VITE_GOOGLE_AI_API_KEY;

const buildBancaStyleBlock = (banca: string): string => {
  if (!/inepam/i.test(banca)) {
    return `PADRÃO DA BANCA
- Aplique o estilo declarado pelo usuário para a banca ${banca}.
- Se a banca for pouco documentada, use como aproximação: enunciados objetivos, cobrança literal do edital, alternativas homogêneas e uma única chave sem ambiguidade.`;
  }

  return `PADRÃO INEPAM
- Trate INEPAM como banca de concursos municipais, com prova objetiva, linguagem direta e forte aderência ao edital.
- Gere questões INÉDITAS, mas calibradas por padrões observados em provas e julgamentos de recurso da banca.
- Use preferencialmente 5 alternativas quando o usuário solicitar 5; a banca costuma trabalhar bem com A-E.
- Em Português, priorize gramática normativa e interpretação literal: ortografia, crase, fonemas, concordância, classes de palavras, predicado, verbo, sentido contextual e texto curto.
- Em Matemática/Raciocínio Lógico, use cálculo direto: juros simples, porcentagem, radicais, operações, razão/proporção, regra de três e tabelas simples.
- Em Conhecimentos Específicos, prefira definição, procedimento, atendimento ao público, legislação seca, documentos oficiais e aplicação direta ao cargo municipal.
- Enunciados devem ser curtos ou médios. Evite casos longos demais, doutrina excessiva e jurisprudência sofisticada quando o cargo for de nível médio.
- Distratores devem errar por troca pontual: grafia, conceito próximo, prazo, competência, requisito, cálculo comum ou termo gramatical.
- A banca pode usar alternativa residual, como "Nenhuma das alternativas"; use com moderação quando fizer sentido, sem abusar.
- A questão deve parecer de prova municipal real: objetiva, verificável pelo edital/lei, sem humor, sem narrativa longa e sem alternativa obviamente absurda.`;
};

const buildPrompt = (conteudo: string, config: ExamConfig): string => {
  const nivelLabel = config.nivel === 'basico' ? 'Nível Médio' : 'Nível Superior';
  const numAlt = config.numAlternativas ?? 5;
  const letras = numAlt === 4 ? 'A, B, C, D' : 'A, B, C, D, E';
  const banca = config.banca?.trim() || 'INEPAM';
  const cargo = config.cargo?.trim() || 'cargo público municipal';
  const bancaStyleBlock = buildBancaStyleBlock(banca);
  const isInepam = /inepam/i.test(banca);
  const specialAlternativeRule = isInepam
    ? 'Evite "todas as anteriores"; "nenhuma das alternativas" pode aparecer raramente quando for compatível com o padrão da questão.'
    : 'NÃO use "todas as anteriores", "nenhuma das anteriores", "n.d.a.".';

  // Calibra a dificuldade conforme o nível solicitado
  const dificuldadeBlock = config.nivel === 'basico'
    ? `NÍVEL DE DIFICULDADE: alto para concurso de Ensino Médio.
- Privilegie aplicação prática (não decoreba pura): situação-problema curta, mini-caso ou pequeno texto-base que exija interpretação.
- Cobre detalhes ESPECÍFICOS da legislação/conteúdo (datas, prazos, exceções, hipóteses de incidência, listas exaustivas), não apenas o conceito geral.
- Inclua pelo menos UMA pegadinha clássica de banca por questão: troca sutil de palavras (ex: "deve" vs "pode"), inversão de regra-exceção, prazo errado por pouco, agente competente trocado, etc.
- Dificuldade-alvo: ~50-60% de acerto entre candidatos preparados.`
    : `NÍVEL DE DIFICULDADE: alto para concurso de Ensino Superior — equivalente a banca tradicional (FCC/VUNESP/CESPE).
- Use cenários complexos: caso prático com 2-4 fatos relevantes que exijam aplicação combinada de regras.
- Cobre jurisprudência consolidada (STF/STJ/TCU/CNJ conforme a área), súmulas, posições doutrinárias majoritárias e divergências relevantes.
- Distratores plausíveis: alternativas erradas devem soar tecnicamente verossímeis; o erro deve estar num detalhe normativo, num prazo, numa competência, num requisito formal.
- Evite questão de "marque a única correta" óbvia — exija discernimento entre alternativas próximas.
- Dificuldade-alvo: ~40-55% de acerto entre candidatos preparados.`;

  return `Você é um elaborador SÊNIOR de questões para concursos públicos brasileiros, com experiência em bancas como VUNESP, FCC, CESPE/Cebraspe, IBAM, OBJETIVA e ${banca}. Suas questões são reconhecidas pelo rigor técnico e pelos distratores bem construídos.

TAREFA
Elabore ${config.quantidade} (${config.quantidade}) questões de múltipla escolha, com exatamente ${numAlt} alternativas (${letras}) e UMA única correta, para o cargo de ${cargo} (${nivelLabel}), no estilo da banca ${banca}, sobre o seguinte conteúdo programático:

${conteudo}

${bancaStyleBlock}

${dificuldadeBlock}

REGRAS OBRIGATÓRIAS
1. Português formal, objetivo, terminologicamente preciso. Sem ambiguidade.
2. Quando o tema for jurídico, cite o dispositivo legal exato (Lei nº X, art. Y, §Z) tanto no enunciado quanto no comentário.
3. Cada questão é autocontida.
4. ${specialAlternativeRule}
5. As alternativas devem ter comprimento similar entre si (não deixe a correta visivelmente mais longa).
6. NÃO repita a mesma estrutura de pergunta entre as questões — varie: "Assinale a alternativa correta", "É CORRETO afirmar que", "É INCORRETO afirmar que", caso prático seguido de "Diante disso, é correto concluir que", citação de artigo seguido de pergunta sobre exceção, etc.
7. Embaralhe a posição da alternativa correta entre as questões (não concentre tudo em A ou C).
8. O comentário deve ser DIDÁTICO E SUBSTANTIVO: explicar por que a correta está certa COM fundamento (lei, doutrina, conceito-chave) E por que cada errada está errada, apontando o erro específico (palavra trocada, prazo errado, regra que não se aplica ao caso etc.).

FORMATO DE SAÍDA — Markdown (siga ESTRITAMENTE este formato; o parser depende dele):

## Questão N

[Enunciado: pode começar com um pequeno texto-base, citação de lei ou mini-caso prático em parágrafo separado, e terminar com uma pergunta clara.]

**A)** [alternativa A]
**B)** [alternativa B]
**C)** [alternativa C]
**D)** [alternativa D]${numAlt === 5 ? `
**E)** [alternativa E]` : ''}

**Gabarito: X**

**Comentário:** [Justificativa da alternativa correta com fundamento (lei/artigo, conceito, doutrina). Em seguida, percorra cada alternativa errada apontando o erro específico — exemplo: "A alternativa A está errada porque trocou o prazo de 5 para 10 dias (art. X da Lei Y)". Mínimo 4 linhas, máximo 12 linhas.]

---

ATENÇÃO ao formato do gabarito: deve ser EXATAMENTE \`**Gabarito: X**\` (com asteriscos abrindo antes de "Gabarito" e fechando DEPOIS da letra X). NÃO escreva \`**Gabarito:** X\`.

Comece IMEDIATAMENTE pela linha "## Questão 1". Não escreva introdução, cabeçalho, "Aqui estão...", nada antes da primeira questão.`;
};

export const useExamGenerator = () => {
  const { toast } = useToast();
  const [resultado, setResultado] = useState('');
  const [generating, setGenerating] = useState(false);
  const [hasStartedReceiving, setHasStartedReceiving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ExamConfig | null>(null);

  const generate = useCallback(async (
    conteudo: string,
    config: ExamConfig,
    // Opcional. Se passado, usado como base do cacheKey de progresso parcial
    // (deve bater com o `tema` usado em findSavedGeneratedExam pra restauração
    // funcionar). Se omitido, cai no `conteudo`.
    persistKey?: string,
  ) => {
    const cacheBase = (persistKey ?? conteudo).trim();
    if (!conteudo.trim()) {
      toast({
        title: 'Tema obrigatório',
        description: 'Informe o tema ou matéria para gerar as questões.',
        variant: 'destructive',
      });
      return null;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    // Em produção (proxy ativo) não precisa de key no front.
    // Em dev, se a key não estiver, alerta.
    if (!useProxy && !apiKey) {
      toast({
        title: 'Chave de API ausente',
        description: 'Configure VITE_GOOGLE_AI_API_KEY no .env.local ou implemente /api/gemini.',
        variant: 'destructive',
      });
      return null;
    }

    setGenerating(true);
    setResultado('');
    setHasStartedReceiving(false);
    setIsComplete(false);
    setCurrentConfig(config);

    try {
      const prompt = buildPrompt(conteudo, config);

      // Estima tokens necessários: ~700 tokens por questão (enunciado + alternativas + gabarito + comentário detalhado)
      const maxOutputTokens = Math.max(8192, Math.min(32768, config.quantidade * 800));
      // Thinking budget proporcional à dificuldade — Nível Superior pede mais raciocínio
      const thinkingBudget = config.nivel === 'avancado' ? 8192 : 4096;

      const url = useProxy ? GEMINI_PROXY : `${GEMINI_DIRECT}&key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens,
            thinkingConfig: { thinkingBudget },
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        let msg = `HTTP ${response.status}`;
        try {
          const parsed = JSON.parse(errBody);
          // O proxy /api/gemini devolve {error: 'gemini_overloaded', message: ...}
          // quando esgotam os retries — exibe mensagem curta e amigável.
          if (parsed?.error === 'gemini_overloaded') {
            msg = parsed.message
              || 'A IA está com alta demanda agora. Tente de novo em alguns segundos.';
          } else {
            msg = parsed?.error?.message ?? parsed?.message ?? msg;
          }
        } catch {
          if (errBody) msg = errBody.slice(0, 200);
        }
        throw new Error(msg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let started = false;
      let buffer = '';
      // Throttle do save no localStorage — escreve no máximo a cada 800ms
      // (ou imediatamente quando passar de 1500 chars desde o último save).
      let lastSaveAt = 0;
      let lastSaveLen = 0;
      const trySaveProgress = () => {
        const now = Date.now();
        const lenDelta = fullText.length - lastSaveLen;
        if (now - lastSaveAt > 800 || lenDelta > 1500) {
          saveExamProgress(cacheBase, config, fullText);
          lastSaveAt = now;
          lastSaveLen = fullText.length;
        }
      };

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
                    if (!started) {
                      started = true;
                      setHasStartedReceiving(true);
                    }
                    fullText += p.text;
                    setResultado(fullText);
                  }
                }
              }
            } catch {
              // ignora chunks parciais
            }
          }

          trySaveProgress();
        }
      }

      setIsComplete(true);
      // Save final + clear do progresso parcial (saveGeneratedExam no Exam.tsx
      // persiste o resultado completo no cache global).
      saveExamProgress(cacheBase, config, fullText);
      // Pequena janela pro Exam.tsx persistir antes de limpar — evita perder
      // a referência se o usuário sair da aba imediatamente após o término.
      setTimeout(() => clearExamProgress(cacheBase, config), 5000);
      return fullText;
    } catch (error) {
      toast({
        title: 'Erro ao gerar questões',
        description: error instanceof Error ? error.message : 'Falha desconhecida.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  const loadSaved = useCallback((savedResultado: string, config: ExamConfig) => {
    setResultado(savedResultado);
    setHasStartedReceiving(true);
    setIsComplete(true);
    setGenerating(false);
    setCurrentConfig(config);
  }, []);

  const reset = useCallback(() => {
    setResultado('');
    setGenerating(false);
    setHasStartedReceiving(false);
    setIsComplete(false);
    setCurrentConfig(null);
  }, []);

  return {
    resultado,
    generating,
    hasStartedReceiving,
    isComplete,
    currentConfig,
    generate,
    loadSaved,
    reset,
  };
};
