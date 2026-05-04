import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  QrCode,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PIX_PAYMENT, submitPixPaymentProof } from '@/lib/paymentSubmissions';
import logoColor from '@/assets/logo-concursos.svg';

type AuthMode = 'entrar' | 'criar' | 'recuperar' | 'redefinir';

const friendlyAuthError = (message: string) => {
  if (/invalid login credentials/i.test(message)) return 'Email ou senha incorretos.';
  if (/already registered|already been registered|user already/i.test(message)) return 'Este email já tem uma conta.';
  if (/password/i.test(message) && /short|weak|six|6/i.test(message)) return 'Use uma senha com pelo menos 6 caracteres.';
  return message;
};

const getRedirectTarget = (next: string | null) => {
  if (!next || !next.startsWith('/')) return '/';
  if (next.startsWith('//')) return '/';
  return next;
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const Auth = () => {
  const { user, loading: authLoading, signIn, signUp, sendPasswordReset, updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const next = useMemo(() => getRedirectTarget(searchParams.get('next')), [searchParams]);
  const initialMode = (searchParams.get('mode') as AuthMode | null) ?? 'entrar';
  const [mode, setMode] = useState<AuthMode>(
    ['entrar', 'criar', 'recuperar', 'redefinir'].includes(initialMode) ? initialMode : 'entrar',
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    const params = new URLSearchParams(searchParams);
    params.set('mode', nextMode);
    setSearchParams(params, { replace: true });
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_PAYMENT.payload);
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 1800);
      toast({ title: 'PIX copiado', description: 'Agora é só colar no app do banco.' });
    } catch (error) {
      toast({
        title: 'Não conseguimos copiar',
        description: error instanceof Error ? error.message : 'Copie o código manualmente.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
      </div>
    );
  }

  if (user && mode !== 'redefinir') return <Navigate to={next} replace />;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await signIn({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: 'Não conseguimos entrar', description: friendlyAuthError(error.message), variant: 'destructive' });
      return;
    }

    navigate(next, { replace: true });
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!proofFile) {
      toast({
        title: 'Anexe o comprovante',
        description: 'Selecione o arquivo do pagamento para concluir o cadastro.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Confira a senha', description: 'As duas senhas precisam ser iguais.', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'Use pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error, session, user: createdUser } = await signUp({ email, password, name });

    if (error) {
      setLoading(false);
      toast({ title: 'Não conseguimos criar a conta', description: friendlyAuthError(error.message), variant: 'destructive' });
      return;
    }

    if (!session || !createdUser) {
      setLoading(false);
      toast({
        title: 'Conta criada',
        description: 'Ative o acesso automático no Supabase para enviar o comprovante logo após o cadastro.',
      });
      switchMode('entrar');
      return;
    }

    try {
      await submitPixPaymentProof({
        userId: createdUser.id,
        email,
        fullName: name,
        file: proofFile,
      });
    } catch (uploadError) {
      setLoading(false);
      toast({
        title: 'Conta criada, mas faltou o comprovante',
        description: uploadError instanceof Error ? uploadError.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(false);
    toast({
      title: 'Conta criada',
      description: 'Recebemos seu comprovante. Vamos liberar o acesso após a conferência.',
    });
    navigate(next, { replace: true });
  };

  const handleRecover = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);

    if (error) {
      toast({ title: 'Não conseguimos enviar o link', description: friendlyAuthError(error.message), variant: 'destructive' });
      return;
    }

    toast({ title: 'Link enviado', description: 'Veja seu email para redefinir a senha.' });
    switchMode('entrar');
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Confira a senha', description: 'As duas senhas precisam ser iguais.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast({ title: 'Não conseguimos alterar a senha', description: friendlyAuthError(error.message), variant: 'destructive' });
      return;
    }

    toast({ title: 'Senha atualizada', description: 'Você já pode continuar estudando.' });
    navigate(next, { replace: true });
  };

  const titleByMode = {
    entrar: 'Entrar no ConcursosAI',
    criar: 'Criar conta',
    recuperar: 'Recuperar senha',
    redefinir: 'Definir nova senha',
  };

  const subtitleByMode = {
    entrar: 'Acesse seus simulados e continue de onde parou.',
    criar: 'Pague via PIX, anexe o comprovante e comece a estudar em poucos segundos.',
    recuperar: 'Informe seu email para receber o link de recuperação.',
    redefinir: 'Escolha uma nova senha para sua conta.',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 cai-animated-grid">
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xl cai-fade-in">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors cai-interactive"
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12 grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start">
        <section className="hidden lg:block cai-slide-up">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-4 cai-slide-up cai-delay-1">
            Área do candidato
          </p>
          <h1 className="font-['Manrope'] text-4xl font-extrabold leading-tight tracking-tight text-slate-950 mb-5 cai-slide-up cai-delay-2">
            Crie sua conta e entre no ritmo da aprovação.
          </h1>
          <p className="text-base leading-7 text-slate-600 max-w-xl mb-8 cai-slide-up cai-delay-3">
            O cadastro já reúne pagamento, comprovante e acesso ao painel, sem te jogar em um fluxo confuso.
          </p>

          <div className="grid gap-3 max-w-xl">
            {[
              ['Cadastro em um passo', 'Você paga por PIX, envia o comprovante e já deixa o acesso encaminhado.'],
              ['Estudo no foco certo', 'Entre para gerar questões por cargo, banca e matéria com mais direção.'],
              ['Tudo organizado', 'Seus simulados ficam salvos para retomar quando quiser.'],
            ].map(([title, text], index) => (
              <div key={title} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop cai-interactive">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm animate-pulse-glow">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-normal">{title}</h2>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop">
            <p className="text-sm font-bold text-slate-900">Precisa falar com a gente?</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                Email: <a href="mailto:castroomath7@gmail.com" className="font-semibold text-blue-700 hover:text-blue-800">castroomath7@gmail.com</a>
              </p>
              <p>
                WhatsApp: <a href="https://wa.me/5535920004855" className="font-semibold text-blue-700 hover:text-blue-800">35 92000-4855</a>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-[0_16px_48px_-28px_rgba(15,23,42,0.35)] overflow-hidden cai-slide-up cai-delay-2">
          <div className="border-b border-slate-200 bg-slate-50 px-5 sm:px-7 py-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600 mb-2">
                Acesso seguro
              </p>
              <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">{titleByMode[mode]}</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{subtitleByMode[mode]}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 animate-float">
              <BookOpenCheck className="h-5 w-5" />
            </div>
          </div>

          {(mode === 'entrar' || mode === 'criar') && (
            <div className="px-5 sm:px-7 pt-5">
              <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('entrar')}
                  className={`h-9 rounded-md text-sm font-bold transition-colors ${
                    mode === 'entrar' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('criar')}
                  className={`h-9 rounded-md text-sm font-bold transition-colors ${
                    mode === 'criar' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Criar conta
                </button>
              </div>
            </div>
          )}

          <div className="p-5 sm:p-7">
            {mode === 'entrar' && (
              <form onSubmit={handleLogin} className="space-y-4 cai-fade-in">
                <Field id="login-email" label="Email" icon={Mail}>
                  <Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required disabled={loading} className="pl-10 h-11" />
                </Field>
                <PasswordField
                  id="login-password"
                  label="Senha"
                  value={password}
                  onChange={setPassword}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((show) => !show)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-bold">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</> : 'Entrar'}
                </Button>
                <button type="button" onClick={() => switchMode('recuperar')} className="w-full text-center text-sm font-semibold text-blue-700 hover:text-blue-800">
                  Esqueci minha senha
                </button>
              </form>
            )}

            {mode === 'criar' && (
              <form onSubmit={handleSignup} className="space-y-5 cai-fade-in">
                <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Pagamento via PIX</p>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-950">Libere seu acesso com {PIX_PAYMENT.amountLabel}</h3>
                    </div>
                    <div className="hidden sm:flex h-10 w-10 rounded-lg bg-white text-blue-700 items-center justify-center border border-blue-100">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-[168px_1fr] gap-4 items-center">
                    <div className="mx-auto rounded-lg bg-white p-3 border border-blue-100 shadow-sm">
                      <QRCodeSVG value={PIX_PAYMENT.payload} size={144} level="M" includeMargin />
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-lg border border-white/80 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-500">Recebedor</p>
                        <p className="text-sm font-bold text-slate-900">{PIX_PAYMENT.beneficiary}</p>
                      </div>
                      <div className="rounded-lg border border-white/80 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-500">Cidade</p>
                        <p className="text-sm font-bold text-slate-900">{PIX_PAYMENT.city}</p>
                      </div>
                      <div className="rounded-lg border border-white/80 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-500">PIX copia e cola</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600 break-all">{PIX_PAYMENT.payload}</p>
                      </div>
                      <Button type="button" variant="outline" className="w-full h-10 font-semibold" onClick={handleCopyPix}>
                        {pixCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {pixCopied ? 'Código copiado' : 'Copiar código PIX'}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-blue-200 bg-white p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Upload className="h-4 w-4 text-blue-700" />
                      <span className="text-sm font-bold">Anexe o comprovante</span>
                    </div>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                      disabled={loading}
                      className="cursor-pointer file:mr-3 file:rounded-md file:border file:border-slate-200 file:px-3 file:py-1.5 file:text-sm file:font-semibold"
                    />
                    <p className="text-xs text-slate-500">
                      Aceitamos imagem ou PDF do pagamento.
                    </p>
                    {proofFile && (
                      <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{proofFile.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(proofFile.size)}</p>
                        </div>
                        <QrCode className="h-4 w-4 shrink-0 text-blue-700" />
                      </div>
                    )}
                  </div>
                </div>

                <Field id="signup-name" label="Nome completo" icon={UserRound}>
                  <Input id="signup-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" required disabled={loading} className="pl-10 h-11" />
                </Field>
                <Field id="signup-email" label="Email" icon={Mail}>
                  <Input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required disabled={loading} className="pl-10 h-11" />
                </Field>
                <PasswordField
                  id="signup-password"
                  label="Senha"
                  value={password}
                  onChange={setPassword}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((show) => !show)}
                  disabled={loading}
                />
                <PasswordField
                  id="signup-confirm"
                  label="Confirmar senha"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((show) => !show)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-bold">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</> : 'Criar conta e enviar comprovante'}
                </Button>
              </form>
            )}

            {mode === 'recuperar' && (
              <form onSubmit={handleRecover} className="space-y-4 cai-fade-in">
                <Field id="recover-email" label="Email cadastrado" icon={Mail}>
                  <Input id="recover-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required disabled={loading} className="pl-10 h-11" />
                </Field>
                <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-bold">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar link de recuperação'}
                </Button>
                <button type="button" onClick={() => switchMode('entrar')} className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700">
                  Voltar para o login
                </button>
              </form>
            )}

            {mode === 'redefinir' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4 cai-fade-in">
                <PasswordField
                  id="new-password"
                  label="Nova senha"
                  value={password}
                  onChange={setPassword}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((show) => !show)}
                  disabled={loading}
                />
                <PasswordField
                  id="new-password-confirm"
                  label="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((show) => !show)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-bold">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : 'Salvar nova senha'}
                </Button>
              </form>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 cai-soft-pop cai-delay-3">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Cadastro simples, pagamento por PIX e comprovante guardado no seu perfil para conferência.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold text-slate-700">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggle,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold text-slate-700">
        {label}
      </Label>
      <div className="relative">
        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Mínimo de 6 caracteres"
          required
          disabled={disabled}
          className="h-11 pl-10 pr-11"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default Auth;
