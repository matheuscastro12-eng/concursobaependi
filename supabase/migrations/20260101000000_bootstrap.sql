-- Bootstrap inicial — ConcursosAI
-- Cria: profiles + helper updated_at + tabelas de provas importadas + simulado IA

-- ============================================================
-- Helper: updated_at automatico
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- profiles (perfil de cada usuario)
-- ============================================================
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  email       text,
  area_foco   text,                 -- area de concurso de interesse (juridica, fiscal, etc)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "user_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TRIGGER tg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-cria profile quando um auth.users novo aparece
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- generation_logs (rate limit IA — 5/5min)
-- ============================================================
CREATE TABLE public.generation_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature     text NOT NULL,        -- 'exam' | 'ingest_prova' | 'explain_question'
  cost_usd    numeric(10,4),
  meta        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_genlogs_user_created ON public.generation_logs (user_id, created_at DESC);

ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_select_own_genlogs" ON public.generation_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- exam_generations (provas geradas pela IA a partir de tema)
-- ============================================================
CREATE TABLE public.exam_generations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  tema        text NOT NULL,        -- topico/area
  banca       text,                 -- CESPE, FCC, FGV, etc
  num_questoes integer NOT NULL,
  nivel       text NOT NULL CHECK (nivel IN ('basico','intermediario','avancado')),
  resultado   text NOT NULL,        -- markdown final com questoes + gabaritos
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_gen_user_created ON public.exam_generations (user_id, created_at DESC);

ALTER TABLE public.exam_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_select_own_exam_gen" ON public.exam_generations
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_exam_gen" ON public.exam_generations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_delete_own_exam_gen" ON public.exam_generations
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- provas_importadas (cabecalho da prova)
-- ============================================================
CREATE TABLE public.provas_importadas (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo                   text NOT NULL,
  banca                    text,
  ano                      integer,
  cargo                    text,
  num_alternativas         smallint NOT NULL CHECK (num_alternativas IN (4, 5)),
  gerar_justificativa_ia   boolean NOT NULL DEFAULT true,
  pdf_storage_path         text,
  pdf_size_bytes           integer,
  num_paginas              integer,
  status                   text NOT NULL DEFAULT 'uploading'
    CHECK (status IN ('uploading','extracting','reviewing','ready','failed','archived')),
  status_message           text,
  num_questoes             integer NOT NULL DEFAULT 0,
  num_questoes_aprovadas   integer NOT NULL DEFAULT 0,
  num_questoes_rejeitadas  integer NOT NULL DEFAULT 0,
  extraction_started_at    timestamptz,
  extraction_completed_at  timestamptz,
  extraction_cost_usd      numeric(10,4),
  best_percentage          numeric(5,2),
  attempts_count           integer NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_provas_user_status  ON public.provas_importadas (user_id, status, created_at DESC);
CREATE INDEX idx_provas_user_created ON public.provas_importadas (user_id, created_at DESC);

-- ============================================================
-- prova_questoes_importadas
-- ============================================================
CREATE TABLE public.prova_questoes_importadas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id              uuid NOT NULL REFERENCES public.provas_importadas(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero                integer NOT NULL,
  enunciado             text NOT NULL,
  alternativas          text[] NOT NULL,
  gabarito              text NOT NULL CHECK (gabarito ~ '^[A-E]$'),
  justificativa         text,
  justificativa_origem  text NOT NULL DEFAULT 'none'
    CHECK (justificativa_origem IN ('pdf','ia','none')),
  status                text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','edited')),
  edited_by_user        boolean NOT NULL DEFAULT false,
  pagina_origem         integer,
  raw_extraction        jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prova_id, numero)
);

CREATE INDEX idx_prova_questoes_prova        ON public.prova_questoes_importadas (prova_id, numero);
CREATE INDEX idx_prova_questoes_prova_status ON public.prova_questoes_importadas (prova_id, status);
CREATE INDEX idx_prova_questoes_user         ON public.prova_questoes_importadas (user_id);

