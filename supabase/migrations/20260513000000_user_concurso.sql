-- Multi-concurso por usuário + PIX único Alagoa
-- ============================================================
-- 1) profiles.concurso_slug
--    Cada usuário fica associado a UM concurso. Default 'baependi'
--    pra não quebrar contas legadas.
-- 2) profiles.has_lifetime_access
--    Flag pra acesso vitalício (modelo PIX único Alagoa).
-- 3) Trigger handle_new_user atualizado: copia 'concurso_slug' do
--    raw_user_meta_data pro profile quando o usuário cria conta.
-- 4) Tabela pix_payments: comprovantes PIX únicos pra Alagoa.
-- ============================================================

-- 1) Coluna concurso_slug em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS concurso_slug text NOT NULL DEFAULT 'baependi';

CREATE INDEX IF NOT EXISTS idx_profiles_concurso_slug
  ON public.profiles (concurso_slug);

-- 2) Coluna has_lifetime_access em profiles (acesso vitalício via PIX único)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_lifetime_access boolean NOT NULL DEFAULT false;

-- 3) Atualiza handle_new_user pra capturar concurso_slug do raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, concurso_slug)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'concurso_slug', ''), 'baependi')
  )
  ON CONFLICT (id) DO UPDATE
    SET concurso_slug = COALESCE(
      NULLIF(EXCLUDED.concurso_slug, ''),
      public.profiles.concurso_slug
    );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 4) pix_payments — comprovantes de pagamento PIX único (Alagoa)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pix_payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_slug   text NOT NULL,
  valor_centavos  integer NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','rejected','expired')),
  comprovante_url text,
  confirmed_at    timestamptz,
  confirmed_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pix_payments_user
  ON public.pix_payments (user_id);

CREATE INDEX IF NOT EXISTS idx_pix_payments_status
  ON public.pix_payments (status);

ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pix_payments'
      AND policyname = 'user_own_pix'
  ) THEN
    CREATE POLICY "user_own_pix" ON public.pix_payments
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pix_payments'
      AND policyname = 'user_insert_pix'
  ) THEN
    CREATE POLICY "user_insert_pix" ON public.pix_payments
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Admin lê/atualiza tudo. Usamos has_role('admin', uid) — definida em
-- 20260103500000_auth_roles_subscriptions.sql.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pix_payments'
      AND policyname = 'admin_select_pix'
  ) THEN
    CREATE POLICY "admin_select_pix" ON public.pix_payments
      FOR SELECT TO authenticated
      USING (public.has_role('admin', auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pix_payments'
      AND policyname = 'admin_update_pix'
  ) THEN
    CREATE POLICY "admin_update_pix" ON public.pix_payments
      FOR UPDATE TO authenticated
      USING (public.has_role('admin', auth.uid()))
      WITH CHECK (public.has_role('admin', auth.uid()));
  END IF;
END $$;

-- Admin precisa enxergar profiles dos pagadores no CRM
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'admin_update_profile_access'
  ) THEN
    CREATE POLICY "admin_update_profile_access" ON public.profiles
      FOR UPDATE TO authenticated
      USING (public.has_role('admin', auth.uid()))
      WITH CHECK (public.has_role('admin', auth.uid()));
  END IF;
END $$;

-- ============================================================
-- 5) Storage bucket pix-comprovantes (comprovantes de PIX da Alagoa)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pix-comprovantes', 'pix-comprovantes', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'user_upload_own_pix_comprovante'
  ) THEN
    CREATE POLICY "user_upload_own_pix_comprovante" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'pix-comprovantes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'user_read_own_pix_comprovante'
  ) THEN
    CREATE POLICY "user_read_own_pix_comprovante" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'pix-comprovantes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Admin lê tudo do bucket pix-comprovantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'admin_read_pix_comprovantes'
  ) THEN
    CREATE POLICY "admin_read_pix_comprovantes" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'pix-comprovantes'
        AND public.has_role('admin', auth.uid())
      );
  END IF;
END $$;
