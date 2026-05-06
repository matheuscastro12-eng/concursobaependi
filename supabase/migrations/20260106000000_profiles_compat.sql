-- Compatibilidade do schema profiles com o frontend (CRM, DashboardLayout):
-- adiciona coluna user_id (espelho de id, mantida em sincronia por trigger)
-- e a coluna phone, ambas usadas pelo front criado pelo Codex.

-- 1) Coluna phone
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;

-- 2) Coluna user_id (espelho de id)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill: copia id existente
UPDATE public.profiles
   SET user_id = id
 WHERE user_id IS NULL;

-- Trigger pra manter user_id sempre igual a id, mesmo em INSERT/UPDATE futuros.
CREATE OR REPLACE FUNCTION public.profiles_sync_user_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Garante que user_id sempre reflete id (a chave primária e referência a auth.users).
  NEW.user_id := NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_profiles_sync_user_id ON public.profiles;
CREATE TRIGGER tg_profiles_sync_user_id
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_sync_user_id();

-- Índice em user_id (front filtra por ele em DashboardLayout)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- 3) Garantir NOT NULL em user_id (depois do backfill)
ALTER TABLE public.profiles
  ALTER COLUMN user_id SET NOT NULL;

-- 4) RLS: aceita filtro por user_id também (sem isso o front filtra por user_id e acerta as policies só por id).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'user_select_own_profile_by_user_id'
  ) THEN
    CREATE POLICY "user_select_own_profile_by_user_id" ON public.profiles
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;
