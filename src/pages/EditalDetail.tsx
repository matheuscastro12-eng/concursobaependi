import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';
import { useEditais, type EditalMateria } from '@/hooks/useEditais';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageSkeleton from '@/components/PageSkeleton';
import { ArrowLeft, Sparkles, BookOpen, Hash, Weight } from 'lucide-react';

const EditalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { fetchEditalMaterias } = useEditais();
  const navigate = useNavigate();

  const [edital, setEdital] = useState<Record<string, unknown> | null>(null);
  const [materias, setMaterias] = useState<EditalMateria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      setLoading(true);
      try {
        const { data, error: e } = await supabase
          .from('editais')
          .select('*')
          .eq('id', id)
          .single();
        if (e) throw e;
        setEdital(data as Record<string, unknown>);

        const ms = await fetchEditalMaterias(id);
        setMaterias(ms);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, fetchEditalMaterias]);

  if (authLoading || subLoading || adminLoading) return <PageSkeleton variant="dashboard" />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasAccess && !isAdmin) return <Navigate to="/pricing" replace />;

  const handleGerarQuestoes = (materia: EditalMateria) => {
    const params = new URLSearchParams({ tema: materia.nome });
    if (edital?.banca) params.set('banca', String(edital.banca));
    if (edital?.cargo) params.set('cargo', String(edital.cargo));
    navigate(`/exam?${params.toString()}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/editais')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#2563EB] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Meus editais
        </button>

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        ) : (
          <>
            {/* Header do edital */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_1px_2px_rgba(25,28,29,0.04)] mb-8">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#1D4ED8] inline-flex items-center gap-2.5 mb-3">
                <span className="w-6 h-px bg-[#F59E0B]" />
                Edital
              </p>
              <h1 className="font-['Manrope'] font-bold text-2xl sm:text-3xl tracking-[-0.02em] text-[#191C1D] mb-2">
                {String(edital?.titulo ?? '')}
              </h1>
              <div className="flex flex-wrap gap-2 text-xs text-[#4a5568]">
                {edital?.banca && <span className="px-2 py-1 rounded-md bg-slate-100 font-semibold">{String(edital.banca)}</span>}
                {edital?.cargo && <span className="px-2 py-1 rounded-md bg-slate-100 font-semibold">{String(edital.cargo)}</span>}
                {edital?.municipio && <span className="px-2 py-1 rounded-md bg-slate-100">{String(edital.municipio)}</span>}
                {edital?.ano && <span className="px-2 py-1 rounded-md bg-slate-100">{String(edital.ano)}</span>}
              </div>
            </div>

            {/* Matérias */}
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-['Manrope'] font-bold text-lg text-[#191C1D]">
                Matérias cobradas
                <span className="ml-2 text-sm font-medium text-[#94a3b8]">
                  {materias.length} disciplina{materias.length !== 1 ? 's' : ''}
                </span>
              </h2>
            </div>

            {materias.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-[#4a5568]">
                Nenhuma matéria extraída. O edital pode estar em processamento — aguarde e recarregue a página.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {materias.map((m) => (
                  <MateriaCard key={m.id} materia={m} onGerar={() => handleGerarQuestoes(m)} />
                ))}
              </div>
            )}

            {/* CTA geral */}
            {materias.length > 0 && (
              <div className="mt-8 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5">
                <p className="text-sm font-semibold text-[#B45309] mb-1">Dica</p>
                <p className="text-sm text-[#4a5568] leading-relaxed">
                  Clique em "Gerar questões" em qualquer matéria para abrir o gerador com o tema e a banca pré-preenchidos.
                  Você pode ajustar o nível de dificuldade e a quantidade de questões antes de gerar.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditalDetail;

function MateriaCard({ materia, onGerar }: { materia: EditalMateria; onGerar: () => void }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_2px_rgba(25,28,29,0.04)] hover:shadow-[0_6px_20px_-8px_rgba(0,109,91,0.15)] hover:border-[#2563EB]/30 transition-all flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-[18px] h-[18px] text-[#1D4ED8]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-['Manrope'] font-bold text-[15px] text-[#191C1D] leading-snug">
            {materia.nome}
          </h3>
          {(materia.num_questoes != null || materia.peso != null) && (
            <div className="flex items-center gap-3 mt-1.5">
              {materia.num_questoes != null && (
                <span className="inline-flex items-center gap-1 text-xs text-[#4a5568]">
                  <Hash className="w-3 h-3" />
                  {materia.num_questoes} questão{materia.num_questoes !== 1 ? 'ões' : ''}
                </span>
              )}
              {materia.peso != null && (
                <span className="inline-flex items-center gap-1 text-xs text-[#4a5568]">
                  <Weight className="w-3 h-3" />
                  Peso {materia.peso}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onGerar}
        className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white text-xs font-bold hover:brightness-110 transition-all shadow-[0_3px_8px_-3px_rgba(0,109,91,0.4)]"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
        Gerar questões
      </button>
    </div>
  );
}
