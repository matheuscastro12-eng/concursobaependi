-- Adiciona 'manual' como plan_type válido (usado pelo botão "Conceder acesso" no CRM).

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type IN (
    'none', 'monthly', 'annual', 'lifetime', 'trial', 'owner',
    'baependi_2026', 'manual'
  ));
