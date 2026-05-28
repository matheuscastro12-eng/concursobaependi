import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Trophy,
} from 'lucide-react';
import { useActiveConcurso } from '@/hooks/useActiveConcurso';
import { fetchReviewQueue, gradeReview, type ReviewItem } from '@/lib/attempts';
import { getTheme } from '@/lib/concursoTheme';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import logoColor from '@/assets/logo-concursos.svg';

const Revisao = () => {
  const navigate = useNavigate();
  const { concurso, slug } = useActiveConcurso();
  const theme = getTheme(slug);

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchReviewQueue(slug, 20).then((data) => {
      if (cancelled) return;
      setItems(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const current = items[index];
  const total = items.length;
  const progress = total > 0 ? ((index + (chosen ? 1 : 0)) / total) * 100 : 0;

  const handleChoose = useCallback(
    (letter: string) => {
      if (chosen || !current) return;
      setChosen(letter);
      const gotIt = letter === current.correct_answer;
      if (gotIt) setSessionCorrect((n) => n + 1);
      else setSessionWrong((n) => n + 1);
      void gradeReview(current.question_hash, gotIt);
    },
    [chosen, current],
  );

  const handleNext = useCallback(() => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setChosen(null);
    } else {
      setFinished(true);
    }
  }, [index, total]);

  // Header reutilizado.
  const Header = (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-30 cai-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cai-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 rounded-md"
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
  );

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
        {Header}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3 cai-fade-in">
            <Loader2 className={`w-8 h-8 animate-spin ${theme.iconColor}`} />
            <p className="text-sm text-slate-500">Carregando sua revisão…</p>
          </div>
        </main>
      </div>
    );
  }

  // Empty state
  if (total === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
        {Header}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-14 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-slide-up max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="font-['Manrope'] font-extrabold text-xl text-slate-900 mb-2">
              Nenhuma revisão pendente! 🎉
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Continue fazendo simulados — as questões que você errar aparecem aqui pra revisar
              no momento certo.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl ${theme.primaryBg} ${theme.primaryHover} text-white text-sm font-bold transition-colors cai-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
            >
              Voltar ao dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Resumo final
  if (finished) {
    const answered = sessionCorrect + sessionWrong;
    const pct = answered > 0 ? Math.round((sessionCorrect / answered) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
        {Header}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-slide-up max-w-xl mx-auto">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mx-auto mb-5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)]`}>
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="font-['Manrope'] font-extrabold text-2xl text-slate-900 mb-2">
              Revisão concluída!
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Você revisou {answered} {answered === 1 ? 'questão' : 'questões'} nesta sessão.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-7">
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-4">
                <p className="font-['Manrope'] text-2xl font-extrabold text-emerald-600">
                  {sessionCorrect}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/70 mt-0.5">
                  Acertos
                </p>
              </div>
              <div className="rounded-xl border border-red-200/60 bg-red-50/60 p-4">
                <p className="font-['Manrope'] text-2xl font-extrabold text-red-600">
                  {sessionWrong}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-red-700/70 mt-0.5">
                  Erros
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-['Manrope'] text-2xl font-extrabold text-slate-700">{pct}%</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                  Acerto
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl ${theme.primaryBg} ${theme.primaryHover} text-white text-sm font-bold transition-colors cai-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
            >
              Voltar ao dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Card de revisão
  const isCorrectChoice = chosen === current.correct_answer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
      {Header}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Barra de progresso */}
        <div className="mb-5 space-y-1.5 cai-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 inline-flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${theme.iconColor}`} />
              Revisão
            </span>
            <span className="text-xs font-medium text-slate-500">
              {index + 1} de {total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${theme.primaryBg} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div
          key={current.question_hash}
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cai-slide-up"
        >
          {/* Tags */}
          {(current.tema || current.banca) && (
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              {current.tema && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                  {current.tema}
                </span>
              )}
              {current.banca && (
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full bg-slate-50 ${theme.textHighlight} font-medium border border-slate-200`}>
                  {current.banca}
                </span>
              )}
            </div>
          )}

          {/* Enunciado */}
          <div className="prose prose-sm max-w-none text-[14px] leading-relaxed mb-5">
            <MarkdownRenderer content={current.enunciado} />
          </div>

          {/* Alternativas */}
          <div className="space-y-2" role="radiogroup" aria-label="Alternativas">
            {current.alternativas.map((alt) => {
              const isSelected = chosen === alt.letter;
              const isCorrectAlt = alt.letter === current.correct_answer;
              const showFeedback = chosen != null;

              let altClass =
                'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
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
              }

              return (
                <button
                  key={alt.letter}
                  onClick={() => handleChoose(alt.letter)}
                  disabled={showFeedback}
                  role="radio"
                  aria-checked={isSelected}
                  className={`w-full text-left p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-150 active:scale-[0.99] disabled:cursor-default ${altClass} ${opacity} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-400`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${badgeClass}`}
                    >
                      {alt.letter}
                    </span>
                    <span className="text-sm flex-1 pt-0.5">{alt.text}</span>
                    {showFeedback && isCorrectAlt && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    {showFeedback && isSelected && !isCorrectAlt && (
                      <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback + explicação */}
          {chosen != null && (
            <div className="mt-5 space-y-4 cai-fade-in">
              <div
                className={`rounded-xl border p-4 ${
                  isCorrectChoice
                    ? 'border-emerald-200/60 bg-emerald-50/60'
                    : 'border-red-200/60 bg-red-50/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                      isCorrectChoice ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrectChoice ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {isCorrectChoice ? 'Você acertou!' : 'Você errou'}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                    Gabarito: {current.correct_answer}
                  </span>
                </div>
                {current.explanation && (
                  <div className="prose prose-sm max-w-none text-sm border-t border-slate-200/50 pt-3">
                    <MarkdownRenderer content={current.explanation} />
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className={`w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl ${theme.primaryBg} ${theme.primaryHover} text-white text-sm font-bold transition-colors cai-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
              >
                {index < total - 1 ? (
                  <>
                    Próxima
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 text-amber-300" />
                    Concluir revisão
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Dica de fluxo */}
        {chosen == null && (
          <p className="text-center text-xs text-slate-400 mt-4 cai-fade-in">
            Escolha uma alternativa para ver o gabarito e a explicação.
          </p>
        )}
      </main>
    </div>
  );
};

export default Revisao;
