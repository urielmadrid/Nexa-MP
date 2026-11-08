import { PLANOS } from "@/src/lib/data/planos";
import { PROCESSO } from "@/src/lib/data/processo";
import { SERVICOS } from "@/src/lib/data/servicos";

const primeiroPlano = PLANOS[0];
const ultimoPlano = PLANOS[PLANOS.length - 1];

/**
 * "pratica" liga cada diferencial a algo que já existe no próprio site.
 * Os números e nomes vêm dos outros arquivos de dados, então acompanham mudanças de plano, serviço ou fase.
 */
export const DIFERENCIAIS = [
  {
    titulo: "Estratégia antes da execução",
    descricao:
      "Não começamos produzindo conteúdo ou anúncios. Primeiro entendemos o objetivo do negócio.",
    pratica: {
      texto: `Fase ${PROCESSO[0].numero} do método: ${PROCESSO[0].resumo}`,
      rotulo: `Ver a fase ${PROCESSO[0].numero}`,
      href: "#como-funciona",
    },
  },
  {
    titulo: "Soluções sob medida",
    descricao:
      "Nem toda empresa precisa das mesmas ferramentas — o plano é montado de acordo com o momento de cada negócio.",
    pratica: {
      texto: `${PLANOS.length} formatos de plano: da ${primeiroPlano.nome} (${primeiroPlano.preco}, ${primeiroPlano.periodo}) ao ${ultimoPlano.nome} (${ultimoPlano.preco} ${ultimoPlano.periodo}).`,
      rotulo: "Ver os planos",
      href: "#planos",
    },
  },
  {
    titulo: "Comunicação clara",
    descricao:
      "Você entende o que está sendo feito e por quê, sem termos técnicos desnecessários.",
    pratica: {
      texto: "Em cada fase do método, mostramos o que fazemos e qual é a sua parte no processo.",
      rotulo: "Ver as fases",
      href: "#como-funciona",
    },
  },
  {
    titulo: "Visão integrada",
    descricao:
      "Site, conteúdo, anúncios e presença digital são pensados para conversar entre si, não como serviços soltos.",
    pratica: {
      texto: `${SERVICOS.length} frentes de trabalho (design, redes sociais, tráfego pago, web e bots) planejadas como partes de um mesmo projeto.`,
      rotulo: "Ver as capacidades",
      href: "#servicos",
    },
  },
  {
    titulo: "Proximidade",
    descricao:
      "Facilidade para conversar e acompanhar o andamento do trabalho, sem burocracia.",
    pratica: {
      texto: "Conversar não gera cobrança: o atendimento inicial acontece pelo WhatsApp, pelo e-mail ou pelo Instagram @nexamp_.",
      rotulo: "Falar com a Nexa MP",
      href: "#contato",
    },
  },
];
