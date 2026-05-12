-- Multi-concurso: cada questão do banco agora pertence a um concurso.
-- Default 'baependi' pra back-fill das rows existentes.

ALTER TABLE public.question_bank
  ADD COLUMN IF NOT EXISTS concurso_slug text NOT NULL DEFAULT 'baependi';

-- Backfill defensivo (idempotente). Linhas pré-existentes ficam em baependi.
UPDATE public.question_bank
   SET concurso_slug = 'baependi'
 WHERE concurso_slug IS NULL OR concurso_slug = '';

-- Índice composto para o filtro mais comum: concurso + cargo.
CREATE INDEX IF NOT EXISTS idx_qb_concurso_cargo
  ON public.question_bank (concurso_slug, cargo_slug);

CREATE INDEX IF NOT EXISTS idx_qb_concurso_materia
  ON public.question_bank (concurso_slug, materia_id);

-- ────────────────────────────────────────────────────────────────
-- pick_questions: aceita _concurso_slug como filtro (com default
-- 'baependi' pra compat com chamadas antigas).
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pick_questions(
  _materia_id        text,
  _nivel             text,
  _num_alternativas  smallint,
  _limit             int,
  _concurso_slug     text DEFAULT 'baependi'
) RETURNS SETOF public.question_bank
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_unseen int;
BEGIN
  SELECT COUNT(*) INTO total_unseen
  FROM public.question_bank q
  WHERE q.materia_id = _materia_id
    AND q.nivel = _nivel
    AND q.num_alternativas = _num_alternativas
    AND q.concurso_slug = _concurso_slug
    AND (auth.uid() IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.question_bank_seen s
      WHERE s.user_id = auth.uid() AND s.question_id = q.id
    ));

  IF total_unseen >= _limit THEN
    RETURN QUERY
    SELECT q.*
    FROM public.question_bank q
    WHERE q.materia_id = _materia_id
      AND q.nivel = _nivel
      AND q.num_alternativas = _num_alternativas
      AND q.concurso_slug = _concurso_slug
      AND (auth.uid() IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.question_bank_seen s
        WHERE s.user_id = auth.uid() AND s.question_id = q.id
      ))
    ORDER BY random()
    LIMIT _limit;
  ELSE
    RETURN QUERY
    SELECT q.*
    FROM public.question_bank q
    WHERE q.materia_id = _materia_id
      AND q.nivel = _nivel
      AND q.num_alternativas = _num_alternativas
      AND q.concurso_slug = _concurso_slug
    ORDER BY random()
    LIMIT _limit;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pick_questions(text, text, smallint, int, text)
  TO anon, authenticated;

-- ────────────────────────────────────────────────────────────────
-- save_questions_to_bank: persiste concurso_slug por questão.
-- Default 'baependi' quando o caller (front antigo) não envia.
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.save_questions_to_bank(_questions jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q jsonb;
  inserted_count int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  IF _questions IS NULL OR jsonb_typeof(_questions) <> 'array' THEN
    RETURN 0;
  END IF;

  FOR q IN SELECT * FROM jsonb_array_elements(_questions)
  LOOP
    IF (q->>'materia_id') IS NULL OR length(q->>'materia_id') = 0 THEN CONTINUE; END IF;
    IF (q->>'nivel') NOT IN ('basico','avancado') THEN CONTINUE; END IF;
    IF (q->>'gabarito') !~ '^[A-E]$' THEN CONTINUE; END IF;
    IF (q->>'enunciado') IS NULL OR length(trim(q->>'enunciado')) < 10 THEN CONTINUE; END IF;
    IF (q->>'comentario') IS NULL OR length(trim(q->>'comentario')) < 10 THEN CONTINUE; END IF;
    IF jsonb_typeof(q->'alternativas') <> 'array' THEN CONTINUE; END IF;
    IF jsonb_array_length(q->'alternativas') NOT IN (4, 5) THEN CONTINUE; END IF;

    INSERT INTO public.question_bank (
      cargo_slug, materia_id, categoria, nivel, banca, num_alternativas,
      enunciado, alternativas, gabarito, comentario,
      source_model, generated_batch, concurso_slug
    ) VALUES (
      NULLIF(q->>'cargo_slug', ''),
      q->>'materia_id',
      COALESCE(q->>'categoria', 'gerais'),
      q->>'nivel',
      COALESCE(NULLIF(q->>'banca', ''), 'INEPAM'),
      (q->>'num_alternativas')::smallint,
      q->>'enunciado',
      q->'alternativas',
      q->>'gabarito',
      q->>'comentario',
      COALESCE(NULLIF(q->>'source_model', ''), 'gemini-2.5-flash'),
      NULL,
      COALESCE(NULLIF(q->>'concurso_slug', ''), 'baependi')
    );

    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_questions_to_bank(jsonb) TO authenticated;
