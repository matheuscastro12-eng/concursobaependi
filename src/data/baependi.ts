// Edital Concurso Público 002/2026 - Prefeitura de Baependi/MG
// Banca: INEPAM
// Conteúdo programático transcrito do Anexo II do edital.

export type Nivel = 'fundamental' | 'medio' | 'superior';

export interface Materia {
  nome: string;
  conteudo: string;
  categoria: 'gerais' | 'educacao' | 'saude' | 'especifico';
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

export const editalInfo = {
  numero: '002/2026',
  municipio: 'Baependi',
  uf: 'MG',
  banca: 'INEPAM',
  validade: '2 anos (prorrogável por igual período)',
  inscricoes: 'inepam.org.br',
};

// ─────────────────────────────────────────────────────────
// MATÉRIAS — conteúdo programático fiel ao edital
// ─────────────────────────────────────────────────────────
export const materias: Record<string, Materia> = {
  // ───── CONHECIMENTOS GERAIS ─────
  'port-fund': {
    nome: 'Língua Portuguesa (Fundamental)',
    categoria: 'gerais',
    conteudo: 'Interpretação de textos. Significado das palavras. Identificação de vogais e consoantes. Escritas corretas.',
  },
  'mat-fund': {
    nome: 'Matemática (Fundamental)',
    categoria: 'gerais',
    conteudo: 'Operações fundamentais: adição, subtração, multiplicação e divisão. Juros simples. Sistema métrico decimal: unidades de medida (comprimento, massa e capacidade); transformações de unidades. Razão e proporção.',
  },
  'port-medio': {
    nome: 'Língua Portuguesa (Médio/Superior)',
    categoria: 'gerais',
    conteudo: 'Fonema. Sílaba. Ortografia. Classes de Palavras: substantivo, adjetivo, preposição, conjunção, advérbio, verbo, pronome, numeral, interjeição e artigo. Acentuação. Concordância nominal. Concordância Verbal. Sinais de Pontuação. Uso da Crase. Colocação dos pronomes nas frases. Análise Sintática Período Simples e Composto. Figuras de Linguagem. Interpretação de Textos.',
  },
  'mat-medio': {
    nome: 'Matemática (Médio/Superior)',
    categoria: 'gerais',
    conteudo: 'Radicais: operações – simplificação, propriedade – racionalização de denominadores. Razão e Proporção. Porcentagem. Juros Simples. Conjunto de números reais. Fatoração de expressão algébrica. Expressão algébrica – operações. Expressões algébricas fracionárias – operações – simplificação. MDC e MMC. Sistema de medidas: comprimento, superfície, massa, capacidade, tempo e volume: unidades de medida; transformações de unidades. Estatística: noções básicas, razão, proporção, interpretação e construção de tabelas e gráficos. Geometria: elementos básicos, conceitos primitivos, representação geométrica no plano; Noções de probabilidade e análise combinatória.',
  },

  // ───── COMUM A PROFISSIONAIS DE EDUCAÇÃO ─────
  'educ-fundamentos': {
    nome: 'Fundamentos da Educação (comum a todos os profissionais da Educação)',
    categoria: 'educacao',
    conteudo:
      'Fundamentos da educação; História da Educação; Filosofia da Educação; Psicologia da Educação; Cotidiano Escolar; Escola e família; Projeto Político Pedagógico; Processo de Avaliação Educacional; Trabalho Coletivo; Trabalho Interdisciplinar; Pedagogia de projetos; Didática e Metodologia do Ensino; Progressão Continuada; Psicologia da Aprendizagem; Educação Inclusiva; Educação Contemporânea; Educação e Tecnologia; Tecnologia na sala de aula e na Escola; Formação Continuada de professores; Ensino no Brasil e no Mundo; Processo de Escolarização: sucessos e fracassos; Evasão e Repetência: causas, consequências e alternativas; Políticas Educacionais Brasileiras; Gestão Educacional (Gestão Participativa e Participação Comunitária); Formas Inovadoras e Clássicas de Avaliação; Plano de Aula; Autores renomados da Educação: história, pensamento, metodologias e contribuições; Teorias de Aprendizagem; Currículo; Cidadania; Desenvolvimento cognitivo, social, cultural e afetivo dos alunos; Função social da escola e do professor; Avaliação por competências; Ensino condizente com a realidade do aluno; Recuperação; Relação entre professor e aluno; Estudos/notícias/teses/reportagens atualizados sobre educação (últimos 12 meses); Correção de fluxo; Papel do professor de classe, do professor coordenador e do diretor.',
  },
  'educ-legislacao': {
    nome: 'Legislação Educacional (comum a todos os profissionais da Educação)',
    categoria: 'educacao',
    conteudo:
      'Constituição da República Federativa do Brasil – 1988 (Artigos 1º ao 13, 39 ao 41, 205 ao 219-B, 227 ao 229). Lei nº 8.069/90 – ECA. Lei nº 9.394/96 – LDB. Lei nº 13.005/14 – PNE. Lei nº 13.146/15 – Lei Brasileira de Inclusão da Pessoa com Deficiência. Resolução CNE/CP nº 1/2004 (Diretrizes Curriculares Nacionais para Educação das Relações Étnico-Raciais e Ensino de História e Cultura Afro-Brasileira e Africana). Resolução CNE/CEB nº 4/2010 (Diretrizes Curriculares Nacionais Gerais para Educação Básica). Resolução CNE/CP nº 1/2012 (Diretrizes Nacionais para a Educação em Direitos Humanos). Política Nacional de Educação Especial na perspectiva da educação inclusiva (MEC/SEESP, 2008). Decreto nº 6.003/2006 (salário-educação). Decreto nº 7.611/2011 (educação especial e atendimento educacional especializado).',
  },

  // ───── COMUM A PROFISSIONAIS DA SAÚDE ─────
  'saude-sus': {
    nome: 'Saúde Pública e SUS (comum a todos os profissionais da Saúde)',
    categoria: 'saude',
    conteudo:
      'A Saúde Pública no Brasil. Sistema Único de Saúde (SUS). Redes de Atenção à Saúde. Modelos de Atenção à Saúde. Atenção Primária à Saúde. Protocolos do SUS. Gestão do SUS: diretrizes para a gestão; Descentralização; Regionalização; Financiamento; Regulação; Participação Popular; Responsabilidade sanitária das instâncias gestoras; Planejamento e Programação; Regulação, Controle, Avaliação e Auditoria. Política Nacional da Atenção Básica. Vigilância em Saúde. Sistema Nacional de Informações em saúde. Políticas e Sistemas de Saúde no Brasil: retrospectiva histórica; reforma sanitária. Promoção à saúde. Controle social: conselhos e conferências municipais de saúde. Estratégia de Saúde da Família. Determinantes Sociais em Saúde. Lei nº 8.080/1990. Lei nº 8.142/1990. Decreto nº 7.508/2011. Portaria nº 399/GM/2006 (Pacto pela Saúde). Resolução nº 588/2018 (Política Nacional de Vigilância em Saúde). Resolução nº 453/2012 (Conselhos de Saúde). HumanizaSUS (Política Nacional de Humanização). Constituição Federal de 1988 – Da Saúde. Portaria nº 2.436/2017 (Política Nacional de Atenção Básica). Política Nacional de Promoção da Saúde. Portaria nº 2.528/2006 (Política Nacional de Saúde da Pessoa Idosa).',
  },

  // ───── ESPECÍFICAS POR CARGO ─────
  'esp-aux-administrativo': {
    nome: 'Auxiliar Administrativo – Específico',
    categoria: 'especifico',
    conteudo:
      'Redação Oficial. Aspectos Gerais. Identidade Visual. Atos Oficiais: Medidas, Sistemática dos Instrumentos Normativos – artigos, parágrafos, incisos, alíneas, observações gerais e encaminhamento. Elaboração de documentos; Normas Gerais de Elaboração, siglas e acrônimos, vícios de linguagem, hífen, destaques – itálico, aspas, negrito, maiúsculas, minúsculas, enumerações, grafia de numerais, fecho para comunicações, identificação do signatário, autoridades — forma de tratamento, abreviatura, vocativo, destinatário e envelope. Modelos de comunicações oficiais — espécies, finalidades, assinaturas e estruturas: apostila, ata, carta, cartão de visita, circular, comunicação interna, contrato, convênio, correio eletrônico, despacho, instrução normativa, nota informativa, nota técnica, ofício, ordem de serviço, parecer, portaria, regimento interno, resolução. O padrão ofício. Aviso e Ofício. Memorando. Exposição de Motivos. Noções básicas de arquivo. Princípios básicos da administração pública e servidores. Regras de hierarquia no serviço público. Constituição Federal — arts. 37 e 39 a 41. Manual de Redação da Presidência da República. Informática: Utilização e configuração do Windows 11 (versão 25H2), aplicativos embarcados (Bloco de Notas, Calculadora, Paint, WordPad, Ferramenta de Captura), configurações de periféricos (impressoras, scanners, monitores, USB, Bluetooth), noções básicas de hardware e software (CPU, RAM, HD/SSD, placa-mãe, drivers, sistema e aplicativo), Pacote Microsoft Office 365 (Word, Excel, PowerPoint, Outlook) — operações básicas, fórmulas elementares (SOMA, MÉDIA), gráficos básicos, salvar e compartilhar; Outlook: contas, mensagens, anexos, assinatura, impressão; Adobe Reader: abrir, pesquisar, realçar, comentar, preencher formulários, imprimir; Internet: navegadores (Edge/Chrome/Firefox), abas, buscadores, links, favoritos, download e impressão; Segurança na Internet: senhas, phishing, atualizações, antivírus, anexos e links suspeitos; manipulação de arquivos e pastas no Windows 11; integração entre apps embarcados e Office 365.',
  },

  'esp-assistente-social': {
    nome: 'Assistente Social – Específico',
    categoria: 'especifico',
    conteudo:
      'A identidade da profissão do Serviço Social e seus determinantes ideopolíticos. O espaço ocupacional e as relações sociais estabelecidas pelo Serviço Social. A Questão Social, o contexto conjuntural, profissional e as perspectivas teórico-metodológicas do Serviço Social pós-reconceituação. O Serviço Social na contemporaneidade: novas exigências do mercado de trabalho. O espaço sócio-ocupacional e as diferentes estratégias de intervenção profissional. Possibilidades, limites e demandas para o Serviço Social na esfera pública, privada e nas ONGs. A instrumentalidade como elemento da intervenção profissional. Planejamento da intervenção e elaboração de planos, programas, projetos e pesquisas na implantação de políticas sociais. Análise da questão social. Fundamentos históricos, teóricos e metodológicos do Serviço Social. Os fundamentos éticos da profissão. A consolidação da LOAS e seus pressupostos teóricos. O novo reordenamento da Assistência Social e suas interfaces com infância e juventude, mulheres, idosos, família, pessoa com deficiência. Política social brasileira e programas de transferência de renda (Bolsa Família, PETI). Plano Nacional de Promoção, Proteção e Defesa do Direito de Crianças e Adolescentes à Convivência Familiar e Comunitária. Política Nacional de Assistência Social. ECA. Estatuto do Idoso. Tipificação Nacional de Serviços Socioassistenciais. NOB RH/SUAS. Código de Ética do Assistente Social. Atenção para a matéria específica para todos os profissionais da Saúde.',
  },

  'esp-aux-cons-odontologico': {
    nome: 'Auxiliar de Consultório Odontológico – Específico',
    categoria: 'especifico',
    conteudo:
      'Organização e execução das atividades de higiene bucal, processamento de filme radiográfico; preparação do paciente para o atendimento. Auxílio e instrumentação dos profissionais nas intervenções clínicas, inclusive em ambientes hospitalares; seleção de moldeiras; manipulação de material de uso odontológico, registro de dados e participação da análise das informações relacionadas ao controle administrativo em saúde bucal; preparo de modelos em gesso. Limpeza, assepsia, desinfecção e esterilização do instrumental, equipamentos odontológicos e do ambiente de trabalho; acolhimento do paciente nos serviços de saúde bucal. Aplicação de medidas de biossegurança no armazenamento, transporte, manuseio e descarte de produtos e resíduos odontológicos; promoção da saúde e prevenção de riscos ambientais e sanitários; levantamento de necessidades em saúde bucal em equipe; medidas de biossegurança para controlar possíveis infecções. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-aux-saude': {
    nome: 'Auxiliar de Serviços de Saúde – Específico',
    categoria: 'especifico',
    conteudo:
      'Noções básicas de higiene: higiene pessoal e no trabalho. Manuseio e utilização de ferramentas, produtos e materiais de trabalho. Equipamentos de proteção individual. Noções de primeiros socorros. Qualidade no atendimento ao público. Relações humanas no trabalho. Noções básicas de segurança no trabalho.',
  },

  'esp-aux-servicos-gerais': {
    nome: 'Auxiliar de Serviços Gerais – Específico',
    categoria: 'especifico',
    conteudo:
      'Noções básicas de higiene: higiene pessoal e no trabalho. Manuseio e utilização de ferramentas, produtos e materiais de trabalho. Equipamentos de proteção individual. Noções de primeiros socorros. Qualidade no atendimento ao público. Relações humanas no trabalho. Noções básicas de segurança no trabalho. Atribuições da função — Anexo I do edital.',
  },

  'esp-coveiro': {
    nome: 'Coveiro – Específico',
    categoria: 'especifico',
    conteudo:
      'Noções básicas de higiene: higiene pessoal e no trabalho. Manuseio e utilização de ferramentas, produtos e materiais de trabalho. Equipamentos de proteção individual. Noções de primeiros socorros. Qualidade no atendimento ao público. Relações humanas no trabalho. Noções básicas de segurança no trabalho.',
  },

  'esp-fiscal-vig-sanitaria': {
    nome: 'Fiscal de Vigilância Sanitária – Específico',
    categoria: 'especifico',
    conteudo:
      'Vigilância Sanitária: conceitos, funções, áreas de abrangência. Defesa sanitária animal, inspeção industrial e sanitária dos produtos de origem animal. Objetivos e atribuições do SUS relacionados à execução de ações da vigilância sanitária. Conhecimentos básicos de fiscalização: competência para fiscalizar, ações fiscais, diligências, licenciamento, autorização, autos de infração, multas e penalidades, recursos. Sistema Nacional de Vigilância Sanitária. Vigilância sanitária como prática do SUS e a municipalização. Dimensões e campo de abrangência. Consciência sanitária educativa e defesa dos direitos do consumidor. Vigilância sanitária das tecnologias dos alimentos. Contaminação física, biológica e química dos alimentos. Doenças causadas por contaminação de alimentos e respectivas notificações compulsórias. Informações nos rótulos de produtos alimentares industrializados. Vigilância sanitária do meio ambiente: controle da água para consumo, destino de resíduos sólidos, sistemas de coleta e disposição final de esgotos. Fiscalização das condições higiênico-sanitárias e tecnológicas da produção, manipulação, beneficiamento, armazenamento e transporte de produtos de origem animal. Normas para promoção e proteção da saúde. Saúde do trabalhador. Condições higiênico-sanitárias de estabelecimentos. Doenças transmitidas por alimentos. Investigação de surtos. Qualidade da água para consumo humano. Gestão de resíduos sólidos. Manuseio, manejo e tratamento dos resíduos. Saneamento. Aspectos éticos do exercício da vigilância sanitária. Caracterização das infrações e procedimentos legais. Legislações sanitárias.',
  },

  'esp-motorista': {
    nome: 'Motorista – Específico',
    categoria: 'especifico',
    conteudo:
      'Técnicas de Primeiros Socorros. Instrumentos e ferramentas. Conhecimentos operacionais de eletricidade de autos. Noções básicas de mecânica, operação e manutenção preventiva dos equipamentos automotivos de veículos leves e pesados. Sistema de funcionamento dos componentes (leitura do painel, nível de óleo, água, freio, pneus etc.). Diagnósticos de falhas. Lubrificação e conservação do veículo. Código de Trânsito Brasileiro – Lei nº 9.503/1997 e Legislação Complementar. Resoluções do CONTRAN. EPI. Relações humanas no trabalho. Noções básicas de segurança no trabalho.',
  },

  'esp-operador-maquina': {
    nome: 'Operador de Máquina – Específico',
    categoria: 'especifico',
    conteudo:
      'Peças e ferramentas convencionais; sistemas de direção (convencional e hidráulica). Sistemas de freios: funcionamento, freios mecânicos, sistema hidráulico, cilindros. Suspensão: molas e amortecedores. Rodas e pneus, desgaste, geometria de eixo. Motores a explosão; tipos; sistema diesel (injeção, bomba, filtragem de óleo, lubrificação, refrigeração, partida, freio-motor, graxas, manutenção). Operação prática com máquinas e equipamentos. Código de Trânsito (artigos 26 a 71, 80 a 90, 91 a 95, 144, 161 a 255 e 256 a 268), direção defensiva, primeiros socorros, cargas perigosas, sinalização, equipamentos obrigatórios, manutenção e reparos, avarias, freios, combustão, eletricidade, controle de quilometragem/combustíveis/lubrificantes. Conservação e limpeza, condições adversas, segurança, instrumentos e controle, procedimentos de operação, verificações diárias, manutenção periódica, ajustes, diagnóstico de falhas, engrenagens. Noções de segurança no posto de trabalho; higiene e limpeza; mecânica básica. EPI. Relações humanas no trabalho. Noções básicas de segurança no trabalho.',
  },

  'esp-artesao-caps': {
    nome: 'Artesão CAPS – Específico',
    categoria: 'especifico',
    conteudo:
      'Projeto Político Pedagógico: elaboração, organização e estrutura. Tendências pedagógicas contemporâneas. Fundamentos da Educação. História da educação brasileira. Políticas educacionais brasileiras contemporâneas. Concepções de aprendizagem. Concepções de avaliação. Artesanatos em geral.',
  },

  'esp-fiscal-obras': {
    nome: 'Fiscal de Obras e Posturas – Específico',
    categoria: 'especifico',
    conteudo:
      'Noções de higiene, bem-estar social e segurança da população. Noções de legislação de Trânsito. Normas reguladoras da Emissão de Ruídos. Normas reguladoras da Emissão de Gases. Poder de polícia do Município: meios de atuação da fiscalização. Atos administrativos relacionados ao poder de polícia: atributos, elementos, discricionariedade, vinculação; autorização e licença.',
  },

  'esp-fiscal-tributario': {
    nome: 'Fiscal Tributário – Específico',
    categoria: 'especifico',
    conteudo:
      'Competência tributária. Limitações Constitucionais ao Poder de Tributar. Imunidades. Princípios Constitucionais Tributários. Conceito e Classificação dos Tributos. Tributos da União, dos Estados e dos Municípios. Simples Nacional. Legislação tributária: Constituição, Emendas, Leis Complementares, Leis Ordinárias, Leis Delegadas, Medidas Provisórias, Decretos, Resoluções. Empréstimos Públicos: classificação, fases, condições, garantias, amortização e conversão. Dívida pública: conceito, disciplina constitucional, classificação e extinção. Contribuição de melhoria. IPTU – Imposto sobre Propriedade Predial e Territorial Urbana: hipótese de incidência (material, espacial, temporal), relação jurídica tributária, progressividade, localização do imóvel. ITBI – hipótese de incidência (material, espacial, temporal), relação jurídica tributária. ISSQN – hipótese de incidência, listas de serviços, imunidades e isenções, formas de tributação (Simples Nacional). Taxas – regime jurídico, distinção entre poder de polícia e serviços públicos, especificidade e divisibilidade, limites, prescindibilidade do efetivo exercício do poder de polícia, imunidades e isenções. Distinção entre Taxas, Tarifas e Preço Público. Noções de direito penal: crimes contra a administração pública – arts. 312 a 327 do Código Penal.',
  },

  'esp-fiscal-agricultura': {
    nome: 'Fiscal da Agricultura – Específico',
    categoria: 'especifico',
    conteudo:
      'Introdução à Administração Rural: conceitos básicos; administração e economia rural; comercialização; educação no campo e pesquisa; estatísticas do meio rural; intervenção estatal no mercado de terras; análise do ambiente; visão sistêmica do agronegócio; zoneamento agrícola; particularidades das propriedades rurais; caracterização das unidades de produção agrícolas; mapa de uso do solo; recursos humanos; infraestrutura: capital agrário e de exploração; identificação da renda bruta; identificação das despesas específicas e gerais.',
  },

  'esp-monitor-creche': {
    nome: 'Monitor de Creche/Educação Infantil – Específico',
    categoria: 'especifico',
    conteudo:
      'Constituição Federal de 1988 (arts. 5º ao 7º, 205 ao 214 e 226 ao 230). Lei Orgânica do Município. Lei nº 8.069/1990 – ECA (Direitos da Criança e do Adolescente — arts. 1º ao 6º, 13 ao 18 e 53 ao 73). Lei nº 9.394/1996 e alterações. Diretrizes Nacionais para Educação em Direitos Humanos. Resolução CNE/CP nº 1/2012. Cuidados com a segurança do aluno nas dependências da escola. Noções de primeiros socorros. Atendimento ao público. Cuidados e higiene pessoal e no trabalho. Relações humanas no trabalho. Inspeção e cuidados com o comportamento dos alunos no ambiente escolar. Regras e procedimentos de um ambiente escolar. Comunicação e oratória. Regimento escolar. Ética e cidadania no trabalho. Noções básicas de segurança no trabalho. Diretrizes e Bases da Educação Nacional.',
  },

  'esp-orientador-social': {
    nome: 'Orientador Social – Específico',
    categoria: 'especifico',
    conteudo:
      'Constituição Federal: conceito e conteúdo, leis constitucionais, complementares e ordinárias. Estado Federal: União, Estados, Municípios, Distrito Federal e Territórios. Posição do Município na Federação Brasileira; criação e organização. Autonomia Municipal: leis orgânicas. Intervenção nos Municípios. Possibilidades, limites e demandas para o Serviço Social na esfera pública, privada e nas ONGs. A instrumentalidade na intervenção profissional. Planejamento e elaboração de planos, programas, projetos e pesquisas em políticas sociais. Análise da questão social. Fundamentos históricos, teóricos e metodológicos do Serviço Social. Consolidação da LOAS. Reordenamento da Assistência Social: infância e juventude, mulheres, idosos, família, pessoa com deficiência. Programas de transferência de renda (Bolsa Família, PETI). Plano Nacional de Convivência Familiar e Comunitária. Política Nacional de Assistência Social. ECA. Estatuto do Idoso. Tipificação Nacional de Serviços Socioassistenciais. NOB RH/SUAS.',
  },

  'esp-tec-higiene-dental': {
    nome: 'Técnico em Higiene Dental – Específico',
    categoria: 'especifico',
    conteudo:
      'Organização e execução das atividades de higiene bucal; processamento de filme radiográfico; preparação do paciente. Auxílio e instrumentação nas intervenções clínicas, inclusive em ambientes hospitalares; seleção de moldeiras; manipulação de material odontológico; registro de dados e análise de informações de controle administrativo em saúde bucal; preparo de modelos em gesso. Limpeza, assepsia, desinfecção e esterilização do instrumental, equipamentos e do ambiente de trabalho; acolhimento do paciente. Biossegurança no armazenamento, transporte, manuseio e descarte de produtos e resíduos odontológicos; promoção da saúde e prevenção de riscos ambientais e sanitários; levantamento de necessidades em saúde bucal em equipe; controle de infecções. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-tec-seguranca-trabalho': {
    nome: 'Técnico em Segurança do Trabalho – Específico',
    categoria: 'especifico',
    conteudo:
      'Legislação de segurança do trabalho (NRs / Portaria 3.214). Normas Regulamentadoras do MTE. Normas de Higiene Ocupacional da Fundacentro; limites de exposição ocupacional. Aspectos éticos, multidisciplinares e relações intervenientes. Políticas e sistema de gestão de segurança e saúde no trabalho. Procedimentos para inspeções internas de áreas, instalações e equipamentos. Técnicas de prevenção e medidas de controle nos processos, condições e meio ambiente de trabalho. Programa de brigada de incêndio, prevenção e combate. Programas de gestão e da CIPA. Análise de riscos no processo produtivo. Fatores de risco de acidentes e doenças profissionais; medidas de controle; ações analíticas, corretivas e preventivas. Indicadores estatísticos. Laudos técnicos e Perfil Profissiográfico Previdenciário. Programas de gerenciamento de riscos: Proteção Radiológica, Proteção Respiratória, Conservação Auditiva, Prevenção de Acidentes com Materiais Perfurocortantes. Gerenciamento de resíduos de serviços de saúde.',
  },

  'esp-secretaria-escolar': {
    nome: 'Secretária Escolar – Específico',
    categoria: 'especifico',
    conteudo:
      'Redação Oficial. Aspectos Gerais. Identidade Visual. Atos Oficiais (artigos, parágrafos, incisos, alíneas). Elaboração de documentos; siglas e acrônimos, vícios de linguagem, hífen, destaques, maiúsculas/minúsculas, enumerações, grafia de numerais, fecho para comunicações, identificação do signatário, formas de tratamento, abreviatura, vocativo, destinatário e envelope. Modelos de comunicações oficiais (apostila, ata, carta, cartão de visita, circular, comunicação interna, contrato, convênio, e-mail, despacho, instrução normativa, nota informativa, nota técnica, ofício, ordem de serviço, parecer, portaria, regimento interno, resolução). Padrão ofício. Aviso e Ofício. Memorando. Exposição de Motivos. Noções de arquivo. Princípios da administração pública. Constituição Federal — arts. 37, 39 a 41. Manual de Redação da Presidência da República. Informática: Windows (XP+), aplicativos embarcados (Bloco de Notas, Calculadora, Paint, WordPad), periféricos. Pacote Office 2010+ (Word, Excel, PowerPoint, Outlook). Adobe Reader. Noções de Internet (configurações, navegadores, navegação, sites).',
  },

  'esp-tec-administrativo-caps': {
    nome: 'Técnico Administrativo do CAPS – Específico',
    categoria: 'especifico',
    conteudo:
      'Redação Oficial. Aspectos Gerais. Identidade Visual. Atos Oficiais. Elaboração de documentos; modelos de comunicações oficiais (apostila, ata, carta, circular, comunicação interna, contrato, e-mail, despacho, instrução normativa, nota informativa, nota técnica, ofício, ordem de serviço, parecer, portaria, regimento interno, resolução). Padrão ofício. Aviso e Ofício. Memorando. Exposição de Motivos. Noções básicas de arquivo. Princípios da administração pública e servidores. Constituição Federal — arts. 37, 39 a 41. Manual de Redação da Presidência da República. Informática: Windows (XP+), aplicativos embarcados, periféricos. Pacote Office 2010+ (Word, Excel, PowerPoint, Outlook). Adobe Reader. Noções de Internet.',
  },

  'esp-tec-educacional-caps': {
    nome: 'Técnico Educacional CAPS – Específico',
    categoria: 'especifico',
    conteudo:
      'Inteligências múltiplas e estímulos (Antunes). Referencial Curricular Nacional para a Educação Infantil (MEC/SEF, 1998). Critérios para atendimento em creches que respeite os direitos fundamentais das crianças (MEC/SEB, 2009). Diretrizes Curriculares Nacionais para Educação Infantil (MEC/SEB, 2010). Resolução CNE/CEB nº 5/2009. Parâmetros nacionais de qualidade para a educação infantil. Avaliação na educação infantil (Hoffmann).',
  },

  'esp-tec-enfermagem': {
    nome: 'Técnico em Enfermagem – Específico',
    categoria: 'especifico',
    conteudo:
      'Processo de Trabalho em Enfermagem. Ética e Legislação em Enfermagem. Registros de Enfermagem. Fundamentos básicos do cuidado: preparo e administração de medicamentos e legislação; interações medicamentosas; nebulização, oxigenoterapia e aspiração das vias aéreas superiores; cuidados com cateterismo vesical, sondas nasogástrica e nasoenteral, drenos; tratamento de feridas; sinais vitais; processamento de artigos hospitalares; medidas de higiene e conforto; manuseio de material estéril. Segurança no ambiente de trabalho: controle de infecção hospitalar e biossegurança; NR-32/2005; riscos e acidentes ocupacionais e prevenção; ergonomia; saúde do trabalhador; organização da unidade hospitalar; Programa Nacional de Imunização. Cuidados de Enfermagem em distúrbios oncológicos, respiratórios, cardiovasculares, neurológicos, hematológicos, gastrintestinais, geniturinários, endócrinos, metabólicos, hidroeletrolíticos, ginecológicos, obstétricos e de locomoção. Processo saúde-doença. Cuidados em urgência e emergência. Cuidados no pré, trans e pós-operatório. Políticas de Saúde no Brasil. Cuidados em Saúde Mental. Educação em saúde. Epidemiologia geral e regional. Saúde da criança, adolescente, mulher, homem, idoso e trabalhador. Prevenção de doenças infectocontagiosas. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-tec-informatica': {
    nome: 'Técnico em Informática – Específico',
    categoria: 'especifico',
    conteudo:
      'Redes de computadores: arquitetura, topologias (lógica e física), tecnologias e projetos de redes locais e de longa distância. Arquitetura TCP/IP (DNS, DHCP, SMTP, HTTP, HTTPS, FTP). Equipamentos: switches, roteadores, firewall, filtros de conteúdo. Redes sem fio. Protocolos para voz e vídeo em tempo real. Planejamento e projeto de cabeamento. Sistemas operacionais (instalação, configuração e administração de Windows, Unix e Linux), sistemas de arquivos (acessos, segurança e integridade), multitarefa, multiusuário, núcleo. Gerenciamento de serviços de rede (servidor de arquivos, impressão e aplicação). Ambiente Microsoft. Linguagens de Script. Gestão de TI: gerenciamento de projetos (viabilidade, prazo e custo, escopo). Análise de impactos, custos, riscos e benefícios. Segurança física e lógica – Firewall e Proxy. Certificação digital, criptografia. Políticas de segurança da informação (disponibilidade, integridade, confidencialidade, plano de contingência, controle de acesso, auditoria, backup). Vírus, spywares, rootkits. Desenvolvimento de Sistemas: engenharia de software (requisitos, análise/projeto OO, implementação, testes). Rotinas de Backup.',
  },

  'esp-bioquimico': {
    nome: 'Bioquímico – Específico',
    categoria: 'especifico',
    conteudo:
      'Diagnóstico clínico e laboratorial. Glóbulos brancos, vermelhos, hemoglobina, plaquetas. Bioquímica do sangue: interpretação dos exames; métodos de coleta; técnica empregada; coleta, obtenção e conservação de amostras. Microbiologia Clínica: classificação de bactérias; meios de cultura; provas de identificação; antibiograma; processos de esterilização; patologias bacterianas; bacteriologia; coprocultura; hemocultura; urocultura. Parasitologia: estudo epidemiológico e diagnóstico das parasitoses; helmintos, protozoários e hematozoários; exame macro e microscópico; métodos diagnósticos. Controle de qualidade em análises clínicas. Determinações bioquímicas (metodologia e interpretação). Fatores interferentes. Hematologia: células do sangue; índices hematimétricos; imuno-hematologia; sistemas ABO e Rh; hemograma. Imunologia: testes imunológicos (incluindo imunoenzimáticos); doenças autoimunes; resposta antígeno/anticorpo. Provas Sorológicas (Machado Guerreiro; fixação de complemento qualitativa para Doença de Chagas; Sabin-Feldman; Widal; aglutinação para Leptospirose; soro aglutinação para Brucelose). Técnicas de coloração e preparo de lâminas. Biossegurança. Bioquímica e Uranálise: elementos anormais da urina; sedimentoscopia; urina de 24h; testes de tolerância à glicose; provas de função renal e hepática; lipidograma, proteinograma, ionograma; dosagens bioquímicas usuais. Exames laboratoriais nas DSTs. Urina: bacteriológico, microscópico, químico (qualitativo e quantitativo); cálculos. Escarro: coleta, exame bacteriológico, macro e microscópico. Vitaminas. Química e Física aplicadas (matéria, ácidos/bases/sais, álcoois/cetonas/éteres, soluções; calorimetria, hidrostática, mecânica, termologia).',
  },

  'esp-cirurgiao-dentista': {
    nome: 'Cirurgião Dentista – Específico',
    categoria: 'especifico',
    conteudo:
      'Dentística operatória e restauradora. Anatomia e histologia bucal. Fisiologia e patologia bucal. Microbiologia e bioquímica bucal. Farmacologia. Periodontia. Odontopediatria. Ortodontia. Endodontia. Próteses. Cirurgia oral. Técnicas anestésicas em odontologia. Urgências em odontologia. Oclusão. Radiologia. Biossegurança. Educação em saúde bucal. Ética profissional. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-enfermeiro': {
    nome: 'Enfermeiro – Específico',
    categoria: 'especifico',
    conteudo:
      'Fundamentos da prática de Enfermagem: bases teóricas; sinais vitais; avaliação de saúde e exame físico; Sistematização da Assistência de Enfermagem (SAE); prevenção e controle de infecção; administração de medicamentos e preparo de soluções; integridade da pele e cuidados de feridas. Enfermagem na Atenção Primária; princípios da Estratégia Saúde da Família; epidemiologia; indicadores de saúde; metas do milênio; educação em saúde; vigilância em saúde; sistemas de informação em saúde; doenças e agravos não transmissíveis; doenças transmissíveis; enfermagem em psiquiatria; saúde mental; política nacional de saúde mental. Exercício profissional: história, legislação aplicada, ética e bioética. Programa Nacional de Imunização. Princípios e Diretrizes do SUS e Lei Orgânica da Saúde. Saúde do trabalhador. Biossegurança. Saúde do adulto, mulher, homem, criança, adolescente, jovem e idoso. Práticas integrativas e complementares no SUS. Pessoas com necessidades especiais. Política Nacional de Humanização. Ações na Atenção Básica: Diabetes, Hipertensão Arterial, Prevenção de Câncer de Mama e Cérvico-Uterino. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-engenheiro-civil': {
    nome: 'Engenheiro Civil – Específico',
    categoria: 'especifico',
    conteudo:
      'Planejamento Urbano. Legislação Federal: proteção do patrimônio histórico e artístico nacional; parcelamento de solo urbano. Contratos e licitações: contratos, aditivos, especificações técnicas, Lei nº 14.133/2021, Lei nº 10.520 e Decreto nº 3.555/2000. Estatuto da Cidade. Política Nacional de Mobilidade Urbana. Novo Código Florestal. Legislação Estadual: parcelamento do solo urbano. Geologia aplicada à Engenharia. Resistência dos Materiais. Topografia. Urbanismo. Hidráulica. Materiais de Construção: propriedades, ensaios tecnológicos, tipos. Teorias das Estruturas. Estradas e pavimentação. Hidrologia aplicada. Mecânica dos Solos. Estruturas em concreto armado, aço e madeira. Estruturas em concreto pré-moldado e protendido. Fundações: investigação do solo, ensaios, propriedades, tipos. Planejamento e análise de orçamento, custos diretos e indiretos, encargos sociais, quantificação. Saneamento urbano. Equipamentos urbanos. Gerenciamento da Construção Civil. Cadastro Fiscal Imobiliário.',
  },

  'esp-farmaceutico': {
    nome: 'Farmacêutico – Específico',
    categoria: 'especifico',
    conteudo:
      'Ética: bioética. Atenção farmacêutica: princípios, planejamento. Farmacologia: interação fármaco-célula; agonistas e antagonistas; riscos e benefícios; farmacodinâmica e farmacocinética; absorção, distribuição, metabolismo e excreção. Medicamento Genérico. Fármacos bloqueadores neuromusculares. Fármacos que afetam receptores adrenérgicos e neurônios adrenérgicos. Fármacos cardíacos: antianginosos. Coagulação: pró-coagulantes, anticoagulantes, antiplaquetários, fibrinolíticos. Fármacos gastrointestinais: inibidores de HCl, antieméticos. Anti-inflamatórios (AINEs), anti-histamínicos, fármacos para gota e antirreumatóides. Sistema nervoso: anestésicos gerais (inalatórios e intravenosos), ansiolíticos, hipnóticos, antidepressivos, IMAO, estabilizadores do humor, antiepilépticos. Licenciamento sanitário. Controle Sanitário do Comércio de Drogas, Medicamentos, Insumos e Correlatos. Armazenamento e distribuição: fluxo, técnicas, gestão de estoques (curva ABC, níveis). Farmácia Magistral: RDC ANVISA nº 67/2007. Boas Práticas Farmacêuticas: RDC ANVISA nº 44/2009. Gestão e dispensação de medicamentos controlados: Portaria nº 344/1998 e RDC ANVISA nº 20/2011 (e atualizações); avaliação de prescrição. Lei nº 13.021/2014 e Lei nº 5.991/1973. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-fisioterapeuta': {
    nome: 'Fisioterapeuta – Específico',
    categoria: 'especifico',
    conteudo:
      'Fisioterapia Neurofuncional. Fisioterapia Dermatológica e Galvanopuntura. Fisiologia articular do membro inferior. Fisioterapia gerontológica. Fisioterapia músculo-esquelética (manguito rotador, fibromialgia, cadeias musculares, pata de ganso, lesão de Bankart, músculo tibial). Fisioterapia do trabalho. Fisioterapia motora. Fundamentos de fisioterapia. Métodos e técnicas de avaliação, tratamento e procedimentos. Provas de função muscular, cinesiologia e biomecânica. Cinesioterapia motora; manipulações e cinesioterapia respiratória. Análise da marcha; treinamento em locomoção e deambulação. Indicação, contraindicação, técnicas e efeitos da mecanoterapia, hidroterapia, massoterapia, eletroterapia, termoterapia superficial e profunda e crioterapia. Prescrição e treinamento de órteses e próteses. Anatomia, fisiologia e fisiopatologia, semiologia e procedimentos fisioterápicos. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-fonoaudiologa': {
    nome: 'Fonoaudióloga – Específico',
    categoria: 'especifico',
    conteudo:
      'Programa de Saúde da Família. Trabalho em equipe multiprofissional. Código de Ética da Fonoaudiologia. Fonoaudiologia na saúde pública. Desenvolvimento humano. Crescimento e desenvolvimento das estruturas e funções dos órgãos fonoarticulatórios. Comunicação verbal e não verbal. Linguagem e comunicação no idoso. Alterações de memória no idoso. Dominância cerebral e linguagem. Classificação, avaliação e tratamento das afasias. Reabilitação em AVC, doenças da unidade motora, doenças degenerativas do SNC e neoplasias. Diagnóstico e reabilitação do déficit auditivo; audiologia; processamento auditivo central. Avaliação e tratamento dos distúrbios da deglutição (neonatal, pediátrico e adulto/disfagia). Gagueira. Respiração: tipo, capacidade, coordenação pneumofônica. Ressonância. Avaliação da motricidade oral. Distúrbio articulatório. Fissuras. Paralisia cerebral. Avaliação e tratamento das disfonias. Fonoaudiologia escolar. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-clinico-geral': {
    nome: 'Médico Clínico Geral – Específico',
    categoria: 'especifico',
    conteudo:
      'Semiologia médica na prática clínica. Radiologia básica na prática clínica. Patologia geral. Epidemiologia geral. Farmacologia básica. Ética médica. Hipertensão arterial. Arritmias cardíacas. Doenças coronarianas. Embolia pulmonar. Asma brônquica. Hemorragia digestiva. Úlceras e gastrites. Hepatites. Obstrução intestinal. Isquemia mesentérica. Pancreatites. Diarreias. Parasitoses. Doenças inflamatórias intestinais. Anemias. Neoplasias malignas mais prevalentes. Cefaleias e enxaquecas. Convulsões. AVE. Infecção urinária. Cólica renal. Infecção das vias aéreas superiores. Pneumonia adquirida na Comunidade. Diabetes tipo I e II. Obesidade. Artrites. Lombalgia. AIDS. Síndrome Gripal e Doença Respiratória Aguda Grave. Dengue. Tabagismo. Etilismo. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-psiquiatra': {
    nome: 'Médico Psiquiatra – Específico',
    categoria: 'especifico',
    conteudo:
      'Diagnóstico em Psiquiatria. Psicopatologia. Transtornos mentais orgânicos, incluindo sintomáticos. Transtornos mentais e do comportamento por uso de substância psicoativa. Política Nacional de Drogas. Esquizofrenia, transtornos esquizotípicos e delirantes. Transtornos do humor. Transtornos neuróticos, relacionados ao estresse e somatoformes. Síndromes comportamentais associadas a perturbações fisiológicas e fatores físicos. Transtornos de personalidade e de comportamento em adultos. Transtornos emocionais e de comportamento com início na infância e adolescência. Psicogeriatria. Psicofarmacologia e psicofarmacoterapia. Tratamentos biológicos. Psicoterapias. Reabilitação psicossocial. Emergências psiquiátricas. Psiquiatria de ligação e interconsulta. Saúde mental da mulher. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-endocrinologista': {
    nome: 'Médico Endocrinologista – Específico',
    categoria: 'especifico',
    conteudo:
      'Doenças do pâncreas endócrino: Diabetes Mellitus – diagnóstico, classificação, fisiopatologia, rastreamento e tratamento de complicações e comorbidades. Doenças da tireoide: testes de função tireoidiana; nódulos tireoidianos; câncer de tireoide; hipertireoidismo e hipotireoidismo; disfunção tireoidiana subclínica. Dislipidemia e obesidade: risco cardiovascular; etiologia, diagnóstico e tratamento; doença hepática gordurosa não alcoólica. Doenças das adrenais: incidentalomas; insuficiência adrenal; hiperaldosteronismo primário; hiperplasia adrenal congênita. Doenças osteometabólicas: hiperparatireoidismo primário; osteoporose; diagnóstico diferencial das hipercalcemias. Doenças do sistema reprodutivo: amenorreia; síndrome de ovários policísticos; ginecomastia; hipogonadismo masculino. Neuroendocrinologia: hiperprolactinemia; incidentalomas hipofisários; hipopituitarismo. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-ginecologista': {
    nome: 'Médico Ginecologista – Específico',
    categoria: 'especifico',
    conteudo:
      'Semiologia médica e radiologia básica na prática clínica. Patologia, epidemiologia, farmacologia e ética médica. Anatomia, embriologia e fisiologia do aparelho genital. Anamnese e exame ginecológico. Exames complementares. Malformações genitais. Estados intersexuais. Ginecologia infantopuberal. DSTs. Vulvovaginites. Doença inflamatória pélvica. Dismenorreia. Síndrome pré-menstrual. Hemorragia uterina disfuncional. Amenorreias. Distopias genitais. Distúrbios urogenitais. Incontinência urinária. Infertilidade conjugal. Endometriose. Métodos contraceptivos. Climatério. Patologias benignas do colo e corpo uterino. Miomatose uterina. Doenças da vulva. SOP. Câncer do colo do útero. Tumores ovarianos malignos e benignos. Lesões mamárias. Abdome agudo em ginecologia. Cirurgias ginecológicas e complicações. Obstetrícia: fisiologia e endocrinologia do ciclo gravídico-puerperal; pré-natal; doenças intercorrentes; gestação de alto risco; medicina fetal; DPP; inserção viciosa placentária; abortamento; prematuridade; gravidez pós-termo; doenças hipertensivas; rotura prematura de membranas; CIUR; diabete e gestação; infecções pré-natais; prenhez ectópica; gemelaridade; parto e puerpério; sofrimento fetal agudo; doença hemolítica perinatal; doença trofoblástica gestacional; hemorragias da gestação e do puerpério. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-neurologista': {
    nome: 'Médico Neurologista – Específico',
    categoria: 'especifico',
    conteudo:
      'AVC isquêmico. AVC hemorrágico. Hemorragia subaracnóidea. Trombose venosa cerebral. Ataque isquêmico transitório. Trombólise para AVC isquêmico agudo. Escalas de avaliação neurológica. Reabilitação de pacientes com AVC. Investigação etiológica do AVC. Prevenção secundária de AVC. Neuroimagem na fase aguda do AVC. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-ortopedista': {
    nome: 'Médico Ortopedista – Específico',
    categoria: 'especifico',
    conteudo:
      'Afecções ortopédicas do adulto e do desenvolvimento. Deformidades congênitas. Fraturas e luxações dos membros inferiores e superiores. Vias de acesso em cirurgia traumato-ortopédica. Lesões tumorais e pseudotumorais na criança e no adulto. Infecções osteoarticulares. Lesões traumáticas dos músculos, tendões e nervos periféricos. Cirurgia da Mão. Doenças Ocupacionais Relacionadas ao Trabalho. Afecções da coluna vertebral. Urgências e emergências traumato-ortopédicas. Radiologia convencional e avançada (TC, RM, US). Navegação. Doenças osteometabólicas. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-pediatra': {
    nome: 'Médico Pediatra – Específico',
    categoria: 'especifico',
    conteudo:
      'Doenças infecciosas na infância: bacterianas, virais, micóticas, protozoários, helmintíases. Erros inatos do metabolismo. Feto e recém-nascido: desenvolvimento; RN a termo e patológico; prematuro e pós-maturo; doenças infecciosas. Fisiopatologia dos líquidos corporais; hidratação oral e parenteral; equilíbrio hidroeletrolítico e ácido-básico. Genética: dismorfismos, aconselhamento. Neoplasmas e lesões neoplásicas: leucoses, linfomas, retinoblastomas, neoplasias do SNC, rins, ossos, sarcoma de tecidos moles. Ginecologia e distúrbios menstruais. Nutrição e distúrbios nutricionais. Crescimento e desenvolvimento. Distúrbios da aprendizagem. Retardo mental. Pediatria preventiva: atenção primária, prevenção secundária e terciária. Epidemiologia. Pele e anexos. Emergências pediátricas: PCR, RCP, IRA, abdome agudo, afogamento, queimaduras, envenenamentos. Sistemas: circulatório, digestivo, endócrino, hematológico, imunológico, nervoso, osteomuscular, respiratório, urinário – desenvolvimento, doenças e diagnósticos no RN, infância e adolescência. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-medico-urologista': {
    nome: 'Médico Urologista – Específico',
    categoria: 'especifico',
    conteudo:
      'Anatomia do aparelho urinário. Deficiência erétil. Doença de Peyronie. Doenças sexualmente transmissíveis. Escroto agudo, torção testicular e orquiepididimite. Exames complementares básicos em cirurgia. Fimose, parafimose e balanite. Hiperplasia benigna da próstata. Imaginologia urológica básica. Incontinência urinária. Infecções urinárias. Malformações urinárias. Priapismo. Risco cirúrgico, controle pré e pós-operatório. Semiologia urológica. Traumatismo urogenital. Tumores malignos da bexiga. Tumores malignos do rim. Urolitíase. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-nutricionista': {
    nome: 'Nutricionista – Específico',
    categoria: 'especifico',
    conteudo:
      'Nutrição básica: nutrientes (conceito, classificação, funções, requerimentos, recomendações, fontes); aspectos clínicos da carência e do excesso. Dietas não convencionais. Avaliação nutricional (antropométrica, clínica, bioquímica). Fibras. Tabelas de alimentos. Alimentação nas diferentes fases biológicas. Educação nutricional: conceito, importância, princípios, hábitos alimentares, técnicas educativas. Avaliação nutricional: métodos diretos e indiretos; estado nutricional populacional. Técnica dietética: alimentos (conceito, classificação, valor nutritivo, caracteres organolépticos); seleção e preparo; planejamento, execução e avaliação de cardápios. Higiene de alimentos: análise microbiológica e toxicológica; contaminação; fatores de desenvolvimento microbiano; modificações; ETAs. Nutrição e dietética: recomendações nutricionais; função social dos alimentos; atividade física e alimentação; alimentação vegetariana. Tecnologia de alimentos: operações unitárias, conservação, embalagem, processamento de origem vegetal e animal, análise sensorial. Nutrição em saúde pública. Dietoterapia: paciente hospitalizado; fisiopatologia; exames laboratoriais; suporte enteral e parenteral. Bromatologia: aditivos, condimentos, pigmentos; estudo químico-bromatológico; vitaminas; minerais; bebidas. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-prof-edbasica': {
    nome: 'Professor de Educação Básica – Específico',
    categoria: 'especifico',
    conteudo:
      'Inteligências múltiplas (Antunes). BNCC (páginas 7 a 60). Diretrizes Curriculares Nacionais para a Educação Infantil. Parâmetros Curriculares Nacionais (1º e 2º ciclo): Arte, Ciências Naturais, História, Geografia, Língua Portuguesa, Matemática, Educação Física, Temas Transversais e Introdução. Crianças de 0 a 6 anos nas políticas educacionais (Kramer). Pedagogia da autonomia (Freire). Ler e escrever na escola (Lerner). Didática (Libâneo). Inclusão escolar (Mantoan). Formação do símbolo na criança (Piaget). Pensamento e Linguagem (Vygotsky). Diálogo entre ensino e aprendizagem (Weisz). Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-matematica': {
    nome: 'Professor 6º a 9º – Matemática – Específico',
    categoria: 'especifico',
    conteudo:
      'Psicologia da Aprendizagem e do Desenvolvimento; Didática Geral; Metodologia de Ensino; Psicologia da Educação; Tendências Pedagógicas da Matemática; Relação ensino/escola/legislação; Teoria versus prática em Matemática; Metodologias e concepções; Matemática aliada à BNCC; Materiais para o ensino; Educação Inclusiva. Aritmética e conjuntos: naturais, inteiros, racionais, irracionais e reais; operações; divisibilidade; contagem; princípio multiplicativo; proporcionalidade. Álgebra: equações de 1º e 2º graus; funções (lineares, quadráticas, exponenciais, logarítmicas, trigonométricas); progressões aritméticas e geométricas; polinômios; números complexos; matrizes; sistemas lineares; matemática financeira. Espaço e forma: geometria plana, espacial, métrica e analítica. Tratamento de dados: estatística; análise combinatória; probabilidade; gráficos e tabelas. Currículos de Matemática e Reforma; objetivos, seleção/organização de conteúdos; tendências (resolução de problemas, modelagem, etnomatemática, história da matemática, mídias tecnológicas). Sistemas de medidas; regra de três; cálculos algébricos (produtos notáveis, fatoração); equações, inequações e sistemas (1º e 2º graus); funções (1º, 2º graus, logarítmica, exponencial, trigonométricas); geometria plana e espacial; sequências e progressões; matrizes e determinantes; sistemas lineares; análise combinatória; matemática financeira (juros simples e compostos); trigonometria (no triângulo retângulo e em triângulos quaisquer); geometria analítica (ponto e reta, circunferência, cônicas); estatística (representação gráfica, medidas de tendência central, dispersão, testes de significância); polinômios e equações algébricas; noções de limites, derivadas e integrais. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-portugues': {
    nome: 'Professor 6º a 9º – Língua Portuguesa – Específico',
    categoria: 'especifico',
    conteudo:
      'Psicologia da Aprendizagem e Desenvolvimento; Didática Geral; Metodologia de Ensino; Psicologia da Educação; Tendências pedagógicas; Teoria versus prática em Língua Portuguesa; Metodologias e concepções; Tendências Pedagógicas da Língua Portuguesa; LP aliada à BNCC; Materiais; LP e Educação Inclusiva. Concepções de língua-linguagem como discurso e processo de interação: dialogismo, polifonia, discurso, enunciado, enunciação, texto, gêneros discursivos. Oralidade: gêneros orais; particularidades do texto oral. Leitura: papel do leitor; objetivos; formação do leitor crítico; intertextualidade; inferências; literatura e ensino; análise estética. Escrita: produção textual; interlocutor; contexto; gêneros; fatores linguísticos e discursivos; análise, revisão e reescrita. Análise Linguística: o texto (oral e escrito) como unidade privilegiada na análise-reflexão da linguagem; efeitos de sentido; norma padrão e variedades. Linguagem oral e escrita: relações entre fala e escrita; perspectiva não dicotômica. Estratégias de leitura. Literatura Brasileira e geral; interpretação de livros e textos literários. Gramática. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-ciencias': {
    nome: 'Professor 6º a 9º – Ciências – Específico',
    categoria: 'especifico',
    conteudo:
      'Psicologia da Aprendizagem e Desenvolvimento; Didática Geral; Metodologia de Ensino; Psicologia da Educação; Tendências pedagógicas; Tendências Pedagógicas das Ciências; Teoria versus prática; Metodologias e concepções; Ciências aliadas à BNCC; Materiais; Educação Inclusiva. Ar, água, solo. Vírus, moneras, protistas e fungos. Evolução; seres vivos e adaptação; seleção natural/mutação; nomenclatura científica; classificação. Animais: filogenia dos principais grupos; poríferos, celenterados, platelmintos, nematelmintos, anelídeos, moluscos, vertebrados (classificação, ecologia, morfofisiologia, reprodução). Vegetais: algas pluricelulares, briófitas e pteridófitas; gimnospermas; angiospermas. Corpo Humano: célula; tecido (conceito, tipos, função); sistemas digestivo, respiratório, circulatório, nervoso e reprodutor (composição e funções); educação sexual; drogas e seus efeitos. Matéria: conceito, tipos, propriedade, energia; fenômenos químicos e físicos; substâncias simples e compostas; funções químicas (ácidos, bases, sais e óxidos); misturas e combinações; tipos e fatores que influenciam reações. Movimento: conceito, tipos e fatores; massa, força e aceleração. Metodologia/didática de Ciências; Educação Inclusiva e Ciências; principais cientistas; História da Ciência/Educação em Ciência; principais educadores. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-historia': {
    nome: 'Professor 6º a 9º – História – Específico',
    categoria: 'especifico',
    conteudo:
      'Ensino de história: desafios contemporâneos (Barroso). Ensino de História: fundamentos e métodos (Bittencourt). PCN: 3º e 4º ciclos do ensino fundamental – História (MEC/SEF). Canudos e outros temas (Euclides da Cunha). História/vários autores (SEED-PR). Eixos temáticos no livro didático (Oliveira). História: ensino fundamental (MEC). Projeto História (PUC-SP). Currículo do Estado de SP: Ciências Humanas e suas tecnologias. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-geografia': {
    nome: 'Professor 6º a 9º – Geografia – Específico',
    categoria: 'especifico',
    conteudo:
      'PCN – 3º e 4º ciclos: Geografia. Práticas e textualizações no cotidiano (Castrogiovanni). Pensamento geográfico e epistemologia (Godoy et al.). Mapas e cartografia temática (Martinelli). Geografia: pequena história crítica (Moraes). Formação docente e geografia escolar (Pezzato). Natureza do espaço; Metamorfoses do espaço habitado; O Brasil: território e sociedade; Por uma Geografia Nova; Território: globalização e fragmentação (Milton Santos). Currículo do Estado de SP. Geografia escolar para o século XXI (Vesentini). Mudanças climáticas (Zangalli Jr.). Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-ingles': {
    nome: 'Professor 6º a 9º – Inglês – Específico',
    categoria: 'especifico',
    conteudo:
      'Psicologia da Aprendizagem e Desenvolvimento; Didática Geral; Metodologia de Ensino; Psicologia da Educação; Tendências pedagógicas; Tendências Pedagógicas do Inglês; Teoria versus prática; Metodologias e concepções; Inglês aliado à BNCC; Materiais; Educação Inclusiva. Gramática: fonética, fonologia, ortografia, morfologia, sintaxe, vocabulário; compreensão e produção de gêneros textuais. Prática pedagógica: abordagem comunicativa, lexical, reflexiva. Análise e interpretação de textos: tema central; relações entre partes; lugar, tempo, modo, finalidade, causa, condição, consequência, comparação. Interculturalidade e interdisciplinaridade. Competências para ensinar e aprender. Avaliação. Interação em sala de aula e conhecimento prévio. Letramento: leitura, comunicação oral e escrita. Metodologia da Língua Estrangeira. Proposta Curricular de LEM. Comunicação. Construção da leitura e escrita. Natureza sociointeracional. Literatura Americana e Inglesa. Cognatos e falsos cognatos. Vocabulário em contexto. Aspectos gramaticais: flexão do nome, pronome e artigo; substantivos contáveis e não contáveis; flexão verbal; tempos verbais e auxiliares; expressões; regência e concordância nominal/verbal; preposições; orações relacionais; orações relativas; pronomes interrogativos; frases interrogativas. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-edfisica': {
    nome: 'Professor 6º a 9º – Educação Física – Específico',
    categoria: 'especifico',
    conteudo:
      'Psicologia da Aprendizagem e Desenvolvimento; Didática Geral; Metodologia de Ensino; Psicologia da Educação; Tendências Pedagógicas da Ed. Física; Teoria versus prática; Metodologias e concepções; EF aliada à BNCC; Materiais; Educação Inclusiva. Ed. Física frente à LDB 9.394/96 (Lei 10.793/03); PCNs; EF na Área de Linguagens, Códigos e suas Tecnologias; EF como componente curricular: função social, objetivos, características, conteúdos. Abordagens da EF: intenção, fundamentos, objetos de estudo e função na EF escolar. Planejamento e Avaliação. Esporte Escolar: ensino-aprendizagem-treinamento; conhecimento prático das modalidades. Concepções psicomotoras. EF e desenvolvimento humano. Metodologia. Teorias da EF e do Esporte. Qualidades físicas. Biologia do esporte. Fisiologia do exercício. Anatomia Humana. Dimensões filosóficas, antropológicas e sociais aplicadas à educação e ao esporte; lazer e suas interfaces. Dimensões biológicas: mudanças fisiológicas resultantes da atividade física. EF e cidadania; objetivos, conteúdos, metodologia e avaliação. Esporte e jogos na escola: competição, cooperação e transformação didático-pedagógica. Crescimento e desenvolvimento motor. Efeitos da atividade física na saúde. História da EF. Atividade motora adaptada. Aprendizagem motora. Crescimento, desenvolvimento e maturação; processo avaliativo. Cultura corporal: esportes, jogos, lutas, ginástica e dança. PCN: Educação Física. Anatomia (osteologia, artrologia, miologia, sistema cardiocirculatório e respiratório); biomecânica do movimento humano; fisiologia do exercício; treinamento desportivo: princípios e métodos. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-prof-religioso': {
    nome: 'Professor 6º a 9º – Ensino Religioso – Específico',
    categoria: 'especifico',
    conteudo:
      'Ensino religioso na atualidade brasileira: legislação Nacional e Estadual. BNCC e o Ensino Religioso. Conhecimento religioso e suas manifestações nas diferentes culturas e tradições. Currículo, objetivos, princípios organizativos, tratamento didático e avaliação. Ideia de transcendência. Função política religiosa. Revelação. Revolução das estruturas religiosas. Espiritualidade. Limites. Psicologia da Aprendizagem e Desenvolvimento. Metodologia do Ensino Religioso. Temas transversais. LDB e alterações. ECA. Constituição Federal art. 33 e Lei nº 9.475/1997. Plano Político Pedagógico. PNE – Lei nº 13.005/2014. Lei nº 11.645/2008. Resolução CNE/CEB nº 4 de 02/10/2009. Resolução CNE/CEB nº 4 de 13/07/2010. Resolução CNE/CEB nº 7 de 14/12/2010. Lei nº 11.738/2008. Plano Municipal de Educação – Lei nº 5.614/2015. Decreto nº 6.094/2007 (IDEB). Lei Ordinária nº 5.677/2015. Proposta Curricular AMAVI. Lei nº 5.053/2010. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-psicologo': {
    nome: 'Psicólogo – Específico',
    categoria: 'especifico',
    conteudo:
      'Políticas Públicas do Brasil (SUS, SUAS, portarias, resoluções, decretos, tipificações e legislações). História da Psicologia (área de atuação, autores, teorias, técnicas, abordagens, métodos de intervenção e marcos históricos). Aspectos gerais do Psicodiagnóstico (entrevista, avaliação, interpretação, aplicação, diagnóstico e testes psicológicos). Psicopatologia (conceituação, sintomas, alterações e doenças de natureza psíquica, neurose, perversões e síndromes). Código de Ética do Psicólogo (resoluções, publicações, artigos, legislações, decretos, prática profissional). Teorias e práticas da Psicologia nas áreas Hospitalar, Saúde, Educação, Organizacional e Social (atuação multidisciplinar, interdisciplinar e transdisciplinar). Psicologia do desenvolvimento e da aprendizagem (Psicanálise, Gestalt, Fenomenológica, Sócio-Histórica, Behaviorismo, Humanista, Analítica). ECA. Estatuto da Juventude. Estatuto do Idoso. Atenção para o conteúdo específico para todos os profissionais da Saúde.',
  },

  'esp-supervisor-edu': {
    nome: 'Supervisor Escolar – Específico',
    categoria: 'especifico',
    conteudo:
      'Educação contemporânea. Normas, diretrizes, referenciais e parâmetros curriculares da educação básica, infantil e ensino fundamental. Gestão participativa na escola. Educação Inclusiva. Gestão Escolar e Projeto Político-Pedagógico. Currículo escolar. Plano de Ação compartilhado. Participação da família e comunidade. Reuniões pedagógicas. Ética e cidadania no convívio escolar. História da educação. Trajetória da Gestão Escolar. Funcionamento e organização escolar. Currículo e formação de educadores; teorias do currículo; currículo na prática escolar. Concepções e processos democráticos de gestão. Tecnologia e gestão educacional. Gestão Pedagógica: desempenho e eficácia das Unidades Escolares; objetivos e metas; indicadores; avaliação institucional; tendências e inovação. Desafios contemporâneos. Resolução de conflitos. Política educacional atual. Reuniões de pais. Educação especial e inclusão. Diretrizes Curriculares (Educação Básica, EF, EI e Ed. Especial). Avaliação Institucional. Motivação. Gestão Educacional: indicadores sociais, educacionais e culturais; atendimento a necessidades específicas; bases legais. Estratégias contra evasão escolar. Desenvolvimento da Educação. Indicadores demográficos da demanda escolar. Atenção para o conteúdo específico para todos os profissionais da Educação.',
  },

  'esp-fisioterapeuta-geriatrico': {
    nome: 'Fisioterapeuta Geriátrico – Específico',
    categoria: 'especifico',
    conteudo:
      'Fisioterapia Neurofuncional. Fisioterapia Dermatológica e Galvanopuntura. Fisiologia articular do membro inferior. Fisioterapia gerontológica. Fisioterapia músculo-esquelética (manguito rotador, fibromialgia, cadeias musculares, pata de ganso, lesão de Bankart, músculo tibial). Fisioterapia do trabalho. Fisioterapia motora. Fundamentos de fisioterapia. Métodos e técnicas de avaliação e tratamento. Provas de função muscular, cinesiologia e biomecânica. Cinesioterapia motora; manipulações e cinesioterapia respiratória. Análise da marcha; treinamento em locomoção e deambulação. Mecanoterapia, hidroterapia, massoterapia, eletroterapia, termoterapia e crioterapia. Prescrição e treinamento de órteses e próteses. Anatomia, fisiologia, fisiopatologia, semiologia e procedimentos fisioterápicos. Atenção para matéria específica para todos os profissionais da Saúde.',
  },

  'esp-terapeuta-ocupacional': {
    nome: 'Terapeuta Ocupacional CAPS – Específico',
    categoria: 'especifico',
    conteudo:
      'Ética profissional. Trabalho em equipe. Atividades multi e interdisciplinares em saúde. Saúde coletiva e do trabalho. Saúde mental e reforma psiquiátrica e rede de reabilitação psicossocial. Modelos de atenção em saúde e atuação do TO na saúde pública. Inserção no trabalho de pessoas em desvantagem. Saúde mental da criança. Reabilitação psicossocial, física e inclusão. Atividades e recursos terapêuticos em TO. Transformação e adaptação de recursos materiais e ambientais. Fundamentos de TO: conceituação, histórico, evolução, objetivos, modelos. TO nas disfunções físicas: avaliação; objetivos; seleção e análise de atividades; programa de tratamento; cinesiologia aplicada; reeducação muscular; facilitação neuromuscular proprioceptiva; tratamento da coordenação; tipos de preensão; mobilização articular; AVDs e AVPs; órteses e próteses. TO aplicada às condições neuromusculoesqueléticas: Neurológica, Neuropediátrica, Reumatológica, Traumato-ortopédica, Geriátrica e Gerontológica. TO em Psiquiatria e Saúde Mental: oligofrenias; psicoses orgânicas; esquizofrenias; psicoses afetivas; transtornos de personalidade; neuroses; alcoolismo; abuso de fármacos e drogas; distúrbios psicossomáticos; reabilitação psicossocial. Temas Transversais.',
  },

  'esp-veterinario': {
    nome: 'Médico Veterinário – Específico',
    categoria: 'especifico',
    conteudo:
      'Inspeção industrial e sanitária dos produtos de origem animal. Programas Nacionais de Saúde Animal no Brasil. Sistemas: sanguíneo, linfático, cardiovascular, digestivo, endócrino, olho e ouvido, imune, musculoesquelético, nervoso, reprodutivo, respiratório, urinário; pele; afecções generalizadas; distúrbios metabólicos; influências físicas; comportamento. Animais silvestres e de laboratório. Manejo, criação e nutrição. Farmacologia. Doenças aviárias. Toxicologia. Zoonoses. Vigilância sanitária e epidemiológica de alimentos: intoxicações e toxi-infecções; profilaxia; investigação de surtos; coleta de amostras. Epidemiologia geral e aplicada à vigilância sanitária. Doenças bacterianas (Tuberculose, Brucelose, Leptospirose, Salmoneloses, Estreptococciases, Estafilococciases). Doenças virais (Raiva, Encefalites equinas). Protozoários (Leishmaniose, Toxoplasmose). Nematoides (Ascaridíase, Ancilostomíase). Cestoides (Teníases, Cisticercoses, Equinococoses). Zoonoses: conceituação e classificação; controle da raiva; controle de roedores; controle de vetores; quirópteros. Doenças infectocontagiosas dos animais domésticos. Farmacologia e terapêutica. Fisiologia. Inspeção e tecnologia de produtos de origem animal. Nutrição animal. Parasitologia médico-veterinária. Patologia médico-veterinária.',
  },
};

// ─────────────────────────────────────────────────────────
// CARGOS — vagas, salário, requisitos, matérias correlatas
// ─────────────────────────────────────────────────────────
export const cargos: Cargo[] = [
  // ─── ENSINO FUNDAMENTAL ───
  { slug: 'auxiliar-administrativo', nome: 'Auxiliar Administrativo', nivel: 'fundamental', vagas: '09', cargaHoraria: '30h semanais', salario: 'R$ 1.662,48', requisitos: 'Ensino Fundamental Completo',
    materiasIds: ['port-fund', 'mat-fund', 'esp-aux-administrativo'] },
  { slug: 'auxiliar-consultorio-odontologico', nome: 'Auxiliar de Consultório Odontológico', nivel: 'fundamental', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.662,48', requisitos: 'Alfabetizado, Ensino Fundamental Incompleto',
    materiasIds: ['port-fund', 'mat-fund', 'saude-sus', 'esp-aux-cons-odontologico'] },
  { slug: 'auxiliar-servicos-saude', nome: 'Auxiliar de Serviços de Saúde', nivel: 'fundamental', vagas: '03', cargaHoraria: '40h semanais', salario: 'R$ 1.662,48', requisitos: 'Ensino Fundamental Completo',
    materiasIds: ['port-fund', 'mat-fund', 'saude-sus', 'esp-aux-saude'] },
  { slug: 'auxiliar-servicos-gerais', nome: 'Auxiliar de Serviços Gerais', nivel: 'fundamental', vagas: '23', cargaHoraria: '44h semanais', salario: 'R$ 1.662,48', requisitos: 'Ensino Fundamental Incompleto',
    materiasIds: ['port-fund', 'mat-fund', 'esp-aux-servicos-gerais'] },
  { slug: 'coveiro', nome: 'Coveiro', nivel: 'fundamental', vagas: '01', cargaHoraria: '40h semanais', salario: 'R$ 1.662,48', requisitos: 'Ensino Fundamental Completo',
    materiasIds: ['port-fund', 'mat-fund', 'esp-coveiro'] },
  { slug: 'fiscal-vigilancia-sanitaria', nome: 'Fiscal de Vigilância Sanitária', nivel: 'fundamental', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 2.342,63', requisitos: 'Ensino Fundamental Completo',
    materiasIds: ['port-fund', 'mat-fund', 'saude-sus', 'esp-fiscal-vig-sanitaria'] },
  { slug: 'motorista', nome: 'Motorista', nivel: 'fundamental', vagas: '02', cargaHoraria: '44h semanais', salario: 'R$ 1.662,48', requisitos: 'Ensino Fundamental Incompleto + CNH "D"',
    materiasIds: ['port-fund', 'mat-fund', 'esp-motorista'] },
  { slug: 'operador-maquina', nome: 'Operador de Máquina', nivel: 'fundamental', vagas: '03', cargaHoraria: '44h semanais', salario: 'R$ 1.757,03', requisitos: 'Ensino Fundamental Incompleto + CNH "C", "D" ou "E"',
    materiasIds: ['port-fund', 'mat-fund', 'esp-operador-maquina'] },

  // ─── ENSINO MÉDIO / TÉCNICO ───
  { slug: 'artesao-caps', nome: 'Artesão CAPS', nivel: 'medio', vagas: '01', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-artesao-caps'] },
  { slug: 'fiscal-agricultura', nome: 'Fiscal da Agricultura', nivel: 'medio', vagas: '01', cargaHoraria: '30h semanais', salario: 'R$ 2.342,63', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'esp-fiscal-agricultura'] },
  { slug: 'fiscal-obras', nome: 'Fiscal de Obras e Posturas', nivel: 'medio', vagas: '01', cargaHoraria: '30h semanais', salario: 'R$ 2.342,63', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'esp-fiscal-obras'] },
  { slug: 'fiscal-tributario', nome: 'Fiscal Tributário', nivel: 'medio', vagas: '01', cargaHoraria: '30h semanais', salario: 'R$ 2.342,63', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'esp-fiscal-tributario'] },
  { slug: 'monitor-creche', nome: 'Monitor de Creche/Educação Infantil', nivel: 'medio', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 1.827,53', requisitos: 'Ensino Médio com Magistério',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-monitor-creche'] },
  { slug: 'orientador-social', nome: 'Orientador Social', nivel: 'medio', vagas: '02', cargaHoraria: '30h semanais', salario: 'R$ 1.662,48', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'esp-orientador-social'] },
  { slug: 'secretaria-escolar', nome: 'Secretária Escolar', nivel: 'medio', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 1.827,53', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'esp-secretaria-escolar'] },
  { slug: 'tecnico-administrativo-caps', nome: 'Técnico Administrativo do CAPS', nivel: 'medio', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-tec-administrativo-caps'] },
  { slug: 'tecnico-educacional-caps', nome: 'Técnico Educacional CAPS', nivel: 'medio', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Ensino Médio Completo',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'esp-tec-educacional-caps'] },
  { slug: 'tecnico-enfermagem', nome: 'Técnico em Enfermagem', nivel: 'medio', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Técnico em Enfermagem com registro no COREN',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-tec-enfermagem'] },
  { slug: 'tecnico-enfermagem-caps', nome: 'Técnico em Enfermagem CAPS', nivel: 'medio', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Técnico em Enfermagem com registro no COREN',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-tec-enfermagem'] },
  { slug: 'tecnico-higiene-dental', nome: 'Técnico em Higiene Dental', nivel: 'medio', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Técnico em Higiene Dental',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-tec-higiene-dental'] },
  { slug: 'tecnico-informatica', nome: 'Técnico em Informática', nivel: 'medio', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Técnico em Informática',
    materiasIds: ['port-medio', 'mat-medio', 'esp-tec-informatica'] },
  { slug: 'tecnico-seguranca-trabalho', nome: 'Técnico em Segurança do Trabalho', nivel: 'medio', vagas: 'CR', cargaHoraria: '40h semanais', salario: 'R$ 1.827,53', requisitos: 'Técnico em Segurança do Trabalho',
    materiasIds: ['port-medio', 'mat-medio', 'esp-tec-seguranca-trabalho'] },

  // ─── ENSINO SUPERIOR ───
  { slug: 'assistente-social', nome: 'Assistente Social', nivel: 'superior', vagas: '01', cargaHoraria: '30h semanais', salario: 'R$ 2.433,54', requisitos: 'Ensino Superior em Serviço Social',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-assistente-social'] },
  { slug: 'assistente-social-caps', nome: 'Assistente Social CAPS', nivel: 'superior', vagas: '01', cargaHoraria: '30h semanais', salario: 'R$ 3.244,70', requisitos: 'Ensino Superior em Serviço Social',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-assistente-social'] },
  { slug: 'bioquimico', nome: 'Bioquímico', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 2.780,02', requisitos: 'Superior em Farmácia/Bioquímica',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-bioquimico'] },
  { slug: 'cirurgiao-dentista', nome: 'Cirurgião Dentista', nivel: 'superior', vagas: '01', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Odontologia',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-cirurgiao-dentista'] },
  { slug: 'enfermeiro', nome: 'Enfermeiro', nivel: 'superior', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 2.511,94', requisitos: 'Superior em Enfermagem',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-enfermeiro'] },
  { slug: 'enfermeiro-caps', nome: 'Enfermeiro CAPS', nivel: 'superior', vagas: '01', cargaHoraria: '40h semanais', salario: 'R$ 3.603,43', requisitos: 'Superior em Enfermagem',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-enfermeiro'] },
  { slug: 'engenheiro-civil', nome: 'Engenheiro Civil', nivel: 'superior', vagas: '01', cargaHoraria: '40h semanais', salario: 'R$ 2.780,00', requisitos: 'Superior em Engenharia Civil',
    materiasIds: ['port-medio', 'mat-medio', 'esp-engenheiro-civil'] },
  { slug: 'farmaceutico', nome: 'Farmacêutico', nivel: 'superior', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 4.060,60', requisitos: 'Superior em Farmácia',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-farmaceutico'] },
  { slug: 'fisioterapeuta', nome: 'Fisioterapeuta', nivel: 'superior', vagas: '01', cargaHoraria: '20h semanais', salario: 'R$ 2.779,93', requisitos: 'Superior em Fisioterapia',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-fisioterapeuta'] },
  { slug: 'fisioterapeuta-geriatrico', nome: 'Fisioterapeuta Geriátrico', nivel: 'superior', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 2.779,93', requisitos: 'Superior em Fisioterapia',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-fisioterapeuta-geriatrico'] },
  { slug: 'fonoaudiologa', nome: 'Fonoaudióloga', nivel: 'superior', vagas: '02', cargaHoraria: '20h semanais', salario: 'R$ 2.342,63', requisitos: 'Superior em Fonoaudiologia',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-fonoaudiologa'] },
  { slug: 'medico-clinico-geral', nome: 'Médico Clínico Geral', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-clinico-geral'] },
  { slug: 'medico-pediatra', nome: 'Médico Pediatra', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-pediatra'] },
  { slug: 'medico-psiquiatra', nome: 'Médico Psiquiatra', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-psiquiatra'] },
  { slug: 'medico-psiquiatra-caps', nome: 'Médico Psiquiatra CAPS', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-psiquiatra'] },
  { slug: 'medico-endocrinologista', nome: 'Médico Endocrinologista', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-endocrinologista'] },
  { slug: 'medico-ginecologista', nome: 'Médico Ginecologista', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-ginecologista'] },
  { slug: 'medico-neurologista', nome: 'Médico Neurologista', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-neurologista'] },
  { slug: 'medico-ortopedista', nome: 'Médico Ortopedista', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-ortopedista'] },
  { slug: 'medico-urologista', nome: 'Médico Urologista', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 4.863,00', requisitos: 'Superior em Medicina + Especialização',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-medico-urologista'] },
  { slug: 'nutricionista', nome: 'Nutricionista', nivel: 'superior', vagas: '01', cargaHoraria: '20h semanais', salario: 'R$ 2.433,52', requisitos: 'Superior em Nutrição',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-nutricionista'] },
  { slug: 'professor-edbasica', nome: 'Professor de Educação Básica', nivel: 'superior', vagas: '02', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Superior em Pedagogia',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-edbasica'] },
  { slug: 'professor-portugues', nome: 'Professor 6º a 9º – Língua Portuguesa', nivel: 'superior', vagas: 'CR', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em Letras',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-portugues'] },
  { slug: 'professor-matematica', nome: 'Professor 6º a 9º – Matemática', nivel: 'superior', vagas: '02', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em Matemática',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-matematica'] },
  { slug: 'professor-ciencias', nome: 'Professor 6º a 9º – Ciências', nivel: 'superior', vagas: 'CR', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em Ciências/Biologia',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-ciencias'] },
  { slug: 'professor-historia', nome: 'Professor 6º a 9º – História', nivel: 'superior', vagas: '01', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em História',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-historia'] },
  { slug: 'professor-geografia', nome: 'Professor 6º a 9º – Geografia', nivel: 'superior', vagas: '01', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em Geografia',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-geografia'] },
  { slug: 'professor-ingles', nome: 'Professor 6º a 9º – Inglês', nivel: 'superior', vagas: 'CR', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em Letras-Inglês',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-ingles'] },
  { slug: 'professor-edfisica', nome: 'Professor 6º a 9º – Educação Física', nivel: 'superior', vagas: 'CR', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em Educação Física',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-edfisica'] },
  { slug: 'professor-religioso', nome: 'Professor 6º a 9º – Ensino Religioso', nivel: 'superior', vagas: 'CR', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Licenciatura em Ensino Religioso/áreas afins',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-prof-religioso'] },
  { slug: 'psicologo', nome: 'Psicólogo', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 2.780,02', requisitos: 'Superior em Psicologia',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-psicologo'] },
  { slug: 'psicologo-caps', nome: 'Psicólogo CAPS', nivel: 'superior', vagas: '02', cargaHoraria: '30h semanais', salario: 'R$ 3.397,86', requisitos: 'Superior em Psicologia',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-psicologo'] },
  { slug: 'supervisor-escolar', nome: 'Supervisor Escolar', nivel: 'superior', vagas: '05', cargaHoraria: '25h semanais', salario: 'R$ 3.206,66', requisitos: 'Superior em Pedagogia',
    materiasIds: ['port-medio', 'mat-medio', 'educ-fundamentos', 'educ-legislacao', 'esp-supervisor-edu'] },
  { slug: 'terapeuta-ocupacional', nome: 'Terapeuta Ocupacional CAPS', nivel: 'superior', vagas: 'CR', cargaHoraria: '30h semanais', salario: 'R$ 2.779,93', requisitos: 'Superior em Terapia Ocupacional',
    materiasIds: ['port-medio', 'mat-medio', 'saude-sus', 'esp-terapeuta-ocupacional'] },
  { slug: 'veterinario', nome: 'Médico Veterinário', nivel: 'superior', vagas: 'CR', cargaHoraria: '20h semanais', salario: 'R$ 2.777,83', requisitos: 'Superior em Medicina Veterinária',
    materiasIds: ['port-medio', 'mat-medio', 'esp-veterinario'] },
];

export const getCargoBySlug = (slug: string): Cargo | undefined =>
  cargos.find((c) => c.slug === slug);

export const getMateriaById = (id: string): Materia | undefined =>
  materias[id];

export const cargosByNivel = {
  fundamental: cargos.filter((c) => c.nivel === 'fundamental'),
  medio: cargos.filter((c) => c.nivel === 'medio'),
  superior: cargos.filter((c) => c.nivel === 'superior'),
};

export const NIVEL_LABEL: Record<Nivel, string> = {
  fundamental: 'Ensino Fundamental',
  medio: 'Ensino Médio / Técnico',
  superior: 'Ensino Superior',
};
