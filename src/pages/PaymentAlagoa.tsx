import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import logoColor from '@/assets/logo-concursos.svg';

// BR Code EMV-compliant gerado para chave PIX castroomath7@gmail.com · R$ 60,00.
// CRC16-CCITT já calculado no final do payload — usuário pode pagar via copia-e-cola.
const ALAGOA_PIX = {
  chave: 'castroomath7@gmail.com',
  beneficiario: 'Matheus Castro',
  cidade: 'SAO PAULO',
  valorCentavos: 6000,
  valorLabel: 'R$ 60,00',
  payload:
    '00020126440014BR.GOV.BCB.PIX0122castroomath7@gmail.com520400005303986540560.005802BR5914Matheus Castro6009SAO PAULO62070503***63043B4B',
} as const;

const sanitizeFileName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const PaymentAlagoa = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(ALAGOA_PIX.chave);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast({ title: 'Chave PIX copiada', description: 'Cole no app do seu banco.' });
    } catch (error) {
      toast({
        title: 'Não conseguimos copiar',
        description: error instanceof Error ? error.message : 'Copie a chave manualmente.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(ALAGOA_PIX.payload);
      setCopiedPayload(true);
      window.setTimeout(() => setCopiedPayload(false), 1800);
      toast({ title: 'PIX copia-e-cola copiado', description: 'Cole no campo PIX do seu banco.' });
    } catch (error) {
      toast({
        title: 'Não conseguimos copiar',
        description: error instanceof Error ? error.message : 'Copie o código manualmente.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast({ title: 'Faça login', description: 'Entre na conta para enviar o comprovante.', variant: 'destructive' });
      return;
    }
    if (!file) {
      toast({ title: 'Anexe o comprovante', description: 'Selecione a imagem do pagamento.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const safeName = sanitizeFileName(file.name || 'comprovante');
    const storagePath = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('pix-comprovantes')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      setSubmitting(false);
      toast({
        title: 'Falha ao enviar comprovante',
        description: uploadError.message,
        variant: 'destructive',
      });
      return;
    }

    const { error: insertError } = await (supabase as any).from('pix_payments').insert({
      user_id: user.id,
      concurso_slug: 'alagoa',
      valor_centavos: ALAGOA_PIX.valorCentavos,
      comprovante_url: storagePath,
      status: 'pending',
    });

    setSubmitting(false);

    if (insertError) {
      await supabase.storage.from('pix-comprovantes').remove([storagePath]);
      toast({
        title: 'Falha ao registrar pagamento',
        description: insertError.message,
        variant: 'destructive',
      });
      return;
    }

    setSubmitted(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-950">Entre na sua conta</h1>
          <p className="text-sm text-slate-600">
            Você precisa estar logado pra registrar o pagamento PIX.
          </p>
          <Button onClick={() => navigate('/auth?mode=entrar&concurso=alagoa')} className="bg-emerald-700 hover:bg-emerald-800">
            Ir pro login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/c/alagoa')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <img src={logoColor} alt="ConcursosAI" className="h-8 w-8" />
            <span className="font-['Manrope'] font-extrabold tracking-tight">ConcursosAI</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-2">
            Pagamento Alagoa
          </p>
          <h1 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-slate-950">
            PIX único · R$ 60 · acesso vitalício
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Pague {ALAGOA_PIX.valorLabel} via PIX e faça upload do comprovante. Confirmamos por
            email em até 24h e liberamos seu acesso.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="h-5 w-5" />
              <h2 className="font-extrabold">Comprovante recebido</h2>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed">
              Pagamento em análise — você receberá confirmação por email em até 24h. Pode fechar
              esta página.
            </p>
            <Button onClick={() => navigate('/c/alagoa')} variant="outline" className="font-semibold">
              Voltar para Alagoa
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-1">
                    1. Faça o PIX de {ALAGOA_PIX.valorLabel}
                  </p>
                  <h3 className="text-base font-extrabold text-slate-950">
                    Use o QR code ou copie a chave PIX
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-white text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              <div className="grid sm:grid-cols-[168px_1fr] gap-4 items-center">
                <div className="mx-auto rounded-lg bg-white p-3 border border-emerald-100 shadow-sm">
                  <QRCodeSVG value={ALAGOA_PIX.payload} size={144} level="M" includeMargin />
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-lg border border-white/80 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">Recebedor</p>
                    <p className="text-sm font-bold text-slate-900">{ALAGOA_PIX.beneficiario}</p>
                  </div>
                  <div className="rounded-lg border border-white/80 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">Chave PIX (email)</p>
                    <p className="text-sm font-bold text-slate-900 break-all">{ALAGOA_PIX.chave}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 font-semibold"
                    onClick={handleCopyPix}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Chave copiada' : 'Copiar chave PIX'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 font-semibold"
                    onClick={handleCopyPayload}
                  >
                    {copiedPayload ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedPayload ? 'Código copiado' : 'Copiar PIX copia-e-cola'}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Importante: pague exatamente {ALAGOA_PIX.valorLabel}. Pagamentos com valor
                diferente serão revisados manualmente.
              </p>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-amber-700">
                2. Anexe o comprovante
              </p>
              <h3 className="text-base font-extrabold text-slate-950">Print ou PDF do pagamento</h3>
              <div className="rounded-lg border border-dashed border-amber-300 bg-white p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <Upload className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-bold">Selecione o arquivo</span>
                </div>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  disabled={submitting}
                  className="cursor-pointer file:mr-3 file:rounded-md file:border file:border-slate-200 file:px-3 file:py-1.5 file:text-sm file:font-semibold"
                />
                {file && (
                  <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <QrCode className="h-4 w-4 shrink-0 text-amber-700" />
                  </div>
                )}
              </div>
            </section>

            <Button
              type="submit"
              disabled={submitting || !file}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-extrabold"
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
              ) : (
                'Enviar comprovante para análise'
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Após o envio, seu pagamento entra em análise. Você recebe confirmação por email em
              até 24h e o acesso vitalício é liberado.
            </p>
          </form>
        )}
      </main>
    </div>
  );
};

export default PaymentAlagoa;
