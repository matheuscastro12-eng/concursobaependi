import type { ExamConfig } from '@/hooks/useExamGenerator';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'concursosai.generatedExams.v1';
const STORAGE_KEY_PROGRESS = 'concursosai.examProgress.v1';
const MAX_SAVED_EXAMS = 80;
// Progresso parcial fica disponível por 24h. Depois disso, descartamos e o usuário
// gera de novo (provavelmente abandonou).
const PROGRESS_TTL_MS = 24 * 60 * 60 * 1000;

export interface SavedGeneratedExam {
  id: string;
  cacheKey: string;
  tema: string;
  banca: string;
  cargo: string;
  config: {
    quantidade: number;
    nivel: ExamConfig['nivel'];
    numAlternativas: 4 | 5;
  };
  resultado: string;
  createdAt: string;
  updatedAt: string;
}

type GlobalGeneratedExamRow = {
  id: string;
  cache_key: string;
  tema: string;
  banca: string;
  cargo: string | null;
  quantidade: number;
  nivel: ExamConfig['nivel'];
  num_alternativas: 4 | 5;
  resultado: string;
  created_at: string;
  updated_at: string;
};

const isSupabaseConfigured = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export const buildGeneratedExamCacheKey = (tema: string, config: ExamConfig) => {
  const parts = [
    normalize(tema),
    normalize(config.banca || 'INEPAM'),
    normalize(config.cargo || ''),
    config.nivel,
    String(config.quantidade),
    String(config.numAlternativas ?? 5),
  ];
  return parts.join('|');
};

const readSavedExams = (): SavedGeneratedExam[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSavedExams = (items: SavedGeneratedExam[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_SAVED_EXAMS)));
  } catch {
    // Se o navegador bloquear ou lotar o localStorage, a geração continua funcionando.
  }
};

const fromGlobalRow = (row: GlobalGeneratedExamRow): SavedGeneratedExam => ({
  id: row.id,
  cacheKey: row.cache_key,
  tema: row.tema,
  banca: row.banca,
  cargo: row.cargo ?? '',
  config: {
    quantidade: row.quantidade,
    nivel: row.nivel,
    numAlternativas: row.num_alternativas,
  },
  resultado: row.resultado,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findSavedGeneratedExam = async (tema: string, config: ExamConfig) => {
  const cacheKey = buildGeneratedExamCacheKey(tema, config);
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('generated_exam_cache')
      .select('id, cache_key, tema, banca, cargo, quantidade, nivel, num_alternativas, resultado, created_at, updated_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    if (!error && data) {
      const saved = fromGlobalRow(data as GlobalGeneratedExamRow);
      saveLocalGeneratedExam(saved);
      return saved;
    }
  }

  return readSavedExams().find((item) => item.cacheKey === cacheKey) ?? null;
};

const saveLocalGeneratedExam = (saved: SavedGeneratedExam) => {
  const existing = readSavedExams();
  writeSavedExams([saved, ...existing.filter((item) => item.cacheKey !== saved.cacheKey)]);
};

export const saveGeneratedExam = async (tema: string, config: ExamConfig, resultado: string) => {
  const cacheKey = buildGeneratedExamCacheKey(tema, config);
  const now = new Date().toISOString();
  const existing = readSavedExams();
  const previous = existing.find((item) => item.cacheKey === cacheKey);
  const saved: SavedGeneratedExam = {
    id: previous?.id ?? (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
    cacheKey,
    tema: tema.trim(),
    banca: config.banca?.trim() || 'INEPAM',
    cargo: config.cargo?.trim() || '',
    config: {
      quantidade: config.quantidade,
      nivel: config.nivel,
      numAlternativas: config.numAlternativas ?? 5,
    },
    resultado,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  saveLocalGeneratedExam(saved);

  if (isSupabaseConfigured()) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('generated_exam_cache')
        .upsert(
          {
            cache_key: cacheKey,
            tema: saved.tema,
            banca: saved.banca,
            cargo: saved.cargo || null,
            quantidade: saved.config.quantidade,
            nivel: saved.config.nivel,
            num_alternativas: saved.config.numAlternativas,
            resultado,
            source_user_id: user.id,
          },
          { onConflict: 'cache_key', ignoreDuplicates: true },
        );
    }
  }

  return saved;
};

export const listSavedGeneratedExams = () => readSavedExams();

// ─────────────────────────────────────────────────────────────────────────
// PROGRESSO PARCIAL (durante o stream)
// Salva no localStorage a cada N caracteres recebidos, pra sobreviver a:
//   - troca de aba do navegador
//   - F5 / fechar e abrir a aba
//   - navegação dentro do app (voltar pra outra rota e voltar)
// Quando a geração completa, o saveGeneratedExam acima persiste tudo
// e o clearExamProgress limpa o registro parcial.
// ─────────────────────────────────────────────────────────────────────────

interface ExamProgressEntry {
  cacheKey: string;
  tema: string;
  banca: string;
  cargo: string;
  config: SavedGeneratedExam['config'];
  resultado: string;
  updatedAt: number;
}

const readProgress = (): ExamProgressEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // GC: remove entradas vencidas
    const now = Date.now();
    return parsed.filter((e: ExamProgressEntry) => now - e.updatedAt < PROGRESS_TTL_MS);
  } catch {
    return [];
  }
};

const writeProgress = (items: ExamProgressEntry[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Limita a 5 sessões parciais simultâneas pra não inflar o storage.
    window.localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(items.slice(0, 5)));
  } catch {
    // sem espaço — ignora silenciosamente.
  }
};

export const saveExamProgress = (tema: string, config: ExamConfig, resultado: string) => {
  const cacheKey = buildGeneratedExamCacheKey(tema, config);
  const entry: ExamProgressEntry = {
    cacheKey,
    tema: tema.trim(),
    banca: config.banca?.trim() || 'INEPAM',
    cargo: config.cargo?.trim() || '',
    config: {
      quantidade: config.quantidade,
      nivel: config.nivel,
      numAlternativas: config.numAlternativas ?? 5,
    },
    resultado,
    updatedAt: Date.now(),
  };
  const existing = readProgress().filter((e) => e.cacheKey !== cacheKey);
  writeProgress([entry, ...existing]);
};

export const loadExamProgress = (tema: string, config: ExamConfig): ExamProgressEntry | null => {
  const cacheKey = buildGeneratedExamCacheKey(tema, config);
  return readProgress().find((e) => e.cacheKey === cacheKey) ?? null;
};

export const clearExamProgress = (tema: string, config: ExamConfig) => {
  const cacheKey = buildGeneratedExamCacheKey(tema, config);
  writeProgress(readProgress().filter((e) => e.cacheKey !== cacheKey));
};