-- ============================================================
-- prova_attempts
-- ============================================================
CREATE TABLE public.prova_attempts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prova_id            uuid NOT NULL REFERENCES public.provas_importadas(id) ON DELETE CASCADE,
  total_questions     integer NOT NULL,
  correct_answers     integer NOT NULL,
  percentage          numeric(5,2) NOT NULL,
  answers             jsonb NOT NULL DEFAULT '{}',
  duration_seconds    integer,
  finished_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prova_attempts_user_created ON public.prova_attempts (user_id, created_at DESC);
CREATE INDEX idx_prova_attempts_prova        ON public.prova_attempts (prova_id, created_at DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.provas_importadas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prova_questoes_importadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prova_attempts           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_provas" ON public.provas_importadas
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_provas" ON public.provas_importadas
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_update_own_provas" ON public.provas_importadas
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_delete_own_provas" ON public.provas_importadas
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_select_own_prova_questoes" ON public.prova_questoes_importadas
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_prova_questoes" ON public.prova_questoes_importadas
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_update_own_prova_questoes" ON public.prova_questoes_importadas
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_delete_own_prova_questoes" ON public.prova_questoes_importadas
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_select_own_prova_attempts" ON public.prova_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_prova_attempts" ON public.prova_attempts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Storage bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('provas-pdfs', 'provas-pdfs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "user_upload_own_prova_pdf" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'provas-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user_read_own_prova_pdf" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'provas-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user_delete_own_prova_pdf" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'provas-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER tg_provas_importadas_updated
  BEFORE UPDATE ON public.provas_importadas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tg_prova_questoes_updated
  BEFORE UPDATE ON public.prova_questoes_importadas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.refresh_prova_counters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid;
BEGIN
  pid := COALESCE(NEW.prova_id, OLD.prova_id);
  UPDATE public.provas_importadas
  SET
    num_questoes            = (SELECT count(*) FROM public.prova_questoes_importadas WHERE prova_id = pid),
    num_questoes_aprovadas  = (SELECT count(*) FROM public.prova_questoes_importadas WHERE prova_id = pid AND status = 'approved'),
    num_questoes_rejeitadas = (SELECT count(*) FROM public.prova_questoes_importadas WHERE prova_id = pid AND status = 'rejected')
  WHERE id = pid;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER tg_prova_questoes_counters
  AFTER INSERT OR UPDATE OR DELETE ON public.prova_questoes_importadas
  FOR EACH ROW EXECUTE FUNCTION public.refresh_prova_counters();

CREATE OR REPLACE FUNCTION public.refresh_prova_attempt_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.provas_importadas
  SET
    attempts_count  = (SELECT count(*) FROM public.prova_attempts WHERE prova_id = NEW.prova_id),
    best_percentage = (SELECT max(percentage) FROM public.prova_attempts WHERE prova_id = NEW.prova_id)
  WHERE id = NEW.prova_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tg_prova_attempt_stats
  AFTER INSERT ON public.prova_attempts
  FOR EACH ROW EXECUTE FUNCTION public.refresh_prova_attempt_stats();

CREATE OR REPLACE FUNCTION public.validate_gabarito_within_alternativas()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  num_alt smallint;
  letra_max text;
BEGIN
  SELECT num_alternativas INTO num_alt FROM public.provas_importadas WHERE id = NEW.prova_id;
  letra_max := chr(64 + num_alt);
  IF NEW.gabarito > letra_max THEN
    RAISE EXCEPTION 'Gabarito % invalido para prova com % alternativas (max=%)', NEW.gabarito, num_alt, letra_max;
  END IF;
  IF array_length(NEW.alternativas, 1) <> num_alt THEN
    RAISE EXCEPTION 'Numero de alternativas (%) diferente do esperado (%)', array_length(NEW.alternativas, 1), num_alt;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tg_validate_gabarito
  BEFORE INSERT OR UPDATE ON public.prova_questoes_importadas
  FOR EACH ROW EXECUTE FUNCTION public.validate_gabarito_within_alternativas();
