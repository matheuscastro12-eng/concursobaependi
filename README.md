# ConcursosAI

App de provas para concursos — extraído do PreceptorMED.

## O que veio

- **Importador de provas (PDF)** — `/provas` → upload → extração via Gemini → revisão → simulado online
  - Páginas: `Provas.tsx`, `ProvaReview.tsx`, `ProvaSimulado.tsx`
  - Hook: `useProvas.ts`
  - Edge function: `supabase/functions/ingest-prova/`
  - Migration: `supabase/migrations/20260101000000_bootstrap.sql` (consolidada)

- **Geração de prova IA** — `/exam` → tema + nº questões + nível → IA gera markdown com gabarito comentado
  - Página: `Exam.tsx` + `components/exam/`
  - Hook: `useExamGenerator.ts`
  - Edge function: `supabase/functions/generate-exam/`

- **Explicar questão** — botão "Explicar com IA" dentro do simulado
  - Edge function: `supabase/functions/explain-question/`

## O que NÃO veio (e foi limpo)

CRM, gamificação, flashcards, ENAMED bank, Whitebook, Scribe, pagamentos, scientific-mentor.
Migrations antigas estão em `supabase/_legacy_migrations/` (referência apenas — não rode).

## Setup

### 1. Dependências
```bash
npm install
```

### 2. Supabase project novo
1. Criar projeto em supabase.com
2. Copiar `.env.example` → `.env`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```
3. Linkar CLI:
```bash
npx supabase link --project-ref <project-ref>
```
4. Aplicar migration:
```bash
npx supabase db push --yes
```
5. Deploy edge functions:
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy generate-exam --no-verify-jwt
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy ingest-prova --no-verify-jwt
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy explain-question --no-verify-jwt
```
6. Setar secret do Gemini:
```bash
npx supabase secrets set GOOGLE_AI_API_KEY=<sua-key>
```

### 3. Dev
```bash
npm run dev
```

## Adaptações pendentes

O código ainda tem terminologia médica em alguns prompts. Para concursos:
- **`supabase/functions/generate-exam/index.ts`** — ajustar `systemInstruction` para concurso público (banca, edital, jurisprudência etc).
- **`supabase/functions/ingest-prova/index.ts`** — o prompt extrai questões de múltipla escolha genérico, deve funcionar; só verificar.
- **`supabase/functions/explain-question/`** — também tem viés médico no prompt; ajustar.
- **`src/pages/Exam.tsx`** — remover seleção de "biblioteca de fechamentos" (resumos médicos); mudar pra input de tema/edital direto.
- **`src/hooks/useExamGenerator.ts`** — os prompts hard-coded mencionam "residência" / "ENAMED"; trocar.

## Limpezas adicionais a fazer

- [ ] Apagar `supabase/_legacy_migrations/` quando tiver certeza
- [ ] Reduzir `package.json` (várias deps de mindmap, tiptap, recharts podem sair)
- [ ] Remover `src/components/ui/*` que não são usados
- [ ] Renomear `fechamentos` → conceito equivalente ou remover qualquer referência

## Stack

React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase + Gemini 2.5 Flash.
