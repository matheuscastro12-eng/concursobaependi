import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Sparkles,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { cargos, editalInfo } from '@/data/baependi';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';
import { useTrainingCargo } from '@/hooks/useTrainingCargo';
import { useToast } from '@/hooks/use-toast';
import { createStripeCheckoutSession } from '@/lib/paymentSubmissions';
import { Loader2 } from 'lucide-react';
import logoColor from '@/assets/logo-concursos.svg';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { hasAccess, status, planType } = useSubscription();
  const { canAccessAdmin } = useAdmin();
  const { selectedCargo, selectedCargoSlug, setSelectedCargoSlug } = useTrainingCargo();
  const { toast } = useToast();
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!user?.email) return;
    setPaying(true);
    try {
      const url = await createStripeCheckoutSession({ userId: user.id, email: user.email });
      window.location.assign(url);
    } catch (err) {
      setPaying(false);
      toast({
        title: 'Não conseguimos abrir o pagamento',
        description: err instanceof Error ? err.message : 'Tente novamente em alguns segundos.',
        variant: 'destructive',
      });
    }
  };

  const userName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Aluno';
  }, [user]);

  const cargoHighlights = useMemo(
    () => cargos.filter((cargo) => cargo.slug !== selectedCargo.slug).slice(0, 6),
    [selectedCargo.slug],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto min-h-16 px-4 sm:px-6 lg:px-10 xl:px-12 grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-center py-3">
          <div className="flex items-center gap-3">
            <img src={logoColor} alt="ConcursosAI" className="h-8 w-8" />
            <div>
              <p className="font-['Manrope'] font-extrabold tracking-tight">Dashboard</p>
              <p className="text-xs text-slate-500">Área do aluno</p>
            </div>
          </div>

          <div className="lg:justify-self-center w-full lg:w-[420px]">
            <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5 text-center lg:text-left">
              Cargo selecionado para treinar
            </label>
            <select
              value={selectedCargoSlug}
              onChange={(event) => {
                const slug = event.target.value;
                setSelectedCargoSlug(slug);
                // Abre direto a aba do cargo escolhido — vagas, salário,
                // requisitos e matérias com gerador de simulado por matéria.
                navigate(`/cargos/${slug}`);
              }}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors"
            >
              {cargos.map((cargo) => (
                <option key={cargo.slug} value={cargo.slug}>
                  {cargo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 justify-self-start lg:justify-self-end">
            {canAccessAdmin && (
              <button
                onClick={() => navigate('/crm')}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors shadow-[0_4px_12px_-4px_rgba(37,99,235,0.45)]"
                title="Abrir painel administrativo"
              >
                <LayoutDashboard className="h-4 w-4" />
                CRM
              </button>
            )}
            <button
              onClick={async () => {
                await signOut();
                navigate('/auth?mode=entrar', { replace: true });
              }}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:text-red-700 hover:border-red-200 transition-colors"
              title="Sair da conta"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8">
        <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] p-7 sm:p-9 text-white shadow-[0_24px_80px_-28px_rgba(30,58,138,0.45)]">
            <p className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-300 mb-4">
              <span className="w-7 h-px bg-amber-400" />
              {hasAccess ? 'Acesso ativo' : 'Conta pronta'}
            </p>
            <h1 className="font-['Manrope'] text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.02]">
              Bem-vindo, {userName}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed">
              {hasAccess
                ? `Seu acesso já está liberado. O foco agora é treinar para ${selectedCargo.nome} com mais constância e menos dispersão.`
                : `Sua conta já está pronta. Assim que o acesso for liberado, você vai treinar para ${selectedCargo.nome} com tudo organizado.`}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {hasAccess ? (
                <button
                  onClick={() =>
                    navigate(`/exam?banca=${encodeURIComponent(editalInfo.banca)}&cargo=${encodeURIComponent(selectedCargo.nome)}`)
                  }
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl text-sm font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
                >
                  Gerar simulado agora
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => void handlePay()}
                  disabled={paying}
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl text-sm font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-60"
                >
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  {paying ? 'Abrindo pagamento…' : 'Liberar acesso · R$ 40/mês'}
                </button>
              )}
              <button
                onClick={() => navigate(`/cargos/${selectedCargo.slug}`)}
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-bold hover:bg-white/15 transition-colors"
              >
                Ver cargo selecionado
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              ['Status do acesso', status === 'active' ? 'Liberado' : 'Pendente', CheckCircle2],
              ['Plano', planType === 'owner' ? 'Owner' : planType === 'manual' ? 'Manual' : planType, LayoutDashboard],
              ['Cargo atual', selectedCargo.nome, Building2],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            ['1', 'Escolha o cargo', 'Deixe o cargo selecionado no header e mantenha seu treino sempre apontado para o mesmo foco.'],
            ['2', 'Gere o treino', 'Crie questões com banca, nível e quantidade do jeito que fizer mais sentido.'],
            ['3', 'Revise melhor', 'Use os comentários para entender a lógica da cobrança e ganhar ritmo.'],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-extrabold flex items-center justify-center mb-4">
                {step}
              </div>
              <h2 className="font-['Manrope'] text-base font-extrabold text-slate-950">{title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{text}</p>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)]">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-3 inline-flex items-center gap-2">
              <Target className="w-4 h-4" />
              Seu próximo passo
            </p>
            <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] text-slate-950">
              Foque em {selectedCargo.nome}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mt-4">
              Você já deixou um cargo selecionado no header. Agora é só entrar nas matérias dele e transformar o edital em treino prático.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                ['Simulados com cara de prova', BookOpenCheck],
                [`${selectedCargo.materiasIds.length} matérias mapeadas`, FileText],
                ['Treino mais rápido e objetivo', Clock3],
              ].map(([label, Icon]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                    <Icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  navigate(`/exam?banca=${encodeURIComponent(editalInfo.banca)}&cargo=${encodeURIComponent(selectedCargo.nome)}`)
                }
                disabled={!hasAccess}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition-colors disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                Gerar simulado de {selectedCargo.nome}
              </button>
              <button
                onClick={() => navigate(`/cargos/${selectedCargo.slug}`)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                Ver matérias do cargo
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-2 inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Cargos sugeridos
                </p>
                <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-950">
                  Outras opções para comparar
                </h2>
              </div>
              <button
                onClick={() => navigate('/', { state: { fromInternal: true } })}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Ver todos
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {cargoHighlights.map((cargo) => {
                const NivelIcon = cargo.nivel === 'superior' ? GraduationCap : cargo.nivel === 'medio' ? Building2 : FileText;
                return (
                  <button
                    key={cargo.slug}
                    onClick={() => navigate(`/cargos/${cargo.slug}`)}
                    className="text-left rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-blue-300 hover:bg-white transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 mb-3">
                      <NivelIcon className="w-5 h-5 text-blue-700" />
                    </div>
                    <p className="font-['Manrope'] text-sm font-extrabold text-slate-950 leading-snug">
                      {cargo.nome}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {cargo.salario} · {cargo.materiasIds.length} matérias
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {!hasAccess && (
          <section className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5">
            <p className="text-sm font-bold text-amber-900">Acesso em análise</p>
            <p className="mt-2 text-sm text-amber-800 leading-relaxed">
              Seu login já está ativo e o cargo para treino já pode ser escolhido. Assim que o pagamento for confirmado, o botão de gerar simulado e a área de treino serão liberados.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
