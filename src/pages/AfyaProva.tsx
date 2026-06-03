import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Eye,
  ImageOff,
  Loader2,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { getProvaById } from '@/data/afya';
import type { QuestaoIntegradora } from '@/data/concursos/types';
import { recordAttempts, type AttemptInput } from '@/lib/attempts';
import { getTheme } from '@/lib/concursoTheme';
import logoColor from '@/assets/logo-concursos.svg';

const t = getTheme('afya');

// Renderiza um enunciado com parágrafos separados por \n\n.
const Enunciado = ({ texto }: { texto: string }) => (
  <div className="space-y-3 text-[14px] leading-relaxed text-slate-800">
    {texto.split('\n\n').map((paragrafo, i) => (
      <p key={i} className="whitespace-pre-line">
        {paragrafo}
      </p>
    ))}
  </div>
);

const AfyaProva = () => {
  const { provaId } = useParams<{ provaId: string }>();
  const navigate = useNavigate();
  const prova = provaId ? getProvaById(provaId) : undefined;

  const [questoes, setQuestoes] = useState<QuestaoIntegradora[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Modo múltipla: letra escolhida por questão.
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // Modo revisão: índices já revelados.
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const recordedRef = useRef(false);

  const isRevisao = prova?.modo === 'revisao';

  useEffect(() => {
    if (!prova) return;
    let cancelled = false;
    setQuestoes(null);
    prova
      .load()
      .then((data) => {
        if (!cancelled) setQuestoes(data);
      })
      .catch(() => {
        if (!cancelled) setQuestoes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [prova]);

  const total = questoes?.length ?? 0;
  const currentQ = questoes && total > 0 ? questoes[currentIndex] : undefined;

  const score = useMemo(() => {
    if (!questoes) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    for (let i = 0; i < questoes.length; i++) {
      if (answers[i] && answers[i] === questoes[i].gabarito) correct++;
    }
    return {
      correct,
      total: questoes.length,
      percentage: questoes.length > 0 ? Math.round((correct / questoes.length) * 100) : 0,
    };
  }, [answers, questoes]);

  const selectAnswer = useCallback(
    (letra: string) => {
      if (isRevisao) return;
      // Trava após escolher: ignora cliques se já respondida.
      setAnswers((prev) => (prev[currentIndex] ? prev : { ...prev, [currentIndex]: letra }));
    },
    [currentIndex, isRevisao],
  );

  const revealCurrent = useCallback(() => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
  }, [currentIndex]);

  const finish = useCallback(() => {
    setShowResults(true);
    // Grava tentativas (apenas modo múltipla) uma única vez.
    if (!isRevisao && prova && questoes && !recordedRef.current) {
      recordedRef.current = true;
      const payload: AttemptInput[] = [];
      for (let i = 0; i < questoes.length; i++) {
        const chosen = answers[i];
        if (!chosen) continue; // só respondidas
        const q = questoes[i];
        payload.push({
          tema: q.subareas[0] || prova.titulo,
          cargo_slug: prova.id,
          banca: 'Afya',
          nivel: prova.id,
          enunciado: q.enunciado,
          alternativas: q.alternativas.map((a) => ({ letter: a.letra, text: a.texto })),
          correct_answer: q.gabarito ?? '',
          chosen_answer: chosen,
          is_correct: chosen === q.gabarito,
          explanation: q.respostaComentada,
        });
      }
      if (payload.length) void recordAttempts('afya', payload);
    }
  }, [answers, isRevisao, prova, questoes]);

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finish();
    }
  }, [currentIndex, total, finish]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setRevealed(new Set());
    setShowResults(false);
    recordedRef.current = false;
  }, []);

  // Prova inexistente → volta pra vitrine.
  if (!prova) return <Navigate to="/c/afya" replace />;

  // Loading das questões.
  if (questoes === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className={`h-7 w-7 animate-spin ${t.textHighlight}`} />
          <p className="text-sm font-medium">Carregando questões…</p>
        </div>
      </div>
    );
  }

  if (questoes.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <p className="text-sm text-slate-600">Não foi possível carregar as questões desta prova.</p>
        <button
          onClick={() => navigate('/c/afya')}
          className={`h-10 rounded-xl px-5 text-sm font-bold text-white ${t.primaryBg} ${t.primaryHover}`}
        >
          Voltar
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  // ── Tela de resultado (modo múltipla) ──
  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header prova={prova} progressLabel={null} onBack={() => navigate('/c/afya')} />
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-cyan-100 bg-white p-8 text-center shadow-sm cai-slide-up">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 ${t.iconColor}`}>
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="font-['Manrope'] text-2xl font-extrabold text-slate-950">
              Prova concluída
            </h2>
            <p className="mt-1 text-sm text-slate-500">{prova.titulo}</p>

            <div className={`mt-6 text-5xl font-extrabold ${t.textHighlight}`}>
              {score.percentage}%
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {score.correct} de {score.total} {score.total === 1 ? 'acerto' : 'acertos'}
            </p>

            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 cai-interactive"
              >
                <RotateCcw className="h-4 w-4" />
                Refazer
              </button>
              <button
                onClick={() => navigate('/c/afya')}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white ${t.primaryBg} ${t.primaryHover} cai-interactive`}
              >
                Voltar
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const userAnswer = currentQ ? answers[currentIndex] : undefined;
  const isRevealed = revealed.has(currentIndex);
  // No modo múltipla, "revela" o feedback assim que há resposta escolhida.
  const showFeedback = isRevisao ? isRevealed : Boolean(userAnswer);
  const isLast = currentIndex === total - 1;
  // A resposta correta no modo revisão é a única alternativa.
  const correctText = currentQ?.alternativas.find((a) => a.correta)?.texto
    ?? currentQ?.alternativas[0]?.texto
    ?? '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        prova={prova}
        progressLabel={`Questão ${currentIndex + 1} de ${total}`}
        onBack={() => navigate('/c/afya')}
      />

      {/* Barra de progresso */}
      <div className="mx-auto max-w-2xl px-4 pt-4 sm:px-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${t.gradient} transition-all duration-500`}
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {currentQ && (
          <div className="space-y-5 cai-slide-up" key={currentIndex}>
            {/* Subáreas + código */}
            {(currentQ.subareas.length > 0 || currentQ.codigo) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {currentQ.subareas.map((sa) => (
                  <span
                    key={sa}
                    className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-700 ring-1 ring-cyan-200/60"
                  >
                    {sa}
                  </span>
                ))}
                {currentQ.codigo && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                    #{currentQ.codigo}
                  </span>
                )}
              </div>
            )}

            {/* Aviso de imagem */}
            {currentQ.possivelImagem && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-[12.5px] leading-snug text-amber-800">
                <ImageOff className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Esta questão referenciava uma imagem na prova original (não incluída).
                </span>
              </div>
            )}

            {/* Enunciado */}
            <Enunciado texto={currentQ.enunciado} />

            {/* ── Modo MÚLTIPLA: alternativas A-D ── */}
            {!isRevisao && (
              <div className="space-y-2">
                {currentQ.alternativas.map((alt) => {
                  const isSelected = userAnswer === alt.letra;
                  const isCorrectAlt = alt.letra === currentQ.gabarito;

                  let altClass =
                    'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/40';
                  let badgeClass = 'bg-slate-100 text-slate-500';
                  let opacity = '';

                  if (showFeedback) {
                    if (isCorrectAlt) {
                      altClass = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                      badgeClass = 'bg-emerald-100 text-emerald-700';
                    } else if (isSelected) {
                      altClass = 'border-red-300 bg-red-50 text-red-800';
                      badgeClass = 'bg-red-100 text-red-600';
                    } else {
                      altClass = 'border-slate-100 bg-slate-50 text-slate-400';
                      opacity = 'opacity-60';
                    }
                  } else if (isSelected) {
                    altClass = 'border-cyan-400 bg-cyan-50 text-cyan-800 shadow-sm';
                    badgeClass = 'bg-cyan-100 text-cyan-700';
                  }

                  return (
                    <button
                      key={alt.letra}
                      onClick={() => selectAnswer(alt.letra)}
                      disabled={Boolean(userAnswer)}
                      className={`w-full rounded-xl border-2 p-3 text-left transition-all duration-150 active:scale-[0.99] disabled:cursor-default sm:p-3.5 ${altClass} ${opacity}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-150 ${badgeClass}`}
                        >
                          {alt.letra}
                        </span>
                        <span className="flex-1 pt-0.5 text-sm">{alt.texto}</span>
                        {showFeedback && isCorrectAlt && (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        )}
                        {showFeedback && isSelected && !isCorrectAlt && (
                          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Modo REVISÃO: revelar resposta correta ── */}
            {isRevisao && !isRevealed && (
              <button
                onClick={revealCurrent}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white ${t.primaryBg} ${t.primaryHover} cai-interactive`}
              >
                <Eye className="h-4 w-4" />
                Revelar resposta
              </button>
            )}

            {isRevisao && isRevealed && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Resposta correta{currentQ.gabarito ? ` (${currentQ.gabarito})` : ''}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900">{correctText}</p>
              </div>
            )}

            {/* Resposta comentada + referência + gabarito (após revelar/responder) */}
            {showFeedback && (
              <div className="space-y-3 rounded-2xl border border-cyan-100 bg-white p-4 cai-soft-pop">
                {!isRevisao && currentQ.gabarito && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold ${t.textHighlight}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Gabarito: {currentQ.gabarito}
                  </span>
                )}
                {currentQ.respostaComentada && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Resposta comentada
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                      {currentQ.respostaComentada}
                    </p>
                  </div>
                )}
                {currentQ.referencia && (
                  <div className="border-t border-slate-100 pt-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Referência
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {currentQ.referencia}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botão próxima / finalizar */}
            {showFeedback && (
              <button
                onClick={goNext}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white ${t.primaryBg} ${t.primaryHover} cai-interactive`}
              >
                {isLast ? (
                  isRevisao ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Concluir revisão
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4" />
                      Ver resultado
                    </>
                  )
                ) : (
                  <>
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </main>

      {/* Rodapé sutil com contagem (modo múltipla) */}
      {!isRevisao && (
        <div className="mx-auto max-w-2xl px-4 pb-8 text-center sm:px-6">
          <p className="text-xs text-slate-400">
            {answeredCount} de {total} respondidas
          </p>
        </div>
      )}
    </div>
  );
};

// Cabeçalho do runner.
const Header = ({
  prova,
  progressLabel,
  onBack,
}: {
  prova: { titulo: string };
  progressLabel: string | null;
  onBack: () => void;
}) => (
  <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
    <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:${t.textHighlight}`}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Voltar</span>
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-extrabold text-slate-900">{prova.titulo}</p>
        {progressLabel && <p className="text-[11px] text-slate-400">{progressLabel}</p>}
      </div>
      <img src={logoColor} alt="ConcursosAI" className="h-7 w-7 shrink-0" />
    </div>
  </header>
);

export default AfyaProva;
