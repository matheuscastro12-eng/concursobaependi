import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useExamGenerator, type ExamConfig } from '@/hooks/useExamGenerator';
import { ArrowLeft } from 'lucide-react';
import GenerationProgress from '@/components/GenerationProgress';
import ExamConfigPanel from '@/components/exam/ExamConfigPanel';
import SimulationView from '@/components/exam/SimulationView';
import ContextChat from '@/components/ContextChat';
import logoColor from '@/assets/logo-concursos.svg';
import { findSavedGeneratedExam, saveGeneratedExam, loadExamProgress, clearExamProgress } from '@/lib/savedGeneratedExams';
import { tryPickFromBank, markQuestionsSeen } from '@/lib/questionBank';

function hasParseableQuestion(text: string): boolean {
  const blocks = text.split(/(?=##\s*Questão\s+\d+)/i);
  for (const block of blocks) {
    if (!block.match(/##\s*Questão\s+\d+/i)) continue;
    const altRegex = /\*\*([A-E])\)\*\*\s*(.+)/g;
    const alts: string[] = [];
    let m;
    while ((m = altRegex.exec(block)) !== null) {
      if (!alts.includes(m[1])) alts.push(m[1]);
    }
    if (alts.length >= 4) return true;
  }
  return false;
}

const Exam = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const temaFromUrl = searchParams.get('tema') ?? '';
  const bancaFromUrl = searchParams.get('banca') ?? 'INEPAM';
  const cargoFromUrl = searchParams.get('cargo') ?? '';

  const [config, setConfig] = useState<ExamConfig>({
    quantidade: 10,
    nivel: 'basico',
    simulationMode: true,
    banca: bancaFromUrl,
    cargo: cargoFromUrl,
    numAlternativas: 5,
  });
  const [tema, setTema] = useState(temaFromUrl);

  const [showSimulation, setShowSimulation] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config.simulationMode) {
      setConfig(prev => ({ ...prev, simulationMode: true }));
    }
  }, [config.simulationMode]);

  const {
    resultado,
    generating,
    hasStartedReceiving,
    isComplete,
    generate,
    loadSaved,
    reset,
  } = useExamGenerator();

  useEffect(() => {
    if (showSimulation) return;
    if (!hasStartedReceiving || !resultado) return;
    if (hasParseableQuestion(resultado)) {
      setShowSimulation(true);
    }
  }, [hasStartedReceiving, resultado, showSimulation]);

  // Restauração automática: se o usuário saiu da aba/recarregou no meio de uma
  // geração, ao voltar pra essa rota com os mesmos parâmetros recuperamos o
  // progresso salvo no localStorage e mostramos as questões que já tinham
  // chegado. Útil tanto pra geração completa quanto pra parcial.
  useEffect(() => {
    if (examStarted) return;
    const trimmedTema = temaFromUrl.trim();
    if (!trimmedTema) return;

    let cancelled = false;
    (async () => {
      // 1) Tenta cache COMPLETO (Supabase + localStorage)
      const saved = await findSavedGeneratedExam(trimmedTema, config);
      if (cancelled) return;
      if (saved && hasParseableQuestion(saved.resultado)) {
        setExamStarted(true);
        loadSaved(saved.resultado, config);
        return;
      }
      // 2) Tenta progresso PARCIAL (só localStorage, durante stream interrompido)
      const partial = loadExamProgress(trimmedTema, config);
      if (partial && hasParseableQuestion(partial.resultado)) {
        setExamStarted(true);
        loadSaved(partial.resultado, config);
        toast({
          title: 'Simulado restaurado',
          description: 'Recuperamos o que já tinha sido gerado antes de você sair.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // só no mount — config no momento inicial reflete defaults + URL

  const handleGenerate = async () => {
    if (!tema.trim()) {
      toast({ title: 'Tema obrigatório', description: 'Informe o tema ou matéria das questões.', variant: 'destructive' });
      return;
    }

    const conteudo = [
      tema,
      config.banca ? `Banca: ${config.banca}` : '',
      config.cargo ? `Cargo: ${config.cargo}` : '',
    ].filter(Boolean).join('\n');

    // 1) Tenta o BANCO DE QUESTÕES (instantâneo, sem IA).
    // Match exato de tema → matéria. Se houver questões suficientes,
    // monta o simulado direto do banco.
    const fromBank = await tryPickFromBank(tema, config);
    if (fromBank) {
      setShowSimulation(false);
      setExamStarted(true);
      loadSaved(fromBank.markdown, config);
      // Marca como vistas pra anti-repetição em sessões futuras.
      markQuestionsSeen(fromBank.questionIds);
      toast({
        title: 'Simulado carregado do banco',
        description: 'Questões do banco oficial · sem custo de IA.',
      });
      return;
    }

    // 2) Tenta o cache de simulados completos (Supabase + localStorage).
    const saved = await findSavedGeneratedExam(tema, config);
    if (saved) {
      setShowSimulation(false);
      setExamStarted(true);
      loadSaved(saved.resultado, config);
      toast({
        title: 'Simulado carregado',
        description: 'Alguém já havia gerado essa configuração. Não usamos IA desta vez.',
      });
      return;
    }

    // 3) Fallback: chama o Gemini ao vivo.
    setShowSimulation(false);
    setExamStarted(true);
    const generated = await generate(conteudo, config, tema);
    if (generated?.trim()) {
      await saveGeneratedExam(tema, config, generated);
      toast({
        title: 'Simulado salvo',
        description: 'A partir de agora, essa configuração pode ser reutilizada sem gerar de novo.',
      });
    }
  };

  const handleBackToMenu = () => {
    setExamStarted(false);
    setShowSimulation(false);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
      {/* Top bar */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-30 cai-fade-in">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => cargoFromUrl ? navigate(-1) : navigate('/')}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cai-interactive"
          >
            <ArrowLeft className="w-4 h-4" />
            {cargoFromUrl ? 'Voltar ao cargo' : 'Inicio'}
          </button>
          <div className="flex items-center gap-2">
            <img src={logoColor} alt="ConcursosAI" className="h-7 w-7" />
            <span className="font-['Manrope'] font-bold text-sm text-slate-900">ConcursosAI</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {examStarted ? (
          <div className="flex flex-col gap-4 cai-slide-up">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToMenu}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors active:scale-95 cai-interactive"
              >
                <ArrowLeft className="h-4 w-4" /> Nova configuração
              </button>
              <span className="text-xs text-slate-400">Simulado</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 min-h-[50vh] lg:min-h-[calc(100vh-10rem)]">
              <div ref={resultRef} className="flex-1 min-w-0 rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(25,28,29,0.06)] p-4 sm:p-6 flex flex-col overflow-hidden cai-soft-pop">
                {showSimulation ? (
                  <SimulationView
                    resultado={resultado}
                    onExit={handleBackToMenu}
                    isGenerating={generating}
                    isComplete={isComplete}
                    banca={config.banca}
                    cargo={config.cargo}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-6 max-w-md mx-auto cai-fade-in">
                    <GenerationProgress
                      isGenerating={generating}
                      hasStartedReceiving={hasStartedReceiving}
                      isComplete={isComplete}
                    />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Elaborando questões...</p>
                      <p className="text-xs text-slate-400">
                        {hasStartedReceiving
                          ? 'Recebendo conteúdo — as questões aparecerão automaticamente.'
                          : 'Conectando com a IA, aguarde um momento.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {resultado && (
                <ContextChat
                  context={resultado}
                  contextLabel="simulado"
                  suggestions={[
                    'Por que a alternativa correta está certa?',
                    'Qual o fundamento legal dessa questão?',
                    'Que pegadinhas comuns caem sobre esse tema?',
                    'Como essa matéria costuma ser cobrada pela banca?',
                  ]}
                />
              )}
            </div>
          </div>
        ) : (
          <ExamConfigPanel
            tema={tema}
            onTemaChange={setTema}
            config={config}
            onConfigChange={(c) => setConfig({ ...c, simulationMode: true })}
            generating={generating}
            hasStartedReceiving={hasStartedReceiving}
            isComplete={isComplete}
            onGenerate={handleGenerate}
          />
        )}
      </main>
    </div>
  );
};

export default Exam;
