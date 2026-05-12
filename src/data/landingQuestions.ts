// Questões pré-selecionadas pra demonstração na landing.
// Não chamam IA — mostram exatamente o nível/estilo do simulado real.
// Variantes por concurso (banca) — fallback default é Baependi/INEPAM.

export interface LandingQuestion {
  id: string;
  area: string;
  cargo: string;
  nivel: 'Médio' | 'Superior';
  enunciado: string;
  alternativas: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
  comentario: string;
}

const BAEPENDI_QUESTIONS: LandingQuestion[] = [
  {
    id: 'lp-01',
    area: 'Língua Portuguesa',
    cargo: 'Auxiliar Administrativo',
    nivel: 'Médio',
    enunciado:
      'Considere as frases a seguir, que apresentam lacunas a serem preenchidas observando a norma-padrão da Língua Portuguesa:\n\nI. O departamento realizou uma _______ de produtos.\nII. Aquele cidadão tem direito à _______ de seus bens.\nIII. Os servidores compareceram à _______ de treinamento.\nIV. Ele não tem _______ para realizar o trabalho.\n\nAssinale a alternativa que preenche, correta e respectivamente, as lacunas com as palavras "seção", "cessão", "sessão" e "escassez".',
    alternativas: [
      { letter: 'A', text: 'seção, cessão, sessão, escassez' },
      { letter: 'B', text: 'sessão, seção, cessão, escassez' },
      { letter: 'C', text: 'seção, sessão, cessão, escassez' },
      { letter: 'D', text: 'cessão, seção, sessão, escassez' },
      { letter: 'E', text: 'seção, cessão, escassez, sessão' },
    ],
    gabarito: 'A',
    comentario:
      '**Gabarito: A.** Os parônimos exigem distinção pelo significado:\n\n• **Seção** = divisão, repartição (departamento de compras → "seção" de produtos).\n• **Cessão** = ato de ceder, transferir direito ("cessão" de bens).\n• **Sessão** = reunião, encontro ("sessão" de treinamento).\n• **Escassez** = falta, pouca disponibilidade ("escassez" de recursos).\n\nA alternativa A mantém essa ordem. As demais alternativas trocam pelo menos um dos parônimos, configurando erro de grafia em contexto.',
  },
  {
    id: 'sus-01',
    area: 'Saúde Pública e SUS',
    cargo: 'Enfermeiro · Técnico em Enfermagem · Profissionais da Saúde',
    nivel: 'Superior',
    enunciado:
      'A Lei nº 8.080/1990 dispõe sobre as condições para a promoção, proteção e recuperação da saúde, a organização e o funcionamento dos serviços correspondentes. Sobre os princípios e diretrizes do Sistema Único de Saúde (SUS), assinale a alternativa CORRETA.',
    alternativas: [
      { letter: 'A', text: 'A universalidade de acesso aos serviços de saúde permite que apenas usuários previamente cadastrados em unidade básica recebam atendimento.' },
      { letter: 'B', text: 'A integralidade da assistência é entendida como conjunto articulado e contínuo das ações e serviços preventivos e curativos, individuais e coletivos, exigidos para cada caso em todos os níveis de complexidade.' },
      { letter: 'C', text: 'A equidade no SUS significa oferecer atendimento idêntico a todos os usuários, sem considerar as diferenças socioeconômicas ou epidemiológicas.' },
      { letter: 'D', text: 'A descentralização político-administrativa concentra a gestão dos serviços de saúde no Ministério da Saúde, cabendo aos estados apenas a execução.' },
      { letter: 'E', text: 'A participação da comunidade no SUS limita-se à eleição quadrienal de representantes para os Conselhos Estaduais de Saúde.' },
    ],
    gabarito: 'B',
    comentario:
      '**Gabarito: B.** A definição de integralidade está no art. 7º, II da Lei nº 8.080/1990, exatamente como redigida na alternativa.\n\n• **A** está errada: universalidade significa acesso a TODOS, sem exigência de cadastro prévio (art. 7º, I).\n• **C** confunde equidade com igualitarismo absoluto — equidade é tratar desigualmente os desiguais, considerando suas necessidades.\n• **D** inverte a diretriz: a descentralização político-administrativa fortalece a gestão **municipal**, não a federal (art. 7º, IX).\n• **E** está errada: participação da comunidade ocorre via Conselhos e Conferências de Saúde, em todas as esferas, e de forma contínua — não por eleições quadrienais (Lei nº 8.142/1990).',
  },
  {
    id: 'da-01',
    area: 'Direito Administrativo',
    cargo: 'Assistente Social · Engenheiro Civil · Cargos de Nível Superior',
    nivel: 'Superior',
    enunciado:
      'Servidor público da prefeitura municipal foi nomeado para cargo efetivo, mas, posteriormente, descobriu-se que possuía vício de motivo na sua nomeação, pois o requisito de escolaridade declarado era falso. Diante disso, a Administração Pública pretende desfazer o ato.\n\nConsiderando a Lei nº 9.784/1999 e a Súmula nº 473 do STF, é correto afirmar que:',
    alternativas: [
      { letter: 'A', text: 'O ato é passível de revogação, com efeitos ex nunc, desde que não haja mais interesse público em sua manutenção.' },
      { letter: 'B', text: 'A Administração deve anular o ato com efeitos ex tunc, independentemente da boa-fé do servidor, sem qualquer prazo decadencial.' },
      { letter: 'C', text: 'O ato é válido até que seja declarada a sua nulidade, e a Administração, pautada na autotutela, poderá convalidá-lo, suprimindo o vício de motivo.' },
      { letter: 'D', text: 'Em razão do vício de motivo, o ato é inexistente, não produzindo efeitos jurídicos desde a sua origem, sendo objeto apenas de declaração de inexistência.' },
      { letter: 'E', text: 'A ilegalidade do ato impõe sua anulação pela Administração com efeitos ex tunc, observado o prazo decadencial de 5 anos para atos favoráveis ao destinatário (art. 54 da Lei nº 9.784/1999), salvo má-fé comprovada.' },
    ],
    gabarito: 'E',
    comentario:
      '**Gabarito: E.** O vício de motivo torna o ato ilegal. Atos ilegais são, em regra, NULOS e a Administração tem o **poder-dever** de anulá-los com base no princípio da autotutela (Súmula 473/STF).\n\n• **A** está errada: vício de motivo é defeito de **legalidade** → cabe **anulação** (não revogação). Revogação exige ato válido + critério de oportunidade.\n• **B** ignora o art. 54 da Lei 9.784/99: o prazo decadencial de **5 anos** se aplica a atos favoráveis ao beneficiário de boa-fé.\n• **C** está errada: vício de motivo em ato vinculado **não é convalidável** (art. 55 da Lei 9.784/99 a contrario sensu — só vícios sanáveis em competência ou forma podem ser convalidados).\n• **D** confunde nulidade com inexistência. O ato existe juridicamente; é apenas inválido.\n• **E** sintetiza corretamente: anulação com efeitos *ex tunc* + decadência de 5 anos para atos favoráveis a destinatários de boa-fé.',
  },
];

