-- Atualiza traffic_summary pra contar apenas usuários NÃO-admin como "cadastros".
-- Admins são internos (você, futuros operadores) e não devem inflar a métrica de
-- conversão visitante → aluno.

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
    -- Conta apenas alunos (sem role admin) criados na janela.
    SELECT COUNT(*) AS new_signups
    FROM auth.users u
    WHERE u.created_at >= now() - (_days || ' days')::interval
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = u.id AND ur.role = 'admin'
      )
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
