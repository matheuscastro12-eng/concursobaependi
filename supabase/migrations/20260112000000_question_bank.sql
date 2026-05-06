-- Banco de questões pré-geradas. Em vez de chamar a IA toda vez, alunos
-- puxam questões aleatórias daqui (instantâneo, sem custo de IA).
-- Admin popula via API /api/generate-bank em batches de N questões.

-- ──────────────────────────────────────────────────────────────────────
-- Tabela principal: 1 row = 1 questão atômica
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE public.question_bank (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_slug        text,                   -- nullable: questões de matérias compartilhadas (ex: SUS) servem vários cargos
  materia_id        text NOT NULL,          -- 'port-medio', 'saude-sus', 'esp-enfermeiro'…
  categoria         text NOT NULL,          -- 'gerais' | 'educacao' | 'saude' | 'especifico'
  nivel             text NOT NULL CHECK (nivel IN ('basico','avancado')),
  banca             text NOT NULL DEFAULT 'INEPAM',
  num_alternativas  smallint NOT NULL CHECK (num_alternativas IN (4, 5)),
  enunciado         text NOT NULL,
  alternativas      jsonb NOT NULL,         -- [{"letter":"A","text":"..."}, …]
  gabarito          text NOT NULL CHECK (gabarito ~ '^[A-E]$'),
  comentario        text NOT NULL,
  source_model      text DEFAULT 'gemini-2.5-flash',
  generated_batch   uuid,                   -- agrupa questões que vieram juntas
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_qb_lookup    ON public.question_bank (materia_id, nivel, num_alternativas);
CREATE INDEX idx_qb_cargo     ON public.question_bank (cargo_slug) WHERE cargo_slug IS NOT NULL;
CREATE INDEX idx_qb_created   ON public.question_bank (created_at DESC);

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- Leitura pública (alunos com acesso pago vão ler do banco diretamente).
-- A camada de access ainda é controlada pelo AccessRoute do front; quem
-- chega no /exam e dispara o pick_questions já é authenticated com
-- subscription ativa.
CREATE POLICY "anyone_select_question_bank" ON public.question_bank
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admin pode tudo via service_role (no /api/generate-bank). Sem policies
-- de INSERT/UPDATE/DELETE públicas — só service_role escreve.

-- ──────────────────────────────────────────────────────────────────────
-- Tabela de "vistas": cada user_id × question_id (anti-repetição).
-- Quando o aluno gera um simulado de 10 questões, marca todas como vistas.
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE public.question_bank_seen (
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
  seen_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX idx_qbs_user ON public.question_bank_seen (user_id, seen_at DESC);

ALTER TABLE public.question_bank_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_seen" ON public.question_bank_seen
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_insert_own_seen" ON public.question_bank_seen
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────
-- RPC: puxa N questões aleatórias respeitando matéria/nível/alts.
-- Filtra automaticamente questões que o auth.uid() já viu (anti-repetição).
-- Se faltar quantidade após filtro, repete (zera vistas) — UX > rigor.
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pick_questions(
  _materia_id        text,
  _nivel             text,
  _num_alternativas  smallint,
  _limit             int
) RETURNS SETOF public.question_bank
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_unseen int;
BEGIN
  -- Conta quantas questões ainda não vistas pelo user atual
  SELECT COUNT(*) INTO total_unseen
  FROM public.question_bank q
  WHERE q.materia_id = _materia_id
    AND q.nivel = _nivel
    AND q.num_alternativas = _num_alternativas
    AND (auth.uid() IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.question_bank_seen s
      WHERE s.user_id = auth.uid() AND s.question_id = q.id
    ));

  -- Se há questões não vistas suficientes, retorna delas (sem repetição)
  IF total_unseen >= _limit THEN
    RETURN QUERY
    SELECT q.*
    FROM public.question_bank q
    WHERE q.materia_id = _materia_id
      AND q.nivel = _nivel
      AND q.num_alternativas = _num_alternativas
      AND (auth.uid() IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.question_bank_seen s
        WHERE s.user_id = auth.uid() AND s.question_id = q.id
      ))
    ORDER BY random()
    LIMIT _limit;
  ELSE
    -- Pool esgotado: ignora histórico e devolve do banco inteiro
    RETURN QUERY
    SELECT q.*
    FROM public.question_bank q
    WHERE q.materia_id = _materia_id
      AND q.nivel = _nivel
      AND q.num_alternativas = _num_alternativas
    ORDER BY random()
    LIMIT _limit;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pick_questions(text, text, smallint, int)
  TO anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────
-- RPC: marca questões como vistas (1 chamada com array de IDs).
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_questions_seen(_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  IF _ids IS NULL OR array_length(_ids, 1) IS NULL THEN RETURN; END IF;

  INSERT INTO public.question_bank_seen (user_id, question_id)
  SELECT auth.uid(), unnest(_ids)
  ON CONFLICT (user_id, question_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_questions_seen(uuid[]) TO authenticated;

-- ──────────────────────────────────────────────────────────────────────
-- RPC: resumo do banco pra dashboard do CRM.
-- Retorna contagem de questões agrupadas por matéria + nível.
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.question_bank_summary()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(s) ORDER BY s.materia_id, s.nivel), '[]'::json)
  FROM (
    SELECT
      materia_id,
      nivel,
      num_alternativas,
      COUNT(*)::int AS cnt,
      MAX(created_at) AS last_generated
    FROM public.question_bank
    GROUP BY materia_id, nivel, num_alternativas
  ) s;
$$;

GRANT EXECUTE ON FUNCTION public.question_bank_summary() TO authenticated;
