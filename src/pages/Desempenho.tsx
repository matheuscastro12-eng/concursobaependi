import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Target,
  CheckCircle2,
  CalendarCheck,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { useActiveConcurso } from '@/hooks/useActiveConcurso';
import { fetchPerformanceSummary, type PerformanceSummary } from '@/lib/attempts';
import { getTheme } from '@/lib/concursoTheme';
import logoColor from '@/assets/logo-concursos.svg';

const MIN_QUESTIONS_FOR_WEAKNESS = 4;

const accuracyColor = (accuracy: number): string => {
  if (accuracy < 60) return 'bg-red-500';
  if (accuracy < 80) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const accuracyTextColor = (accuracy: number): string => {
  if (accuracy < 60) return 'text-red-600';
  if (accuracy < 80) return 'text-amber-600';
  return 'text-emerald-600';
};

const safeDay = (day: string): string => {
  try {
    return format(parseISO(day), 'dd/MM');
  } catch {
    return day;
  }
};

const Desempenho = () => {
  const navigate = useNavigate();
  const { concurso, slug } = useActiveConcurso();
  const theme = getTheme(slug);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPerformanceSummary(slug).then((data) => {
      if (cancelled) return;
      setSummary(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const accuracy = useMemo(() => {
    if (!summary || summary.total === 0) return 0;
    return Math.round((summary.correct / summary.total) * 100);
  }, [summary]);

  // Matérias ordenadas da MENOR accuracy pra maior (pontos fracos primeiro).
  const sortedMaterias = useMemo(() => {
    if (!summary) return [];
    return [...summary.by_materia].sort((a, b) => a.accuracy - b.accuracy);
  }, [summary]);

  // Recomendação: matéria com >= MIN questões e menor accuracy.
  const weakest = useMemo(() => {
    if (!summary) return null;
    const eligible = summary.by_materia.filter(
      (m) => m.total >= MIN_QUESTIONS_FOR_WEAKNESS,
    );
    if (!eligible.length) return null;
    return eligible.reduce((min, m) => (m.accuracy < min.accuracy ? m : min));
  }, [summary]);

  const chartData = useMemo(() => {
    if (!summary) return [];
    return summary.by_day.map((d) => ({
      day: safeDay(d.day),
      total: d.total,
      correct: d.correct,
    }));
  }, [summary]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-30 cai-fade-in">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 text-sm font-medium text-slate-600 ${theme.textHighlight.replace('text-', 'hover:text-')} transition-colors cai-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 rounded-md`}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao dashboard
          </button>
          <div className="flex items-center gap-2">
            <img src={logoColor} alt="ConcursosAI" className="h-7 w-7" />
            <span className="font-['Manrope'] font-bold text-sm text-slate-900">ConcursosAI</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-6 cai-slide-up">
          <p className={`inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] ${theme.textHighlight} mb-3`}>
            <span className="w-6 h-px bg-amber-500" />
            {concurso.municipio}/{concurso.uf} · Desempenho
          </p>
          <h1 className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl tracking-[-0.02em] text-slate-900 flex items-center gap-3">
            <BarChart3 className={`w-7 h-7 ${theme.iconColor}`} />
            Meu desempenho
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3 cai-fade-in">
            <Loader2 className={`w-8 h-8 animate-spin ${theme.iconColor}`} />
            <p className="text-sm text-slate-500">Carregando suas estatísticas…</p>
          </div>
        ) : !summary || summary.total === 0 ? (
          <EmptyState slug={slug} theme={theme} />
        ) : (
          <div className="space-y-8">
            {/* Hero de stats */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 cai-slide-up">
              <StatCard
                icon={Target}
                label="Respondidas"
                value={String(summary.total)}
                iconClass={theme.iconColor}
              />
              <StatCard
                icon={CheckCircle2}
                label="Acerto geral"
                value={`${accuracy}%`}
                iconClass={accuracyTextColor(accuracy)}
              />
              <StatCard
                icon={Flame}
                label="Streak"
                value={`${summary.streak} ${summary.streak === 1 ? 'dia' : 'dias'}`}
                iconClass="text-orange-500"
              />
              <StatCard
                icon={CalendarCheck}
                label="Hoje"
                value={String(summary.today)}
                iconClass={theme.iconColor}
              />
              <StatCard
                icon={RefreshCw}
                label="Revisões"
                value={String(summary.review_due)}
                iconClass={summary.review_due > 0 ? 'text-amber-600' : 'text-slate-400'}
              />
            </section>

            {/* Banner de recomendação */}
            {weakest && (
              <section className={`rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 cai-slide-up cai-delay-1`}>
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Foque em <span className="underline decoration-amber-400">{weakest.tema}</span> — seu ponto mais fraco
                    </p>
                    <p className="text-[13px] text-amber-800 mt-0.5">
                      {Math.round(weakest.accuracy)}% de acerto em {weakest.total} questões.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(`/c/${slug}/exam?tema=${encodeURIComponent(weakest.tema)}`)
                  }
                  className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl ${theme.primaryBg} ${theme.primaryHover} text-white text-sm font-bold transition-colors cai-interactive shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Treinar {weakest.tema}
                </button>
              </section>
            )}

            {/* Desempenho por matéria */}
            {sortedMaterias.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-slide-up cai-delay-2">
                <h2 className="font-['Manrope'] font-bold text-lg text-slate-900 mb-1">
                  Desempenho por matéria
                </h2>
                <p className="text-[13px] text-slate-500 mb-5">
                  Seus pontos fracos aparecem primeiro.
                </p>
                <div className="space-y-4">
                  {sortedMaterias.map((m) => (
                    <div key={m.tema}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="text-[13px] font-semibold text-slate-800 truncate">
                          {m.tema}
                        </span>
                        <span className="text-[12px] font-medium text-slate-500 shrink-0">
                          {m.correct}/{m.total}{' '}
                          <span className={`font-bold ${accuracyTextColor(m.accuracy)}`}>
                            {Math.round(m.accuracy)}%
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${accuracyColor(m.accuracy)}`}
                          style={{ width: `${Math.max(2, Math.min(100, m.accuracy))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Evolução (últimos 30 dias) */}
            {chartData.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-slide-up cai-delay-3">
                <h2 className="font-['Manrope'] font-bold text-lg text-slate-900 mb-1 flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${theme.iconColor}`} />
                  Evolução (últimos 30 dias)
                </h2>
                <p className="text-[13px] text-slate-500 mb-5">
                  Questões respondidas e acertos por dia.
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCorrect" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={16}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                        boxShadow: '0 8px 24px -12px rgba(15,23,42,0.2)',
                      }}
                      labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'total' ? 'Respondidas' : 'Acertos',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      fill="url(#gradTotal)"
                      name="total"
                    />
                    <Area
                      type="monotone"
                      dataKey="correct"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#gradCorrect)"
                      name="correct"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 text-[12px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-slate-400" /> Respondidas
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-emerald-500" /> Acertos
                  </span>
                </div>
              </section>
            )}

            {/* CTA Revisão */}
            {summary.review_due > 0 && (
              <section className={`rounded-2xl bg-gradient-to-br ${theme.gradient} p-6 sm:p-7 text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.45)] cai-slide-up cai-delay-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-amber-300 mb-2 inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Revisão espaçada
                    </p>
                    <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-[-0.02em]">
                      Você tem {summary.review_due}{' '}
                      {summary.review_due === 1 ? 'questão' : 'questões'} pra revisar
                    </h2>
                    <p className="mt-1.5 text-sm text-white/80">
                      Reforce o que você errou no momento certo de memorização.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/c/${slug}/revisao`)}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-amber-400 text-slate-950 text-sm font-extrabold hover:bg-amber-300 transition-colors cai-interactive shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-300"
                  >
                    Revisar agora
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-soft-pop">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
        <Icon className={`w-[18px] h-[18px] ${iconClass}`} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 font-['Manrope'] text-xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  slug,
  theme,
}: {
  slug: string;
  theme: ReturnType<typeof getTheme>;
}) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-14 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-slide-up max-w-xl mx-auto">
      <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-5`}>
        <BarChart3 className={`w-7 h-7 ${theme.iconColor}`} />
      </div>
      <h2 className="font-['Manrope'] font-extrabold text-xl text-slate-900 mb-2">
        Você ainda não respondeu nenhuma questão
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">
        Faça seu primeiro simulado! Conforme você responde, mostramos aqui seus acertos por
        matéria, sua evolução e o que revisar.
      </p>
      <button
        onClick={() => navigate(`/c/${slug}`)}
        className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl ${theme.primaryBg} ${theme.primaryHover} text-white text-sm font-bold transition-colors cai-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        Fazer meu primeiro simulado
      </button>
    </div>
  );
}

export default Desempenho;
