import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { listConcursos } from '@/data/concursos';
import {
  ShieldCheck,
  Users,
  ScrollText,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface LandingStats {
  students: number;
  questions_in_bank: number;
  simulados_generated: number;
}

const SocialProofBanner = () => {
  const [stats, setStats] = useState<LandingStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc('landing_stats')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setStats(data as LandingStats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Números só aparecem quando carregados; placeholder = "—" se vazio
  const studentsLabel = stats ? stats.students.toLocaleString('pt-BR') : '—';
  const simuladosLabel = stats
    ? stats.simulados_generated.toLocaleString('pt-BR')
    : '—';
  const concursos = listConcursos();
  const totalCargos = concursos.reduce((acc, c) => acc + c.cargos.length, 0);
  const cargosLabel = totalCargos.toString();

  return (
    <section className="relative">
      {/* Trust badges institucionais */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="px-5 py-3 sm:px-7 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2 flex-wrap">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-700">
            Preparação alinhada ao seu concurso municipal
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
            <Badge icon={Building2} text={`${concursos.length} concursos cobertos`} />
            <Badge icon={CheckCircle2} text="Banca da sua prova" accent />
          </div>
        </div>

        {/* KPIs reais (puxados do banco) */}
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          <Kpi
            icon={Users}
            value={studentsLabel}
            label="alunos cadastrados"
            highlight={!!stats && stats.students > 0}
          />
          <Kpi
            icon={Sparkles}
            value={simuladosLabel}
            label="simulados já gerados"
            highlight={!!stats && stats.simulados_generated > 0}
          />
          <Kpi
            icon={ScrollText}
            value={cargosLabel}
            label="cargos do edital cobertos"
            highlight
          />
        </div>
      </div>
    </section>
  );
};

const Badge = ({
  icon: Icon,
  text,
  accent = false,
}: {
  icon: typeof Building2;
  text: string;
  accent?: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold text-[10.5px] ${
      accent
        ? 'bg-blue-700/10 text-blue-700 border border-blue-200'
        : 'bg-slate-100 text-slate-600 border border-slate-200'
    }`}
  >
    <Icon className="h-3 w-3" />
    {text}
  </span>
);

const Kpi = ({
  icon: Icon,
  value,
  label,
  highlight = false,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  highlight?: boolean;
}) => (
  <div className="px-3 py-4 sm:px-5 sm:py-5 text-center sm:text-left">
    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
      <Icon
        className={`h-4 w-4 ${highlight ? 'text-amber-600' : 'text-slate-400'}`}
      />
      <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-500 hidden sm:inline">
        {label}
      </span>
    </div>
    <p className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums leading-none">
      {value}
    </p>
    <p className="mt-1 text-[10.5px] text-slate-500 sm:hidden leading-tight">{label}</p>
    <p className="mt-0.5 text-[10.5px] text-slate-500 hidden sm:block leading-tight">
      no app
    </p>
  </div>
);

export default SocialProofBanner;
