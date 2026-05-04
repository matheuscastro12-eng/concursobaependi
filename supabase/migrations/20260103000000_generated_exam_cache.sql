-- Cache global de simulados gerados por IA.
-- Regra de produto: se um usuário gerou uma configuração, outros usuários podem reutilizar.

CREATE TABLE public.generated_exam_cache (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key          text NOT NULL UNIQUE,
  tema               text NOT NULL,
  banca              text NOT NULL DEFAULT 'INEPAM',
  cargo              text,
  quantidade         integer NOT NULL,
  nivel              text NOT NULL CHECK (nivel IN ('basico','avancado')),
  num_alternativas   smallint NOT NULL CHECK (num_alternativas IN (4, 5)),
  resultado          text NOT NULL,
  source_user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  use_count          integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_exam_cache_lookup ON public.generated_exam_cache (cache_key);
CREATE INDEX idx_generated_exam_cache_created ON public.generated_exam_cache (created_at DESC);

ALTER TABLE public.generated_exam_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_read_generated_exam_cache"
  ON public.generated_exam_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authenticated_can_insert_generated_exam_cache"
  ON public.generated_exam_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (source_user_id = auth.uid());

CREATE POLICY "source_user_can_update_generated_exam_cache"
  ON public.generated_exam_cache
  FOR UPDATE
  TO authenticated
  USING (source_user_id = auth.uid())
  WITH CHECK (source_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tg_generated_exam_cache_updated
  BEFORE UPDATE ON public.generated_exam_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
