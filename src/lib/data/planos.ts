export type Plano = {
  id: string;
  nome: string;
  preco: string;
  periodo: string;
  descricao: string;
  itens: string[];
  destaque?: "popular" | "completo";
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
  },

  {
    id: "essencial",
    nome: "Essencial",
    preco: "R$ 800",
    periodo: "por mês",
    descricao:
      'O empurrão que faltava pra sua empresa sair do "vou fazer" e começar a aparecer online de verdade.',
    itens: ["Landing page profissional inclusa", "10 posts estratégicos todo mês"],
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
      "Landing page inclusa",
      "Gestão completa das redes sociais",
      "Google Meu Negócio sempre atualizado",
      "Tráfego pago gerenciado",
      "Bot de conversa configurado e ajustado",
    ],
    destaque: "completo",
  },
];