// Estilo Consulplan: enunciados contextualizados, "assinale a INCORRETA",
// linguagem formal, distratores plausíveis com erro num detalhe normativo.
const ALAGOA_QUESTIONS: LandingQuestion[] = [
  {
    id: 'al-lp-01',
    area: 'Língua Portuguesa',
    cargo: 'Cargos de Nível Médio',
    nivel: 'Médio',
    enunciado:
      'Leia o fragmento a seguir, adaptado para fins didáticos:\n\n"A leitura, mais do que um simples ato mecânico, constitui uma prática social que exige do leitor a mobilização de conhecimentos prévios, inferências e diálogo com o texto. Quando bem orientada na escola, transforma-se em ferramenta de emancipação."\n\nA respeito dos elementos de coesão e dos sentidos construídos no fragmento, analise as afirmativas a seguir:\n\nI. A expressão "mais do que" estabelece relação de comparação, atribuindo à leitura caráter que supera o aspecto meramente mecânico.\nII. O termo "quando", em "Quando bem orientada na escola", introduz oração subordinada adverbial temporal.\nIII. O vocábulo "transforma-se" pode, sem prejuízo do sentido original e da norma-padrão, ser substituído por "se transforma".\n\nAssinale a alternativa que apresenta a(s) afirmativa(s) CORRETA(S).',
    alternativas: [
      { letter: 'A', text: 'Apenas I.' },
      { letter: 'B', text: 'Apenas I e II.' },
      { letter: 'C', text: 'Apenas II e III.' },
      { letter: 'D', text: 'I, II e III.' },
    ],
    gabarito: 'D',
    comentario:
      '**Gabarito: D.** Todas as afirmativas estão corretas.\n\n• **I — correta:** "mais do que" é construção comparativa de superioridade; opõe a leitura a um "simples ato mecânico" para destacá-la.\n• **II — correta:** "Quando" introduz oração adverbial; aqui, com valor temporal/condicional (a temporalidade é a leitura adequada para o contexto, classificação consagrada pela gramática tradicional).\n• **III — correta:** próclise e ênclise são ambas admitidas em orações iniciadas por advérbio/conjunção que não exija obrigatoriamente próclise; na ausência de fator atrativo categórico, "transforma-se" e "se transforma" coexistem como variantes da norma-padrão.\n\nA banca trabalha questões de análise por afirmativas e exige leitura atenta — o erro típico seria descartar a III por desconhecimento das regras de colocação pronominal.',
  },
  {
    id: 'al-rl-01',
    area: 'Raciocínio Lógico',
    cargo: 'Cargos de Nível Médio e Superior',
    nivel: 'Médio',
    enunciado:
      'Em uma repartição pública, são feitas as seguintes afirmações sobre os servidores Ana, Bruno e Carla:\n\n• Se Ana foi promovida, então Bruno também foi promovido.\n• Carla não foi promovida ou Bruno foi promovido.\n• Ana foi promovida.\n\nConsiderando que todas as afirmações são verdadeiras, assinale a alternativa INCORRETA.',
    alternativas: [
      { letter: 'A', text: 'Bruno foi promovido.' },
      { letter: 'B', text: 'Se Carla foi promovida, então Bruno foi promovido.' },
      { letter: 'C', text: 'É possível concluir que Carla foi promovida.' },
      { letter: 'D', text: 'A negação de "Bruno foi promovido" implicaria a falsidade da primeira afirmação.' },
    ],
    gabarito: 'C',
    comentario:
      '**Gabarito: C** (a alternativa INCORRETA).\n\nDas premissas: Ana foi promovida (P3) e "Ana → Bruno" (P1) → por *modus ponens*, **Bruno foi promovido**. A premissa P2 ("¬Carla ∨ Bruno") já é satisfeita por Bruno ser verdadeiro — portanto, nada se pode afirmar sobre Carla.\n\n• **A — correta:** *modus ponens* aplicado a P1 e P3.\n• **B — correta:** trivialmente verdadeira porque o consequente "Bruno foi promovido" é verdadeiro, tornando a condicional verdadeira independentemente do antecedente.\n• **C — INCORRETA:** as premissas não permitem concluir nem afirmar nem negar a promoção de Carla. É o erro típico de tratar disjunção como bicondicional.\n• **D — correta:** se ¬Bruno fosse verdadeiro, P1 (Ana → Bruno) seria F → V → F, contradizendo a premissa.',
  },
  {
    id: 'al-cg-01',
    area: 'Conhecimentos Gerais e Atualidades',
    cargo: 'Cargos Gerais',
    nivel: 'Médio',
    enunciado:
      'O estado de Minas Gerais possui forte tradição na produção cafeeira e na pecuária leiteira, com microrregiões reconhecidas nacionalmente por suas características produtivas. A respeito da geografia e da economia mineira, assinale a alternativa INCORRETA.',
    alternativas: [
      { letter: 'A', text: 'A região do Sul de Minas concentra parte expressiva da produção nacional de café arábica, em razão das condições de altitude, clima e solo.' },
      { letter: 'B', text: 'A microrregião conhecida como Serra da Mantiqueira abrange municípios produtores de café de alta qualidade, com denominações de origem reconhecidas.' },
      { letter: 'C', text: 'A pecuária leiteira tem presença marcante no estado, com Minas Gerais figurando, há anos, entre os principais produtores de leite do país.' },
      { letter: 'D', text: 'O estado de Minas Gerais faz divisa exclusivamente com estados da região Sudeste, não possuindo fronteira com unidades federativas de outras regiões.' },
    ],
    gabarito: 'D',
    comentario:
      '**Gabarito: D** (a alternativa INCORRETA).\n\n• **A — correta:** o Sul de Minas é polo cafeeiro consolidado, com microclimas e altitude favoráveis ao café arábica.\n• **B — correta:** a Serra da Mantiqueira de Minas é uma das regiões com Indicação Geográfica para café de alta qualidade.\n• **C — correta:** Minas é historicamente o maior produtor nacional de leite.\n• **D — INCORRETA:** Minas Gerais faz divisa com **estados de outras regiões** — Bahia (Nordeste) e Goiás/Distrito Federal (Centro-Oeste), além de São Paulo, Rio de Janeiro e Espírito Santo (Sudeste). Erro típico de banca: misturar "todas as divisas" com "região Sudeste".',
  },
];

const BY_CONCURSO: Record<string, LandingQuestion[]> = {
  baependi: BAEPENDI_QUESTIONS,
  alagoa: ALAGOA_QUESTIONS,
};

export const getLandingQuestions = (concursoSlug?: string): LandingQuestion[] => {
  if (!concursoSlug) return BAEPENDI_QUESTIONS;
  return BY_CONCURSO[concursoSlug] ?? BAEPENDI_QUESTIONS;
};

// Compat: imports antigos continuam funcionando (Baependi como default).
export const LANDING_QUESTIONS: LandingQuestion[] = BAEPENDI_QUESTIONS;
