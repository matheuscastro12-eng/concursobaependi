import { Slider } from '@/components/ui/slider';
import GenerationProgress from '@/components/GenerationProgress';
import type { ExamConfig } from '@/hooks/useExamGenerator';
import { Loader2, Sparkles, ArrowRight, GraduationCap, Award, BookOpen } from 'lucide-react';

const BANCAS_SUGERIDAS = ['INEPAM', 'VUNESP', 'FCC', 'IBAM', 'CESPE/Cebraspe', 'OBJETIVA', 'AVANÇA SP', 'FUNDATEC', 'FEPESE'];

interface ExamConfigPanelProps {
  tema: string;
  onTemaChange: (v: string) => void;
  config: ExamConfig;
  onConfigChange: (config: ExamConfig) => void;
  generating: boolean;
  hasStartedReceiving: boolean;
  isComplete: boolean;
  onGenerate: () => void;
}

const ExamConfigPanel = ({
  tema,
  onTemaChange,
  config,
  onConfigChange,
  generating,
  hasStartedReceiving,
  isComplete,
  onGenerate,
}: ExamConfigPanelProps) => {
  const isReady = tema.trim().length > 0;

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200 shadow-[0_1px_2px_rgba(25,28,29,0.04)] overflow-hidden cai-slide-up">
      <div className="h-1 bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] via-[#2563EB] to-[#F59E0B]" />

      <div className="px-5 sm:px-8 md:px-12 py-7 sm:py-9 md:py-12 space-y-9">
        {/* Header */}
        <header>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#1D4ED8] inline-flex items-center gap-2.5 mb-3 cai-slide-up cai-delay-1">
            <span className="w-6 h-px bg-[#F59E0B]" />
            Simulado com IA
          </p>
          <h1 className="font-['Manrope'] font-bold text-[28px] sm:text-[34px] tracking-[-0.025em] leading-[1.05] text-[#191C1D] cai-slide-up cai-delay-2">
            Treine como se fosse<br />a <em className="not-italic font-medium text-[#B45309]">prova de verdade</em>.
          </h1>
          <p className="text-sm text-[#4a5568] mt-3 max-w-[52ch] leading-relaxed cai-slide-up cai-delay-3">
            Informe o tema e a IA gera um simulado personalizado com gabarito comentado — no estilo da banca do seu concurso.
          </p>
        </header>

        {/* ① Tema */}
        <section className="cai-slide-up cai-delay-2">
          <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-3">
            ① Tema / Matéria
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
            <input
              type="text"
              value={tema}
              onChange={(e) => onTemaChange(e.target.value)}
              disabled={generating}
              placeholder="Ex: Direito Administrativo — Atos Administrativos"
              className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white font-['Manrope'] text-sm font-semibold text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-shadow disabled:opacity-50"
            />
          </div>
        </section>

        {/* ② Banca e Cargo */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 cai-slide-up cai-delay-3">
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">
              ② Banca
              <span className="ml-1.5 text-[9.5px] font-medium normal-case tracking-normal text-[#94a3b8]">opcional</span>
            </label>
            <input
              type="text"
              value={config.banca ?? ''}
              onChange={(e) => onConfigChange({ ...config, banca: e.target.value })}
              disabled={generating}
              list="bancas-list"
              placeholder="Ex: INEPAM, VUNESP, FCC..."
              className="w-full h-11 px-3.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-shadow disabled:opacity-50"
            />
            <datalist id="bancas-list">
              {BANCAS_SUGERIDAS.map((b) => <option key={b} value={b} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">
              ③ Cargo
              <span className="ml-1.5 text-[9.5px] font-medium normal-case tracking-normal text-[#94a3b8]">opcional</span>
            </label>
            <input
              type="text"
              value={config.cargo ?? ''}
              onChange={(e) => onConfigChange({ ...config, cargo: e.target.value })}
              disabled={generating}
              placeholder="Ex: Agente Administrativo"
              className="w-full h-11 px-3.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-[#191C1D] placeholder-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-shadow disabled:opacity-50"
            />
          </div>
        </section>

        {/* ④ Quantidade */}
        <section data-tour="exam-config" className="cai-slide-up cai-delay-4">
          <div className="flex items-baseline justify-between mb-3">
            <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568]">
              ④ Quantidade
            </label>
            <span className="font-mono text-[10.5px] font-bold text-[#1D4ED8]">
              {config.quantidade} questões
            </span>
          </div>
          <div className="bg-slate-50/60 border-2 border-slate-200 rounded-xl px-4 py-5 cai-soft-pop">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">5</span>
              <span className="font-['Manrope'] text-[40px] font-black text-[#1D4ED8] tabular-nums leading-none">
                {config.quantidade}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">60</span>
            </div>
            <Slider
              value={[config.quantidade]}
              onValueChange={([v]) => onConfigChange({ ...config, quantidade: v })}
              min={5}
              max={60}
              step={5}
              disabled={generating}
            />
          </div>
        </section>

        {/* ⑤ Nível */}
        <section className="cai-slide-up cai-delay-4">
          <div className="flex items-baseline justify-between mb-3">
            <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568]">
              ⑤ Nível
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'basico' as const, label: 'Nível Médio', sub: 'lei seca, conceitos diretos', Icon: GraduationCap },
              { value: 'avancado' as const, label: 'Nível Superior', sub: 'casos práticos, jurisprudência', Icon: Award },
            ].map(({ value, label, sub, Icon }) => {
              const ativo = config.nivel === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onConfigChange({ ...config, nivel: value })}
                  disabled={generating}
                  className={`group text-left p-4 rounded-xl border-2 transition-all disabled:opacity-50 cai-interactive ${
                    ativo
                      ? 'border-[#1D4ED8] bg-[#1D4ED8]/[0.03] shadow-[0_0_0_4px_rgba(0,109,91,0.06)]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      ativo ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-[#4a5568]'
                    }`}>
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <h4 className="font-['Manrope'] font-bold text-[14px] text-[#191C1D] leading-tight">{label}</h4>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">{sub}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ⑥ Alternativas */}
        <section className="cai-slide-up cai-delay-5">
          <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#4a5568] mb-2">
            ⑥ Alternativas por questão
          </label>
          <div className="grid grid-cols-2 gap-2">
            {([4, 5] as const).map((n) => {
              const ativo = (config.numAlternativas ?? 5) === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onConfigChange({ ...config, numAlternativas: n })}
                  disabled={generating}
                  className={`h-11 rounded-xl font-['Manrope'] font-bold text-sm border-2 transition-all disabled:opacity-50 cai-interactive ${
                    ativo
                      ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_4px_12px_-4px_rgba(0,109,91,0.4)]'
                      : 'border-slate-200 bg-white text-[#4a5568] hover:border-slate-300'
                  }`}
                >
                  {n} alternativas{' '}
                  <span className="font-mono font-normal text-xs opacity-70">
                    A–{String.fromCharCode(64 + n)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-slate-100" />
          <div className="w-1 h-1 rounded-full bg-[#F59E0B]" />
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* CTA */}
        <section data-tour="generate-exam-btn">
          <button
            onClick={onGenerate}
            disabled={!isReady || generating}
            className="w-full h-[58px] rounded-xl font-['Manrope'] font-bold text-[15px] tracking-[-0.005em] text-white inline-flex items-center justify-center gap-2.5 transition-all disabled:cursor-not-allowed group relative overflow-hidden cai-interactive cai-sheen"
            style={{
              background:
                isReady && !generating
                  ? 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #2563EB 100%)'
                  : '#94a3b8',
              boxShadow:
                isReady && !generating
                  ? '0 8px 24px -8px rgba(0,109,91,0.45)'
                  : 'none',
            }}
          >
            {isReady && !generating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F59E0B]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            )}
            <div className="relative flex items-center gap-2.5">
              {generating ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin" />
                  Gerando questões…
                </>
              ) : !isReady ? (
                <>Informe o tema das questões</>
              ) : (
                <>
                  <Sparkles className="w-[18px] h-[18px] text-[#F59E0B]" />
                  Gerar simulado
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </div>
          </button>
          <p className="text-[11px] text-[#94a3b8] text-center mt-3">
            {generating
              ? 'A IA está elaborando — aguarde…'
              : `Reutiliza simulados salvos · ~${Math.max(10, Math.round(config.quantidade * 0.6))}s se precisar gerar`}
          </p>

          {generating && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <GenerationProgress
                isGenerating={generating}
                hasStartedReceiving={hasStartedReceiving}
                isComplete={isComplete}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ExamConfigPanel;
