import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  RotateCw,
} from 'lucide-react';
import { getLandingQuestions, type LandingQuestion } from '@/data/landingQuestions';
import { getConcursoBySlug, DEFAULT_CONCURSO_SLUG } from '@/data/concursos';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface InteractiveQuestionPreviewProps {
  concursoSlug?: string;
}

const InteractiveQuestionPreview = ({ concursoSlug = DEFAULT_CONCURSO_SLUG }: InteractiveQuestionPreviewProps) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const questions = getLandingQuestions(concursoSlug);
  const concurso = getConcursoBySlug(concursoSlug);
  const bancaLabel = concurso?.banca ?? 'INEPAM';

  const question: LandingQuestion = questions[index];
  const total = questions.length;
  const userAnswer = answers[question.id];
  const isRevealed = revealed.has(question.id);

  const selectAnswer = (letter: string) => {
    if (isRevealed) return;
    setAnswers((prev) => ({ ...prev, [question.id]: letter }));
  };

  const reveal = () => {
    setRevealed((prev) => new Set(prev).add(question.id));
  };

  const goNext = () => setIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  const reset = () => {
    setAnswers({});
    setRevealed(new Set());
    setIndex(0);
  };

  const correctCount = questions.reduce(
    (acc, q) => (revealed.has(q.id) && answers[q.id] === q.gabarito ? acc + 1 : acc),
    0,
  );
  const allDone = questions.every((q) => revealed.has(q.id));

  return (
    <section className="relative bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-amber-400" />

      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Experimente sem cadastro
            </p>
            <h3 className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-[1.05]">
              Veja o nível das questões.
              <span className="block text-blue-700">Responda 3 amostras.</span>
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Mesmo padrão da banca <strong className="text-slate-700">{bancaLabel}</strong> · com
              gabarito comentado linha a linha.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1">
              Questão
            </div>
            <p className="font-['Manrope'] text-3xl font-extrabold text-slate-900 tabular-nums">
              {index + 1}
              <span className="text-base font-bold text-slate-400">/{total}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Question metadata */}
      <div className="px-6 sm:px-8 pt-4 pb-2 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700">
          {question.area}
        </span>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700">
          Nível {question.nivel}
        </span>
        <span className="text-[10.5px] text-slate-400 truncate max-w-md">
          {question.cargo}
        </span>
      </div>

      {/* Enunciado */}
      <div className="px-6 sm:px-8 py-4">
        <div className="prose prose-sm max-w-none text-[14.5px] leading-relaxed text-slate-800 whitespace-pre-wrap">
          {question.enunciado}
        </div>
      </div>

      {/* Alternativas */}
      <div className="px-6 sm:px-8 pb-4 space-y-2">
        {question.alternativas.map((alt) => {
          const selected = userAnswer === alt.letter;
          const isCorrect = isRevealed && alt.letter === question.gabarito;
          const isWrongPick = isRevealed && selected && alt.letter !== question.gabarito;

          let bg = 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40';
          if (selected && !isRevealed) bg = 'bg-blue-50 border-blue-300';
          if (isCorrect) bg = 'bg-emerald-50 border-emerald-400';
          if (isWrongPick) bg = 'bg-red-50 border-red-300';

          return (
            <button
              key={alt.letter}
              onClick={() => selectAnswer(alt.letter)}
              disabled={isRevealed}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${bg} ${
                isRevealed ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isWrongPick
                      ? 'bg-red-500 text-white'
                      : selected
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                }`}
              >
                {alt.letter}
              </span>
              <span className="flex-1 text-[13.5px] leading-relaxed text-slate-800 pt-0.5">
                {alt.text}
              </span>
              {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
              {isWrongPick && <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Reveal / Comentário */}
      <div className="px-6 sm:px-8 pb-6">
        {!isRevealed && userAnswer && (
          <button
            onClick={reveal}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
          >
            <Award className="h-4 w-4 text-amber-300" />
            Ver gabarito comentado
          </button>
        )}

        {!userAnswer && !isRevealed && (
          <p className="text-center text-xs text-slate-400">
            Selecione uma alternativa pra ver o gabarito.
          </p>
        )}

        {isRevealed && (
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                Gabarito · {question.gabarito}
              </span>
              {userAnswer === question.gabarito ? (
                <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                  Você acertou
                </span>
              ) : (
                <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-red-500 text-white">
                  Você errou
                </span>
              )}
            </div>
            <div className="prose prose-sm max-w-none text-[13.5px] leading-relaxed text-slate-800">
              <MarkdownRenderer content={question.comentario} />
            </div>
          </div>
        )}
      </div>

      {/* Footer / Navigation */}
      <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {questions.map((q, i) => {
            const done = revealed.has(q.id);
            const correct = done && answers[q.id] === q.gabarito;
            return (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? 'w-6 bg-blue-700'
                    : done
                      ? `w-2 ${correct ? 'bg-emerald-500' : 'bg-red-400'}`
                      : 'w-2 bg-slate-300'
                }`}
                title={`Questão ${i + 1}`}
              />
            );
          })}
        </div>

        {index < total - 1 ? (
          <button
            onClick={goNext}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-bold text-blue-700 hover:text-blue-800"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700"
            title="Recomeçar"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refazer
          </button>
        )}
      </div>

      {/* CTA — só aparece após responder todas */}
      {allDone && (
        <div className="px-6 sm:px-8 py-5 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] text-white">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-amber-300 mb-1">
            Você acertou {correctCount} de {total}
          </p>
          <h4 className="font-['Manrope'] text-xl font-extrabold mb-1">
            Quer agora pro <strong className="text-amber-300">seu cargo</strong>, com seu nível?
          </h4>
          <p className="text-sm text-white/80 mb-3">
            Gere quantos simulados quiser, com gabarito explicado, no padrão da banca {bancaLabel}.
          </p>
          <button
            onClick={() => navigate('/auth?mode=criar')}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Criar conta · R$ 40/mês
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};

export default InteractiveQuestionPreview;
