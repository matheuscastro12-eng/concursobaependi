-- Estruturas de RBAC e assinaturas que faltavam ao bootstrap original.
-- Pré-requisito para as migrations payment_submissions e admin_crm_access.

-- 1) Enum de papéis (apenas 'admin' por enquanto, mas extensível)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin');
  END IF;
END $$;

-- 2) Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- O próprio usuário pode ler seus papéis (necessário pro useAdmin no front).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles'
      AND policyname = 'user_select_own_role'
  ) THEN
    CREATE POLICY "user_select_own_role" ON public.user_roles
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 3) Função has_role com SECURITY DEFINER para evitar recursão de policy.
CREATE OR REPLACE FUNCTION public.has_role(_role text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  );
$$;

-- 4) Tabela subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status             text NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'inactive', 'pending', 'cancelled', 'expired')),
  plan_type          text NOT NULL DEFAULT 'none'
    CHECK (plan_type IN ('none', 'monthly', 'annual', 'lifetime', 'trial', 'owner', 'baependi_2026')),
  access_expires_at  timestamptz,
  granted_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at         timestamptz,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_unique
  ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions (status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- O próprio usuário pode ler sua subscription.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions'
      AND policyname = 'user_select_own_subscription'
  ) THEN
    CREATE POLICY "user_select_own_subscription" ON public.subscriptions
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DROP TRIGGER IF EXISTS tg_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER tg_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
