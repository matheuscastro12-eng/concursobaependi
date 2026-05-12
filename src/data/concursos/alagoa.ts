// Edital Concurso Público 002/2026 - Município de Alagoa/MG (PM Alagoa + FMS)
// Banca: Instituto Consulplan
// Conteúdo programático transcrito do Anexo I do edital.

import type { Cargo, Concurso, Materia } from './types';

// ─────────────────────────────────────────────────────────
// MATÉRIAS — conteúdo programático fiel ao Anexo I
// ─────────────────────────────────────────────────────────
const materias: Record<string, Materia> = {
  // ───── NÍVEL ALFABETIZADO (Quadro I) ─────
  'al-port-alfa': {
    nome: 'Língua Portuguesa (Alfabetizado)',
    categoria: 'gerais',
    conteudo:
      'Leitura e compreensão de textos, informações de pequenos textos. Estabelecer relações entre sequência de fatos ilustrados. Conhecimento da língua: ortografia; acentuação gráfica; pontuação; masculino e feminino; antônimo e sinônimo; diminutivo e aumentativo. Divisão silábica.',
  },
  'al-mat-alfa': {
    nome: 'Raciocínio Lógico-Matemático (Alfabetizado)',
    categoria: 'gerais',
    conteudo:
      'Raciocínio verbal. Raciocínio sequencial (sequências lógicas envolvendo números, letras e figuras). Raciocínio espacial. Raciocínio temporal. Comparações. Calendários. Numeração. Contagem, medição, avaliação e quantificação. Simetria. Questões envolvendo o entendimento das estruturas lógicas de relações entre pessoas, lugares, coisas ou eventos. Problemas sobre as quatro operações fundamentais da matemática.',
  },
  'al-cg-comum': {
    nome: 'Conhecimentos Gerais e Atualidades',
    categoria: 'gerais',
    conteudo:
      'Programa de Atualidades: domínio de tópicos relevantes de diversas áreas como política, economia, sociedade, educação, tecnologia, energia, relações internacionais, desenvolvimento sustentável, meio ambiente, segurança, artes, cultura, literatura e suas vinculações históricas a nível nacional e internacional.',
  },

  // ───── NÍVEL FUNDAMENTAL (Quadro II) ─────
  'al-port-fund': {
    nome: 'Língua Portuguesa (Fundamental)',
    categoria: 'gerais',
    conteudo:
      'Leitura, interpretação e compreensão de textos. A significação das palavras no texto. Emprego das classes de palavras. Pontuação. Acentuação gráfica. Ortografia. Fonética e fonologia. Termos essenciais da oração. Classificação das palavras quanto ao número de sílabas e quanto à disposição da sílaba tônica. Tempos e modos verbais. Reescrita de frases.',
  },
  'al-mat-fund': {
    nome: 'Raciocínio Lógico-Matemático (Fundamental)',
    categoria: 'gerais',
    conteudo:
      'Sistema Métrico Decimal. Razão. Proporção. Divisão Proporcional. Regra de Três (simples e composta). Porcentagem. Equações do 1º Grau e Problemas. Equações do 2º Grau e Problemas. Produtos Notáveis. Fatoração Algébrica. Geometria básica. Conjuntos. Numeração. Probabilidade.',
  },

  // ───── NÍVEL MÉDIO/TÉCNICO (Quadro III) ─────
  'al-port-medio': {
    nome: 'Língua Portuguesa (Médio/Técnico)',
    categoria: 'gerais',
    conteudo:
      'Fonologia: conceito; encontros vocálicos; dígrafos; ortoépia; divisão silábica; prosódia; acentuação; ortografia. Morfologia: estrutura e formação das palavras; classes de palavras. Sintaxe: termos da oração; período composto; conceito e classificação das orações; concordância verbal e nominal; regência verbal e nominal; crase e pontuação. Semântica: a significação das palavras no texto. Interpretação de texto.',
  },
  'al-mat-medio': {
    nome: 'Raciocínio Lógico-Matemático (Médio/Superior)',
    categoria: 'gerais',
    conteudo:
      'Princípio da Regressão ou Reversão. Lógica dedutiva, argumentativa e quantitativa. Lógica matemática qualitativa. Sequências lógicas envolvendo números, letras e figuras. Regra de três simples e compostas. Razões especiais. Análise combinatória e probabilidade. Progressões aritmética e geométrica. Conjuntos: as relações de pertinência, inclusão e igualdade; operações entre conjuntos, união, interseção e diferença. Geometria plana e espacial. Trigonometria. Conjuntos numéricos. Equações de 1º e 2º grau.',
  },
  'al-informatica-medio': {
    nome: 'Conhecimentos de Informática (Médio/Superior)',
    categoria: 'gerais',
    conteudo:
      'Conhecimentos básicos de microcomputadores PC-Hardware. Noções de Sistemas Operacionais. MS-DOS. Noções de sistemas de Windows. Noções do processador de texto MS-Word para Windows. Noções da planilha de cálculo MS-Excel. Noções básicas de Banco de dados. Comunicação de dados. Conceitos gerais de equipamentos e operacionalização. Conceitos básicos de Internet.',
  },
  'al-adm-publica': {
    nome: 'Administração Pública e Legislação Correlata',
    categoria: 'gerais',
    conteudo:
      '1. Constituição Federal de 1988: Princípios Fundamentais; Direitos e Garantias Fundamentais; Direitos sociais; Organização do Estado; Administração Pública. 2. Organização Administrativa: Centralização e Descentralização; Autarquia, Fundação, Empresa Pública e Sociedade de Economia Mista. 3. Lei da improbidade administrativa. 4. Licitações e Contratos Administrativos: Lei nº 14.133/2021 — Princípios; Definições; Modalidades, Limites e Dispensa; Contratos. 5. Processo Administrativo (Lei nº 9.784/1999). 6. Lei nº 12.527/2011 — Lei de Acesso à Informação. 7. Lei nº 13.709/2018 — Lei Geral de Proteção de Dados.',
  },

  // ───── NÍVEL SUPERIOR (Quadro IV) ─────
  'al-port-superior': {
    nome: 'Língua Portuguesa (Superior)',
    categoria: 'gerais',
    conteudo:
      'Compreensão e interpretação de textos; denotação e conotação; figuras; coesão e coerência; tipologia e gênero textual; significação das palavras; emprego das classes de palavras; sintaxe da oração e do período; pontuação; concordância verbal e nominal; regência verbal e nominal; estudo da crase; semântica e estilística. Conhecimentos de elaboração de correspondências, protocolos circulares e ofícios.',
  },

  // ───── NÍVEL SUPERIOR — EDUCAÇÃO (Quadro V) ─────
  'al-legisl-educ': {
    nome: 'Legislação Educacional',
    categoria: 'educacao',
    conteudo:
      'Lei nº 9.394, de 20 de dezembro de 1996, que estabelece as diretrizes e bases da educação nacional (LDB); Base Nacional Comum Curricular (BNCC); Plano Nacional de Educação (PNE).',
  },
  'al-didatico-pedag': {
    nome: 'Conhecimentos Didático-Pedagógicos (comum a Educação)',
    categoria: 'educacao',
    conteudo:
      'Fundamentos da educação: conceitos e concepções pedagógicas. Aspectos históricos da educação brasileira. Diretrizes Curriculares Nacionais e suas implicações na prática pedagógica. Educação, trabalho, formação profissional. Função histórica e social da escola. Organização do processo didático: planejamento, estratégias e metodologias, avaliação. Avaliação como processo contínuo, investigativo e inclusivo. Didática. Currículo e cultura. Conteúdos curriculares e aprendizagem. Projetos de trabalho. Interdisciplinaridade e contextualização. Multiculturalismo. Projeto Político-Pedagógico (PPP). Sala de aula como ambiente interativo. Professor mediador. Planejamento e gestão educacional. Gestão da aprendizagem. Filosofias tradicionais e teorias educacionais contemporâneas. Piaget, Vygotsky e Wallon. Psicologia do desenvolvimento. Temas contemporâneos: bullying, escolha da profissão, transtornos alimentares, família, escolhas sexuais, diferenças individuais, de gênero, étnicas e socioculturais. Educação Especial e Inclusiva.',
  },

  // ───── ESPECÍFICAS POR CARGO ─────
  'al-esp-aux-administrativo': {
    nome: 'Auxiliar Administrativo — Específico',
    categoria: 'especifico',
    conteudo:
      '1. Direito Administrativo: organização administrativa; administração direta e indireta; desconcentração; princípios; órgãos públicos; agentes públicos; processo administrativo; poderes administrativos; ato administrativo; controle e responsabilização; improbidade administrativa; responsabilidade civil do Estado; licitações e contratos (Lei 14.133/2021). 2. Direito Constitucional: conceito, classificações, princípios fundamentais; direitos e garantias fundamentais; nacionalidade, cidadania, direitos políticos; organização político-administrativa; administração pública (arts. 7º e 37 a 41); Organização dos Poderes Legislativo e Executivo (arts. 44 a 91). 3. Administração: planejar, organizar, dirigir, controlar; eficiência, eficácia e efetividade; pensamento sistêmico; novas tecnologias; estruturas organizacionais; liderança, motivação, clima e cultura organizacional; gestão de pessoas; gestão da qualidade; processo decisório; administração de material e logística. 4. Administração pública: modelos (patrimonialista, burocrática, gerencial); governabilidade, governança, accountability; gestão pública empreendedora; inovação no setor público. 5. Rotinas administrativas: técnicas de arquivo e protocolo; processos de comunicação; organização de reuniões; atendimento ao público e telefônico. 6. Redação Oficial: princípios, características, linguagem, formas de tratamento, fechos, identificação do signatário, padronização, diagramação. Padrão ofício, correio eletrônico, atas, pareceres, memorandos, contratos, alvará, requerimento, certidão, atestado, declaração, despacho, portaria, relatório, ordem de serviço, exposição de motivos.',
  },
  'al-esp-tec-enfermagem-fms': {
    nome: 'Técnico de Enfermagem da FMS — Específico',
    categoria: 'saude',
    conteudo:
      'Semiotécnica aplicada à enfermagem. Administração de medicamentos. Central de Material Esterilizado (CME). Prevenção e controle da Infecção Hospitalar (IH) ou Infecção Relacionada à Assistência à Saúde (IRAS). Biossegurança. Segurança do paciente nos serviços de saúde. Assistência de enfermagem à mulher; criança; adolescente; homem; pessoa idosa; portadores de transtorno mentais e/ou em abuso e dependência de substâncias psicoativas e em tratamento clínico e cirúrgico. Assistência em urgência e emergência. SUS: princípios doutrinários e organizativos; bases legais; pacto; controle social. Vigilância em saúde. Política Nacional de Humanização (HumanizaSUS). Modelo de Atenção Integral à Saúde da Pessoa Idosa. Programa Nacional de Imunização (PNI). Sala de vacina. Cuidados paliativos. Doenças crônicas não transmissíveis e transmissíveis. Farmacologia aplicada à enfermagem. Atenção Primária em Saúde. Lei do Exercício Profissional da Enfermagem.',
  },
  'al-esp-aux-enfermagem-psf': {
    nome: 'Auxiliar de Enfermagem do PSF — Específico',
    categoria: 'saude',
    conteudo:
      'Acolhimento na atenção primária: conceitos; formas de organização; avaliação do processo de trabalho; trabalho em equipe. Saúde da Família: conceito de territorialização; visita domiciliar. Anotações e registros de enfermagem. Técnicas básicas: sinais vitais; termoterapia; crioterapia; sondagens; aspirações; nebulização; oxigenoterapia; lavagens gastrointestinais; banho no leito. Mensuração de peso; aplicações de medicações (vias e técnicas); medicação parenteral; venóclise; curativos; posição para exames; alimentações e coleta de material para exames. Princípios básicos de limpeza, desinfecção e esterilização. Assistência de enfermagem à mulher, criança e adolescente. Controle de pacientes e de comunicantes em doenças transmissíveis (tuberculose; hanseníase; cólera; HIV; sífilis; hepatite; meningite; arboviroses; leptospirose). Assistência ao paciente com hipertensão, Diabetes Mellitus e doenças crônicas. Cuidados em AVC. Imunizações: esquema básico de vacinação; teste tuberculínico; prevenção e controle de infecções. Lei do Exercício Profissional da Enfermagem.',
  },
  'al-esp-enfermeiro-padrao': {
    nome: 'Enfermeiro Padrão — Específico',
    categoria: 'saude',
    conteudo:
      'Deontologia. Bioética. Noções de saúde coletiva e epidemiologia. Nutrição e dietética em saúde. Semiologia e semiotécnica em enfermagem. Sistematização da assistência em enfermagem (SAE). Processo do cuidar em enfermagem em todo o ciclo vital (RN, criança, adolescente, adulto, mulher e idoso). Processo do cuidar em enfermagem cirúrgica. Processo do cuidar em doenças transmissíveis. Processo do cuidar em emergências e urgências. Processo do cuidar em saúde mental e psiquiatria. Administração e gerenciamento em saúde. Saúde da família e atendimento domiciliar. Biossegurança nas ações de enfermagem. Enfermagem em centro de material e esterilização. Programa Nacional de Imunização. Código de Ética dos Profissionais da Enfermagem.',
  },
  'al-esp-nutricionista': {
    nome: 'Nutricionista — Específico',
    categoria: 'saude',
    conteudo:
      'Nutrição básica: nutrientes (conceito, classificação, funções, requerimentos, recomendações, fontes); aspectos clínicos da carência e do excesso; dietas não-convencionais; aspectos antropométricos, clínico e bioquímico da avaliação nutricional. Nutrição e fibra. Tabelas de alimentos. Alimentação nas diferentes fases biológicas. Educação nutricional. Avaliação nutricional: métodos diretos e indiretos. Técnica dietética: alimentos (conceito, classificação, grupos, valor nutritivo, caracteres organolépticos); preparo; cardápios. Higiene de alimentos: análise microbiológica e toxicológica; fontes de contaminação; modificações físicas, químicas e biológicas; ETAs. Tecnologia de alimentos: operações unitárias; conservação; embalagem; processamento de origem vegetal e animal; análise sensorial. Nutrição em saúde pública. Dietoterapia: paciente hospitalizado; fisiopatologia; tratamento; exames laboratoriais; suporte enteral e parenteral. Bromatologia: aditivos, condimentos, pigmentos; estudo químico-bromatológico (proteínas, lipídios, carboidratos); vitaminas; minerais; bebidas. Saúde pública e legislação. Código de Ética do Nutricionista.',
  },
  'al-esp-psicologo': {
    nome: 'Psicólogo — Específico',
    categoria: 'saude',
    conteudo:
      'Teorias e Técnicas Psicoterápicas. Psicoterapia breve. Entrevista Psicológica. Teorias da Personalidade. Psicopatologia. Avaliação Psicológica e Psicodiagnóstico. Psicologia da Saúde. Promoção da saúde mental. Atuação em equipes multiprofissionais no SUS. Intervenções Psicológicas em grupo. Intervenção Psicossocial com grupos. Psicologia Social no Brasil. Psicologia Social Comunitária. Intervenções em contextos comunitários e políticas públicas. Psicologia Sócio-Histórica. Exclusão social. Família: socialização, papéis, identidade e cidadania. Aspectos psicológicos da violência: urbana, doméstica, abuso físico/sexual/psicológico. Padrão comportamental agressivo, delinquente e antissocial. Bullying. Psicologia Escolar e Educacional. Desenvolvimento e Aprendizagem. Educação inclusiva. Psicopedagogia. Psicologia Organizacional e do Trabalho. Gestão de pessoas no serviço público. Saúde do Trabalhador. Psicodinâmica do Trabalho. Reabilitação profissional. SUS. SUAS. Política Nacional de Saúde Mental. Estatuto do Idoso. ECA. Estatuto da Pessoa com Deficiência. Código de Ética do Psicólogo.',
  },
  'al-esp-monitor-apoio-educ': {
    nome: 'Monitor de Apoio da Educação Básica — Específico',
    categoria: 'educacao',
    conteudo:
      'Fundamentos legais: Resolução nº 04/2009; Notas Técnicas nº 11/2010, 24/2013, 55/2013. Educação especial e inclusiva: princípios da normalização, integração e individualização. Tecnologia assistiva e suas modalidades: Comunicação Aumentativa e Alternativa (CAA). Desenvolvimento neuropsicomotor. Definições, etiologias e bases genéticas das deficiências e das altas habilidades-superdotação. Transtorno Global do Desenvolvimento (TGD); Transtorno do Espectro Autista (TEA). Atendimento Educacional Especializado (AEE) para alunos com deficiência intelectual, auditiva, surdez, deficiência visual, deficiência múltipla, surdocegueira, TGD/TEA, altas habilidades. Política Nacional de Educação Especial na Perspectiva Inclusiva. Aspectos psicológicos das famílias. Avaliação na aprendizagem inclusiva. Acessibilidade curricular. Plano de Atendimento Educacional Especializado (PAEE). Orientação e mobilidade; AVD para estudantes com deficiência visual. Leitura e escrita Braile. Noções de Soroban. Mediação. Sexualidade da pessoa com deficiência. AADID: avaliação, diagnóstico, classificação. TICs Acessíveis.',
  },
  'al-esp-prof-edfisica-1fase': {
    nome: 'Professor de Educação Física 1ª Fase — Específico',
    categoria: 'educacao',
    conteudo:
      'Legislação: Lei 9.394/1996; BNCC — Educação Física; PCN — Educação Física. História da Educação Física Escolar. Métodos de Ensino e Sequência didática em Educação Física Escolar. Conceitos sobre a Cultura Corporal do Movimento. Iniciação Esportiva: Pedagogia do Esporte — ensino de jogos coletivos para crianças. Jogos Cooperativos. Ensino das Lutas no Contexto Escolar. Ensino da Ginástica no contexto escolar. Ensino da Dança no contexto Escolar. Avaliação em Educação Física Escolar. Desenvolvimento Motor e Crescimento Humano. Educação Física Escolar Inclusiva e Educação Física Adaptada. Noções de Anatomia, Fisiologia e Primeiros Socorros. Organização de Eventos Esportivos: Festivais, Torneios e Campeonatos. Moralidade Infantil.',
  },
  'al-esp-prof-ensino-1fase': {
    nome: 'Professor de Ensino Municipal 1ª Fase — Específico',
    categoria: 'educacao',
    conteudo:
      'PCN. BNCC. Projeto Político-Pedagógico (PPP): concepção, princípios e eixos. Prática de ensino: processo de ensino-aprendizagem; organização do tempo e do espaço; atividades; avaliação; cotidiano escolar; projetos de trabalho. Interdisciplinaridade. Tendências pedagógicas; estratégias metodológicas; indicadores para a ação pedagógica. Currículo e cultura. Direito à educação: legislação educacional brasileira. Profissão docente. Infância e práticas cotidianas: contribuição da psicologia, sociologia e antropologia. Socialização, interação, múltiplas linguagens e práticas sociais. Concepções de ludicidade: jogo, brinquedo, brincadeira. Desenvolvimento da escrita, audição e leitura. Linguagem verbal e não verbal. Relações entre escrita e oralidade. Ferreiro e Teberosky: psicogênese da língua escrita. Educação matemática. Etnomatemática. Ética profissional.',
  },
  'al-esp-prof-portugues': {
    nome: 'Professor 2ª Fase — Letras (Português) — Específico',
    categoria: 'educacao',
    conteudo:
      'Novo acordo ortográfico. Norma culta e variação linguística. Acentuação gráfica. Ortografia. Elementos da comunicação. Funções de linguagem. Compreensão e interpretação de textos. Denotação e conotação. Figuras de linguagem. Coesão e coerência. Tipologia textual. Significação das palavras. Emprego das classes de palavras. Sintaxe da oração e do período. Pontuação. Concordância verbal e nominal. Regência verbal e nominal. Crase. Semântica e estilística. Literatura: dimensão estética da linguagem; instâncias de produção e legitimação; pactos de leitura. Paradigmas estéticos e movimentos literários em língua portuguesa. Teatro e gênero dramático; romance; novela; conto; poema e gêneros líricos; intertextualidade. Ensino da Língua Portuguesa: novas tecnologias. PCN: competências e habilidades. Procedimentos didático-pedagógicos. Ética profissional.',
  },
  'al-esp-prof-ingles': {
    nome: 'Professor 2ª Fase — Letras (Inglês) — Específico',
    categoria: 'educacao',
    conteudo:
      'Língua Inglesa: leitura e compreensão de diversos gêneros textuais. Tendências pedagógicas. Linguagem e discurso: ensino de inglês. Letramento e gêneros discursivos. Produção textual. Aspectos morfossintáticos e discursivos. Pluralidade cultural e variação linguística. Estratégias de leitura (skimming, scanning, prediction). Inferência e predição. Palavras cognatas e falsos cognatos. Vocabulário compatível com interpretação de texto. Aspectos linguísticos e gramaticais: tempos e modos verbais; Verb to be; Regular/Irregular verbs; Simple Present/Past; Present/Past Continuous; Present/Past Perfect; Present Perfect Continuous; Future (will, going to); Imperative; Modals (can, could, should, must, have, may); Passive voice. Preposições e conjunções. Formação e classes de palavras. Pronouns (personal, object, possessive); Possessive adjectives. Relative clauses. Comparatives and superlatives. Possessive case. Relação língua-cultura-sociedade. Produção escrita como processo. Compreensão de textos modernos. Políticas linguísticas. Documentos norteadores. Formação do professor; material didático; avaliação. Novas tecnologias. PCN.',
  },
  'al-esp-prof-matematica': {
    nome: 'Professor 2ª Fase — Matemática — Específico',
    categoria: 'educacao',
    conteudo:
      'Conjunto de números naturais (N): operações; expressão numérica. Teoria dos números: pares, ímpares, múltiplos, divisores, primos, compostos, fatoração, divisibilidade. MMC e MDC. Conjunto dos números relativos (Z) e racionais (Q): propriedades; operações. Matemática financeira: razão, proporção, regra de três, porcentagem, juros. Função polinomial real: 1º e 2º grau; equações. Expressões numéricas; produtos notáveis; fatoração; simplificação; inequações; sistemas. Geometria plana: ponto, reta, ângulos, triângulos, quadriláteros, polígonos. Geometria espacial: corpos redondos, poliedros, volumes. Análise combinatória: arranjo, permutação, combinação; binômio de Newton. Progressões aritméticas e geométricas. Polinômios. Conhecimento matemático. Processo de ensino-aprendizagem. Aspectos metodológicos. Avaliação e educação matemática. História da matemática. Tendências em educação matemática. Transposição didática. Construtivismo. Novas tecnologias. PCN. Procedimentos didático-pedagógicos. Ética profissional.',
  },
  'al-esp-prof-religioso': {
    nome: 'Professor 2ª Fase — Ensino Religioso — Específico',
    categoria: 'educacao',
    conteudo:
      'Parâmetros Curriculares Nacionais do Ensino Religioso. Fundamentos Epistemológicos do Ensino Religioso no Brasil. Elementos históricos do ensino religioso e contextualização da disciplina no Brasil. Ensino religioso e a participação social, cultura e transferência. Culturas e tradições religiosas. As escrituras sagradas. Ensino religioso/teologias e a origem do fenômeno religioso. Ensino religioso e a escola a partir da Lei nº 9.394/96. Objetivos do ensino religioso. Metodologia do ensino religioso. Direitos humanos e diversidade.',
  },
  'al-esp-prof-geografia': {
    nome: 'Professor 2ª Fase — Geografia — Específico',
    categoria: 'educacao',
    conteudo:
      'Introdução aos estudos geográficos. Ciência geográfica: objeto e evolução. Escolas determinista, possibilista, quantitativa, crítica, cultural. Conceitos-chave: espaço, lugar, paisagem, território, região, redes. Escalas. Organização do espaço geográfico: sociedade e natureza. Cartografia: fuso horário, curvas de nível, projeções; coordenadas geográficas; mapas; visões de mundo. Movimentos da Terra; estações do ano. Climatologia e meteorologia: elementos, fatores, classificação. Climas do mundo e do Brasil. Geomorfologia: relevo; agentes; classificação; relevo brasileiro. Hidrografia: rede hidrográfica brasileira. Biogeografia: biomas do mundo e do Brasil; vegetação brasileira. Geologia: estrutura, tectônica global. Pedologia: solos do Brasil. Geografia rural: fatores geoecológicos, jurídicos, sociais e econômicos. Modernização da agricultura. Geografia da população: indicadores; teorias demográficas; estrutura etária; PEA; etnias; mobilidade; política demográfica. Contrastes populacionais; contraste norte-sul. Geografia urbana: urbanização, metropolização, problemas ambientais. Geografia da indústria: distribuição espacial; bens de produção; tipos. Divisão internacional do trabalho. Geopolítica: regionalização do espaço mundial; nova ordem mundial; blocos econômicos. Questão ambiental. Geografia do Brasil: globalização; industrialização; urbanização; espaço agrário; transportes; população; espaço natural; contrastes regionais. Ensino de geografia: novas tecnologias. PCN. Aspectos econômicos de Minas Gerais.',
  },
  'al-esp-prof-artes': {
    nome: 'Professor 2ª Fase — Artes — Específico',
    categoria: 'educacao',
    conteudo:
      'LDB (Lei 9.394/96) no que se refere ao ensino das Artes. Referencial Curricular Nacional para Educação Básica (RCNEI). Fundamentos e tendências pedagógicas do ensino de arte no Brasil. Ensino da arte: conceito, histórico, metodologias, propostas, práticas. Arte e processo: construção da cidadania. Diversas linguagens artísticas: estética. Aspectos da cultura popular brasileira e manifestações populares. Arte pré-histórica; arte brasileira; arte indígena; arte africana. Elementos da linguagem visual. Meios visuais de arte. Correntes estilísticas. Leitura de imagem. Artes visuais no Brasil: do Barroco aos dias atuais. Artes audiovisuais: TV, cinema, fotografia, multimídia. Música no Brasil. Teatro no Brasil. Dança no Brasil. Principais movimentos artísticos do século XX no Brasil. Ensino e aprendizagem da música. Avaliação. Novas abordagens e tecnologias no ensino de Arte. Competências e habilidades PCN. Ética profissional.',
  },
  'al-esp-supervisor': {
    nome: 'Supervisor do Ensino Municipal — Específico',
    categoria: 'educacao',
    conteudo:
      'Noções de redação técnica e tipos de documentos administrativos na escola. Escrituração em arquivo escolar. Noções de organização escolar: currículo, avaliação e planejamento. Matrícula: inicial, renovada e por transferência. Histórico escolar. Ficha de avaliação. Certificados; diplomas; registros. Ata. Relação entre educação, escola e sociedade: concepções de educação e escola; função social da escola; educação inclusiva; compromisso ético e social do educador. Educar e cuidar. Educação básica: valorização das diferenças individuais, de gênero, étnicas e socioculturais. Mediação do educador. Indisciplina e bullying: diálogo, coerência e exigência. Noções de primeiros socorros. Relações interpessoais. Administração de conflitos. Disciplina escolar. Trabalho em equipe interdisciplinar e multidisciplinar. Ações afirmativas. Ética profissional.',
  },
};

