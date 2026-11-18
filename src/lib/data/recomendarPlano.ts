import { PLANOS, type Plano } from "@/src/lib/data/planos";

type Sinal = { planoId: string; peso: number; palavras: string[] };

const SINAIS: Sinal[] = [
  {
    planoId: "landing-avulsa",
    peso: 3,
    palavras: [
      "orcamento apertado",
      "sem mensalidade",
      "pagamento unico",
      "nao posso pagar todo mes",
      "so preciso de um site",
      "so quero um site",
      "testar antes",
      "nao tenho nada online",
      "nao tenho site nenhum",
      "estou comecando agora",
      "site simples",
      "sem compromisso",
    ],
  },
  {
    planoId: "essencial",
    peso: 2,
    palavras: [
      "postar mais",
      "rede social parada",
      "poucos posts",
      "presenca basica",
      "quero postar com frequencia",
      "manter as redes ativas",
    ],
  },
  {
    planoId: "presenca-completa",
    peso: 2,
    palavras: [
      "aparecer no google",
      "ninguem me encontra",
      "google meu negocio",
      "loja fisica",
      "presenca local",
      "mais conteudo",
      "reels",
      "mais alcance",
      "ser encontrado",
    ],
  },
  {
    planoId: "crescimento-continuo",
    peso: 3,
    palavras: [
      "trafego pago",
      "anuncio",
      "anuncios",
      "gerar leads",
      "geracao de leads",
      "atendimento automatico",
      "bot",
      "automatizar",
      "escalar",
      "aumentar vendas",
      "equipe cuidando",
      "toda semana",
      "constante",
      "recorrente",
      "quero investir",
      "tenho orcamento para investir",
    ],
  },
];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const JUSTIFICATIVAS: Record<string, string> = {
  "landing-avulsa":
    "Pelo que você descreveu, o foco agora é ter uma base profissional sem compromisso mensal.",
  essencial:
    "Você já quer manter uma presença ativa nas redes com constância — esse plano cobre isso sem pesar no investimento.",
  "presenca-completa":
    "Isso combina com quem quer ser encontrado com mais facilidade, principalmente no Google.",
  "crescimento-continuo":
    "Pelo que você contou, faz sentido ter alguém cuidando disso toda semana, com tráfego pago incluso.",
};

export function recomendarPlanoLocal(mensagem: string): {
  plano: Plano;
  justificativa: string;
} {
  const texto = normalizar(mensagem || "");
  const pontuacao: Record<string, number> = {};
  for (const p of PLANOS) pontuacao[p.id] = 0;

  for (const sinal of SINAIS) {
    for (const palavra of sinal.palavras) {
      if (texto.includes(palavra)) {
        pontuacao[sinal.planoId] += sinal.peso;
      }
    }
  }

  const [melhorId, melhorPontos] = Object.entries(pontuacao).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const semSinalClaro = melhorPontos === 0;
  const idEscolhido = semSinalClaro ? "presenca-completa" : melhorId;
  const plano = PLANOS.find((p) => p.id === idEscolhido)!;

  return {
    plano,
    justificativa: semSinalClaro
      ? "Não captei detalhes suficientes pra recomendar com mais precisão, então esse costuma ser o ponto de equilíbrio — mas dá uma olhada nos outros também."
      : JUSTIFICATIVAS[plano.id],
  };
}