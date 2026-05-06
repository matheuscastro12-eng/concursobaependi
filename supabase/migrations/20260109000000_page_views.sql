-- Tracking de visitantes (anônimos e logados) pra métricas no CRM.
-- Cada navegação no front insere uma row aqui.

CREATE TABLE public.page_views (
  id          bigserial PRIMARY KEY,
  visitor_id  text NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  path        text NOT NULL,
  referrer    text,
  user_agent  text,
  viewed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_viewed_at ON public.page_views (viewed_at DESC);
CREATE INDEX idx_page_views_visitor   ON public.page_views (visitor_id);
CREATE INDEX idx_page_views_path      ON public.page_views (path);
CREATE INDEX idx_page_views_user      ON public.page_views (user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Qualquer um (incluindo anon) pode INSERIR seu próprio pageview.
-- Isso é OK porque a tabela é write-only pra anon e ninguém consegue ler.
CREATE POLICY "anyone_inserts_page_view" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Só admin lê.
CREATE POLICY "admin_select_page_views" ON public.page_views
  FOR SELECT TO authenticated
  USING (public.has_role('admin', auth.uid()));

-- ──────────────────────────────────────────────────────────────────────
-- RPC pro CRM puxar resumo agregado em 1 chamada.
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.traffic_summary(_days integer DEFAULT 7)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH window_views AS (
    SELECT * FROM public.page_views
    WHERE viewed_at >= now() - (_days || ' days')::interval
  ),
  by_day AS (
    SELECT date_trunc('day', viewed_at)::date AS day,
           COUNT(*)                          AS views,
           COUNT(DISTINCT visitor_id)        AS visitors
    FROM window_views
    GROUP BY 1
    ORDER BY 1
  ),
  by_path AS (
    SELECT path, COUNT(*) AS views
    FROM window_views
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 10
  ),
  totals AS (
    SELECT
      COUNT(*)                                AS total_views,
      COUNT(DISTINCT visitor_id)              AS unique_visitors,
      COUNT(*) FILTER (WHERE user_id IS NULL) AS anonymous_views,
      COUNT(*) FILTER (WHERE user_id IS NOT NULL) AS authenticated_views
    FROM window_views
  ),
  signups AS (
    SELECT COUNT(*) AS new_signups
    FROM auth.users
    WHERE created_at >= now() - (_days || ' days')::interval
  )
  SELECT json_build_object(
    'days', _days,
    'total_views', (SELECT total_views FROM totals),
    'unique_visitors', (SELECT unique_visitors FROM totals),
    'anonymous_views', (SELECT anonymous_views FROM totals),
    'authenticated_views', (SELECT authenticated_views FROM totals),
    'new_signups', (SELECT new_signups FROM signups),
    'conversion_rate',
      CASE
        WHEN (SELECT unique_visitors FROM totals) = 0 THEN 0
        ELSE ROUND(
          ((SELECT new_signups FROM signups)::numeric
           / (SELECT unique_visitors FROM totals)::numeric) * 100,
          2
        )
      END,
    'by_day',  COALESCE((SELECT json_agg(by_day.*  ORDER BY day)  FROM by_day),  '[]'::json),
    'by_path', COALESCE((SELECT json_agg(by_path.* ORDER BY views DESC) FROM by_path), '[]'::json)
  );
$$;

GRANT EXECUTE ON FUNCTION public.traffic_summary(integer) TO authenticated;
