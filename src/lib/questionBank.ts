import { supabase } from '@/integrations/supabase/client';
import { materias as materiasMap, type Materia } from '@/data/baependi';
import type { ExamConfig } from '@/hooks/useExamGenerator';

interface BankQuestion {
  id: string;
  enunciado: string;
  alternativas: { letter: string; text: string }[];
  gabarito: string;
  comentario: string;
}

/**
 * Tenta resolver `tema` (string mostrada ao aluno) pra um `materia_id` real.
 * Match exato pelo nome da matéria; se não achar, retorna null e o fluxo
 * cai pro Gemini ao vivo.
 */
export const findMateriaIdByNome = (tema: string): string | null => {
  const norm = tema.trim().toLowerCase();
  for (const [id, m] of Object.entries(materiasMap)) {
    if (m.nome.toLowerCase() === norm) return id;
  }
  return null;
};

/**
 * Tenta puxar N questões do banco. Retorna null se:
 *  - não achou materia_id correspondente
 *  - banco tem menos de N questões pra essa combinação
 *  - erro na RPC
 *
 * Se sucesso, devolve o markdown no MESMO formato do Gemini (pro parser
 * de SimulationView funcionar igual) + os IDs (pra marcar como vistas).
 */
export interface BankResult {
  markdown: string;
  questionIds: string[];
}

export const tryPickFromBank = async (
  tema: string,
  config: ExamConfig,
): Promise<BankResult | null> => {
  const materiaId = findMateriaIdByNome(tema);
  if (!materiaId) return null;

  const { data, error } = await supabase.rpc('pick_questions', {
    _materia_id: materiaId,
    _nivel: config.nivel,
    _num_alternativas: config.numAlternativas ?? 5,
    _limit: config.quantidade,
  });

  if (error || !Array.isArray(data) || data.length < config.quantidade) {
    return null;
  }

  const questions = data as BankQuestion[];
  return {
    markdown: formatAsMarkdown(questions),
    questionIds: questions.map((q) => q.id),
  };
};

/**
 * Reconstrói o markdown que o Gemini produziria, pra reusar o parser
 * existente em SimulationView (sem mudar nada no front de simulado).
 */
const formatAsMarkdown = (questions: BankQuestion[]): string => {
  return questions
    .map((q, i) => {
      const alts = q.alternativas
        .map((a) => `**${a.letter})** ${a.text}`)
        .join('\n');
      return `## Questão ${i + 1}

${q.enunciado}

${alts}

**Gabarito: ${q.gabarito}**

**Comentário:** ${q.comentario}`;
    })
    .join('\n\n---\n\n');
};

/**
 * Marca as questões como vistas pelo aluno atual (anti-repetição).
 * Fire-and-forget — falha silenciosa.
 */
export const markQuestionsSeen = (questionIds: string[]): void => {
  if (questionIds.length === 0) return;
  supabase
    .rpc('mark_questions_seen', { _ids: questionIds })
    .then(() => {})
    .catch(() => {});
};

// ─────────────────────────────────────────────────────────────────────
// PARSER: extrai questões atômicas do markdown gerado pelo Gemini
// (mesmo formato usado pelo SimulationView).
// ─────────────────────────────────────────────────────────────────────

interface ParsedQuestion {
  enunciado: string;
  alternativas: { letter: string; text: string }[];
  gabarito: string;
  comentario: string;
}

const parseQuestionsFromMarkdown = (markdown: string, expectedAlts: number): ParsedQuestion[] => {
  const blocks = markdown.split(/(?=##\s*Questão\s+\d+)/i);
  const out: ParsedQuestion[] = [];

  for (const block of blocks) {
    if (!/##\s*Questão\s+\d+/i.test(block)) continue;

    const gabMatch = block.match(/\*\*Gabarito:\s*([A-E])\*\*/i);
    if (!gabMatch) continue;
    const gabarito = gabMatch[1].toUpperCase();

    const alts: { letter: string; text: string }[] = [];
    const altRegex = /\*\*([A-E])\)\*\*\s*([^\n]+(?:\n(?!\*\*[A-E]\)\*\*|\*\*Gabarito|\*\*Coment)[^\n]*)*)/g;
    let m: RegExpExecArray | null;
    while ((m = altRegex.exec(block)) !== null) {
      if (!alts.some((a) => a.letter === m![1])) {
        alts.push({ letter: m[1], text: m[2].trim() });
      }
    }
    if (alts.length < expectedAlts) continue;

    const comentarioMatch = block.match(/\*\*Coment[áa]rio:\*\*\s*([\s\S]*?)(?=\n---|$)/i);
    const comentario = comentarioMatch?.[1]?.trim() ?? '';
    if (!comentario || comentario.length < 10) continue;

    const headerEnd = block.indexOf('\n', block.indexOf('##'));
    const firstAlt = block.search(/\*\*[A-E]\)\*\*/);
    if (firstAlt < 0 || headerEnd < 0) continue;
    const enunciado = block.slice(headerEnd, firstAlt).trim();
    if (!enunciado || enunciado.length < 10) continue;

    out.push({ enunciado, alternativas: alts.slice(0, expectedAlts), gabarito, comentario });
  }

  return out;
};

/**
 * Após uma geração bem-sucedida via Gemini, parseia o markdown e contribui
 * todas as questões parseadas pro banco compartilhado. Fire-and-forget —
 * o aluno não espera por isso, e falhas não atrapalham o simulado dele.
 *
 * Só roda pra alunos AUTENTICADOS (RPC valida via auth.uid()).
 */
export const saveGeneratedToBank = (
  markdown: string,
  config: ExamConfig,
  meta: {
    materiaId: string;
    categoria: 'gerais' | 'educacao' | 'saude' | 'especifico';
    cargoSlug?: string | null;
  },
): void => {
  const numAlts = config.numAlternativas ?? 5;
  const parsed = parseQuestionsFromMarkdown(markdown, numAlts);
  if (parsed.length === 0) return;

  const payload = parsed.map((p) => ({
    materia_id: meta.materiaId,
    categoria: meta.categoria,
    nivel: config.nivel,
    banca: config.banca?.trim() || 'INEPAM',
    cargo_slug: meta.cargoSlug ?? null,
    num_alternativas: numAlts,
    enunciado: p.enunciado,
    alternativas: p.alternativas,
    gabarito: p.gabarito,
    comentario: p.comentario,
  }));

  supabase
    .rpc('save_questions_to_bank', { _questions: payload })
    .then(() => {
      // sucesso silencioso — admin vê via traffic_summary/dashboard
    })
    .catch(() => {
      /* falha silenciosa */
    });
};
