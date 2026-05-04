-- Garante acesso administrativo exclusivo ao owner do projeto

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'::public.app_role
    FROM auth.users
    WHERE lower(email) = 'castroomath7@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.ensure_owner_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(COALESCE(NEW.email, '')) = 'castroomath7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_owner_admin ON auth.users;

CREATE TRIGGER on_auth_user_created_owner_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_owner_admin_role();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'admin_select_all_profiles'
  ) THEN
    CREATE POLICY "admin_select_all_profiles" ON public.profiles
      FOR SELECT TO authenticated
      USING (public.has_role('admin', auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscriptions'
      AND policyname = 'admin_select_all_subscriptions'
  ) THEN
    CREATE POLICY "admin_select_all_subscriptions" ON public.subscriptions
      FOR SELECT TO authenticated
      USING (public.has_role('admin', auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscriptions'
      AND policyname = 'admin_manage_subscriptions'
  ) THEN
    CREATE POLICY "admin_manage_subscriptions" ON public.subscriptions
      FOR ALL TO authenticated
      USING (public.has_role('admin', auth.uid()))
      WITH CHECK (public.has_role('admin', auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'admin_select_all_roles'
  ) THEN
    CREATE POLICY "admin_select_all_roles" ON public.user_roles
      FOR SELECT TO authenticated
      USING (public.has_role('admin', auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'admin_manage_roles'
  ) THEN
    CREATE POLICY "admin_manage_roles" ON public.user_roles
      FOR ALL TO authenticated
      USING (public.has_role('admin', auth.uid()))
      WITH CHECK (public.has_role('admin', auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'admin_read_payment_proofs'
  ) THEN
    CREATE POLICY "admin_read_payment_proofs" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'payment-proofs'
        AND public.has_role('admin', auth.uid())
      );
  END IF;
END $$;
