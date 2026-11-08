import { PLANOS } from "@/src/lib/data/planos";

/**
 * Dados e regras do assistente de mensagem do Contato.
 * A pessoa escolhe opções e preenche alguns dados; daqui sai o texto pronto para enviar à Nexa MP.
 * Nada é guardado nem enviado pelo site: a mensagem só sai quando a pessoa toca em "enviar" no WhatsApp ou no e-mail.
 */

export type Opcao = { id: string; rotulo: string; dica?: string; /** Como aparece dentro da mensagem (quando difere do rótulo). */ texto?: string };

/** O que a pessoa precisa (pode marcar mais de uma). */
export const NECESSIDADES: Opcao[] = [
  { id: "site", rotulo: "Site ou landing page", texto: "site ou landing page", dica: "Uma página profissional para apresentar a empresa" },
  { id: "redes", rotulo: "Redes sociais e conteúdo", texto: "redes sociais e conteúdo", dica: "Posts e comunicação com constância" },
  { id: "trafego", rotulo: "Anúncios (tráfego pago)", texto: "anúncios (tráfego pago)", dica: "Aparecer para quem pode virar cliente" },
  { id: "google", rotulo: "Google Meu Negócio", texto: "Google Meu Negócio", dica: "Ser encontrado nas buscas da sua região" },
  { id: "bot", rotulo: "Atendimento automático (chatbot)", texto: "atendimento automático (chatbot)", dica: "Responder dúvidas e organizar contatos" },
  { id: "identidade", rotulo: "Identidade visual", texto: "identidade visual", dica: "Logo, cores e materiais da marca" },
  { id: "indefinido", rotulo: "Ainda não sei, quero ajuda para decidir", texto: "ajuda para decidir o que faz sentido para o meu negócio", dica: "Sem problema: conversamos e entendemos juntos" },
];

/** Momento do negócio (escolha única). O texto vai na primeira pessoa, pois entra na mensagem. */
export const MOMENTOS: (Opcao & { texto: string })[] = [
  {
    id: "comecando",
    rotulo: "Estou começando",
    dica: "Ainda estou montando a presença digital",
    texto: "estou começando a montar a presença digital do negócio",
  },
  {
    id: "irregular",
    rotulo: "Já tenho presença, mas sem constância",
    dica: "Existo online, mas sem um plano claro",
    texto: "já tenho alguma presença digital, mas sem constância ou estratégia",
  },
  {
    id: "crescer",
    rotulo: "Quero crescer o que já funciona",
    dica: "Já invisto ou já tenho resultado e quero ir além",
    texto: "já tenho presença digital e quero crescer com mais estratégia",
  },
  {
    id: "conhecer",
    rotulo: "Só quero conhecer o trabalho",
    dica: "Quero entender como funciona, sem compromisso",
    texto: "quero conhecer o trabalho da Nexa MP, sem compromisso",
  },
];

export const PLANO_INDICACAO = "indicacao";

/** Plano de interesse: os planos reais do site + "quero uma indicação". */
export const OPCOES_PLANO: Opcao[] = [
  { id: PLANO_INDICACAO, rotulo: "Quero uma indicação", dica: "A Nexa MP me ajuda a escolher" },
  ...PLANOS.map((p) => ({ id: p.id, rotulo: p.nome, dica: `${p.preco}, ${p.periodo}` })),
];

/** Como a pessoa prefere ser respondida. */
export const RETORNOS: Opcao[] = [
  { id: "whatsapp", rotulo: "WhatsApp", texto: "WhatsApp" },
  { id: "email", rotulo: "E-mail", texto: "e-mail" },
  { id: "instagram", rotulo: "Instagram", texto: "Instagram" },
  { id: "qualquer", rotulo: "Tanto faz", texto: "qualquer canal" },
];

export type RespostasContato = {
  necessidades: string[];
  momento: string;
  plano: string;
  nome: string;
  empresa: string;
  ramo: string;
  retorno: string;
  contato: string;
  detalhes: string;
  /** A pessoa marcou "li e aceito" (Política de Privacidade e Termos de Uso). */
  aceite: boolean;
};

export const RESPOSTAS_VAZIAS: RespostasContato = {
  necessidades: [],
  momento: "",
  plano: PLANO_INDICACAO,
  nome: "",
  empresa: "",
  ramo: "",
  retorno: "qualquer",
  contato: "",
  detalhes: "",
  aceite: false,
};

