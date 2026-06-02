import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Database as DatabaseIcon, Zap } from 'lucide-react';
import { ConcursoBadge } from '@/pages/CRM';

type ConcursoFilter = 'todos' | 'baependi' | 'alagoa';

type AiUsageSummary = {
  total: number;
  today: number;
  last_7d: number;
  ia_calls: number;
  ia_today: number;
  by_feature: Array<{ feature: string; cnt: number }>;
  by_source: Array<{ source: string; cnt: number }>;
  by_concurso: Array<{ concurso_slug: string; cnt: number }>;
  by_day: Array<{ day: string; total: number; ia: number }>;
};

type AiCallMeta = {
  tema?: string | null;
  banca?: string | null;
  cargo?: string | null;
  cargoSlug?: string | null;
  nivel?: string | null;
  quantidade?: number | null;
} | null;

type AiCallRow = {
  id: string;
  created_at: string;
  feature: string;
  source: string;
  concurso_slug: string | null;
  meta: AiCallMeta;
  user_id: string;
  full_name: string | null;
  email: string | null;
};

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const FEATURE_LABELS: Record<string, string> = {
  exam: 'Simulado',
  assistant: 'Tutor',
  explain: 'Explicação',
};

function featureLabel(feature: string) {
  return FEATURE_LABELS[feature] ?? feature;
}

