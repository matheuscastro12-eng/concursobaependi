// Tema visual por concurso. Cada slug tem sua paleta — usado pra evitar
// hardcode de cor em componentes que recebem `concurso`.

export interface ConcursoTheme {
  gradient: string;
  accent: string;
  primaryBg: string;
  primaryHover: string;
  textHighlight: string;
  iconColor: string;
  borderHover: string;
  shadowHover: string;
}

export const THEMES: Record<string, ConcursoTheme> = {
  baependi: {
    gradient: 'from-[#0F172A] via-[#1E3A8A] to-[#2563EB]',
    accent: 'amber-300',
    primaryBg: 'bg-blue-700',
    primaryHover: 'hover:bg-blue-800',
    textHighlight: 'text-blue-700',
    iconColor: 'text-blue-700',
    borderHover: 'hover:border-blue-500/40',
    shadowHover: 'hover:shadow-[0_12px_32px_-12px_rgba(37,99,235,0.20)]',
  },
  alagoa: {
    gradient: 'from-[#052e2b] via-[#065f46] to-[#10b981]',
    accent: 'amber-300',
    primaryBg: 'bg-emerald-700',
    primaryHover: 'hover:bg-emerald-800',
    textHighlight: 'text-emerald-700',
    iconColor: 'text-emerald-700',
    borderHover: 'hover:border-emerald-500/40',
    shadowHover: 'hover:shadow-[0_12px_32px_-12px_rgba(16,185,129,0.20)]',
  },
};

export const getTheme = (slug: string): ConcursoTheme =>
  THEMES[slug] ?? THEMES.baependi;
