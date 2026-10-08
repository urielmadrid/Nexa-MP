export type Servico = {
  id: string;
  titulo: string;
  resumo: string;
  descricao: string;
};

export const SERVICOS: Servico[] = [
  {
    id: "design-estrategico",
    titulo: "Design Estratégico",
    resumo: "Identidade visual que transmite valor e profissionalismo.",
    descricao:
      "Criação de identidade visual, materiais e comunicação visual alinhados ao posicionamento da sua marca.",
  },
  {
    id: "redes-sociais",
    titulo: "Redes Sociais & Conteúdo",
    resumo: "Presença digital com propósito, não só posts soltos.",
    descricao:
      "Organização e gestão das redes sociais, criação de posts e conteúdos que mantêm uma comunicação profissional e consistente.",
  },
  {
    id: "trafego-pago",
    titulo: "Tráfego Pago",
    resumo: "Estratégias para alcançar o público certo e gerar oportunidades.",
    descricao:
      "Campanhas de anúncios pensadas para colocar sua empresa na frente de quem realmente pode se tornar cliente.",
  },
  {
    id: "web-landing-pages",
    titulo: "Desenvolvimento Web & Landing Pages",
    resumo: "Sites que apresentam sua empresa e convertem visitantes.",
    descricao:
      "Sites institucionais e landing pages desenvolvidos com foco em clareza, credibilidade e conversão.",
  },
  {
    id: "bots-conversacao",
    titulo: "Bots de Conversação",
    resumo: "Automação para agilizar o atendimento e otimizar processos.",
    descricao:
      "Configuração de bots de conversa que agilizam o primeiro contato e organizam o atendimento da sua empresa.",
  },
];