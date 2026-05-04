-- Editais de concursos públicos e matérias extraídas

CREATE TABLE public.editais (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo           text NOT NULL,
  banca            text,
  cargo            text,
  municipio        text,
  ano              integer,
  status           text NOT NULL DEFAULT 'uploading'
                     CHECK (status IN ('uploading','extracting','ready','failed')),
  status_message   text,
  pdf_storage_path text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.edital_materias (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id    uuid NOT NULL REFERENCES public.editais(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome         text NOT NULL,
  num_questoes integer,
  peso         numeric,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edital_materias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_editais" ON public.editais
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_own_edital_materias" ON public.edital_materias
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER tg_editais_updated
  BEFORE UPDATE ON public.editais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('editais-pdfs', 'editais-pdfs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "user_upload_editais" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'editais-pdfs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user_read_editais" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'editais-pdfs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user_delete_editais" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'editais-pdfs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
