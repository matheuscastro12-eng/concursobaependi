// Gravação de respostas + helpers de revisão espaçada.
// Persiste cada questão respondida em `question_attempts` (via RPC record_attempts)
// e alimenta a fila de revisão (review_queue) das erradas.

import { supabase } from '@/integrations/supabase/client';

export interface AttemptInput {
  tema?: string;
  cargo_slug?: string;
  banca?: string;
  nivel?: string;
  enunciado: string;
  alternativas: { letter: string; text: string }[];
  correct_answer: string;
  chosen_answer: string | null;
  is_correct: boolean;
  explanation?: string;
}

/**
 * Grava um lote de respostas de um simulado. Best-effort: nunca lança —
 * falha silenciosa pra não atrapalhar o fluxo de estudo.
 */
export async function recordAttempts(
  concursoSlug: string,
  attempts: AttemptInput[],
): Promise<boolean> {
  if (!attempts.length) return false;
  try {
    const { error } = await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
    }).rpc('record_attempts', {
      _concurso_slug: concursoSlug,
      _attempts: attempts,
    });
    if (error) {
      console.warn('[attempts] record_attempts falhou', error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[attempts] record_attempts exception', e);
    return false;
  }
}

export interface ReviewItem {
  question_hash: string;
  concurso_slug: string;
  tema: string | null;
  banca: string | null;
  nivel: string | null;
  enunciado: string;
  alternativas: { letter: string; text: string }[];
  correct_answer: string;
  explanation: string | null;
  box: number;
  times_seen: number;
  times_correct: number;
  next_review_at: string;
}

export async function fetchReviewQueue(
  concursoSlug: string,
  limit = 20,
): Promise<ReviewItem[]> {
  try {
    const { data, error } = await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    }).rpc('wrong_questions_for_review', {
      _concurso_slug: concursoSlug,
      _limit: limit,
    });
    if (error || !Array.isArray(data)) return [];
    return data as ReviewItem[];
  } catch {
    return [];
  }
}

export async function gradeReview(questionHash: string, gotIt: boolean): Promise<void> {
  try {
    await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
    }).rpc('grade_review', { _question_hash: questionHash, _got_it: gotIt });
  } catch {
    /* best-effort */
  }
}

export interface PerformanceSummary {
  total: number;
  correct: number;
  today: number;
  streak: number;
  review_due: number;
  review_total: number;
  by_materia: { tema: string; total: number; correct: number; accuracy: number }[];
  by_day: { day: string; total: number; correct: number }[];
}

const EMPTY_SUMMARY: PerformanceSummary = {
  total: 0, correct: 0, today: 0, streak: 0, review_due: 0, review_total: 0,
  by_materia: [], by_day: [],
};

export async function fetchPerformanceSummary(
  concursoSlug: string,
): Promise<PerformanceSummary> {
  try {
    const { data, error } = await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    }).rpc('user_performance_summary', { _concurso_slug: concursoSlug });
    if (error || !data || typeof data !== 'object') return EMPTY_SUMMARY;
    return { ...EMPTY_SUMMARY, ...(data as Partial<PerformanceSummary>) };
  } catch {
    return EMPTY_SUMMARY;
  }
}
