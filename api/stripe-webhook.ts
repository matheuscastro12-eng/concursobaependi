// Vercel Serverless Function — recebe webhooks do Stripe.
// Valida assinatura HMAC (Stripe-Signature) e atualiza subscriptions
// usando a SERVICE_ROLE key do Supabase (bypassa RLS).

// Edge runtime: usa Web Crypto API (nativa) — sem dependência do Node 'crypto'.
export const config = {
  runtime: 'edge',
};

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
  livemode: boolean;
}

const ok = (msg = 'ok') => new Response(msg, { status: 200 });
const err = (msg: string, status = 400) => new Response(msg, { status });

// ─── HMAC SHA-256 verification (Stripe signature) ──────────────────────
async function verifyStripeSignature(
  payload: string,
  sigHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!sigHeader) return false;

  // Formato: t=1492774577,v1=5257a869e7...,v0=...
  const parts = sigHeader.split(',').map((s) => s.trim());
  const tsPart = parts.find((p) => p.startsWith('t='));
  const sigParts = parts.filter((p) => p.startsWith('v1='));
  if (!tsPart || sigParts.length === 0) return false;

  const timestamp = parseInt(tsPart.slice(2), 10);
  if (!Number.isFinite(timestamp)) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - timestamp) > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time-ish compare
  return sigParts.some((p) => {
    const v1 = p.slice(3);
    if (v1.length !== expected.length) return false;
    let mismatch = 0;
    for (let i = 0; i < v1.length; i++) {
      mismatch |= v1.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return mismatch === 0;
  });
}

// ─── Supabase REST helpers (sem importar SDK pra ficar leve em Edge) ───
async function supabaseUpsert(
  url: string,
  serviceKey: string,
  table: string,
  body: unknown,
  onConflict: string,
): Promise<void> {
  const r = await fetch(`${url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase upsert ${table} ${r.status}: ${t.slice(0, 200)}`);
  }
}

async function supabaseUpdate(
  url: string,
  serviceKey: string,
  table: string,
  filter: string,
  body: unknown,
): Promise<void> {
  const r = await fetch(`${url}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase update ${table} ${r.status}: ${t.slice(0, 200)}`);
  }
}

// ─── Handlers por tipo de evento ────────────────────────────────────────
async function handleCheckoutCompleted(
  event: StripeEvent,
  supabaseUrl: string,
  serviceKey: string,
): Promise<void> {
  const session = event.data.object as Record<string, unknown>;
  const userId =
    (session.client_reference_id as string | null) ??
    ((session.metadata as Record<string, string> | null)?.user_id ?? null);
  const customerId = session.customer as string | null;
  const subscriptionId = session.subscription as string | null;

  if (!userId) {
    // eslint-disable-next-line no-console
    console.warn('[stripe-webhook] checkout.session.completed sem user_id', session.id);
    return;
  }

  // Quando o aluno completa o checkout (mesmo em trial, cartão já está salvo),
  // já liberamos o acesso. Status 'active' cobre tanto trialing quanto paid —
  // o frontend usa só o boolean hasAccess (= status === 'active').
  await supabaseUpsert(supabaseUrl, serviceKey, 'subscriptions', {
    user_id: userId,
    status: 'active',
    plan_type: 'monthly_stripe',
    payment_provider: 'stripe',
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: 'price_1TTowYEHvCNyCbcUJlokgOiT',
    granted_at: new Date().toISOString(),
    notes: `Stripe checkout ${session.id}`,
  }, 'user_id');
}

// Atualiza status conforme Stripe avisa de mudanças na subscription
// (trial → active, active → past_due/cancelled etc).
async function handleSubscriptionUpdated(
  event: StripeEvent,
  supabaseUrl: string,
  serviceKey: string,
): Promise<void> {
  const sub = event.data.object as Record<string, unknown>;
  const subscriptionId = sub.id as string | null;
  const stripeStatus = sub.status as string | null; // 'trialing' | 'active' | 'past_due' | 'canceled' | ...
  if (!subscriptionId || !stripeStatus) return;

  // Mapeia status do Stripe pros nossos. Trial e active = acesso liberado.
  const localStatus =
    stripeStatus === 'active' || stripeStatus === 'trialing' ? 'active'
    : stripeStatus === 'past_due' ? 'expired'
    : stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired' ? 'cancelled'
    : 'inactive';

  await supabaseUpdate(
    supabaseUrl,
    serviceKey,
    'subscriptions',
    `stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,
    {
      status: localStatus,
      notes: `Stripe ${stripeStatus} em ${new Date().toISOString()}`,
    },
  );
}

async function handleSubscriptionDeleted(
  event: StripeEvent,
  supabaseUrl: string,
  serviceKey: string,
): Promise<void> {
  const sub = event.data.object as Record<string, unknown>;
  const subscriptionId = sub.id as string;
  if (!subscriptionId) return;

  await supabaseUpdate(
    supabaseUrl,
    serviceKey,
    'subscriptions',
    `stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,
    { status: 'cancelled' },
  );
}

async function handleInvoicePaymentFailed(
  event: StripeEvent,
  supabaseUrl: string,
  serviceKey: string,
): Promise<void> {
  const invoice = event.data.object as Record<string, unknown>;
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) return;

  await supabaseUpdate(
    supabaseUrl,
    serviceKey,
    'subscriptions',
    `stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,
    { status: 'expired', notes: `Cobrança falhou em ${new Date().toISOString()}` },
  );
}

// ─── Handler principal ─────────────────────────────────────────────────
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return err('Method not allowed', 405);

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !serviceKey) {
    return err('Server not configured', 500);
  }

  const sigHeader = req.headers.get('stripe-signature');
  const payload = await req.text();

  const valid = await verifyStripeSignature(payload, sigHeader, webhookSecret);
  if (!valid) return err('Invalid signature', 400);

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return err('Invalid JSON', 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, supabaseUrl, serviceKey);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, supabaseUrl, serviceKey);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, supabaseUrl, serviceKey);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event, supabaseUrl, serviceKey);
        break;
      default:
        // ignora outros eventos silenciosamente
        break;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[stripe-webhook] handler error', e);
    // Devolve 500 pra Stripe re-tentar (caso seja erro transiente)
    return err((e as Error).message || 'handler error', 500);
  }

  return ok();
}
