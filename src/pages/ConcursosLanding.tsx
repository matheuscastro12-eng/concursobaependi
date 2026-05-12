import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, FileText, MapPin, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import logoColor from '@/assets/logo-concursos.svg';
import { listConcursos } from '@/data/concursos';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useSubscription } from '@/hooks/useSubscription';
import SocialProofBanner from '@/components/landing/SocialProofBanner';
import { getTheme } from '@/lib/concursoTheme';

const ConcursosLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading: authLoading } = useAuth();
  const { canAccessAdmin } = useAdmin();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const concursos = listConcursos();

  useEffect(() => {
    if (authLoading || subscriptionLoading) return;
    if (!user) return;
    const fromInternal = (location.state as { fromInternal?: boolean } | null)?.fromInternal;
    if (fromInternal) return;
    navigate(canAccessAdmin ? '/crm' : '/dashboard', { replace: true });
  }, [authLoading, canAccessAdmin, location.state, navigate, subscriptionLoading, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl cai-fade-in">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center gap-2.5">
            <img src={logoColor} alt="ConcursosAI" className="h-8 w-8" />
            <span className="font-['Manrope'] font-extrabold tracking-tight text-slate-900">
              ConcursosAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {(hasAccess || canAccessAdmin) && (
                  <button
                    onClick={() => navigate(canAccessAdmin ? '/crm' : '/dashboard')}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700 cai-interactive"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    {canAccessAdmin ? 'CRM' : 'Dashboard'}
                  </button>
                )}
                <button
                  onClick={signOut}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:border-red-200 hover:text-red-600 cai-interactive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth?mode=criar')}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition-colors hover:bg-blue-700 cai-interactive"
              >
                <LogIn className="h-3.5 w-3.5" />
                Criar conta
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-12">
        <div className="mb-10 text-center cai-slide-up">
          <p className="mb-3 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-blue-700">
            <span className="h-px w-7 bg-amber-500" />
            Preparação municipal
            <span className="h-px w-7 bg-amber-500" />
          </p>
          <h1 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-5xl">
            Escolha seu concurso
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Selecione o edital que você está estudando. Cada concurso tem cargos, matérias e
            estilo de banca próprios.
          </p>
        </div>

        <div className="mb-8">
          <SocialProofBanner />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {concursos.map((c) => {
            const ct = getTheme(c.slug);
            return (
            <button
              key={c.slug}
              onClick={() => navigate(`/c/${c.slug}`)}
              className={`group flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-[0_10px_40px_-24px_rgba(15,23,42,0.18)] transition-all ${ct.borderHover} ${ct.shadowHover} cai-soft-pop cai-interactive sm:p-8`}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 transition-transform group-hover:scale-110">
                  <Building2 className={`h-6 w-6 ${ct.iconColor}`} />
                </div>
                <div>
                  <p className={`text-[10.5px] font-bold uppercase tracking-[0.18em] ${ct.textHighlight}`}>
                    Edital {c.numeroEdital}
                  </p>
                  <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-950">
                    {c.municipio}
                  </h2>
                </div>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-slate-600">
                {c.nome} — preparação alinhada ao edital {c.numeroEdital} e ao estilo da banca{' '}
                <strong className="text-slate-800">{c.banca}</strong>.
              </p>

              <div className="mb-6 grid grid-cols-1 gap-2 text-[13px] text-slate-600 sm:grid-cols-2">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  {c.municipio}/{c.uf}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-amber-500" />
                  {c.banca}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-amber-500" />
                  {c.cargos.length} cargos mapeados
                </span>
                {c.inscricoesPeriodo && (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    Inscrições: {c.inscricoesPeriodo}
                  </span>
                )}
              </div>

              <div className={`mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${ct.gradient} px-5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.45)] transition-all group-hover:brightness-110 cai-sheen`}>
                Estudar
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
            );
          })}
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-8 text-center">
          <p className="text-xs text-slate-400">ConcursosAI · preparação focada por edital e banca</p>
        </footer>
      </main>
    </div>
  );
};

export default ConcursosLanding;
