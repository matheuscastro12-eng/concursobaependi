-- Comprovantes de pagamento via PIX no fluxo de cadastro

CREATE TABLE public.payment_submissions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         text,
  email             text NOT NULL,
  payment_method    text NOT NULL DEFAULT 'pix' CHECK (payment_method = 'pix'),
  pix_payload       text NOT NULL,
  amount_cents      integer NOT NULL DEFAULT 4000 CHECK (amount_cents > 0),
  proof_storage_path text NOT NULL,
  proof_file_name   text NOT NULL,
  proof_mime_type   text,
  proof_size_bytes  bigint,
  status            text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes      text,
  reviewed_at       timestamptz,
  reviewed_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_submissions_user_created
  ON public.payment_submissions (user_id, created_at DESC);

CREATE INDEX idx_payment_submissions_status_created
  ON public.payment_submissions (status, created_at DESC);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_payment_submissions" ON public.payment_submissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_insert_own_payment_submissions" ON public.payment_submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_select_payment_submissions" ON public.payment_submissions
  FOR SELECT TO authenticated
  USING (public.has_role('admin', auth.uid()));

CREATE POLICY "admin_update_payment_submissions" ON public.payment_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));

CREATE TRIGGER tg_payment_submissions_updated
  BEFORE UPDATE ON public.payment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "user_upload_own_payment_proof" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user_read_own_payment_proof" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user_delete_own_payment_proof" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
