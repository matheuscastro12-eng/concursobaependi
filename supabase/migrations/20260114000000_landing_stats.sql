-- RPC pública pra prova social na landing.
-- Retorna agregados anônimos (sem PII), seguros pra exibir publicamente.

CREATE OR REPLACE FUNCTION public.landing_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'students',
    (SELECT COUNT(*)::int
       FROM auth.users u
      WHERE NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = u.id AND ur.role = 'admin'
      )),
    'questions_in_bank',
    (SELECT COUNT(*)::int FROM public.question_bank),
    'simulados_generated',
    (SELECT COUNT(*)::int FROM public.generated_exam_cache),
    'updated_at',
    now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.landing_stats() TO anon, authenticated;
