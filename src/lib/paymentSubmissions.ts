import { supabase } from '@/integrations/supabase/client';

export const PIX_PAYMENT = {
  amountCents: 4000,
  amountLabel: 'R$ 40,00',
  beneficiary: 'Matheus da Cunha Castro',
  city: 'São Paulo',
  payload:
    '00020126480014BR.GOV.BCB.PIX0126kamikazematheus7@gmail.com520400005303986540540.005802BR5923Matheus da Cunha Castro6009SAO PAULO62140510sU2syNeg7v6304FD4B',
} as const;

const sanitizeFileName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

export async function submitPixPaymentProof(params: {
  userId: string;
  email: string;
  fullName: string;
  file: File;
}) {
  const { userId, email, fullName, file } = params;

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
  });

  if (insertError) {
    await supabase.storage.from('payment-proofs').remove([storagePath]);
    throw new Error(`Falha ao salvar pagamento: ${insertError.message}`);
  }

  return { storagePath };
}
