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
import { NIVEL_LABEL, type Nivel } from '@/data/concursos';
import { useActiveConcurso } from '@/hooks/useActiveConcurso';
import logoColor from '@/assets/logo-concursos.svg';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useSubscription } from '@/hooks/useSubscription';
import InteractiveQuestionPreview from '@/components/landing/InteractiveQuestionPreview';
import SocialProofBanner from '@/components/landing/SocialProofBanner';

const NIVEL_ICON: Record<Nivel, typeof Building2> = {
  alfabetizado: Building2,
  fundamental: Building2,
  medio: Briefcase,
  medio_tecnico: Briefcase,
  superior: GraduationCap,
  superior_educacao: GraduationCap,
};

const shortLabel = (nivel: Nivel): string => {
  switch (nivel) {
    case 'alfabetizado': return 'Alfa.';
    case 'fundamental': return 'Fund.';
    case 'medio': return 'Médio';
    case 'medio_tecnico': return 'Téc.';
    case 'superior': return 'Superior';
    case 'superior_educacao': return 'Sup. Edu.';
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { canAccessAdmin } = useAdmin();
  const { hasAccess } = useSubscription();
  const { concurso, slug: concursoSlug } = useActiveConcurso();
  const cargos = concurso.cargos;
  const [search, setSearch] = useState('');
  const [activeNivel, setActiveNivel] = useState<Nivel | 'todos'>('todos');

  // Níveis disponíveis no concurso atual (mostra só os que aparecem)
  const nivelOptions = useMemo(
    () => Array.from(new Set(cargos.map((c) => c.nivel))) as Nivel[],
    [cargos],
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return cargos.filter((cargo) => {
      const matchesNivel = activeNivel === 'todos' || cargo.nivel === activeNivel;
      const matchesSearch = !term || cargo.nome.toLowerCase().includes(term);
      return matchesNivel && matchesSearch;
    });
  }, [search, activeNivel, cargos]);

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
            <span className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Preparação municipal
            </span>
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

      <main>
        <section className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10 xl:px-12">
          <div className="grid items-stretch gap-10 lg:grid-cols-[1.18fr_0.82fr] xl:gap-12">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] p-8 text-white shadow-[0_24px_80px_-28px_rgba(30,58,138,0.45)] cai-slide-up cai-sheen sm:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-20 cai-animated-grid" />
              <div className="relative z-10">
                <p className="mb-4 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-300 cai-slide-up cai-delay-1">
                  <span className="h-px w-7 bg-amber-400" />
                  Questões no padrão da banca
                </p>
                <h1 className="mb-5 font-['Manrope'] text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] cai-slide-up cai-delay-2 sm:text-5xl">
                  Estude para concurso municipal com simulados que parecem prova de verdade.
                </h1>
                <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-white/78 cai-slide-up cai-delay-3 sm:text-base">
                  Escolha o cargo, gere questões inéditas no estilo da banca e revise com
                  comentários claros, sem perder tempo com material genérico.
                </p>

                <div className="mb-6 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm cai-slide-up cai-delay-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                      Acesso mensal
                    </p>
                    <p className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] text-white">
                      R$ 40
                      <span className="text-base font-bold text-white/72">/mês</span>
                    </p>
                  </div>
                  <div className="hidden h-10 w-px bg-white/12 sm:block" />
                  <p className="max-w-md text-sm leading-relaxed text-white/80">
                    Entre para treinar com mais direção, revisar com clareza e manter seus
                    simulados organizados no painel.
                  </p>
                </div>

                <div className="mb-7 grid gap-3 cai-slide-up cai-delay-4 sm:grid-cols-3">
                  {[
                    ['Mais foco', 'Estude em cima do cargo e da matéria certa.'],
                    ['Mais velocidade', 'Transforme edital em treino em poucos minutos.'],
                    ['Mais confiança', 'Revise com comentários claros e objetivos.'],
                  ].map(([title, text]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm"
                    >
                      <p className="text-sm font-extrabold text-white">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/72">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 cai-slide-up cai-delay-5 sm:flex-row">
                  <button
                    onClick={() => navigate('/auth?mode=criar')}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-extrabold text-slate-950 transition-colors hover:bg-amber-300 cai-interactive"
                  >
                    Começar por R$ 40/mês
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => document.getElementById('cargos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition-colors hover:bg-white/15 cai-interactive"
                  >
                    Ver cargos disponíveis
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/80 cai-slide-up cai-delay-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-amber-300" />
                    Banca: <strong className="text-white">{concurso.banca}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-amber-300" />
                    {concurso.municipio}/{concurso.uf}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-amber-300" />
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
                <div
                  key={title}
                  className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop cai-interactive cai-delay-${index + 1}`}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 animate-pulse-glow">
                    <CheckCircle2 className="h-5 w-5 text-blue-700" />
                  </div>
                  <h2 className="font-['Manrope'] text-lg font-extrabold tracking-tight text-slate-950">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prova social: stats reais + selos institucionais */}
        <section className="mx-auto mt-10 max-w-3xl px-4 sm:px-6 lg:mt-14 lg:px-10 xl:px-12">
          <SocialProofBanner />
        </section>

        {/* Preview interativo: 3 questões reais respondíveis sem cadastro */}
        <section className="mx-auto mt-6 max-w-3xl px-4 sm:px-6 lg:px-10 xl:px-12">
          <InteractiveQuestionPreview concursoSlug={concursoSlug} />
        </section>

        <section className="mx-auto mt-10 max-w-[1440px] px-4 sm:px-6 lg:mt-14 lg:px-10 xl:px-12">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              [String(cargos.length), 'cargos já organizados', BadgeCheck],
              [concurso.banca, 'banca base calibrada', Target],
              ['Edital', 'virando treino prático', TrendingUp],
              ['Minutos', 'para começar a revisar', Clock3],
            ].map(([value, label, Icon]) => (
              <div
                key={value}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop cai-interactive"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-700" />
                </div>
                <p className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-950">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1440px] px-4 sm:px-6 lg:mt-14 lg:px-10 xl:px-12">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.55)] cai-slide-up sm:p-7">
              <p className="mb-3 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-amber-300">
                <Sparkles className="h-4 w-4" />
                Oferta de entrada
              </p>
              <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Um plano simples para estudar com mais direção.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/76">
                Em vez de comprar mais material solto, o aluno entra para treinar no cargo
                certo, com questões comentadas e uma rotina mais organizada desde o primeiro
                acesso.
              </p>
            </div>

            <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(37,99,235,0.28)] cai-slide-up sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700">
                    Assinatura mensal
                  </p>
                  <h3 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                    R$ 40
                    <span className="ml-2 text-lg font-bold text-slate-500 sm:text-xl">/mês</span>
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    Valor pensado para caber na rotina de estudo e entregar ganho prático logo
                    no começo.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auth?mode=criar')}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-800 cai-interactive"
                >
                  Assinar agora
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  'Simulados focados no cargo e na banca.',
                  'Comentários claros para revisar sem travar.',
                  'Histórico salvo para continuar depois.',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold leading-relaxed text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['1', 'Escolha seu cargo', 'Veja as matérias do edital e entre direto no que faz sentido para você.'],
              ['2', 'Gere o simulado', 'Selecione quantidade, banca e nível para criar questões sob medida.'],
              ['3', 'Revise e avance', 'Veja o comentário de cada resposta e volte para treinar quando quiser.'],
            ].map(([step, title, text]) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-200 bg-white p-5 cai-soft-pop cai-interactive"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-extrabold text-white">
                  {step}
                </div>
                <h3 className="font-['Manrope'] text-base font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1440px] px-4 sm:px-6 lg:mt-14 lg:px-10 xl:px-12">
          <div className="mb-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] cai-slide-up sm:p-7">
              <p className="mb-3 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700">
                <Quote className="h-4 w-4" />
                Por que isso funciona
              </p>
              <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                O candidato não quer tecnologia.
                <br />
                Ele quer sentir que a prova ficou mais previsível.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                A promessa mais forte aqui é simples: treinar com questões que parecem feitas
                para o concurso dele, com menos improviso e mais aderência ao edital.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ['"Parece questão de prova mesmo."', 'Percepção imediata de valor no primeiro uso.'],
                ['"Agora eu sei no que focar."', 'A sensação de direção vende mais do que volume de conteúdo.'],
                ['"Consigo revisar sem travar."', 'Comentário claro ajuda o aluno a voltar e continuar usando.'],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop cai-interactive"
                >
                  <p className="font-['Manrope'] text-lg font-extrabold tracking-tight text-slate-950">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] cai-slide-up sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-3 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700">
                  <Target className="h-4 w-4" />
                  Edital em destaque
                </p>
                <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                  {concurso.numeroEdital} · {concurso.municipio}/{concurso.uf}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  Veja os cargos, entenda onde está sua vaga e comece a treinar com mais
                  clareza, sem perder tempo pulando entre materiais soltos.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth?mode=criar')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-800 cai-interactive"
              >
                Criar conta para testar
                <Sparkles className="h-4 w-4 text-amber-300" />
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#2563EB] p-7 text-white shadow-[0_24px_80px_-28px_rgba(30,58,138,0.45)] cai-slide-up cai-sheen sm:p-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  Comece pelo seu edital
                </p>
                <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                  Crie a conta e teste o fluxo completo em poucos minutos.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/78 sm:text-base">
                  Entre por R$ 40/mês, escolha o cargo, gere o primeiro simulado e veja a
                  diferença entre questão genérica e preparação orientada por banca.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth?mode=criar')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-extrabold text-slate-950 transition-colors hover:bg-amber-300 cai-interactive"
              >
                Assinar por R$ 40/mês
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section
          id="cargos"
          className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-12"
        >
          <div className="mb-6">
            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-blue-700">
              Cargos disponíveis
            </p>
            <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Escolha por onde começar
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Filtre por nível e encontre rapidamente o cargo que combina com sua preparação.
            </p>
          </div>

          <section className="mb-6 flex flex-col gap-3 cai-slide-up cai-delay-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cargo (ex: enfermeiro, fiscal, professor...)"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
            </div>
            <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {(['todos', ...nivelOptions] as const).map((nivel) => {
                const active = activeNivel === nivel;
                const label =
                  nivel === 'todos'
                    ? 'Todos'
                    : NIVEL_LABEL[nivel as Nivel].replace('Ensino ', '');
                return (
                  <button
                    key={nivel}
                    onClick={() => setActiveNivel(nivel as Nivel | 'todos')}
                    className={`h-9 rounded-lg px-3.5 transition-all ${
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
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {filtered.map((cargo) => {
                const Icon = NIVEL_ICON[cargo.nivel];
                return (
                  <button
                    key={cargo.slug}
                    onClick={() => navigate(`/c/${concursoSlug}/cargos/${cargo.slug}`)}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-500/40 hover:shadow-[0_12px_32px_-12px_rgba(37,99,235,0.20)] cai-slide-up cai-interactive"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 transition-transform group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="h-[18px] w-[18px] text-blue-700 transition-transform group-hover:-translate-y-0.5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors group-hover:text-blue-600">
                        {shortLabel(cargo.nivel)}
                      </span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 font-['Manrope'] text-[15px] font-bold leading-snug text-slate-900">
                      {cargo.nome}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                      <span>
                        <strong className="text-slate-700">{cargo.vagas}</strong>{' '}
                        {cargo.vagas === 'CR' ? 'cad. reserva' : 'vagas'}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-blue-700">{cargo.salario}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[12px] font-semibold text-blue-700">
                      <span>{cargo.materiasIds.length} matérias</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          <footer className="mt-16 border-t border-slate-200 pt-8 text-center">
            <p className="text-xs text-slate-400">
              Concurso Público {concurso.numeroEdital} · {concurso.banca} · ConcursosAI
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default Home;
