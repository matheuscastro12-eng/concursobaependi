-- Estende subscriptions e payment_submissions para suportar:
-- 1. Pagamento mensal recorrente via Stripe (sem cupom)
-- 2. Pagamento único via PIX desbloqueado por cupom (HELENICE, etc)

-- ──────────────────────────────────────────────────────
-- 1) subscriptions: rastreio do Stripe + tipo de pagamento
-- ──────────────────────────────────────────────────────
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id     text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id        text,
  ADD COLUMN IF NOT EXISTS payment_provider       text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription
  ON public.subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions (stripe_customer_id);

-- Atualiza CHECK do plan_type pra incluir os tipos novos.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type IN (
    'none', 'monthly', 'annual', 'lifetime', 'trial', 'owner',
    'baependi_2026', 'manual',
    'monthly_stripe',  -- assinatura mensal Stripe
    'helenice'         -- acesso único via cupom HELENICE (PIX)
  ));

-- ──────────────────────────────────────────────────────
-- 2) payment_submissions: cupom usado (rastreia limite de 40)
-- ──────────────────────────────────────────────────────
ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS coupon_code text;

CREATE INDEX IF NOT EXISTS idx_payment_submissions_coupon
  ON public.payment_submissions (coupon_code)
  WHERE coupon_code IS NOT NULL;

-- ──────────────────────────────────────────────────────
-- 3) RPC pública pra contar usos do cupom (sem expor a tabela inteira)
-- O frontend chama isso pra saber se ainda há vagas antes de mostrar a UI.
-- ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.count_coupon_usage(_code text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.payment_submissions
  WHERE coupon_code = upper(_code)
    AND status IN ('pending', 'approved');
$$;

GRANT EXECUTE ON FUNCTION public.count_coupon_usage(text) TO anon, authenticated;
