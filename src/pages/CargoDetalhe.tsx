import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles, Briefcase, Clock, DollarSign, Award } from 'lucide-react';
import { getCargoBySlug, getMateriaById, editalInfo, NIVEL_LABEL } from '@/data/baependi';
import logoColor from '@/assets/logo-concursos.svg';

const CATEGORIA_LABEL: Record<string, string> = {
  gerais: 'Conhecimentos Gerais',
  educacao: 'Educação (comum)',
  saude: 'Saúde (comum)',
  especifico: 'Conhecimentos Específicos',
};

const CATEGORIA_COLOR: Record<string, string> = {
  gerais: 'bg-slate-100 text-slate-700',
  educacao: 'bg-purple-100 text-purple-700',
  saude: 'bg-emerald-100 text-emerald-700',
  especifico: 'bg-blue-100 text-blue-700',
};

const CargoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cargo = slug ? getCargoBySlug(slug) : undefined;

  if (!cargo) return <Navigate to="/" replace />;

  const handleGerar = (materiaNome: string) => {
    const params = new URLSearchParams({
      tema: materiaNome,
      banca: editalInfo.banca,
      cargo: cargo.nome,
    });
    navigate(`/exam?${params.toString()}`);
  };

  const handleGerarTodas = () => {
    const params = new URLSearchParams({
      tema: `Conhecimentos gerais e específicos do cargo de ${cargo.nome}`,
      banca: editalInfo.banca,
      cargo: cargo.nome,
    });
    navigate(`/exam?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 cai-animated-grid">
      {/* Top bar */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-30 cai-fade-in">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cai-interactive"
          >
            <ArrowLeft className="w-4 h-4" />
            Todos os cargos
          </button>
          <div className="flex items-center gap-2">
            <img src={logoColor} alt="ConcursosAI" className="h-7 w-7" />
            <span className="font-['Manrope'] font-bold text-sm text-slate-900">ConcursosAI</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Cargo header */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] mb-8 cai-slide-up">
          <p className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-blue-700 mb-3 cai-slide-up cai-delay-1">
            <span className="w-6 h-px bg-amber-500" />
            {NIVEL_LABEL[cargo.nivel]} · {editalInfo.municipio}/{editalInfo.uf}
          </p>
          <h1 className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl tracking-[-0.02em] text-slate-900 mb-4 cai-slide-up cai-delay-2">
            {cargo.nome}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 cai-slide-up cai-delay-3">
            <Stat icon={Briefcase} label="Vagas" value={cargo.vagas} />
            <Stat icon={Clock} label="Carga" value={cargo.cargaHoraria} />
            <Stat icon={DollarSign} label="Salário" value={cargo.salario} />
            <Stat icon={Award} label="Banca" value={editalInfo.banca} />
          </div>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-6 cai-slide-up cai-delay-4">
            <strong className="text-slate-800">Requisitos:</strong> {cargo.requisitos}
          </p>
          <button
            onClick={handleGerarTodas}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white text-sm font-bold hover:brightness-110 transition-all shadow-[0_8px_24px_-8px_rgba(37,99,235,0.45)] cai-interactive cai-sheen"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Gerar simulado completo do cargo
          </button>
        </section>

        {/* Matérias */}
        <section className="cai-slide-up cai-delay-2">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-['Manrope'] font-bold text-lg text-slate-900">
              Conteúdo programático
              <span className="ml-2 text-sm font-medium text-slate-400">
                {cargo.materiasIds.length} matérias
              </span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              Anexo II do edital
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cargo.materiasIds.map((id) => {
              const m = getMateriaById(id);
              if (!m) return null;
              return (
                <div
                  key={id}
                  className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-500/40 hover:shadow-[0_8px_24px_-12px_rgba(37,99,235,0.20)] transition-all flex flex-col cai-soft-pop cai-interactive"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <BookOpen className="w-[18px] h-[18px] text-blue-700 transition-transform group-hover:-translate-y-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block text-[9.5px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded ${CATEGORIA_COLOR[m.categoria]} mb-1.5`}>
                        {CATEGORIA_LABEL[m.categoria]}
                      </span>
                      <h3 className="font-['Manrope'] font-bold text-[14.5px] text-slate-900 leading-snug">
                        {m.nome}
                      </h3>
                    </div>
                  </div>

                  <p className="mb-4 flex-1 text-[12px] text-slate-600 leading-relaxed max-h-40 overflow-y-auto pr-1">
                    {m.conteudo}
                  </p>

                  <button
                    onClick={() => handleGerar(m.nome)}
                    className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-blue-700 transition-colors cai-interactive"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Gerar questões
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer dica */}
        <div className="mt-10 rounded-2xl border border-amber-200/60 bg-amber-50/40 p-5 cai-slide-up cai-delay-3">
          <p className="text-sm font-bold text-amber-900 mb-1">Dica</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Gere as questões da matéria que você quer treinar. Você escolhe quantidade,
            nível de dificuldade e número de alternativas. As questões são geradas no
            padrão da banca {editalInfo.banca}.
          </p>
        </div>
      </main>
    </div>
  );
};

function Stat({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 transition-transform hover:scale-110">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-[12.5px] font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

export default CargoDetalhe;
