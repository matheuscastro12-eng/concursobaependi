-- RPC SECURITY DEFINER pra inserir pageviews. Bypassa RLS de forma segura
-- (a função só permite inserir, com sanitização básica de tamanho).

CREATE OR REPLACE FUNCTION public.track_pageview(
  _visitor_id text,
  _path       text,
  _referrer   text DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sanitização: visitor_id e path são obrigatórios.
  IF _visitor_id IS NULL OR length(trim(_visitor_id)) = 0 THEN
    RETURN;
  END IF;
  IF _path IS NULL OR length(trim(_path)) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.page_views (visitor_id, user_id, path, referrer, user_agent)
  VALUES (
    left(_visitor_id, 100),
    auth.uid(),
    left(_path, 500),
    left(_referrer, 500),
    left(_user_agent, 240)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_pageview(text, text, text, text) TO anon, authenticated;
