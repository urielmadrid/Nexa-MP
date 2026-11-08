export type Plano = {
  id: string;
  nome: string;
  preco: string;
  periodo: string;
  descricao: string;
  itens: string[];
  destaque?: "popular" | "completo";
  /** Condições que valem para o plano (prazos, início do serviço, pagamento). */
  notas?: string[];
};

export const PLANOS: Plano[] = [
  {
    id: "landing-avulsa",
    nome: "Landing Page Avulsa",
    preco: "R$ 500",
    periodo: "pagamento único",
    descricao:
      "Só a landing page, sem mensalidade — ideal pra validar antes de assumir um compromisso maior.",
    itens: ["Landing page profissional"],
    notas: [
      "O primeiro modelo da landing page é entregue em 1 semana, para você ver e pedir mudanças.",
      "O pagamento só acontece depois que você aceita o produto final.",
    ],
  },

  {
    id: "essencial",
    nome: "Essencial",
    preco: "R$ 800",
    periodo: "por mês",
    descricao:
      'O empurrão que faltava pra sua empresa sair do "vou fazer" e começar a aparecer online de verdade.',
    itens: ["Landing page profissional inclusa", "10 posts estratégicos todo mês"],
    notas: [
      "O primeiro modelo da landing page é entregue em 1 semana, para você ver e pedir mudanças.",
      "O serviço de postagens começa logo após o aceite do contrato e o primeiro pagamento.",
    ],
  },

  {
    id: "presenca-completa",
    nome: "Presença Completa",
    preco: "R$ 1.500",
    periodo: "por mês",
    descricao:
      "Mais conteúdo, mais alcance e um perfil completo no Google — pra quem quer ser encontrado, não só existir.",
    itens: [
      "Landing page profissional inclusa",
      "15 posts estratégicos todo mês",
      "5 reels todo mês",
      "Google Meu Negócio: análise, configuração e atualização",
    ],
    notas: [
      "O primeiro modelo da landing page é entregue em 1 semana, para você ver e pedir mudanças.",
      "O serviço de postagens começa logo após o aceite do contrato e o primeiro pagamento.",
    ],
    destaque: "popular",
  },

  {
    id: "crescimento-continuo",
    nome: "Crescimento Contínuo",
    preco: "R$ 3.000",
    periodo: "por mês",
    descricao:
      "Uma equipe cuidando da sua presença digital toda semana, enquanto você foca 100% no seu negócio.",
    itens: [
      "Landing page profissional inclusa",
      "Gestão completa das redes sociais",
      "Google Meu Negócio sempre atualizado",
      "Tráfego pago gerenciado",
      "Bot de conversa configurado e ajustado",
    ],
    notas: [
      "O primeiro modelo da landing page é entregue em 1 semana, para você ver e pedir mudanças.",
      "O serviço de postagens começa logo após o aceite do contrato e o primeiro pagamento.",
    ],
    destaque: "completo",
  },
];

export type ValorRecurso = boolean | string;
export type Recurso = {
  rotulo: string;
  /** O que é esse item, em uma frase, para quem não conhece o termo. */
  explicacao: string;
  valores: Record<string, ValorRecurso>;
};

/**
 * Matriz de comparação. Só repete o que já está nos "itens" de cada plano:
 * "false" = não listado nesse plano. Se mudar os itens de um plano, atualize aqui também.
 */
export const RECURSOS: Recurso[] = [
  {
    rotulo: "Landing page profissional",
    explicacao:
      "Uma página profissional que apresenta a sua empresa com clareza e credibilidade e leva o visitante a entrar em contato.",
    valores: { "landing-avulsa": true, essencial: true, "presenca-completa": true, "crescimento-continuo": true },
  },
  {
    rotulo: "Posts e reels",
    explicacao:
      "Conteúdo planejado para as redes sociais da sua empresa, para manter uma comunicação profissional e consistente.",
    valores: {
      "landing-avulsa": false,
      essencial: "10 posts por mês",
      "presenca-completa": "15 posts + 5 reels por mês",
      "crescimento-continuo": "Gestão completa das redes sociais",
    },
  },
  {
    rotulo: "Google Meu Negócio",
    explicacao:
      "O perfil da sua empresa no Google. Analisamos, configuramos e mantemos atualizado, para que quem pesquisar por você encontre informações corretas.",
    valores: {
      "landing-avulsa": false,
      essencial: false,
      "presenca-completa": "Análise, configuração e atualização",
      "crescimento-continuo": "Sempre atualizado",
    },
  },
  {
    rotulo: "Tráfego pago",
    explicacao:
      "Campanhas de anúncios pensadas para colocar a sua empresa na frente de quem realmente pode se tornar cliente.",
    valores: { "landing-avulsa": false, essencial: false, "presenca-completa": false, "crescimento-continuo": "Gerenciado" },
  },
  {
    rotulo: "Bot de conversa",
    explicacao:
      "Um bot que agiliza o primeiro contato e organiza o atendimento da sua empresa.",
    valores: {
      "landing-avulsa": false,
      essencial: false,
      "presenca-completa": false,
      "crescimento-continuo": "Configurado e ajustado",
    },
  },
];

