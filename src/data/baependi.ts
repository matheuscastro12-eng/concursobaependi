// Shim de compatibilidade: o conteúdo real foi movido pra
// `src/data/concursos/baependi.ts`. Esse arquivo apenas re-exporta
// tudo pra não quebrar imports antigos espalhados no codebase.
//
// Novos componentes devem importar de `@/data/concursos` (registry)
// ou diretamente do arquivo de um concurso específico.

export * from './concursos/baependi';
