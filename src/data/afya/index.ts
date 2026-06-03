// Afya — Prova Integradora.
// Produto distinto dos concursos municipais: provas FIXAS transcritas de
// devolutivas reais (não geradas por IA). Acesso via PIX único (modelo Alagoa).
// Organizado por turma (61, 62). As questões carregam sob demanda (lazy).

import type { Concurso, ProvaIntegradora, QuestaoIntegradora } from '../concursos/types';

const loadProva = (
  importer: () => Promise<{ default: unknown }>,
): (() => Promise<QuestaoIntegradora[]>) => {
  return async () => {
    const mod = await importer();
    return mod.default as QuestaoIntegradora[];
  };
};

export const provas: ProvaIntegradora[] = [
  {
    id: 'afya-2025-2',
    titulo: 'Integradora 2025.2',
    turmaSlug: 'turma-61',
    modo: 'multipla',
    total: 50,
    load: loadProva(() => import('./2025-2.json')),
  },
  {
    id: 'afya-2025-1',
    titulo: 'Integradora 2025.1',
    turmaSlug: 'turma-61',
    modo: 'multipla',
    total: 50,
    load: loadProva(() => import('./2025-1.json')),
  },
  {
    id: 'afya-2024-1',
    titulo: 'Integradora 6º Período · 2024.1',
    turmaSlug: 'turma-61',
    modo: 'revisao',
    total: 50,
    load: loadProva(() => import('./2024-1.json')),
  },
];

export const getProvaById = (id: string): ProvaIntegradora | undefined =>
  provas.find((p) => p.id === id);

export const provasByTurma = (turmaSlug: string): ProvaIntegradora[] =>
  provas.filter((p) => p.turmaSlug === turmaSlug);

export const concurso: Concurso = {
  slug: 'afya',
  nome: 'Afya — Prova Integradora',
  municipio: 'Curso de Medicina',
  uf: 'Afya',
  banca: 'Afya',
  bancaSlug: 'afya',
  numeroEdital: '—',
  validade: 'Acesso vitalício',
  cargos: [],
  materias: {},
  tipo: 'integradora',
  // Verde-azulado clínico, distinto do azul/esmeralda dos concursos.
  themeColor: '#0e7490',
  paymentModel: 'pix_unico',
  // TODO: ajustar o valor real da Prova Integradora Afya (placeholder R$ 50).
  precoLabel: 'R$ 50 · pagamento único',
  formaPagamento: 'PIX · pagamento único',
  valorCentavos: 5000,
  turmas: [
    { slug: 'turma-61', nome: 'Turma 61' },
    { slug: 'turma-62', nome: 'Turma 62' },
  ],
  provas,
};
