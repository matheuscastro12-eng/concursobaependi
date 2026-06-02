-- ════════════════════════════════════════════════════════════════════════
-- Histórico de chamadas de IA (pro CRM) + RPC de log + agregados de admin
--
-- A tabela generation_logs já existia (feature, cost_usd, meta), mas só as
-- Supabase functions (não usadas em prod) inseriam nela. O caminho real é o
-- proxy /api/gemini, que não logava. Aqui:
--   • adiciona colunas concurso_slug + source pra filtrar/agrupar fácil
--   • RPC log_ai_call (SECURITY DEFINER) pro client logar sem expor user_id
--   • policy de admin pra ler tudo no CRM
--   • RPC ai_usage_summary com agregados
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE public.generation_logs
  ADD COLUMN IF NOT EXISTS concurso_slug text,
  ADD COLUMN IF NOT EXISTS source        text;   -- 'ia' | 'bank' | 'cache'

CREATE INDEX IF NOT EXISTS idx_genlogs_created   ON public.generation_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_genlogs_concurso  ON public.generation_logs (concurso_slug, created_at DESC);

-- Admin lê todos os logs (pro CRM).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='generation_logs' AND policyname='admin_select_genlogs'
  ) THEN
    CREATE POLICY "admin_select_genlogs" ON public.generation_logs
      FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- RPC log_ai_call — client loga 1 chamada (user_id = auth.uid()).
-- SECURITY DEFINER pra não depender de policy de INSERT do client.
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_ai_call(
  _feature       text,
  _source        text,
  _concurso_slug text,
  _meta          jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  INSERT INTO public.generation_logs (user_id, feature, source, concurso_slug, meta)
  VALUES (
    uid,
    coalesce(nullif(_feature,''), 'exam'),
    nullif(_source,''),
    nullif(_concurso_slug,''),
    coalesce(_meta, '{}'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_ai_call(text, text, text, jsonb) TO authenticated;

-- ─────────────────────────────────────────────────────────
-- RPC ai_usage_summary — agregados pro painel do CRM (admin).
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.ai_usage_summary()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.has_role('admin', auth.uid()) THEN
    RETURN '{}'::json;
  END IF;

  SELECT json_build_object(
    'total',       (SELECT count(*) FROM public.generation_logs),
    'today',       (SELECT count(*) FROM public.generation_logs WHERE created_at::date = current_date),
    'last_7d',     (SELECT count(*) FROM public.generation_logs WHERE created_at >= current_date - 6),
    'ia_calls',    (SELECT count(*) FROM public.generation_logs WHERE source = 'ia'),
    'ia_today',    (SELECT count(*) FROM public.generation_logs WHERE source = 'ia' AND created_at::date = current_date),
    'by_feature',  COALESCE((
        SELECT json_agg(row_to_json(f) ORDER BY f.cnt DESC) FROM (
          SELECT coalesce(feature,'?') AS feature, count(*)::int AS cnt
          FROM public.generation_logs GROUP BY coalesce(feature,'?')
        ) f), '[]'::json),
    'by_source',   COALESCE((
        SELECT json_agg(row_to_json(s) ORDER BY s.cnt DESC) FROM (
          SELECT coalesce(source,'?') AS source, count(*)::int AS cnt
          FROM public.generation_logs GROUP BY coalesce(source,'?')
        ) s), '[]'::json),
    'by_concurso', COALESCE((
        SELECT json_agg(row_to_json(c) ORDER BY c.cnt DESC) FROM (
          SELECT coalesce(concurso_slug,'?') AS concurso_slug, count(*)::int AS cnt
          FROM public.generation_logs GROUP BY coalesce(concurso_slug,'?')
        ) c), '[]'::json),
    'by_day',      COALESCE((
        SELECT json_agg(row_to_json(d) ORDER BY d.day) FROM (
          SELECT created_at::date AS day, count(*)::int AS total,
                 count(*) FILTER (WHERE source='ia')::int AS ia
          FROM public.generation_logs
          WHERE created_at >= current_date - 29
          GROUP BY created_at::date
        ) d), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ai_usage_summary() TO authenticated;

-- ─────────────────────────────────────────────────────────
-- RPC ai_call_history — lista paginada com nome/email do aluno (admin).
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.ai_call_history(
  _limit int DEFAULT 100,
  _concurso_slug text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.has_role('admin', auth.uid()) THEN
    RETURN '[]'::json;
  END IF;

  SELECT COALESCE(json_agg(row_to_json(h) ORDER BY h.created_at DESC), '[]'::json)
  INTO result
  FROM (
    SELECT
      g.id, g.created_at, g.feature, g.source, g.concurso_slug, g.meta,
      g.user_id, p.full_name, p.email
    FROM public.generation_logs g
    LEFT JOIN public.profiles p ON p.id = g.user_id
    WHERE _concurso_slug IS NULL OR g.concurso_slug = _concurso_slug
    ORDER BY g.created_at DESC
    LIMIT GREATEST(1, LEAST(500, _limit))
  ) h;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ai_call_history(int, text) TO authenticated;
