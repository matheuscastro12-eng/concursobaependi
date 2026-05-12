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
