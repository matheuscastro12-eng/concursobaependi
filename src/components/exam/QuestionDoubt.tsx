import { useEffect, useRef, useState } from 'react';
import { MessageCircleQuestion, Send, Sparkles, X, Loader2 } from 'lucide-react';
import { useQuestionAssistant, type QuestionContext } from '@/hooks/useQuestionAssistant';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface QuestionDoubtProps {
  questionId: string | number;
  context: QuestionContext;
}

const SUGESTOES_PADRAO = [
  'Explique a lei ou conceito principal dessa questão.',
  'Por que cada alternativa errada está errada?',
  'Quais pegadinhas a banca costuma cobrar nesse tema?',
  'Me dê um exemplo prático para fixar o conceito.',
];

const QuestionDoubt = ({ questionId, context }: QuestionDoubtProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, streaming, ask, reset } = useQuestionAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reseta o histórico sempre que troca de questão.
  useEffect(() => {
    reset();
    setOpen(false);
    setInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Auto-scroll pro final quando chega mensagem nova.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setInput('');
    await ask(trimmed, context);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-all active:scale-[0.98]"
      >
        <MessageCircleQuestion className="h-4 w-4" />
        Tirar dúvida sobre essa questão
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50/40 via-white to-amber-50/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-700/95 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span className="text-xs font-bold uppercase tracking-[0.14em]">Tutor IA · esta questão</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-white/15 transition-colors"
          title="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Sugestões prontas — só aparecem antes da primeira mensagem */}
      {messages.length === 0 && (
        <div className="px-4 pt-3 pb-2 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Comece com uma sugestão ou escreva sua dúvida
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {SUGESTOES_PADRAO.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={streaming}
                className="text-left text-[12px] leading-snug px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-700 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                }`}
              >
                {m.role === 'assistant' ? (
                  m.content ? (
                    <div className="prose prose-sm max-w-none [&_p]:my-1 [&_p]:text-[13px] [&_strong]:text-slate-900">
                      <MarkdownRenderer content={m.content} />
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      pensando…
                    </span>
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-200 bg-white"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={streaming ? 'Aguardando resposta…' : 'Escreva sua dúvida…'}
          disabled={streaming}
          className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 bg-slate-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-700 text-white disabled:opacity-40 hover:bg-blue-800 transition-colors active:scale-95"
          title="Enviar"
        >
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
};

export default QuestionDoubt;
