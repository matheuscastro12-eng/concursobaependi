import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Eye, UserPlus, TrendingUp } from 'lucide-react';

interface TrafficSummary {
  days: number;
  total_views: number;
  unique_visitors: number;
  anonymous_views: number;
  authenticated_views: number;
  new_signups: number;
  conversion_rate: number;
  by_day: Array<{ day: string; views: number; visitors: number }>;
  by_path: Array<{ path: string; views: number }>;
}

const RANGES: Array<{ label: string; days: number }> = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
];

const TrafficMetrics = () => {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<TrafficSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void supabase.rpc('traffic_summary', { _days: days }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setData((data as TrafficSummary) ?? null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const maxDayViews = Math.max(1, ...(data?.by_day.map((d) => d.views) ?? [1]));

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="font-['Manrope'] font-extrabold text-base text-slate-950">Visitas e conversão</h2>
          <p className="text-xs text-slate-500">Quem chegou no app — anônimos e logados.</p>
        </div>
        <div className="inline-flex bg-slate-100 p-1 rounded-lg">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`h-8 px-3 rounded-md text-xs font-bold transition-colors ${
                days === r.days ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">Erro ao carregar: {error}</p>
      ) : !data ? (
        <p className="text-sm text-slate-500">Sem dados ainda.</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Kpi icon={Eye} label="Pageviews" value={data.total_views} />
            <Kpi icon={Users} label="Visitantes únicos" value={data.unique_visitors} />
            <Kpi icon={UserPlus} label="Cadastros" value={data.new_signups} />
            <Kpi
              icon={TrendingUp}
              label="Conversão"
              value={`${data.conversion_rate.toFixed(1)}%`}
              hint="cadastros / visitantes"
            />
          </div>

          {/* Gráfico simples por dia */}
          {data.by_day.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">
                Visitas por dia
              </p>
              <div className="flex items-end gap-1.5 h-24 border-b border-slate-200 pb-0">
                {data.by_day.map((d) => {
                  const heightPct = Math.max(4, (d.views / maxDayViews) * 100);
                  const dayLabel = new Date(d.day).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  });
                  return (
                    <div
                      key={d.day}
                      className="flex-1 flex flex-col items-center justify-end gap-1 group cursor-default"
                      title={`${d.views} visitas · ${d.visitors} visitantes em ${dayLabel}`}
                    >
                      <div
                        className="w-full bg-blue-700/80 group-hover:bg-blue-700 rounded-t-md transition-colors relative"
                        style={{ height: `${heightPct}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.views}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top páginas */}
          {data.by_path.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">
                Páginas mais visitadas
              </p>
              <div className="space-y-1.5">
                {data.by_path.slice(0, 8).map((p) => {
                  const pct = (p.views / data.total_views) * 100;
                  return (
                    <div key={p.path} className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-slate-700 truncate flex-1 min-w-0">
                        {p.path}
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">{p.views}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

const Kpi = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Eye;
  label: string;
  value: number | string;
  hint?: string;
}) => (
  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/40">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-3.5 w-3.5 text-blue-700" />
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
    </div>
    <p className="text-2xl font-extrabold text-slate-950 tabular-nums">{value}</p>
    {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
  </div>
);

export default TrafficMetrics;
