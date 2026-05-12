-- Admin já tinha policies de SELECT/UPDATE em pix_payments (migration anterior),
-- mas faltava INSERT — necessário pra liberação manual de acesso Alagoa via CRM.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pix_payments'
      AND policyname = 'admin_insert_pix'
  ) THEN
    CREATE POLICY "admin_insert_pix" ON public.pix_payments
      FOR INSERT TO authenticated
      WITH CHECK (public.has_role('admin', auth.uid()));
  END IF;
END $$;
