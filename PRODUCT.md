<div align="center">

<img src="src/assets/logo-concursos.svg" alt="ConcursosAI" width="96" />

# ConcursosAI

### Estude para concurso municipal com simulados que parecem prova de verdade.

**[→ Acessar agora](https://concursobaependi.vercel.app)**

<br/>

![Concurso](https://img.shields.io/badge/Edital-002%2F2026_Baependi%2FMG-1D4ED8?style=for-the-badge)
![Banca](https://img.shields.io/badge/Banca-INEPAM-F59E0B?style=for-the-badge)
![Cargos](https://img.shields.io/badge/Cargos-45_mapeados-0F172A?style=for-the-badge)
![IA](https://img.shields.io/badge/IA-Gemini_2.5_Flash-2563EB?style=for-the-badge)

</div>

<br/>

---

## O problema

Você abriu o edital. Tem **40 páginas**, **45 cargos** diferentes, conteúdo programático denso e zero amostra de prova anterior dessa banca em qualquer site. O material de cursinho é genérico — pensado pra CESPE, FCC, VUNESP — e não bate com o que cai numa prefeitura de cidade pequena.

Você acaba estudando matéria errada, com peso errado, no nível errado.

---

## A solução

**ConcursosAI** é um treinador de simulado pensado pra um concurso específico. A gente já leu o edital, mapeou os 45 cargos, transcreveu o conteúdo programático fiel ao Anexo II e calibrou um motor de IA pra gerar questões no estilo da banca **INEPAM** — com lei seca, pegadinhas típicas e gabarito comentado.

> Você escolhe o cargo. A gente escolhe o resto.

<br/>

## O que tem dentro

<table>
<tr>
<td width="50%" valign="top">

### Catálogo do edital
Os **45 cargos** do concurso de Baependi 2026 com vagas, salário, carga horária e requisitos. Buscável e filtrável por nível.

### Matérias fiéis ao Anexo II
Conteúdo programático **transcrito literalmente** do edital. Sem resumo, sem adaptação. O que cai é o que está aqui.

</td>
<td width="50%" valign="top">

### Simulado IA no padrão da banca
Escolha tema, banca, cargo, nível e quantidade. A IA gera questões inéditas com **5 alternativas, gabarito e comentário fundamentado** — citando lei e artigo quando cabível.

### Calibração de dificuldade
Modos **Nível Médio** (lei seca, conceitos diretos) e **Nível Superior** (casos práticos, jurisprudência). Distratores plausíveis. Pegadinhas reais.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Gabarito comentado de verdade
Cada questão vem com explicação detalhada: por que a correta está certa **e** por que cada errada está errada — apontando o erro específico (palavra trocada, prazo, competência).

</td>
<td width="50%" valign="top">

### Cobertura por área
- **Saúde** (SUS, atenção primária, vigilância)
- **Educação** (BNCC, LDB, ECA, PNE)
- **Administrativo** (redação oficial, Office 365, Lei 14.133)
- **Específicas por cargo** (Direito, Engenharia, Enfermagem, Pedagogia…)

</td>
</tr>
</table>

<br/>

## Como funciona

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ 1. Escolha o cargo  │ →  │ 2. Selecione        │ →  │ 3. Treine com IA    │
│                     │    │    a matéria        │    │                     │
│ Filtre por nível,   │    │                     │    │ Questões inéditas   │
│ veja vagas e        │    │ Veja o conteúdo     │    │ com comentário      │
│ salário.            │    │ programático fiel.  │    │ citando lei/artigo. │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

Tudo em **menos de 30 segundos** entre o login e a primeira questão. Streaming em tempo real — você lê enquanto a IA escreve.

<br/>

## Para quem é

- **Concurseiros de Baependi/MG** — concurso 002/2026
- **Quem está se preparando para concursos municipais com bancas pequenas** (INEPAM, IBAM, OBJETIVA, AVANÇA SP) onde **não há prova anterior pública**
- **Estudantes que cansaram de cursinho genérico** e querem treinar especificamente o cargo e a banca alvo

<br/>

## Por que funciona

| | Cursinho tradicional | ConcursosAI |
|---|:---:|:---:|
| Material genérico | sim | — |
| Foco no edital exato | — | sim |
| Cargo específico | — | sim |
| Banca específica | — | sim |
| Questões ilimitadas | — | sim |
| Gabarito comentado | parcial | sim |
| Atualização instantânea | — | sim |

<br/>

## Stack

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

- **Frontend** — React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend** — Supabase (Postgres + Auth + Storage + RLS)
- **IA** — Google Gemini 2.5 Flash (streaming SSE) com proxy serverless no Vercel para proteger a API key
- **Deploy** — Vercel Edge Functions + CDN global

<br/>

## Roadmap

- [x] Catálogo de 45 cargos do edital de Baependi 2026
- [x] Conteúdo programático transcrito do Anexo II
- [x] Gerador de simulado IA com calibração por nível e banca
- [x] Cadastro com pagamento PIX e CRM administrativo
- [x] Deploy em produção
- [ ] Importação de edital próprio (PDF → matérias extraídas pela IA)
- [ ] Importação de provas anteriores em PDF
- [ ] Modo simulado cronometrado com folha de respostas
- [ ] Estatísticas de desempenho por matéria
- [ ] App mobile (PWA)

<br/>

## Rodar local

```bash
git clone https://github.com/matheuscastro12-eng/concursobaependi
cd concursobaependi
npm install
cp .env.example .env.local
# preencher: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_GOOGLE_AI_API_KEY
npm run dev
```

Aplicação sobe em `http://localhost:5174`.

<br/>

---

<div align="center">

**ConcursosAI** — preparação focada para concursos públicos municipais.

Feito para concurseiros de Baependi · Edital 002/2026 · Banca INEPAM

[Acessar →](https://concursobaependi.vercel.app)

</div>
