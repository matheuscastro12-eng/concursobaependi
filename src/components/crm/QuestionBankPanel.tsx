import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cargos, materias as materiasMap, type Materia } from '@/data/baependi';
import { Loader2, Plus, Database, RefreshCw } from 'lucide-react';

interface BankRow {
  materia_id: string;
  nivel: 'basico' | 'avancado';
  num_alternativas: number;
  cnt: number;
  last_generated: string | null;
}

const TARGET_PER_LEVEL = 30;
const BATCH_SIZE = 15; // 15 questões por clique — mais rápido e dentro do timeout
const NIVEIS: Array<{ key: 'basico' | 'avancado'; label: string }> = [
  { key: 'basico', label: 'Médio' },
  { key: 'avancado', label: 'Superior' },
];

// Persiste batches em andamento em localStorage. Se admin trocar de aba ou
// recarregar, ao voltar a página detecta o batch ativo e faz polling pra ver
// se as questões já chegaram no banco.
interface PendingJob {
  key: string; // materia_id-nivel
  materia_id: string;
  nivel: 'basico' | 'avancado';
  countBefore: number;
  startedAt: number;
  expectedDelta: number;
}

const PENDING_KEY = 'concursosai.bank.pending.v1';
const POLL_TIMEOUT_MS = 120_000; // 2 min — gera bem menos que isso, mas margem
const POLL_INTERVAL_MS = 4_000;

const loadPending = (): PendingJob[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingJob[];
    if (!Array.isArray(parsed)) return [];
    // GC: descarta jobs antigos (> 5 min) — não vamos esperar mais que isso
    const now = Date.now();
    return parsed.filter((j) => now - j.startedAt < 5 * 60 * 1000);
  } catch {
    return [];
  }
};

const savePending = (jobs: PendingJob[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(jobs));
  } catch {
    /* */
  }
};

