import { useParams } from 'react-router-dom';
import {
  CONCURSOS_BY_SLUG,
  DEFAULT_CONCURSO_SLUG,
  type Concurso,
} from '@/data/concursos';

/**
 * Lê o `concursoSlug` da rota (`/c/:concursoSlug/...`), faz fallback pro
 * default quando ausente/inválido. Nunca lança.
 */
export function useActiveConcurso(): { concurso: Concurso; slug: string } {
  const params = useParams<{ concursoSlug?: string }>();
  const slugFromUrl = params.concursoSlug;
  const concurso =
    (slugFromUrl && CONCURSOS_BY_SLUG[slugFromUrl]) ||
    CONCURSOS_BY_SLUG[DEFAULT_CONCURSO_SLUG];
  return { concurso, slug: concurso.slug };
}
