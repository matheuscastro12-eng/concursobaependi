// Registry central dos concursos disponíveis no app.
// Adicionar novo concurso? Importe ele aqui e inclua no array CONCURSOS.

import type { Concurso } from './types';
import { concurso as baependi } from './baependi';
import { concurso as alagoa } from './alagoa';
import { concurso as afya } from '../afya';

export * from './types';

export const CONCURSOS: Concurso[] = [baependi, alagoa, afya];

// Apenas concursos municipais (cargos + IA) — exclui produtos 'integradora'.
export const CONCURSOS_MUNICIPAIS: Concurso[] = CONCURSOS.filter(
  (c) => c.tipo !== 'integradora',
);

export const CONCURSOS_BY_SLUG: Record<string, Concurso> = CONCURSOS.reduce(
  (acc, c) => {
    acc[c.slug] = c;
    return acc;
  },
  {} as Record<string, Concurso>,
);

export const getConcursoBySlug = (slug: string | undefined | null): Concurso | undefined => {
  if (!slug) return undefined;
  return CONCURSOS_BY_SLUG[slug];
};

export const listConcursos = (): Concurso[] => CONCURSOS;

// Slug default quando não há contexto (ex: rota raiz legada).
export const DEFAULT_CONCURSO_SLUG = 'baependi';
