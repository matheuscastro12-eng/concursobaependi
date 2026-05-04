import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { useEditais, type Edital, type EditalStatus } from '@/hooks/useEditais';
import { readPdfMeta } from '@/lib/pdfMeta';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageSkeleton from '@/components/PageSkeleton';
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  Trash2, Plus, X, Sparkles, ChevronRight, Hourglass, CircleAlert,
} from 'lucide-react';

const STATUS_CONFIG: Record<EditalStatus, { label: string; color: string; icon: typeof Loader2 }> = {
  uploading:  { label: 'Enviando…',       color: 'bg-slate-100 text-slate-600 border-slate-200',      icon: Hourglass     },
  extracting: { label: 'IA processando…', color: 'bg-blue-50 text-blue-700 border-blue-200',           icon: Sparkles      },
  ready:      { label: 'Pronto',          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',  icon: CheckCircle2  },
  failed:     { label: 'Falhou',          color: 'bg-red-50 text-red-700 border-red-200',              icon: CircleAlert   },
};

const Editais = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { editais, loading, fetchEditais, deleteEdital } = useEditais();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showUpload, setShowUpload] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => { void fetchEditais(); }, [fetchEditais]);

  if (authLoading || subLoading || adminLoading) return <PageSkeleton variant="dashboard" />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasAccess && !isAdmin) return <Navigate to="/pricing" replace />;

  const handleDelete = async (id: string) => {
    try {
      await deleteEdital(id);
      toast({ title: 'Edital removido' });
    } catch (err) {
      toast({ title: 'Erro ao remover', description: (err as Error).message, variant: 'destructive' });
    }
    setConfirmDeleteId(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#1D4ED8] inline-flex items-center gap-2.5 mb-3">
              <span className="w-6 h-px bg-[#F59E0B]" />
              Editais
            </p>
            <h1 className="font-['Manrope'] font-bold text-3xl sm:text-4xl tracking-[-0.025em] leading-[1.05] text-[#191C1D]">
              Importe o edital,{' '}
              <em className="not-italic font-medium text-[#B45309]">
                a IA extrai as matérias
              </em>
              .
            </h1>
            <p className="text-sm text-[#4a5568] mt-2 max-w-[58ch] leading-relaxed">
              Suba o PDF do edital do seu concurso. A IA identifica todas as
              disciplinas cobradas e você gera simulados específicos por matéria.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="shrink-0 inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white font-bold text-sm font-['Manrope'] shadow-[0_8px_24px_-8px_rgba(0,109,91,0.45)] hover:shadow-[0_12px_28px_-6px_rgba(0,109,91,0.55)] transition-shadow"
          >
            <Plus className="w-4 h-4" />
            Importar edital
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : editais.length === 0 ? (
          <EmptyState onUpload={() => setShowUpload(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editais.map((e) => (
              <EditalCard
                key={e.id}
                edital={e}
                onOpen={() => navigate(`/editais/${e.id}`)}
                onDelete={() => setConfirmDeleteId(e.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          userId={user!.id}
          onClose={() => setShowUpload(false)}
          onSuccess={(editalId) => {
            setShowUpload(false);
            void fetchEditais();
            navigate(`/editais/${editalId}`);
          }}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDelete
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </DashboardLayout>
  );
};

export default Editais;

// ─────────────────────────────────────────────────────────────────

function EditalCard({ edital, onOpen, onDelete }: { edital: Edital; onOpen: () => void; onDelete: () => void }) {
  const cfg = STATUS_CONFIG[edital.status];
  const Icon = cfg.icon;
  const isWorking = edital.status === 'uploading' || edital.status === 'extracting';
  const created = new Date(edital.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(25,28,29,0.04)] hover:shadow-[0_8px_28px_-12px_rgba(0,109,91,0.18)] hover:border-[#2563EB]/30 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className={`shrink-0 w-10 h-10 rounded-xl border ${cfg.color} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${isWorking ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-['Manrope'] font-bold text-base text-[#191C1D] tracking-tight leading-snug truncate">
            {edital.titulo}
          </h3>
          <p className="text-xs text-[#4a5568] mt-0.5">
            {[edital.banca, edital.cargo, edital.municipio].filter(Boolean).join(' · ')}
            {edital.ano ? ` · ${edital.ano}` : ''}
            {' · '}{created}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 w-8 h-8 rounded-lg text-[#4a5568] hover:text-red-600 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remover"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cfg.color} text-[11px] font-semibold mb-4`}>
        {cfg.label}
      </div>

      {edital.status === 'failed' && edital.status_message && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 leading-relaxed">
          <strong>Erro:</strong> {edital.status_message}
        </div>
      )}

      {edital.status === 'ready' && (
        <button
          onClick={onOpen}
          className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white text-sm font-bold hover:brightness-110 transition-all shadow-[0_4px_12px_-4px_rgba(0,109,91,0.4)]"
        >
          Ver matérias
          <ChevronRight className="w-4 h-4 opacity-70" />
        </button>
      )}
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50 p-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2563EB]/10 mb-4">
        <FileText className="w-8 h-8 text-[#1D4ED8]" />
      </div>
      <h3 className="font-['Manrope'] font-bold text-xl text-[#191C1D] tracking-tight mb-2">
        Nenhum edital importado ainda
      </h3>
      <p className="text-sm text-[#4a5568] max-w-md mx-auto leading-relaxed mb-6">
        Suba o PDF do edital do seu concurso e a IA extrai automaticamente
        todas as matérias cobradas para você gerar simulados por disciplina.
      </p>
      <button
        onClick={onUpload}
        className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white font-bold text-sm font-['Manrope'] shadow-[0_8px_24px_-8px_rgba(0,109,91,0.45)]"
      >
        <Upload className="w-4 h-4" />
        Importar primeiro edital
      </button>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
        {[
          { n: '01', t: 'Suba o edital',   d: 'PDF até 20MB. Aceita qualquer edital de concurso público.' },
          { n: '02', t: 'IA lê as matérias', d: 'Gemini 2.5 identifica todas as disciplinas e o número de questões.' },
          { n: '03', t: 'Gere simulados',   d: 'Clique em qualquer matéria e gere questões focadas nela em segundos.' },
        ].map((s) => (
          <div key={s.n} className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="font-mono text-xs text-[#B45309] font-bold mb-1">{s.n}</div>
            <div className="font-['Manrope'] font-bold text-sm text-[#191C1D] mb-1">{s.t}</div>
            <p className="text-xs text-[#4a5568] leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadModal({ userId, onClose, onSuccess }: { userId: string; onClose: () => void; onSuccess: (id: string) => void }) {
  const { toast } = useToast();
  const { uploadEdital } = useEditais();
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [banca, setBanca] = useState('');
  const [cargo, setCargo] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [ano, setAno] = useState('');
  const [pdfMeta, setPdfMeta] = useState<{ numPages: number } | null>(null);
  const [stage, setStage] = useState<'select' | 'reading' | 'uploading' | 'extracting_text' | 'ingesting'>('select');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPdfMeta(null); return; }
    setStage('reading');
    void (async () => {
      try {
        const meta = await readPdfMeta(file);
        setPdfMeta({ numPages: meta.numPages });
        if (!titulo) setTitulo(file.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim());
        setStage('select');
      } catch (e) {
        setError(`Falha ao ler PDF: ${(e as Error).message}`);
        setStage('select');
      }
    })();
  }, [file]);

  const isProcessing = stage !== 'select' && stage !== 'reading';
  const canSubmit = file && pdfMeta && titulo.trim().length > 2 && !isProcessing;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    try {
      const { editalId } = await uploadEdital(userId, {
        titulo: titulo.trim(),
        banca: banca.trim() || undefined,
        cargo: cargo.trim() || undefined,
        municipio: municipio.trim() || undefined,
        ano: ano ? parseInt(ano, 10) : undefined,
        pdfFile: file!,
        onProgress: (s) => setStage(s as typeof stage),
      });
      onSuccess(editalId);
    } catch (e) {
      setError((e as Error).message);
      setStage('select');
    }
  };

  const stageLabel: Record<string, string> = {
    reading: 'Lendo PDF…',
    uploading: 'Enviando arquivo…',
    extracting_text: 'Extraindo texto…',
    ingesting: 'IA identificando matérias…',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !isProcessing && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-1 bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] via-[#2563EB] to-[#F59E0B]" />
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#1D4ED8] inline-flex items-center gap-2 mb-2">
              <span className="w-5 h-px bg-[#F59E0B]" />
              Novo edital
            </p>
            <h2 className="font-['Manrope'] font-bold text-xl text-[#191C1D] tracking-[-0.015em]">
              Importar edital em PDF
            </h2>
          </div>
          {!isProcessing && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-[#4a5568] hover:bg-slate-100 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Arquivo */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">① Arquivo PDF</label>
            {!file ? (
              <label className="relative flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-colors cursor-pointer">
                <input type="file" accept="application/pdf" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.type !== 'application/pdf') { setError('Arquivo deve ser PDF'); return; }
                  if (f.size > 20 * 1024 * 1024) { setError('PDF muito grande. Limite: 20 MB.'); return; }
                  setError(null);
                  setFile(f);
                }} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="w-6 h-6 text-[#4a5568] mb-1.5" />
                <span className="text-sm font-semibold text-[#191C1D]">Clique para selecionar</span>
                <span className="text-xs text-[#4a5568] mt-0.5">PDF até 20 MB</span>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#191C1D] truncate">{file.name}</p>
                  <p className="text-xs text-[#4a5568]">{(file.size / 1024 / 1024).toFixed(1)} MB{pdfMeta ? ` · ${pdfMeta.numPages} páginas` : ''}</p>
                </div>
                {!isProcessing && <button onClick={() => { setFile(null); setPdfMeta(null); }} className="text-[#4a5568] hover:text-red-600"><X className="w-4 h-4" /></button>}
              </div>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">② Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value.slice(0, 200))} disabled={isProcessing}
              placeholder="Ex: Prefeitura de São Paulo 2024"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-shadow" />
          </div>

          {/* Banca + Cargo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">
                ③ Banca <span className="text-[9px] font-normal normal-case text-[#94a3b8]">opcional</span>
              </label>
              <input value={banca} onChange={(e) => setBanca(e.target.value)} disabled={isProcessing}
                placeholder="VUNESP, FCC…"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" />
            </div>
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">
                ④ Cargo <span className="text-[9px] font-normal normal-case text-[#94a3b8]">opcional</span>
              </label>
              <input value={cargo} onChange={(e) => setCargo(e.target.value)} disabled={isProcessing}
                placeholder="Agente Administrativo"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" />
            </div>
          </div>

          {/* Município + Ano */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">
                ⑤ Município <span className="text-[9px] font-normal normal-case text-[#94a3b8]">opcional</span>
              </label>
              <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} disabled={isProcessing}
                placeholder="São Paulo"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" />
            </div>
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">
                ⑥ Ano <span className="text-[9px] font-normal normal-case text-[#94a3b8]">opcional</span>
              </label>
              <input value={ano} onChange={(e) => setAno(e.target.value)} disabled={isProcessing} type="number" min={2000} max={2030}
                placeholder="2025"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" />
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}

          {(stage === 'reading' || isProcessing) && (
            <div className="p-4 bg-gradient-to-br from-[#1D4ED8]/5 to-[#F59E0B]/5 border border-[#2563EB]/20 rounded-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#1D4ED8] animate-spin shrink-0" />
              <p className="text-sm font-bold text-[#191C1D]">{stageLabel[stage] ?? 'Processando…'}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-2">
          {!isProcessing && <button onClick={onClose} className="px-4 h-10 rounded-lg text-sm font-semibold text-[#4a5568] hover:bg-slate-100">Cancelar</button>}
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_-4px_rgba(0,109,91,0.4)]">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#F59E0B]" />}
            {isProcessing ? 'Processando…' : 'Importar e processar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-['Manrope'] font-bold text-lg text-[#191C1D]">Excluir edital?</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-[#4a5568] leading-relaxed">
            O edital e todas as matérias extraídas serão removidos. O PDF original também será deletado. Não dá para desfazer.
          </p>
        </div>
        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm font-semibold text-[#4a5568] hover:bg-slate-100">Voltar</button>
          <button onClick={onConfirm} className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700">
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
