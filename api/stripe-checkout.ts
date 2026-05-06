// Vercel Serverless Function — cria Stripe Checkout Session pro plano mensal.
// Front chama POST com { user_id, email } e recebe { url } pra redirecionar.

export const config = {
  runtime: 'edge',
};

interface CheckoutRequest {
  user_id?: string;
  email?: string;
  return_url?: string;
}

const PRICE_ID = 'price_1TTowYEHvCNyCbcUJlokgOiT';
const STRIPE_API = 'https://api.stripe.com/v1';

const cors = (): Record<string, string> => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json({ error: 'STRIPE_SECRET_KEY not configured' }, 500);

  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userId = body.user_id?.trim();
  const email = body.email?.trim();
  if (!userId || !email) {
    return json({ error: 'user_id e email são obrigatórios' }, 400);
  }

  const origin =
    req.headers.get('origin') ||
    body.return_url ||
    'https://concursobaependi.vercel.app';
  const successUrl = `${origin}/dashboard?stripe=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/auth?mode=criar&stripe=cancelled`;

  // Stripe Checkout Sessions API recebe form-encoded.
  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('line_items[0][price]', PRICE_ID);
  params.append('line_items[0][quantity]', '1');
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('customer_email', email);
  params.append('client_reference_id', userId);
  params.append('metadata[user_id]', userId);
  params.append('subscription_data[metadata][user_id]', userId);
  params.append('allow_promotion_codes', 'true');
  params.append('billing_address_collection', 'auto');

  const resp = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = (await resp.json()) as { url?: string; error?: { message?: string } };

  if (!resp.ok) {
    return json(
      { error: data.error?.message ?? 'Falha ao criar sessão Stripe' },
      resp.status,
    );
  }

  if (!data.url) {
    return json({ error: 'Stripe não retornou URL de checkout' }, 502);
  }

  return json({ url: data.url });
}
