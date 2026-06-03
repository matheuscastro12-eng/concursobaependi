import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home as HomeIcon,
  ListChecks,
  Lock,
  Stethoscope,
} from 'lucide-react';
import { concurso as afya, provasByTurma } from '@/data/afya';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getTheme } from '@/lib/concursoTheme';
import logoColor from '@/assets/logo-concursos.svg';

const t = getTheme('afya');
const STORAGE_KEY = 'afya:turma';
const turmas = afya.turmas ?? [];
const DEFAULT_TURMA = 'turma-61';

const isKnownTurma = (slug: string | null): slug is string =>
  !!slug && turmas.some((turma) => turma.slug === slug);

const AfyaHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { accessibleConcursoSlugs } = useSubscription();
  const hasAccess = accessibleConcursoSlugs.includes('afya');

  const [activeTurma, setActiveTurma] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_TURMA;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isKnownTurma(stored) ? stored : DEFAULT_TURMA;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, activeTurma);
    } catch {
      /* ignore (modo privado etc.) */
    }
  }, [activeTurma]);

  const provas = useMemo(() => provasByTurma(activeTurma), [activeTurma]);

  // Destino do fluxo de pagamento (access-aware).
  const goToPayment = () => {
    if (user) navigate('/c/afya/pagamento');
    else navigate('/auth?mode=criar&concurso=afya');
  };

  const openProva = (provaId: string) => {
    if (hasAccess) {
      navigate(`/c/afya/prova/${provaId}`);
    } else {
      goToPayment();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header padrão */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={logoColor} alt="ConcursosAI" className="h-8 w-8" />
            <span className="font-['Manrope'] font-extrabold tracking-tight text-slate-900">
              ConcursosAI
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:${t.textHighlight} ${t.borderHover} cai-interactive`}
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Início
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 pb-16 sm:px-6">
        {/* Hero ciano */}
        <section
          className={`mt-6 overflow-hidden rounded-3xl bg-gradient-to-br ${t.gradient} px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12 cai-slide-up`}
        >
          <p className="mb-3 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-cyan-100">
            <Stethoscope className="h-3.5 w-3.5" />
            Medicina · Provas reais comentadas
          </p>
          <h1 className="font-['Manrope'] text-3xl font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl">
            Prova Integradora · Afya
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cyan-50/90 sm:text-base">
            Estude com as provas integradoras reais do curso de Medicina — questões transcritas
            das devolutivas oficiais, cada uma com gabarito, resposta comentada e referência.
            Sem IA: conteúdo fiel à prova.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {afya.precoLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25">
              {afya.validade}
            </span>
          </div>
        </section>

        {/* Banner/CTA de liberação (só sem acesso) */}
        {!hasAccess && (
          <button
            onClick={goToPayment}
            className={`group mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/70 px-5 py-4 text-left transition-all ${t.borderHover} ${t.shadowHover} cai-soft-pop`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${t.iconColor} ring-1 ring-cyan-100`}>
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-950">
                  Liberar acesso — R$ 50 · PIX único
                </p>
                <p className="text-xs text-slate-600">
                  Pagamento único, acesso vitalício a todas as provas integradoras.
                </p>
              </div>
            </div>
            <ArrowRight className={`h-5 w-5 shrink-0 ${t.iconColor} transition-transform group-hover:translate-x-0.5`} />
          </button>
        )}

        {/* Abas de turma */}
        <div className="mt-8 flex items-center gap-2">
          {turmas.map((turma) => {
            const isActive = turma.slug === activeTurma;
            return (
              <button
                key={turma.slug}
                onClick={() => setActiveTurma(turma.slug)}
                className={`h-9 rounded-full px-4 text-sm font-bold transition-all cai-interactive ${
                  isActive
                    ? `${t.primaryBg} text-white shadow-sm`
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700'
                }`}
              >
                {turma.nome}
              </button>
            );
          })}
        </div>

        {/* Lista de provas */}
        <div className="mt-5 space-y-3">
          {provas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center cai-soft-pop">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Provas da {turmas.find((tu) => tu.slug === activeTurma)?.nome ?? 'turma'} em breve.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Estamos transcrevendo as devolutivas. Volte logo.
              </p>
            </div>
          ) : (
            provas.map((prova) => {
              const isRevisao = prova.modo === 'revisao';
              return (
                <button
                  key={prova.id}
                  onClick={() => openProva(prova.id)}
                  className={`group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition-all ${t.borderHover} ${t.shadowHover} cai-interactive cai-soft-pop`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 ${t.iconColor}`}>
                    {isRevisao ? <ListChecks className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-extrabold text-slate-950">
                        {prova.titulo}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
                          isRevisao
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                            : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                        }`}
                      >
                        {isRevisao ? 'Revisão comentada' : 'Múltipla escolha'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {prova.total} {prova.total === 1 ? 'questão' : 'questões'}
                      {!hasAccess && ' · acesso bloqueado'}
                    </p>
                  </div>
                  {hasAccess ? (
                    <ChevronRight className={`h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:${t.textHighlight}`} />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-slate-300" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AfyaHome;