const QuestionBankPanel = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const pollAbortRef = useRef<Map<string, AbortController>>(new Map());

  const load = async (): Promise<BankRow[]> => {
    setLoading(true);
    const { data, error } = await supabase.rpc('question_bank_summary');
    setLoading(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return [];
    }
    const rows = (data as BankRow[]) ?? [];
    setSummary(rows);
    return rows;
  };

  // Mount: carrega summary + retoma jobs pendentes (caso admin tenha recarregado)
  useEffect(() => {
    void (async () => {
      await load();
      const existing = loadPending();
      setPendingJobs(existing);
      // Retoma polling pra cada job pendente
      existing.forEach((j) => startPolling(j));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling: verifica se a contagem aumentou pelo menos o expectedDelta.
  const startPolling = (job: PendingJob) => {
    if (pollAbortRef.current.has(job.key)) return; // já rodando
    const ctrl = new AbortController();
    pollAbortRef.current.set(job.key, ctrl);

    const tick = async () => {
      if (ctrl.signal.aborted) return;
      const elapsed = Date.now() - job.startedAt;
      if (elapsed > POLL_TIMEOUT_MS) {
        // Desistiu de esperar
        finishJob(job.key, 'timeout');
        return;
      }
      const rows = await load();
      const cur = rows
        .filter((r) => r.materia_id === job.materia_id && r.nivel === job.nivel)
        .reduce((acc, r) => acc + r.cnt, 0);
      if (cur >= job.countBefore + job.expectedDelta) {
        finishJob(job.key, 'success', cur - job.countBefore);
        return;
      }
      // Ainda não chegou tudo — agenda próximo tick
      window.setTimeout(() => void tick(), POLL_INTERVAL_MS);
    };
    void tick();
  };

  const finishJob = (key: string, reason: 'success' | 'timeout' | 'error', actualDelta?: number) => {
    const ctrl = pollAbortRef.current.get(key);
    if (ctrl) {
      ctrl.abort();
      pollAbortRef.current.delete(key);
    }
    setPendingJobs((prev) => {
      const next = prev.filter((j) => j.key !== key);
      savePending(next);
      return next;
    });
    if (reason === 'success') {
      toast({
        title: `+${actualDelta ?? 0} questões adicionadas`,
        description: 'Banco atualizado com sucesso.',
      });
    } else if (reason === 'timeout') {
      toast({
        title: 'Geração demorou demais',
        description: 'Verifique se o banco aumentou — talvez a chamada falhou. Tente de novo.',
        variant: 'destructive',
      });
    }
  };

  const allMaterias = useMemo(() => {
    const cargoByMateria = new Map<string, string>();
    for (const c of cargos) {
      for (const mid of c.materiasIds) {
        if (!cargoByMateria.has(mid)) cargoByMateria.set(mid, c.slug);
      }
    }
    return Object.entries(materiasMap).map(([id, data]) => ({
      id,
      data,
      firstCargoSlug: cargoByMateria.get(id) ?? null,
    }));
  }, []);

  const countOf = (materiaId: string, nivel: 'basico' | 'avancado'): number =>
    summary
      .filter((s) => s.materia_id === materiaId && s.nivel === nivel)
      .reduce((acc, s) => acc + s.cnt, 0);

  const isJobPending = (materiaId: string, nivel: 'basico' | 'avancado'): boolean =>
    pendingJobs.some((j) => j.materia_id === materiaId && j.nivel === nivel);

  const generateBatch = async (
    materiaId: string,
    materiaData: Materia,
    nivel: 'basico' | 'avancado',
    cargoSlug: string | null,
  ) => {
    const key = `${materiaId}-${nivel}`;
    if (isJobPending(materiaId, nivel)) return;

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) {
      toast({ title: 'Não autenticado', description: 'Faça login como admin.', variant: 'destructive' });
      return;
    }

    const countBefore = countOf(materiaId, nivel);

    // Marca o job como pendente IMEDIATAMENTE (UI dá feedback) e persiste.
    const job: PendingJob = {
      key,
      materia_id: materiaId,
      nivel,
      countBefore,
      startedAt: Date.now(),
      expectedDelta: BATCH_SIZE,
    };
    setPendingJobs((prev) => {
      const next = [...prev.filter((p) => p.key !== key), job];
      savePending(next);
      return next;
    });
    startPolling(job);

    // Dispara a geração FIRE-AND-FORGET. Não espera o response — se o admin
    // trocar de aba ou recarregar, o polling continua detectando quando as
    // questões aparecem no banco.
    fetch('/api/generate-bank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        cargo_slug: cargoSlug,
        materia_id: materiaId,
        materia_nome: materiaData.nome,
        materia_conteudo: materiaData.conteudo,
        categoria: materiaData.categoria,
        nivel,
        num_alternativas: 5,
        quantidade: BATCH_SIZE,
      }),
      // keepalive permite a request sobreviver à navegação/troca de aba.
      keepalive: true,
    }).catch(() => {
      /* não tem como tratar erro client-side se a request foi pra background;
         o polling vai detectar timeout e mostrar erro nesse caso. */
    });

    toast({
      title: 'Gerando questões…',
      description: `${materiaData.nome} · ${nivel === 'basico' ? 'Médio' : 'Superior'} · ${BATCH_SIZE} questões. Pode trocar de aba à vontade — a gente avisa quando terminar.`,
    });
  };

  const totalQuestions = useMemo(
    () => summary.reduce((acc, s) => acc + s.cnt, 0),
    [summary],
  );

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Database className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-['Manrope'] font-extrabold text-base text-slate-950">Banco de Questões</h2>
            <p className="text-xs text-slate-500">
              {totalQuestions} questões pré-geradas · meta {TARGET_PER_LEVEL}/nível
              {pendingJobs.length > 0 && (
                <span className="ml-2 text-amber-700 font-bold">
                  · {pendingJobs.length} {pendingJobs.length === 1 ? 'gerando' : 'gerando'}
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Atualizar
        </button>
      </div>

      {loading && summary.length === 0 ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500 bg-slate-50 border-y border-slate-200">
                <th className="text-left px-5 sm:px-6 py-2">Matéria</th>
                <th className="text-center px-3 py-2 w-32">Médio</th>
                <th className="text-center px-3 py-2 w-32">Superior</th>
                <th className="text-right px-5 sm:px-6 py-2 w-12">Total</th>
              </tr>
            </thead>
            <tbody>
              {allMaterias.map(({ id, data, firstCargoSlug }) => {
                const cBasico = countOf(id, 'basico');
                const cAvancado = countOf(id, 'avancado');
                return (
                  <tr key={id} className="border-b border-slate-100 hover:bg-slate-50/40">
                    <td className="px-5 sm:px-6 py-3">
                      <p className="font-semibold text-slate-900 text-[13px] leading-tight">
                        {data.nome}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                        {data.categoria}
                      </p>
                    </td>
                    {NIVEIS.map((n) => {
                      const cnt = n.key === 'basico' ? cBasico : cAvancado;
                      const pending = isJobPending(id, n.key);
                      const pct = Math.min(100, (cnt / TARGET_PER_LEVEL) * 100);
                      const colorBar =
                        cnt >= TARGET_PER_LEVEL
                          ? 'bg-emerald-500'
                          : cnt > 0
                            ? 'bg-amber-400'
                            : 'bg-slate-200';
                      return (
                        <td key={n.key} className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-[11px] tabular-nums text-slate-700 font-bold">
                                {cnt} <span className="text-slate-400 font-normal">/ {TARGET_PER_LEVEL}</span>
                              </p>
                              <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div className={`h-full ${colorBar}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <button
                              onClick={() => void generateBatch(id, data, n.key, firstCargoSlug)}
                              disabled={pending}
                              className="shrink-0 inline-flex items-center justify-center h-7 px-2 rounded-md bg-blue-700 text-white text-[10.5px] font-bold hover:bg-blue-800 transition-colors disabled:opacity-40"
                              title={`Gerar +${BATCH_SIZE} questões`}
                            >
                              {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3 mr-0.5" />{BATCH_SIZE}</>}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-5 sm:px-6 py-3 text-right text-[12px] font-bold text-slate-900 tabular-nums">
                      {cBasico + cAvancado}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
        Pode trocar de aba ou fechar a página: a geração continua no servidor.
        Quando voltar, abrimos o painel e o status atualiza automaticamente.
      </p>
    </section>
  );
};

export default QuestionBankPanel;