// ─────────────────────────────────────────────────────────
// CARGOS — vagas, salário, requisitos, matérias correlatas
// ─────────────────────────────────────────────────────────
const cargos: Cargo[] = [
  // ─── NÍVEL ALFABETIZADO ───
  { slug: 'auxiliar-servicos-gerais', nome: 'Auxiliar de Serviços Gerais', nivel: 'alfabetizado', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 1.621,00', requisitos: 'Alfabetizado',
    materiasIds: ['al-port-alfa', 'al-mat-alfa', 'al-cg-comum'] },
  { slug: 'operario', nome: 'Operário', nivel: 'alfabetizado', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.621,00', requisitos: 'Alfabetizado',
    materiasIds: ['al-port-alfa', 'al-mat-alfa', 'al-cg-comum'] },
  { slug: 'auxiliar-administrativo-1', nome: 'Auxiliar Administrativo I', nivel: 'alfabetizado', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.621,00', requisitos: 'Alfabetizado',
    materiasIds: ['al-port-alfa', 'al-mat-alfa', 'al-cg-comum'] },
  { slug: 'auxiliar-saude', nome: 'Auxiliar de Saúde', nivel: 'alfabetizado', vagas: '2', cargaHoraria: '40h semanais', salario: 'R$ 2.253,70', requisitos: 'Alfabetizado',
    materiasIds: ['al-port-alfa', 'al-mat-alfa', 'al-cg-comum'] },
  { slug: 'monitor-transporte-escolar', nome: 'Monitor de Transporte Escolar', nivel: 'alfabetizado', vagas: '1', cargaHoraria: '40h semanais', salario: 'R$ 1.621,00', requisitos: 'Alfabetizado',
    materiasIds: ['al-port-alfa', 'al-mat-alfa', 'al-cg-comum'] },
  { slug: 'auxiliar-servicos-gerais-fms', nome: 'Auxiliar de Serviços Gerais da FMS', nivel: 'alfabetizado', vagas: '3', cargaHoraria: '40h semanais', salario: 'R$ 1.621,00', requisitos: 'Alfabetizado',
    materiasIds: ['al-port-alfa', 'al-mat-alfa', 'al-cg-comum'] },

  // ─── NÍVEL FUNDAMENTAL ───
  { slug: 'motorista-operador', nome: 'Motorista e Operador de Equipamentos Rodoviários', nivel: 'fundamental', vagas: '1', cargaHoraria: '40h semanais', salario: 'R$ 2.231,13', requisitos: 'Ensino Fundamental Incompleto + CNH "D"',
    materiasIds: ['al-port-fund', 'al-mat-fund', 'al-cg-comum'] },
  { slug: 'auxiliar-administrativo', nome: 'Auxiliar Administrativo', nivel: 'fundamental', vagas: '1', cargaHoraria: '40h semanais', salario: 'R$ 1.697,27', requisitos: 'Ensino Fundamental Completo',
    materiasIds: ['al-port-fund', 'al-mat-fund', 'al-cg-comum', 'al-esp-aux-administrativo'] },
  { slug: 'auxiliar-enfermagem-psf', nome: 'Auxiliar de Enfermagem do PSF', nivel: 'fundamental', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.697,27', requisitos: 'Ensino Fundamental Completo',
    materiasIds: ['al-port-fund', 'al-mat-fund', 'al-cg-comum', 'al-esp-aux-enfermagem-psf'] },

  // ─── NÍVEL MÉDIO ───
  { slug: 'monitor-apoio-educacao-basica', nome: 'Monitor de Apoio da Educação Básica', nivel: 'medio', vagas: '1', cargaHoraria: '22h semanais', salario: 'R$ 4.066,94', requisitos: 'Ensino Médio',
    materiasIds: ['al-port-medio', 'al-mat-medio', 'al-informatica-medio', 'al-adm-publica', 'al-esp-monitor-apoio-educ'] },
  { slug: 'prof-edfisica-1fase', nome: 'Professor de Educação Física 1ª Fase', nivel: 'medio', vagas: '2', cargaHoraria: '20h semanais', salario: 'R$ 4.066,94', requisitos: 'Ensino Médio + habilitação',
    materiasIds: ['al-port-medio', 'al-mat-medio', 'al-informatica-medio', 'al-adm-publica', 'al-esp-prof-edfisica-1fase'] },

  // ─── NÍVEL MÉDIO TÉCNICO ───
  { slug: 'tecnico-enfermagem-fms', nome: 'Técnico de Enfermagem da FMS', nivel: 'medio_tecnico', vagas: '3', cargaHoraria: '40h semanais', salario: 'R$ 1.690,14', requisitos: 'Ensino Médio + Técnico em Enfermagem + COREN',
    materiasIds: ['al-port-medio', 'al-mat-medio', 'al-informatica-medio', 'al-adm-publica', 'al-esp-tec-enfermagem-fms'] },

  // ─── NÍVEL SUPERIOR ───
  { slug: 'enfermeiro-padrao', nome: 'Enfermeiro Padrão', nivel: 'superior', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 5.932,50', requisitos: 'Superior em Enfermagem + COREN',
    materiasIds: ['al-port-superior', 'al-mat-medio', 'al-informatica-medio', 'al-adm-publica', 'al-esp-enfermeiro-padrao'] },
  { slug: 'nutricionista', nome: 'Nutricionista', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.496,21', requisitos: 'Superior em Nutrição + CRN',
    materiasIds: ['al-port-superior', 'al-mat-medio', 'al-informatica-medio', 'al-adm-publica', 'al-esp-nutricionista'] },
  { slug: 'psicologo', nome: 'Psicólogo', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.129,91', requisitos: 'Superior em Psicologia + CRP',
    materiasIds: ['al-port-superior', 'al-mat-medio', 'al-informatica-medio', 'al-adm-publica', 'al-esp-psicologo'] },

  // ─── NÍVEL SUPERIOR — EDUCAÇÃO ───
  { slug: 'prof-ensino-municipal-1fase', nome: 'Professor de Ensino Municipal 1ª Fase', nivel: 'superior_educacao', vagas: '3', cargaHoraria: '22h semanais', salario: 'R$ 4.066,94', requisitos: 'Licenciatura Plena em Pedagogia',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-prof-ensino-1fase'] },
  { slug: 'prof-letras-portugues', nome: 'Professor 2ª Fase — Letras (Português)', nivel: 'superior_educacao', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.066,94', requisitos: 'Licenciatura em Letras — Português',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-prof-portugues'] },
  { slug: 'prof-letras-ingles', nome: 'Professor 2ª Fase — Letras (Inglês)', nivel: 'superior_educacao', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.066,94', requisitos: 'Licenciatura em Letras — Inglês',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-prof-ingles'] },
  { slug: 'prof-matematica', nome: 'Professor 2ª Fase — Matemática', nivel: 'superior_educacao', vagas: '1', cargaHoraria: '20h semanais', salario: 'R$ 4.066,94', requisitos: 'Licenciatura em Matemática',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-prof-matematica'] },
  { slug: 'prof-religioso', nome: 'Professor 2ª Fase — Ensino Religioso', nivel: 'superior_educacao', vagas: '1', cargaHoraria: '20h semanais', salario: 'R$ 4.066,94', requisitos: 'Licenciatura em Ensino Religioso',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-prof-religioso'] },
  { slug: 'prof-geografia', nome: 'Professor 2ª Fase — Geografia', nivel: 'superior_educacao', vagas: '1', cargaHoraria: '20h semanais', salario: 'R$ 4.066,94', requisitos: 'Licenciatura em Geografia',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-prof-geografia'] },
  { slug: 'prof-artes', nome: 'Professor 2ª Fase — Artes', nivel: 'superior_educacao', vagas: '1', cargaHoraria: '20h semanais', salario: 'R$ 4.680,94', requisitos: 'Licenciatura em Artes',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-prof-artes'] },
  { slug: 'supervisor-ensino-municipal', nome: 'Supervisor do Ensino Municipal', nivel: 'superior_educacao', vagas: '1', cargaHoraria: '20h semanais', salario: 'R$ 4.066,94', requisitos: 'Superior em Pedagogia ou Pós em Supervisão Escolar',
    materiasIds: ['al-port-superior', 'al-legisl-educ', 'al-didatico-pedag', 'al-esp-supervisor'] },
];

export const concurso: Concurso = {
  slug: 'alagoa',
  nome: 'Município de Alagoa',
  municipio: 'Alagoa',
  uf: 'MG',
  banca: 'Instituto Consulplan',
  bancaSlug: 'consulplan',
  numeroEdital: '002/2026',
  validade: '2 anos (prorrogável por igual período)',
  inscricoes: 'institutoconsulplan.org.br',
  inscricoesPeriodo: '15/abr a 19/mai/2026',
  cargos,
  materias,
  paymentModel: 'pix_unico',
  precoLabel: 'R$ 60 · pagamento único',
  formaPagamento: 'PIX · pagamento único (acesso vitalício)',
  valorCentavos: 6000,
};