export function recursosAusentes(planoId: string): string[] {
  return RECURSOS.filter((r) => !r.valores[planoId]).map((r) => r.rotulo);
}

/** Respostas às dúvidas mais comuns antes de contratar (condições informadas pela Nexa MP). */
export type FaqPlano = {
  /** Identificador estável: a página de Termos busca os itens por ele, então a ordem pode mudar. */
  id: "taxas" | "prazo" | "pagamento-landing" | "postagens" | "formas-pagamento" | "atraso";
  pergunta: string;
  /** Um parágrafo por item. */
  resposta: string[];
  /** Caixa de exemplo opcional, mostrada entre a resposta e o complemento. */
  exemplo?: { titulo: string; linhas: string[] };
  /** Parágrafos depois do exemplo. */
  complemento?: string[];
};

export const FAQ_PLANOS: FaqPlano[] = [
  {
    id: "taxas",
    pergunta: "Existe alguma taxa escondida?",
    resposta: ["Não. Os valores são os que aparecem nos planos, e o dia do pagamento é combinado com você."],
  },
  {
    id: "prazo",
    pergunta: "Em quanto tempo recebo a landing page?",
    resposta: [
      "O primeiro modelo é entregue em 1 semana, para você ver e dizer o que quer mudar. Depois das mudanças que você pedir, é você quem decide se gostou do resultado final.",
    ],
  },
  {
    id: "pagamento-landing",
    pergunta: "Quando eu pago pela landing page?",
    resposta: [
      "Na Landing Page Avulsa, o pagamento só é feito depois que você aceita o produto final. Nos planos mensais, a landing page já está incluída no pacote, e essa regra de pagamento não se aplica a ela.",
    ],
  },
  {
    id: "postagens",
    pergunta: "Quando as postagens começam?",
    resposta: ["O serviço de postagens começa logo após o aceite do contrato e o primeiro pagamento."],
  },
  {
    id: "formas-pagamento",
    pergunta: "Quais são as formas de pagamento?",
    resposta: ["Pix, dinheiro, cartão ou boleto. O dia do pagamento é acertado com você."],
  },
  {
    id: "atraso",
    pergunta: "E se eu atrasar um pagamento?",
    resposta: [
      "O pagamento da mensalidade deverá ser realizado até a data de vencimento estabelecida em contrato.",
      "Caso o pagamento atrase 3 dias ou mais, será aplicada uma multa moratória de 2% sobre o valor da mensalidade em aberto, cobrada uma única vez.",
      "A partir do 10º dia de atraso, também passarão a incidir juros de mora de 2% ao mês, calculados proporcionalmente aos dias corridos de atraso, considerando o início da incidência a partir do 10º dia.",
    ],
    exemplo: {
      titulo: "Exemplo ilustrativo (considerando uma mensalidade de R$ 1.000,00):",
      linhas: [
        "Atraso de 3 dias: multa de 2% (R$ 20,00). Valor total: R$ 1.020,00.",
        "Atraso de 10 dias: multa de 2% (R$ 20,00), sem juros adicionais. Valor total: R$ 1.020,00.",
        "Atraso de 40 dias: multa de 2% (R$ 20,00) + juros de mora de 2% ao mês, proporcionais a 30 dias de incidência (R$ 20,00). Valor total: R$ 1.040,00.",
        "Atraso de 70 dias: multa de 2% (R$ 20,00) + juros de mora de 2% ao mês, proporcionais a 60 dias de incidência (R$ 40,00). Valor total: R$ 1.060,00.",
      ],
    },
    complemento: [
      "A multa será aplicada uma única vez por mensalidade em atraso, não sendo reaplicada a cada mês. Os juros de mora continuarão incidindo proporcionalmente ao período de atraso, até a efetiva quitação do débito.",
      "O não pagamento da mensalidade poderá resultar na suspensão temporária dos serviços contratados, mediante comunicação prévia à CONTRATANTE, sem prejuízo da cobrança dos valores pendentes e dos encargos previstos contratualmente.",
    ],
  },
];
