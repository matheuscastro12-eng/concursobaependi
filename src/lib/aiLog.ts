// Log de chamadas de IA / geração de simulados — alimenta o histórico no CRM.
// Best-effort: nunca lança. Distingue a origem (ia = custo real, bank/cache = grátis).

import { supabase } from '@/integrations/supabase/client';

export type AiFeature = 'exam' | 'assistant' | 'explain';
export type AiSource = 'ia' | 'bank' | 'cache';

export interface AiLogMeta {
  tema?: string;
  banca?: string;
  cargo?: string;
  cargoSlug?: string;
  nivel?: string;
  quantidade?: number;
  [k: string]: unknown;
}

export async function logAiCall(params: {
  feature: AiFeature;
  source: AiSource;
  concursoSlug?: string;
  meta?: AiLogMeta;
}): Promise<void> {
  try {
    await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
    }).rpc('log_ai_call', {
      _feature: params.feature,
      _source: params.source,
      _concurso_slug: params.concursoSlug ?? null,
      _meta: params.meta ?? {},
    });
  } catch {
    /* best-effort — não atrapalha o fluxo de estudo */
  }
}