function SourceBadge({ source }: { source: string }) {
  const config =
    source === 'ia'
      ? { label: 'IA · custo', tone: 'bg-amber-50 text-amber-700 border-amber-200' }
      : source === 'bank'
        ? { label: 'Banco · grátis', tone: 'bg-blue-50 text-blue-700 border-blue-200' }
        : source === 'cache'
          ? { label: 'Cache · grátis', tone: 'bg-slate-100 text-slate-600 border-slate-200' }
          : { label: source, tone: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.tone}`}>
      {config.label}
    </span>
  );
}

const AiHistory = () => {
  const [concursoFilter, setConcursoFilter] = useState<ConcursoFilter>('todos');
  const [summary, setSummary] = useState<AiUsageSummary | null>(null);
  const [rows, setRows] = useState<AiCallRow[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resumo agregado: carrega uma vez (não depende do filtro de concurso).
  useEffect(() => {
    let cancelled = false;
    setLoadingSummary(true);
    void (supabase as any).rpc('ai_usage_summary').then(({ data, error }: { data: unknown; error: { message: string } | null }) => {
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setSummary((data as AiUsageSummary) ?? null);
      }
      setLoadingSummary(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Histórico: refaz a query quando o filtro de concurso muda.
  useEffect(() => {
    let cancelled = false;
    setLoadingRows(true);
    const slug = concursoFilter === 'todos' ? null : concursoFilter;
    void (supabase as any)
      .rpc('ai_call_history', { _limit: 100, _concurso_slug: slug })
      .then(({ data, error }: { data: unknown; error: { message: string } | null }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setRows((data as AiCallRow[]) ?? []);
        }
        setLoadingRows(false);
      });
    return () => {
      cancelled = true;
    };
  }, [concursoFilter]);

  const maxDayTotal = useMemo(
    () => Math.max(1, ...(summary?.by_day.map((d) => d.total) ?? [1])),
    [summary],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <div>
            <h2 className="font-['Manrope'] text-lg font-extrabold text-slate-950">Histórico de IA</h2>
            <p className="text-xs text-slate-500">Gerações e chamadas dos alunos — IA custa, banco e cache são grátis.</p>
          </div>
        </div>
        <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['todos', 'baependi', 'alagoa'] as const).map((slug) => (
            <button
              key={slug}
              onClick={() => setConcursoFilter(slug)}
              className={`px-3.5 h-9 rounded-lg transition-all ${
                concursoFilter === slug ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {slug === 'todos' ? 'Todos concursos' : slug === 'baependi' ? 'Baependi' : 'Alagoa'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          Erro ao carregar: {error}
        </p>
      )}

      {/* ── Cards de resumo ─────────────────────────────────────── */}
      {loadingSummary ? (
        <div className="h-28 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
            <SummaryCard icon={DatabaseIcon} label="Chamadas totais" value={summary.total} tone="slate" />
            <SummaryCard icon={DatabaseIcon} label="Hoje" value={summary.today} tone="slate" />
            <SummaryCard icon={DatabaseIcon} label="Últimos 7 dias" value={summary.last_7d} tone="slate" />
            <SummaryCard icon={Zap} label="Chamadas IA (custo)" value={summary.ia_calls} tone="amber" />
            <SummaryCard icon={Zap} label="IA hoje" value={summary.ia_today} tone="amber" />
          </div>

          {/* Mini-gráfico por dia: total vs IA */}
          {summary.by_day.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Chamadas por dia (30d)
                </p>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-slate-300" /> Total
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-amber-500" /> IA
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-24 border-b border-slate-200">
                {summary.by_day.map((d) => {
                  const totalPct = Math.max(4, (d.total / maxDayTotal) * 100);
                  const iaPct = d.total > 0 ? (d.ia / d.total) * 100 : 0;
                  const dayLabel = new Date(d.day).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  });
                  return (
                    <div
                      key={d.day}
                      className="flex-1 flex flex-col items-center justify-end gap-1 group cursor-default"
                      title={`${d.total} chamadas · ${d.ia} via IA em ${dayLabel}`}
                    >
                      <div
                        className="w-full bg-slate-300 group-hover:bg-slate-400 rounded-t-md transition-colors relative flex flex-col justify-end overflow-hidden"
                        style={{ height: `${totalPct}%` }}
                      >
                        <div className="w-full bg-amber-500" style={{ height: `${iaPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="mb-5 text-sm text-slate-500">Sem dados de uso ainda.</p>
      )}

      {/* ── Tabela do histórico ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Últimas chamadas
        </p>
        {!loadingRows && <span className="text-[11px] text-slate-400">{rows.length} registros</span>}
      </div>

      {loadingRows ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Nenhuma chamada de IA registrada para esse filtro.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-3 font-bold">Aluno</th>
                <th className="py-2 pr-3 font-bold">Tipo</th>
                <th className="py-2 pr-3 font-bold">Origem</th>
                <th className="py-2 pr-3 font-bold">Concurso</th>
                <th className="py-2 pr-3 font-bold">Tema</th>
                <th className="py-2 pr-3 font-bold whitespace-nowrap">Data/hora</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="py-2.5 pr-3 align-top">
                    <p className="font-semibold text-slate-900 leading-tight">{row.full_name || 'Sem nome'}</p>
                    {row.email && <p className="text-xs text-slate-500 leading-tight">{row.email}</p>}
                  </td>
                  <td className="py-2.5 pr-3 align-top text-slate-700 whitespace-nowrap">{featureLabel(row.feature)}</td>
                  <td className="py-2.5 pr-3 align-top">
                    <SourceBadge source={row.source} />
                  </td>
                  <td className="py-2.5 pr-3 align-top">
                    {row.concurso_slug ? <ConcursoBadge slug={row.concurso_slug} /> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="py-2.5 pr-3 align-top text-slate-700 max-w-[220px]">
                    <span className="line-clamp-2">{row.meta?.tema || '—'}</span>
                  </td>
                  <td className="py-2.5 pr-3 align-top text-slate-500 whitespace-nowrap">
                    {dateTime.format(new Date(row.created_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Zap;
  label: string;
  value: number | string;
  tone: 'slate' | 'amber';
}) => {
  const isAmber = tone === 'amber';
  return (
    <div
      className={`rounded-xl border p-3 ${
        isAmber ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-slate-50/40'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-3.5 w-3.5 ${isAmber ? 'text-amber-600' : 'text-blue-700'}`} />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      </div>
      <p className={`text-2xl font-extrabold tabular-nums ${isAmber ? 'text-amber-700' : 'text-slate-950'}`}>{value}</p>
    </div>
  );
};

export default AiHistory;
