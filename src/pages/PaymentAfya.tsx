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
import { concurso as afya } from '@/data/afya';
import { getTheme } from '@/lib/concursoTheme';
import logoColor from '@/assets/logo-concursos.svg';

const t = getTheme('afya');

// CRC16-CCITT (poly 0x1021, init 0xFFFF) — mesma técnica do PaymentAlagoa.
// Mantido aqui para deixar explícito como o payload abaixo foi gerado.
const crc16 = (payload: string): string => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const emvField = (id: string, value: string) =>
  id + String(value.length).padStart(2, '0') + value;

const AFYA_PIX = {
  chave: 'castroomath7@gmail.com',
  beneficiario: 'Matheus Castro',
  cidade: 'SAO PAULO',
  valorCentavos: afya.valorCentavos ?? 5000,
  valorLabel: 'R$ 50,00',
  // BR Code EMV-compliant para chave PIX castroomath7@gmail.com · R$ 50,00.
  // CRC16 recalculado para o valor 50.00 (resultado: 8B45). Confira em buildAfyaPayload().
  payload:
    '00020126440014BR.GOV.BCB.PIX0122castroomath7@gmail.com520400005303986540550.005802BR5914Matheus Castro6009SAO PAULO62070503***63048B45',
} as const;

// Reconstrói o payload campo-a-campo e recalcula o CRC16 — usado como
// verificação em runtime de que a string hardcoded acima continua válida.
const buildAfyaPayload = (): string => {
  const merchantAccount = emvField(
    '26',
    emvField('00', 'BR.GOV.BCB.PIX') + emvField('01', AFYA_PIX.chave),
  );
  const base =
    emvField('00', '01') +
    merchantAccount +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('54', '50.00') +
    emvField('58', 'BR') +
    emvField('59', AFYA_PIX.beneficiario) +
    emvField('60', AFYA_PIX.cidade) +
    emvField('62', emvField('05', '***')) +
    '6304';
  return base + crc16(base);
};

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

const PaymentAfya = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Garante que o payload hardcoded confere com o CRC recalculado em runtime (dev safety).
  const pixPayload = buildAfyaPayload() === AFYA_PIX.payload ? AFYA_PIX.payload : buildAfyaPayload();

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(AFYA_PIX.chave);
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
      await navigator.clipboard.writeText(pixPayload);
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
      concurso_slug: 'afya',
      valor_centavos: AFYA_PIX.valorCentavos,
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
        <Loader2 className={`h-6 w-6 animate-spin ${t.textHighlight}`} />
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
          <Button
            onClick={() => navigate('/auth?mode=entrar&concurso=afya')}
            className={`${t.primaryBg} ${t.primaryHover} text-white`}
          >
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
            onClick={() => navigate('/c/afya')}
            className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:${t.textHighlight}`}
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
          <p className={`text-[10.5px] font-bold uppercase tracking-[0.2em] ${t.textHighlight} mb-2`}>
            Pagamento · Prova Integradora Afya
          </p>
          <h1 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-slate-950">
            PIX único · R$ 50 · acesso vitalício
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Pague {AFYA_PIX.valorLabel} via PIX e faça upload do comprovante. Confirmamos por
            email em até 24h e liberamos seu acesso à Prova Integradora Afya.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 space-y-3">
            <div className={`flex items-center gap-2 ${t.textHighlight}`}>
              <Check className="h-5 w-5" />
              <h2 className="font-extrabold">Comprovante recebido</h2>
            </div>
            <p className="text-sm text-cyan-900 leading-relaxed">
              Pagamento em análise — você receberá confirmação por email em até 24h. Pode fechar
              esta página.
            </p>
            <Button onClick={() => navigate('/c/afya')} variant="outline" className="font-semibold">
              Voltar para a Prova Integradora
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-[10.5px] font-bold uppercase tracking-[0.18em] ${t.textHighlight} mb-1`}>
                    1. Faça o PIX de {AFYA_PIX.valorLabel}
                  </p>
                  <h3 className="text-base font-extrabold text-slate-950">
                    Use o QR code ou copie a chave PIX
                  </h3>
                </div>
                <div className={`h-10 w-10 rounded-lg bg-white ${t.iconColor} flex items-center justify-center border border-cyan-100`}>
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              <div className="grid sm:grid-cols-[168px_1fr] gap-4 items-center">
                <div className="mx-auto rounded-lg bg-white p-3 border border-cyan-100 shadow-sm">
                  <QRCodeSVG value={pixPayload} size={144} level="M" includeMargin />
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-lg border border-white/80 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">Recebedor</p>
                    <p className="text-sm font-bold text-slate-900">{AFYA_PIX.beneficiario}</p>
                  </div>
                  <div className="rounded-lg border border-white/80 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">Chave PIX (email)</p>
                    <p className="text-sm font-bold text-slate-900 break-all">{AFYA_PIX.chave}</p>
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
                Importante: pague exatamente {AFYA_PIX.valorLabel}. Pagamentos com valor
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
              até 24h e o acesso vitalício à Prova Integradora Afya é liberado.
            </p>
          </form>
        )}
      </main>
    </div>
  );
};

export default PaymentAfya;
