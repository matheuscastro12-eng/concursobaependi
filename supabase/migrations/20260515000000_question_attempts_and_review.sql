-- ════════════════════════════════════════════════════════════════════════
-- Sistema de desempenho + revisão espaçada (Leitner)
--
-- Hoje o simulado calcula acerto/erro só na memória do browser e joga fora.
-- Aqui passamos a PERSISTIR cada resposta (question_attempts) e a manter uma
-- fila de revisão (review_queue) das questões erradas, com agendamento
-- espaçado estilo Leitner. Isso alimenta:
--   • página de Desempenho (analytics por matéria + evolução + streak)
--   • página de Revisão de erros (flashcards espaçados)
-- ════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────
-- 1) question_attempts — 1 row = 1 questão respondida
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_slug   text NOT NULL DEFAULT 'baependi',
  cargo_slug      text,
  tema            text,                       -- matéria/tema da questão
  banca           text,
  nivel           text,
  question_hash   text NOT NULL,              -- md5(enunciado normalizado) p/ agrupar repetições
  enunciado       text NOT NULL,
  alternativas    jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer  text NOT NULL,
  chosen_answer   text,
  is_correct      boolean NOT NULL,
  explanation     text,
  answered_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qa_user_time
  ON public.question_attempts (user_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_user_concurso
  ON public.question_attempts (user_id, concurso_slug, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_user_tema
  ON public.question_attempts (user_id, concurso_slug, tema);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_attempts" ON public.question_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_attempts" ON public.question_attempts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_select_attempts" ON public.question_attempts
  FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));

-- ─────────────────────────────────────────────────────────
-- 2) review_queue — fila de revisão espaçada (Leitner)
--    1 row = 1 questão única (por user × question_hash)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.review_queue (
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_hash   text NOT NULL,
  concurso_slug   text NOT NULL DEFAULT 'baependi',
  cargo_slug      text,
  tema            text,
  banca           text,
  nivel           text,
  enunciado       text NOT NULL,
  alternativas    jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer  text NOT NULL,
  explanation     text,
  box             smallint NOT NULL DEFAULT 0,   -- 0..5 (caixa de Leitner)
  times_seen      integer NOT NULL DEFAULT 1,
  times_correct   integer NOT NULL DEFAULT 0,
  last_result     boolean,
  next_review_at  timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_hash)
);

CREATE INDEX IF NOT EXISTS idx_rq_due
  ON public.review_queue (user_id, concurso_slug, next_review_at);

ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_all_own_review" ON public.review_queue
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Intervalo de cada caixa de Leitner (em dias). box 0 = revisar já.
CREATE OR REPLACE FUNCTION public.leitner_interval(_box int)
RETURNS interval LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE GREATEST(0, LEAST(5, _box))
    WHEN 0 THEN interval '0 days'
    WHEN 1 THEN interval '1 day'
    WHEN 2 THEN interval '3 days'
    WHEN 3 THEN interval '7 days'
    WHEN 4 THEN interval '14 days'
    ELSE interval '30 days'
  END;
$$;