/** Junta itens em português: "a", "a e b", "a, b e c". Se algum item já tiver " e ", separa todos por ponto e vírgula para não confundir. */
function listar(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  if (itens.some((i) => i.includes(" e "))) return itens.join("; ");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/** Texto da opção para dentro da mensagem (usa `texto` quando existe, senão o rótulo). */
function textoDe(opcoes: Opcao[], id: string): string {
  const o = opcoes.find((x) => x.id === id);
  return o ? (o.texto ?? o.rotulo) : "";
}

/** Texto do plano escolhido, com preço e período vindos de planos.ts. */
export function descreverPlano(id: string): string {
  if (id === PLANO_INDICACAO) return "ainda não escolhi, gostaria de uma indicação";
  const plano = PLANOS.find((p) => p.id === id);
  return plano ? `${plano.nome} (${plano.preco}, ${plano.periodo})` : "ainda não escolhi, gostaria de uma indicação";
}

/** Monta a mensagem final. Campos vazios não aparecem. */
export function montarMensagem(r: RespostasContato): string {
  const necessidades = r.necessidades.map((id) => textoDe(NECESSIDADES, id)).filter(Boolean);
  const momento = MOMENTOS.find((m) => m.id === r.momento)?.texto ?? "";
  const retorno = textoDe(RETORNOS, r.retorno);

  const campos: [string, string][] = [
    ["Nome", r.nome.trim()],
    ["Empresa", r.empresa.trim()],
    ["Ramo de atuação", r.ramo.trim()],
    ["Preciso de", listar(necessidades)],
    ["Momento", momento],
    ["Plano de interesse", descreverPlano(r.plano)],
    ["Prefiro retorno por", retorno],
    ["Meu contato", r.contato.trim()],
    ["Detalhes", r.detalhes.trim()],
    ["Aceite", r.aceite ? "li e aceito a Política de Privacidade e os Termos de Uso" : ""],
  ];

  return [
    "Olá, Nexa MP! Vim pelo site e gostaria de conversar.",
    "",
    ...campos.filter(([, valor]) => valor !== "").map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    "",
    "Desde já, agradeço o retorno.",
  ].join("\n");
}

/** Assunto do e-mail: usa o nome da empresa, ou o da pessoa, quando houver. */
export function assuntoDaMensagem(r: RespostasContato): string {
  const quem = r.empresa.trim() || r.nome.trim();
  return quem ? `Contato pelo site da Nexa MP: ${quem}` : "Contato pelo site da Nexa MP";
}

/** Procura um e-mail dentro do texto (usado para o "responder para" do e-mail enviado pelo site). */
export function extrairEmail(texto: string): string {
  const achado = texto.match(/[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+/);
  return achado ? achado[0] : "";
}

/** Rótulo e dica do campo "contato" conforme o canal de retorno escolhido. */
export function campoContato(retorno: string): { rotulo: string; dica: string } {
  if (retorno === "whatsapp") return { rotulo: "Seu WhatsApp (com DDD)", dica: "Ex.: (53) 99999-9999" };
  if (retorno === "email") return { rotulo: "Seu e-mail", dica: "seu@email.com" };
  if (retorno === "instagram") return { rotulo: "Seu @ do Instagram", dica: "@seuinstagram" };
  return { rotulo: "Seu e-mail ou telefone", dica: "Como a Nexa MP pode te responder" };
}

/** Confere se o contato informado serve para o canal escolhido. Devolve o aviso, ou "" se estiver bom. */
export function problemaNoContato(retorno: string, contato: string): string {
  const c = contato.trim();
  if (!c) return "Informe um contato para a Nexa MP conseguir te responder.";
  if (retorno === "email" && !extrairEmail(c)) return "Informe um e-mail válido, por exemplo seu@email.com.";
  if (retorno === "whatsapp" && c.replace(/\D/g, "").length < 10) return "Informe o WhatsApp com DDD, por exemplo (53) 99999-9999.";
  if (retorno === "instagram" && c.replace("@", "").length < 2) return "Informe o seu @ do Instagram.";
  if (retorno === "qualquer" && !extrairEmail(c) && c.replace(/\D/g, "").length < 10 && !c.startsWith("@")) {
    return "Informe um e-mail, um telefone com DDD ou um @ do Instagram.";
  }
  return "";
}
