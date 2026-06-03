// Tipos compartilhados entre todos os concursos do app.
// Cada concurso registra cargos + matérias próprias.

export type Nivel =
  | 'alfabetizado'
  | 'fundamental'
  | 'medio'
  | 'medio_tecnico'
  | 'superior'
  | 'superior_educacao';

export type Categoria = 'gerais' | 'educacao' | 'saude' | 'especifico';

export interface Materia {
  nome: string;
  conteudo: string;
  categoria: Categoria;
}

export interface Cargo {
  slug: string;
  nome: string;
  nivel: Nivel;
  vagas: string;
  cargaHoraria: string;
  salario: string;
  requisitos: string;
  materiasIds: string[];
}

// ── Prova Integradora (Afya) ──
// Conteúdo fixo (não gerado por IA): questões transcritas de devolutivas reais.
export interface AlternativaIntegradora {
  letra: string;        // 'A' | 'B' | 'C' | 'D'
  texto: string;
  correta: boolean;
}

export interface QuestaoIntegradora {
  numero: number;
  codigo: string | null;
  enunciado: string;
  alternativas: AlternativaIntegradora[];
  gabarito: string | null;
  respostaComentada: string;
  referencia: string;
  subareas: string[];
  possivelImagem: boolean;
}

export interface ProvaIntegradora {
  id: string;            // 'afya-2025-1'
  titulo: string;        // 'Integradora 2025.1'
  turmaSlug: string;     // 'turma-61'
  modo: 'multipla' | 'revisao';  // multipla = MC A-D; revisao = só correta + justificativa
  total: number;         // nº de questões
  // Loader lazy do JSON com as questões (separa do bundle inicial).
  load: () => Promise<QuestaoIntegradora[]>;
}

export interface Turma {
  slug: string;          // 'turma-61'
  nome: string;          // 'Turma 61'
}

export interface Concurso {
  slug: string;            // identificador URL: 'baependi' | 'alagoa'
  nome: string;            // "Prefeitura de Baependi"
  municipio: string;
  uf: string;
  banca: string;           // "INEPAM" | "Instituto Consulplan"
  bancaSlug: string;       // "inepam" | "consulplan"
  numeroEdital: string;    // "002/2026"
  validade: string;        // "2 anos…"
  inscricoes?: string;     // URL ou descrição
  inscricoesPeriodo?: string;
  cargos: Cargo[];
  materias: Record<string, Materia>;
  // Cor primária pra UI/branding (opcional). Default = azul do app.
  themeColor?: string;
  // ── Pagamento ──
  // 'stripe_mensal' = Stripe recorrente (Baependi). 'pix_unico' = PIX único vitalício (Alagoa/Afya).
  paymentModel?: 'stripe_mensal' | 'pix_unico';
  precoLabel?: string;        // "R$ 40/mês" | "R$ 60 · pagamento único"
  formaPagamento?: string;    // "Stripe · cartão" | "PIX · pagamento único"
  valorCentavos?: number;     // 4000 | 6000
  // ── Tipo de produto ──
  // 'concurso' (default) = cargos + matérias + IA. 'integradora' = provas fixas Afya.
  tipo?: 'concurso' | 'integradora';
  turmas?: Turma[];
  provas?: ProvaIntegradora[];
}

export const NIVEL_LABEL: Record<Nivel, string> = {
  alfabetizado: 'Alfabetizado',
  fundamental: 'Ensino Fundamental',
  medio: 'Ensino Médio',
  medio_tecnico: 'Médio / Técnico',
  superior: 'Ensino Superior',
  superior_educacao: 'Superior — Educação',
};

// ─── Helpers que recebem o concurso explicitamente ───
export const getCargoBySlug = (concurso: Concurso, slug: string): Cargo | undefined =>
  concurso.cargos.find((c) => c.slug === slug);

export const getMateriaById = (concurso: Concurso, id: string): Materia | undefined =>
  concurso.materias[id];

export const cargosByNivel = (concurso: Concurso): Record<Nivel, Cargo[]> => {
  const out: Partial<Record<Nivel, Cargo[]>> = {};
  for (const c of concurso.cargos) {
    if (!out[c.nivel]) out[c.nivel] = [];
    out[c.nivel]!.push(c);
  }
  return {
    alfabetizado: out.alfabetizado ?? [],
    fundamental: out.fundamental ?? [],
    medio: out.medio ?? [],
    medio_tecnico: out.medio_tecnico ?? [],
    superior: out.superior ?? [],
    superior_educacao: out.superior_educacao ?? [],
  };
};