-- ─────────────────────────────────────────────────────────
-- 3) RPC record_attempts — grava um lote de respostas
--    _attempts: jsonb array de objetos com as chaves:
--      tema, cargo_slug, banca, nivel, enunciado, alternativas,
--      correct_answer, chosen_answer, is_correct, explanation
--    Erradas entram/voltam pra fila de revisão (box 0, due agora).
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_attempts(
  _concurso_slug text,
  _attempts      jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  item jsonb;
  qhash text;
  is_ok boolean;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  IF _attempts IS NULL OR jsonb_typeof(_attempts) <> 'array' THEN RETURN; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(_attempts)
  LOOP
    qhash := md5(lower(trim(coalesce(item->>'enunciado', ''))));
    is_ok := coalesce((item->>'is_correct')::boolean, false);

    INSERT INTO public.question_attempts (
      user_id, concurso_slug, cargo_slug, tema, banca, nivel,
      question_hash, enunciado, alternativas, correct_answer,
      chosen_answer, is_correct, explanation
    ) VALUES (
      uid,
      coalesce(_concurso_slug, 'baependi'),
      nullif(item->>'cargo_slug',''),
      nullif(item->>'tema',''),
      nullif(item->>'banca',''),
      nullif(item->>'nivel',''),
      qhash,
      coalesce(item->>'enunciado',''),
      coalesce(item->'alternativas','[]'::jsonb),
      coalesce(item->>'correct_answer',''),
      nullif(item->>'chosen_answer',''),
      is_ok,
      nullif(item->>'explanation','')
    );

    -- Questão errada → entra/reseta na fila de revisão (revisar já).
    IF NOT is_ok THEN
      INSERT INTO public.review_queue (
        user_id, question_hash, concurso_slug, cargo_slug, tema, banca, nivel,
        enunciado, alternativas, correct_answer, explanation,
        box, times_seen, times_correct, last_result, next_review_at
      ) VALUES (
        uid, qhash, coalesce(_concurso_slug,'baependi'),
        nullif(item->>'cargo_slug',''), nullif(item->>'tema',''),
        nullif(item->>'banca',''), nullif(item->>'nivel',''),
        coalesce(item->>'enunciado',''),
        coalesce(item->'alternativas','[]'::jsonb),
        coalesce(item->>'correct_answer',''),
        nullif(item->>'explanation',''),
        0, 1, 0, false, now()
      )
      ON CONFLICT (user_id, question_hash) DO UPDATE SET
        box            = 0,
        times_seen     = public.review_queue.times_seen + 1,
        last_result    = false,
        next_review_at = now(),
        updated_at     = now();
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_attempts(text, jsonb) TO authenticated;

-- ─────────────────────────────────────────────────────────
-- 4) RPC grade_review — avalia 1 revisão (acertou/errou)
--    got_it=true  → sobe de caixa, reagenda pro futuro
--    got_it=false → volta pra caixa 0 (revisar já)
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.grade_review(
  _question_hash text,
  _got_it        boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_box smallint;
  cur_box smallint;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  SELECT box INTO cur_box FROM public.review_queue
    WHERE user_id = uid AND question_hash = _question_hash;
  IF NOT FOUND THEN RETURN; END IF;

  IF _got_it THEN
    new_box := LEAST(5, cur_box + 1);
  ELSE
    new_box := 0;
  END IF;

  UPDATE public.review_queue SET
    box            = new_box,
    times_seen     = times_seen + 1,
    times_correct  = times_correct + CASE WHEN _got_it THEN 1 ELSE 0 END,
    last_result    = _got_it,
    next_review_at = now() + public.leitner_interval(new_box),
    updated_at     = now()
  WHERE user_id = uid AND question_hash = _question_hash;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grade_review(text, boolean) TO authenticated;

-- ─────────────────────────────────────────────────────────
-- 5) RPC user_performance_summary — analytics pro dashboard
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_performance_summary(_concurso_slug text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  result json;
  streak int := 0;
  d date;
BEGIN
  IF uid IS NULL THEN RETURN '{}'::json; END IF;

  -- streak = dias consecutivos (terminando hoje ou ontem) com >=1 resposta
  d := current_date;
  IF NOT EXISTS (
    SELECT 1 FROM public.question_attempts
    WHERE user_id = uid AND concurso_slug = _concurso_slug
      AND answered_at::date = d
  ) THEN
    d := current_date - 1;  -- tolera "ainda não estudou hoje"
  END IF;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.question_attempts
      WHERE user_id = uid AND concurso_slug = _concurso_slug
        AND answered_at::date = d
    );
    streak := streak + 1;
    d := d - 1;
  END LOOP;

  SELECT json_build_object(
    'total',       (SELECT count(*) FROM public.question_attempts qa
                      WHERE qa.user_id = uid AND qa.concurso_slug = _concurso_slug),
    'correct',     (SELECT count(*) FILTER (WHERE is_correct) FROM public.question_attempts qa
                      WHERE qa.user_id = uid AND qa.concurso_slug = _concurso_slug),
    'today',       (SELECT count(*) FROM public.question_attempts qa
                      WHERE qa.user_id = uid AND qa.concurso_slug = _concurso_slug
                        AND qa.answered_at::date = current_date),
    'streak',      streak,
    'review_due',  (SELECT count(*) FROM public.review_queue rq
                      WHERE rq.user_id = uid AND rq.concurso_slug = _concurso_slug
                        AND rq.next_review_at <= now()),
    'review_total',(SELECT count(*) FROM public.review_queue rq
                      WHERE rq.user_id = uid AND rq.concurso_slug = _concurso_slug),
    'by_materia',  COALESCE((
        SELECT json_agg(row_to_json(m) ORDER BY m.total DESC)
        FROM (
          SELECT
            COALESCE(tema, 'Sem matéria') AS tema,
            count(*)::int AS total,
            count(*) FILTER (WHERE is_correct)::int AS correct,
            round(100.0 * count(*) FILTER (WHERE is_correct) / NULLIF(count(*),0))::int AS accuracy
          FROM public.question_attempts qa
          WHERE qa.user_id = uid AND qa.concurso_slug = _concurso_slug
          GROUP BY COALESCE(tema, 'Sem matéria')
        ) m
      ), '[]'::json),
    'by_day',      COALESCE((
        SELECT json_agg(row_to_json(d2) ORDER BY d2.day)
        FROM (
          SELECT
            answered_at::date AS day,
            count(*)::int AS total,
            count(*) FILTER (WHERE is_correct)::int AS correct
          FROM public.question_attempts qa
          WHERE qa.user_id = uid AND qa.concurso_slug = _concurso_slug
            AND qa.answered_at >= current_date - 29
          GROUP BY answered_at::date
        ) d2
      ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.user_performance_summary(text) TO authenticated;

-- ─────────────────────────────────────────────────────────
-- 6) RPC wrong_questions_for_review — devolve as questões devidas
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.wrong_questions_for_review(
  _concurso_slug text,
  _limit int DEFAULT 20
) RETURNS SETOF public.review_queue
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.review_queue
  WHERE user_id = auth.uid()
    AND concurso_slug = _concurso_slug
    AND next_review_at <= now()
  ORDER BY box ASC, next_review_at ASC
  LIMIT GREATEST(1, LEAST(100, _limit));
$$;

GRANT EXECUTE ON FUNCTION public.wrong_questions_for_review(text, int) TO authenticated;
