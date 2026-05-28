import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { listConcursos, DEFAULT_CONCURSO_SLUG, getConcursoBySlug } from '@/data/concursos';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';
import { useTrainingCargo } from '@/hooks/useTrainingCargo';
import { useToast } from '@/hooks/use-toast';
import { createStripeCheckoutSession } from '@/lib/paymentSubmissions';
import { Loader2 } from 'lucide-react';
import logoColor from '@/assets/logo-concursos.svg';
import { getTheme } from '@/lib/concursoTheme';
import { fetchPerformanceSummary, type PerformanceSummary } from '@/lib/attempts';

const DASHBOARD_CONCURSO_KEY = 'cai:dashboard:activeConcurso';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { hasAccess, status, planType, accessibleConcursoSlugs, loading: subLoading } = useSubscription();
  const { canAccessAdmin } = useAdmin();
  const { selectedCargo, selectedCargoSlug, setSelectedCargoSlug } = useTrainingCargo();
  const { toast } = useToast();
  const [paying, setPaying] = useState<string | null>(null);

  // Mostra TODOS os concursos: os pagos vão normais, os não-pagos ganham cadeado
  // e ao clicar disparam o fluxo de pagamento correspondente.
  const concursos = listConcursos();

  const hasAccessTo = (slug: string) => accessibleConcursoSlugs.includes(slug);
  const firstAccessible = accessibleConcursoSlugs[0] ?? DEFAULT_CONCURSO_SLUG;

  const [activeConcursoSlug, setActiveConcursoSlug] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONCURSO_SLUG;
    const stored = window.localStorage.getItem(DASHBOARD_CONCURSO_KEY);
    return (stored && getConcursoBySlug(stored)?.slug) || DEFAULT_CONCURSO_SLUG;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DASHBOARD_CONCURSO_KEY, activeConcursoSlug);
  }, [activeConcursoSlug]);

  // Se a tab ativa não é acessível mas o user tem outras, default = primeira acessível.
  useEffect(() => {
    if (
      accessibleConcursoSlugs.length > 0 &&
      !accessibleConcursoSlugs.includes(activeConcursoSlug)
    ) {
      setActiveConcursoSlug(firstAccessible);
    }
  }, [accessibleConcursoSlugs, activeConcursoSlug, firstAccessible]);

  // Sem acesso e sem perfil admin → manda pra landing.
  useEffect(() => {
    if (!subLoading && !hasAccess && !canAccessAdmin) {
      toast({
        title: 'Acesso necessário',
        description: 'Faça seu pagamento pra acessar o dashboard.',
        variant: 'destructive',
      });
    }
  }, [subLoading, hasAccess, canAccessAdmin, toast]);

  const hasAccessToActive = hasAccessTo(activeConcursoSlug) || canAccessAdmin;
  const activeConcurso =
    getConcursoBySlug(activeConcursoSlug) ?? getConcursoBySlug(DEFAULT_CONCURSO_SLUG)!;
  const cargos = activeConcurso.cargos;
  const editalInfo = {
    banca: activeConcurso.banca,
    numero: activeConcurso.numeroEdital,
    municipio: activeConcurso.municipio,
    uf: activeConcurso.uf,
  };

  // Se o cargo persistido não existir no concurso ativo, cai pro primeiro
  // cargo do concurso. Mantém o estado sempre consistente com a lista visível.
  const visibleCargo = cargos.find((c) => c.slug === selectedCargoSlug) ?? cargos[0];
  useEffect(() => {
    if (visibleCargo && visibleCargo.slug !== selectedCargoSlug) {
      setSelectedCargoSlug(visibleCargo.slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConcursoSlug]);
  const displayCargo = visibleCargo ?? selectedCargo;
  const theme = getTheme(activeConcursoSlug);

  // Resumo de desempenho do concurso ativo — alimenta os widgets de aluno.
  // Só busca pra slugs com acesso (RPC é best-effort e nunca lança).
  const [perf, setPerf] = useState<PerformanceSummary | null>(null);
  useEffect(() => {
    if (!hasAccessToActive) {
      setPerf(null);
      return;
    }
    let cancelled = false;
    setPerf(null);
    fetchPerformanceSummary(activeConcursoSlug).then((data) => {
      if (!cancelled) setPerf(data);
    });
    return () => {
      cancelled = true;
    };
  }, [activeConcursoSlug, hasAccessToActive]);

  const perfAccuracy =
    perf && perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;

  const handlePay = async () => {
    await handlePayForSlug(activeConcursoSlug);
  };

  // Dispara o fluxo de pagamento certo pra cada concurso.
  // - 'baependi' → Stripe checkout (mesmo handler do Auth.tsx).
  // - 'alagoa'  → página de PIX dedicada.
  const handlePayForSlug = async (slug: string) => {
    if (!user?.email) {
      navigate(`/auth?mode=criar&concurso=${slug}`);
      return;
    }
    if (slug === 'alagoa') {
      navigate('/c/alagoa/pagamento');
      return;
    }
    // Baependi (default): Stripe.
    setPaying(slug);
    try {
      const url = await createStripeCheckoutSession({ userId: user.id, email: user.email });
      window.location.assign(url);
    } catch (err) {
      setPaying(null);
      toast({
        title: 'Não conseguimos abrir o pagamento',
        description: err instanceof Error ? err.message : 'Tente novamente em alguns segundos.',
        variant: 'destructive',
      });
    }
  };

  // Click numa tab: se tem acesso → switch normal; senão → fluxo de compra.
  const handleTabClick = (slug: string) => {
    if (hasAccessTo(slug) || canAccessAdmin) {
      setActiveConcursoSlug(slug);
      return;
    }
    void handlePayForSlug(slug);
  };

  const userName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Aluno';
  }, [user]);

  const cargoHighlights = useMemo(
    () => cargos.filter((cargo) => cargo.slug !== displayCargo.slug).slice(0, 6),
    [displayCargo.slug],
  );

  // Guard de acesso DEPOIS de todos os hooks (evita "rendered fewer hooks").
  if (!subLoading && !hasAccess && !canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-2 flex items-center justify-center">
          <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {concursos.map((c) => {
              const active = c.slug === activeConcursoSlug;
              const locked = !hasAccessTo(c.slug) && !canAccessAdmin;
              const busy = paying === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => handleTabClick(c.slug)}
                  disabled={busy}
                  className={`inline-flex items-center gap-1.5 h-8 rounded-lg px-3.5 transition-all disabled:opacity-60 ${
                    active
                      ? `${theme.primaryBg} text-white shadow-sm`
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title={
                    locked
                      ? `${c.nome} — clique pra liberar acesso`
                      : `${c.nome} — ${c.banca}`
                  }
                >
                  {locked && (busy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <LockKeyhole className="h-3 w-3" />
                  ))}
                  {c.municipio}
                </button>
              );
            })}
          </div>
        </div>
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
                navigate(`/c/${activeConcursoSlug}/cargos/${slug}`);
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
          <div className={`rounded-[28px] bg-gradient-to-br ${theme.gradient} p-7 sm:p-9 text-white shadow-[0_24px_80px_-28px_rgba(30,58,138,0.45)]`}>
            <p className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-300 mb-4">
              <span className="w-7 h-px bg-amber-400" />
              {hasAccessToActive ? 'Acesso ativo' : 'Conta pronta'}
            </p>
            <h1 className="font-['Manrope'] text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.02]">
              Bem-vindo, {userName}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed">
              {hasAccessToActive
                ? `Seu acesso já está liberado. O foco agora é treinar para ${displayCargo.nome} com mais constância e menos dispersão.`
                : `Sua conta já está pronta. Assim que o acesso for liberado, você vai treinar para ${displayCargo.nome} com tudo organizado.`}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {hasAccessToActive ? (
                <button
                  onClick={() =>
                    navigate(`/c/${activeConcursoSlug}/exam?banca=${encodeURIComponent(editalInfo.banca)}&cargo=${encodeURIComponent(displayCargo.nome)}`)
                  }
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl text-sm font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
                >
                  Gerar simulado agora
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => void handlePay()}
                  disabled={paying !== null}
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl text-sm font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-60"
                >
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  {paying
                    ? 'Abrindo pagamento…'
                    : activeConcursoSlug === 'alagoa'
                      ? 'Liberar acesso · R$ 60 (PIX único)'
                      : 'Liberar acesso · R$ 40/mês'}
                </button>
              )}
              <button
                onClick={() => navigate(`/c/${activeConcursoSlug}/cargos/${displayCargo.slug}`)}
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
              ['Cargo atual', displayCargo.nome, Building2],
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

        {hasAccessToActive && (
          <section className="grid sm:grid-cols-2 gap-4">
            {/* Meu desempenho */}
            <button
              onClick={() => navigate(`/c/${activeConcursoSlug}/desempenho`)}
              className={`group text-left rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all ${theme.borderHover} ${theme.shadowHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <BarChart3 className={`w-5 h-5 ${theme.iconColor}`} />
                </div>
                <ArrowRight className={`w-5 h-5 text-slate-300 transition-transform group-hover:translate-x-0.5 ${theme.textHighlight.replace('text-', 'group-hover:text-')}`} />
              </div>
              <p className="font-['Manrope'] text-lg font-extrabold tracking-tight text-slate-950">
                Meu desempenho
              </p>
              {perf && perf.total > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="inline-flex items-baseline gap-1">
                    <span className={`font-['Manrope'] text-2xl font-extrabold ${theme.textHighlight}`}>
                      {perfAccuracy}%
                    </span>
                    <span className="text-xs text-slate-500">acerto</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {perf.streak} {perf.streak === 1 ? 'dia' : 'dias'}
                  </span>
                  <span className="text-sm text-slate-500">
                    <strong className="text-slate-700">{perf.total}</strong> respondidas
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Faça um simulado pra ver seus acertos por matéria e sua evolução.
                </p>
              )}
            </button>

            {/* Revisão de erros */}
            <button
              onClick={() => navigate(`/c/${activeConcursoSlug}/revisao`)}
              className={`group text-left rounded-2xl border bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 ${
                perf && perf.review_due > 0
                  ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                  : `border-slate-200 ${theme.borderHover} ${theme.shadowHover}`
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    perf && perf.review_due > 0 ? 'bg-amber-100' : 'bg-slate-50'
                  }`}
                >
                  <RefreshCw
                    className={`w-5 h-5 ${
                      perf && perf.review_due > 0 ? 'text-amber-600' : theme.iconColor
                    }`}
                  />
                </div>
                {perf && perf.review_due > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-amber-500 text-white text-xs font-extrabold">
                    {perf.review_due}
                  </span>
                ) : (
                  <ArrowRight className="w-5 h-5 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                )}
              </div>
              <p className="font-['Manrope'] text-lg font-extrabold tracking-tight text-slate-950">
                Revisão de erros
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {perf && perf.review_due > 0
                  ? `Você tem ${perf.review_due} ${perf.review_due === 1 ? 'questão' : 'questões'} pra revisar agora.`
                  : 'Revise no momento certo as questões que você errou.'}
              </p>
            </button>
          </section>
        )}

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
              Foque em {displayCargo.nome}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mt-4">
              Você já deixou um cargo selecionado no header. Agora é só entrar nas matérias dele e transformar o edital em treino prático.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                ['Simulados com cara de prova', BookOpenCheck],
                [`${displayCargo.materiasIds.length} matérias mapeadas`, FileText],
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
                  navigate(`/c/${activeConcursoSlug}/exam?banca=${encodeURIComponent(editalInfo.banca)}&cargo=${encodeURIComponent(displayCargo.nome)}`)
                }
                disabled={!hasAccessToActive}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition-colors disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                Gerar simulado de {displayCargo.nome}
              </button>
              <button
                onClick={() => navigate(`/c/${activeConcursoSlug}/cargos/${displayCargo.slug}`)}
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
                    onClick={() => navigate(`/c/${activeConcursoSlug}/cargos/${cargo.slug}`)}
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

        {!hasAccessToActive && (
          <section className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5">
            <p className="text-sm font-bold text-amber-900">
              Você ainda não tem acesso a {activeConcurso.municipio}
            </p>
            <p className="mt-2 text-sm text-amber-800 leading-relaxed">
              Para destravar os simulados e o treino deste concurso, libere o acesso pelo
              botão acima. Você pode estudar para mais de um concurso ao mesmo tempo.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
