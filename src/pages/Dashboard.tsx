import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Target,
} from 'lucide-react';
import { cargos, editalInfo } from '@/data/baependi';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import logoColor from '@/assets/logo-concursos.svg';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status, planType } = useSubscription();

  const userName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Aluno';
  }, [user]);

  const cargoHighlights = useMemo(() => cargos.slice(0, 6), []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoColor} alt="ConcursosAI" className="h-8 w-8" />
            <div>
              <p className="font-['Manrope'] font-extrabold tracking-tight">Dashboard</p>
              <p className="text-xs text-slate-500">Área do aluno com acesso liberado</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-200 transition-colors"
          >
            Ver landing
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8">
        <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] p-7 sm:p-9 text-white shadow-[0_24px_80px_-28px_rgba(30,58,138,0.45)]">
            <p className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-300 mb-4">
              <span className="w-7 h-px bg-amber-400" />
              Acesso ativo
            </p>
            <h1 className="font-['Manrope'] text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.02]">
              Bem-vindo, {userName}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed">
              Seu acesso já está liberado. Agora o caminho mais rápido é escolher um cargo, gerar o simulado e revisar com foco no que realmente cai.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/exam?banca=INEPAM')}
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-amber-400 text-slate-950 text-sm font-extrabold hover:bg-amber-300 transition-colors"
              >
                Gerar simulado agora
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/cargos/auxiliar-administrativo')}
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-bold hover:bg-white/15 transition-colors"
              >
                Ver um cargo pronto
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              ['Status do acesso', status === 'active' ? 'Liberado' : 'Pendente', CheckCircle2],
              ['Plano', planType === 'owner' ? 'Owner' : planType === 'manual' ? 'Manual' : planType, LayoutDashboard],
              ['Banca base', editalInfo.banca, Building2],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            ['1', 'Escolha o cargo', 'Entre no cargo que você quer prestar e veja as matérias organizadas.'],
            ['2', 'Gere o treino', 'Crie questões com banca, nível e quantidade do jeito que fizer mais sentido.'],
            ['3', 'Revise melhor', 'Use os comentários para entender a lógica da cobrança e ganhar ritmo.'],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-extrabold flex items-center justify-center mb-4">
                {step}
              </div>
              <h2 className="font-['Manrope'] text-base font-extrabold text-slate-950">{title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{text}</p>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)]">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-3 inline-flex items-center gap-2">
              <Target className="w-4 h-4" />
              Seu próximo passo
            </p>
            <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-[-0.03em] text-slate-950">
              Comece pelo edital de {editalInfo.municipio}/{editalInfo.uf}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mt-4">
              A base já está organizada para acelerar sua preparação municipal com foco em cargos, matérias e treino prático.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                ['Simulados com cara de prova', BookOpenCheck],
                ['Matérias mapeadas por cargo', FileText],
                ['Treino mais rápido e objetivo', Clock3],
              ].map(([label, Icon]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                    <Icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-2 inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Cargos sugeridos
                </p>
                <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-950">
                  Comece por um destes
                </h2>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Ver todos
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {cargoHighlights.map((cargo) => {
                const NivelIcon = cargo.nivel === 'superior' ? GraduationCap : cargo.nivel === 'medio' ? Building2 : FileText;
                return (
                  <button
                    key={cargo.slug}
                    onClick={() => navigate(`/cargos/${cargo.slug}`)}
                    className="text-left rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-blue-300 hover:bg-white transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 mb-3">
                      <NivelIcon className="w-5 h-5 text-blue-700" />
                    </div>
                    <p className="font-['Manrope'] text-sm font-extrabold text-slate-950 leading-snug">
                      {cargo.nome}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {cargo.salario} · {cargo.materiasIds.length} matérias
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
