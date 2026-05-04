import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Quote,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cargos, editalInfo, NIVEL_LABEL, type Nivel } from '@/data/baependi';
import logoColor from '@/assets/logo-concursos.svg';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useSubscription } from '@/hooks/useSubscription';

const NIVEL_ICON: Record<Nivel, typeof Building2> = {
  fundamental: Building2,
  medio: Briefcase,
  superior: GraduationCap,
};

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { canAccessAdmin } = useAdmin();
  const { hasAccess } = useSubscription();
  const [search, setSearch] = useState('');
  const [activeNivel, setActiveNivel] = useState<Nivel | 'todos'>('todos');

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return cargos.filter((cargo) => {
      const matchesNivel = activeNivel === 'todos' || cargo.nivel === activeNivel;
      const matchesSearch = !term || cargo.nome.toLowerCase().includes(term);
      return matchesNivel && matchesSearch;
    });
  }, [search, activeNivel]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-30 cai-fade-in">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoColor} alt="ConcursosAI" className="h-8 w-8" />
            <span className="font-['Manrope'] font-extrabold text-slate-900 tracking-tight">
              ConcursosAI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Preparação municipal
            </span>
            {user ? (
              <div className="flex items-center gap-2">
                {(hasAccess || canAccessAdmin) && (
                  <button
                    onClick={() => navigate(canAccessAdmin ? '/crm' : '/dashboard')}
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:text-blue-700 hover:border-blue-200 transition-colors cai-interactive"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    {canAccessAdmin ? 'CRM' : 'Dashboard'}
                  </button>
                )}
                <button
                  onClick={signOut}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors cai-interactive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth?mode=criar')}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-slate-900 text-xs font-bold text-white hover:bg-blue-700 transition-colors cai-interactive"
              >
                <LogIn className="h-3.5 w-3.5" />
                Criar conta
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-10 sm:pt-14">
          <div className="grid lg:grid-cols-[1.18fr_0.82fr] gap-10 xl:gap-12 items-stretch">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] text-white p-8 sm:p-10 shadow-[0_24px_80px_-28px_rgba(30,58,138,0.45)] cai-slide-up cai-sheen">
              <div className="absolute inset-0 opacity-20 cai-animated-grid pointer-events-none" />
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-300 mb-4 cai-slide-up cai-delay-1">
                  <span className="w-7 h-px bg-amber-400" />
                  Questões no padrão da banca
                </p>
                <h1 className="font-['Manrope'] font-extrabold text-4xl sm:text-5xl tracking-[-0.03em] leading-[1.02] mb-5 cai-slide-up cai-delay-2">
                  Estude para concurso municipal com simulados que parecem prova de verdade.
                </h1>
                <p className="text-[15px] sm:text-base text-white/78 leading-relaxed max-w-2xl mb-6 cai-slide-up cai-delay-3">
                  Escolha o cargo, gere questões inéditas no estilo da banca e revise com comentários claros, sem perder tempo com material genérico.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 mb-7 cai-slide-up cai-delay-4">
                  {[
                    ['Mais foco', 'Estude em cima do cargo e da matéria certa.'],
                    ['Mais velocidade', 'Transforme edital em treino em poucos minutos.'],
                    ['Mais confiança', 'Revise com comentários claros e objetivos.'],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm">
                      <p className="text-sm font-extrabold text-white">{title}</p>
                      <p className="text-xs text-white/72 leading-relaxed mt-1">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 cai-slide-up cai-delay-5">
                  <button
                    onClick={() => navigate('/auth?mode=criar')}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-amber-400 text-slate-950 text-sm font-extrabold hover:bg-amber-300 transition-colors cai-interactive"
                  >
                    Começar agora
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => document.getElementById('cargos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-bold hover:bg-white/15 transition-colors cai-interactive"
                  >
                    Ver cargos disponíveis
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/80 cai-slide-up cai-delay-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-300" />
                    Banca: <strong className="text-white">{editalInfo.banca}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-300" />
                    {editalInfo.municipio}/{editalInfo.uf}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-300" />
                    {cargos.length} cargos mapeados
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ['Questões com cara de prova', 'Enunciados mais objetivos, comentários claros e cobrança alinhada ao edital.'],
                ['Seu estudo mais organizado', 'Entre, gere por matéria e volte depois com tudo salvo no seu painel.'],
                ['Mais prática, menos dispersão', 'Você foca no cargo certo, na banca certa e no conteúdo que realmente cai.'],
              ].map(([title, text], index) => (
                <div key={title} className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop cai-interactive cai-delay-${index + 1}`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 animate-pulse-glow">
                    <CheckCircle2 className="w-5 h-5 text-blue-700" />
                  </div>
                  <h2 className="font-['Manrope'] text-lg font-extrabold tracking-tight text-slate-950">{title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-10 sm:mt-14">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              ['57', 'cargos já organizados', BadgeCheck],
              ['INEPAM', 'banca base calibrada', Target],
              ['Edital', 'virando treino prático', TrendingUp],
              ['Minutos', 'para começar a revisar', Clock3],
            ].map(([value, label, Icon]) => (
              <div key={value} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop cai-interactive">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <p className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>
                <p className="text-sm text-slate-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-10 sm:mt-14">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ['1', 'Escolha seu cargo', 'Veja as matérias do edital e entre direto no que faz sentido para você.'],
              ['2', 'Gere o simulado', 'Selecione quantidade, banca e nível para criar questões sob medida.'],
              ['3', 'Revise e avance', 'Veja o comentário de cada resposta e volte para treinar quando quiser.'],
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5 cai-soft-pop cai-interactive">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-extrabold flex items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="font-['Manrope'] text-base font-extrabold text-slate-950">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-10 sm:mt-14">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5 mb-10">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-7 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] cai-slide-up">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-3 inline-flex items-center gap-2">
                <Quote className="w-4 h-4" />
                Por que isso funciona
              </p>
              <h2 className="font-['Manrope'] text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-slate-950">
                O candidato não quer "IA".
                <br />
                Ele quer sentir que a prova ficou mais previsível.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mt-4 max-w-2xl">
                A promessa mais forte aqui é simples: treinar com questões que parecem feitas para o concurso dele, com menos improviso e mais aderência ao edital.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ['"Parece questão de prova mesmo."', 'Percepção imediata de valor no primeiro uso.'],
                ['"Agora eu sei no que focar."', 'A sensação de direção vende mais do que volume de conteúdo.'],
                ['"Consigo revisar sem travar."', 'Comentário claro ajuda o aluno a voltar e continuar usando.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop cai-interactive">
                  <p className="font-['Manrope'] text-lg font-extrabold tracking-tight text-slate-950">{title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] cai-slide-up">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-3 inline-flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Edital em destaque
                </p>
                <h2 className="font-['Manrope'] text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-slate-950">
                  {editalInfo.numero} · {editalInfo.municipio}/{editalInfo.uf}
                </h2>
                <p className="text-base text-slate-600 leading-relaxed mt-3">
                  Uma vitrine pronta para transformar visitante em cadastro: contexto do concurso, cargos filtráveis e entrada direta para geração de simulados.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth?mode=criar')}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition-colors cai-interactive"
              >
                Criar conta para testar
                <Sparkles className="h-4 w-4 text-amber-300" />
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-10">
          <div className="rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#2563EB] p-7 sm:p-9 text-white shadow-[0_24px_80px_-28px_rgba(30,58,138,0.45)] cai-slide-up cai-sheen">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-300 mb-3">
                  Comece pelo seu edital
                </p>
                <h2 className="font-['Manrope'] text-3xl sm:text-4xl font-extrabold tracking-[-0.03em]">
                  Crie a conta e teste o fluxo completo em poucos minutos.
                </h2>
                <p className="text-sm sm:text-base text-white/78 mt-3 leading-relaxed">
                  Entre, escolha o cargo, gere o primeiro simulado e veja a diferença entre questão genérica e preparação orientada por banca.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth?mode=criar')}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-amber-400 text-slate-950 text-sm font-extrabold hover:bg-amber-300 transition-colors cai-interactive"
              >
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section id="cargos" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 sm:py-16">
          <div className="mb-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-blue-700 mb-3">
              Cargos disponíveis
            </p>
            <h2 className="font-['Manrope'] text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-slate-950">
              Escolha por onde começar
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
              Filtre por nível e encontre rapidamente o cargo que combina com sua preparação.
            </p>
          </div>

          <section className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center cai-slide-up cai-delay-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cargo (ex: enfermeiro, fiscal, professor...)"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors"
              />
            </div>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['todos', 'fundamental', 'medio', 'superior'] as const).map((nivel) => {
                const active = activeNivel === nivel;
                const label = nivel === 'todos' ? 'Todos' : NIVEL_LABEL[nivel].replace('Ensino ', '');
                return (
                  <button
                    key={nivel}
                    onClick={() => setActiveNivel(nivel)}
                    className={`px-3.5 h-9 rounded-lg transition-all ${
                      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-sm text-slate-500">Nenhum cargo encontrado para "{search}".</p>
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((cargo) => {
                const Icon = NIVEL_ICON[cargo.nivel];
                return (
                  <button
                    key={cargo.slug}
                    onClick={() => navigate(`/cargos/${cargo.slug}`)}
                    className="group text-left bg-white rounded-2xl border border-slate-200 p-5 transition-all hover:border-blue-500/40 hover:shadow-[0_12px_32px_-12px_rgba(37,99,235,0.20)] cai-slide-up cai-interactive"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="w-[18px] h-[18px] text-blue-700 transition-transform group-hover:-translate-y-0.5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 group-hover:text-blue-600 transition-colors">
                        {cargo.nivel === 'fundamental' ? 'Fund.' : cargo.nivel === 'medio' ? 'Médio' : 'Superior'}
                      </span>
                    </div>
                    <h3 className="font-['Manrope'] font-bold text-[15px] text-slate-900 leading-snug mb-2 line-clamp-2">
                      {cargo.nome}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                      <span><strong className="text-slate-700">{cargo.vagas}</strong> {cargo.vagas === 'CR' ? 'cad. reserva' : 'vagas'}</span>
                      <span>·</span>
                      <span className="text-blue-700 font-semibold">{cargo.salario}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[12px] text-blue-700 font-semibold">
                      <span>{cargo.materiasIds.length} matérias</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              Concurso Público {editalInfo.numero} · {editalInfo.banca} · ConcursosAI
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default Home;
