import { supabase } from '@/integrations/supabase/client';

export const PIX_PAYMENT = {
  amountCents: 4000,
  amountLabel: 'R$ 40,00',
  beneficiary: 'Matheus da Cunha Castro',
  city: 'São Paulo',
  payload:
    '00020126480014BR.GOV.BCB.PIX0126kamikazematheus7@gmail.com520400005303986540540.005802BR5923Matheus da Cunha Castro6009SAO PAULO62140510sU2syNeg7v6304FD4B',
} as const;

// ────────────────────────────────────────────────────────────────────
// Cupons que liberam o pagamento PIX (acesso único). Sem cupom, o aluno
// só pode pagar via Stripe (mensal recorrente).
// ────────────────────────────────────────────────────────────────────
export const COUPONS = {
  HELENICE: { code: 'HELENICE', maxUses: 40, label: 'Turma da Helenice — acesso único R$ 40,00' },
} as const;

export type CouponCode = keyof typeof COUPONS;

export interface CouponValidation {
  valid: boolean;
  reason?: 'invalid' | 'exhausted';
  remaining?: number;
  config?: typeof COUPONS[CouponCode];
}

/**
 * Valida cupom case-insensitive e checa via RPC count_coupon_usage.
 * Retorna info pra UI mostrar mensagem adequada.
 */
export async function validateCoupon(rawCode: string): Promise<CouponValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, reason: 'invalid' };

  const config = COUPONS[code as CouponCode];
  if (!config) return { valid: false, reason: 'invalid' };

  const { data, error } = await supabase.rpc('count_coupon_usage', { _code: code });
  if (error) {
    // RPC falhou — aceita otimisticamente; o admin valida no CRM se passar do limite.
    return { valid: true, config, remaining: config.maxUses };
  }

  const used = typeof data === 'number' ? data : 0;
  const remaining = Math.max(0, config.maxUses - used);
  if (remaining <= 0) {
    return { valid: false, reason: 'exhausted', remaining: 0, config };
  }
  return { valid: true, remaining, config };
}

const sanitizeFileName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

export async function submitPixPaymentProof(params: {
  userId: string;
  email: string;
  fullName: string;
  file: File;
  couponCode?: string | null;
}) {
  const { userId, email, fullName, file, couponCode } = params;

  const safeName = sanitizeFileName(file.name || 'comprovante');
  const storagePath = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(`Falha ao enviar comprovante: ${uploadError.message}`);
  }

  const { error: insertError } = await supabase.from('payment_submissions').insert({
    user_id: userId,
    email,
    full_name: fullName,
    payment_method: 'pix',
    pix_payload: PIX_PAYMENT.payload,
    amount_cents: PIX_PAYMENT.amountCents,
    proof_storage_path: storagePath,
    proof_file_name: file.name,
    proof_mime_type: file.type || null,
    proof_size_bytes: file.size,
    coupon_code: couponCode ? couponCode.trim().toUpperCase() : null,
  });

  if (insertError) {
    await supabase.storage.from('payment-proofs').remove([storagePath]);
    throw new Error(`Falha ao salvar pagamento: ${insertError.message}`);
  }

  return { storagePath };
}

/**
 * Cria sessão de Stripe Checkout no servidor e retorna a URL pra redirecionar.
 */
export async function createStripeCheckoutSession(params: {
  userId: string;
  email: string;
}): Promise<string> {
  const { userId, email } = params;

  const resp = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, email }),
  });
  const data = (await resp.json()) as { url?: string; error?: string };
  if (!resp.ok || !data.url) {
    throw new Error(data.error ?? 'Falha ao iniciar checkout Stripe');
  }
  return data.url;
}
