import { PLANOS, PLANOS_TRAFEGO, lerValorTrafego } from "@/src/lib/data/planos";
import { PERGUNTAS_DIAGNOSTICO } from "@/src/lib/formulario/diagnostico";
import type { LeadCrm } from "@/src/lib/crm/tipos";

/**
 * "Cérebro" do CRM: lê as respostas do diagnóstico e sugere o que o cliente mais precisa agora.
 * É um conjunto de REGRAS simples e explicáveis (nada de adivinhação escondida): cada conclusão traz os motivos.
 * Os planos e valores vêm de src/lib/data/planos.ts (os mesmos do site). É uma sugestão para a equipe, não uma decisão.
 */

export type ServicoId = "trafego_pago" | "redes_sociais" | "google_meu_negocio" | "site" | "presenca_completa" | "indefinido";
export type ModeloId = "faz_tudo" | "direcao" | "vendas" | "visibilidade";
export type Temperatura = "quente" | "morno" | "frio";

export const ROTULO_SERVICO: Record<ServicoId, string> = {
  trafego_pago: "Tráfego pago",
  redes_sociais: "Redes sociais",
  google_meu_negocio: "Google Meu Negócio",
  site: "Site / landing page",
  presenca_completa: "Presença digital completa",
  indefinido: "A definir na conversa",
};

export const ROTULO_MODELO: Record<ModeloId, string> = {
  faz_tudo: "cuida de tudo sozinho",
  direcao: "precisa de direção",
  vendas: "quer vender mais",
  visibilidade: "quer ser encontrado",
};

/** Faixas de investimento mensal do formulário (códigos de investimento_mensal). max null = sem teto. */
export const ORCAMENTOS: Record<string, { min: number; max: number | null; curto: string }> = {
  ate_500: { min: 0, max: 500, curto: "Até R$ 500" },
  de_500_a_1500: { min: 500, max: 1500, curto: "R$ 500 a R$ 1.500" },
  de_1500_a_3000: { min: 1500, max: 3000, curto: "R$ 1.500 a R$ 3.000" },
  acima_3000: { min: 3000, max: null, curto: "Acima de R$ 3.000" },
};

export type PlanoSugerido = { id: string; nome: string; valor: number; recorrente: boolean };

export type Recomendacao = {
  /** Etiqueta única para bater o olho. Ex.: "R$ 1.500 a R$ 3.000 · Tráfego pago · cuida de tudo sozinho" */
  tag: string;
  servico: ServicoId;
  servicoRotulo: string;
  /** Outras necessidades fortes além da principal. */
  tambemPrecisa: ServicoId[];
  modelo: ModeloId | null;
  orcamentoCodigo: string | null;
  orcamentoRotulo: string;
  plano: PlanoSugerido | null;
  /** Por que o sistema chegou nisso, uma frase por regra usada. */
  motivos: string[];
  /** Pontos de atenção para quem vai atender. */
  alertas: string[];
  temperatura: Temperatura;
  pontos: number;
  /** Por que a temperatura é essa. */
  motivosTemperatura: string[];
  proximoPasso: string;
};

type Valores = Map<string, { codigos: string[]; texto: string | null }>;

function valoresDoLead(lead: LeadCrm): Valores {
  const mapa: Valores = new Map();
  for (const r of lead.respostas) mapa.set(r.perguntaCodigo, { codigos: r.opcaoCodigos, texto: r.texto });
  return mapa;
}

function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function rotuloDaOpcao(perguntaCodigo: string, codigo: string): string {
  const pergunta = PERGUNTAS_DIAGNOSTICO.find((p) => p.codigo === perguntaCodigo);
  return pergunta?.opcoes?.find((o) => o.codigo === codigo)?.rotulo ?? codigo;
}

function formatarReais(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

/** Planos do site, com valor numérico e o que cada um cobre (só o que está nos "itens" dos planos). */
function catalogo(): Array<PlanoSugerido & { cobre: ServicoId[] }> {
  const cobertura: Record<string, ServicoId[]> = {
    "landing-avulsa": ["site"],
    essencial: ["site", "redes_sociais"],
    "presenca-completa": ["site", "redes_sociais", "google_meu_negocio"],
    "crescimento-continuo": ["site", "redes_sociais", "google_meu_negocio", "trafego_pago"],
  };
  const lista: Array<PlanoSugerido & { cobre: ServicoId[] }> = [];
  for (const plano of PLANOS) {
    const cobre = cobertura[plano.id];
    if (!cobre) continue;
    lista.push({ id: plano.id, nome: plano.nome, valor: lerValorTrafego(plano.preco), recorrente: plano.id !== "landing-avulsa", cobre });
  }
  for (const t of PLANOS_TRAFEGO) lista.push({ id: t.id, nome: t.nome, valor: t.valor, recorrente: true, cobre: ["trafego_pago"] });
  return lista.filter((p) => p.valor > 0);
}

const PRIORIDADE: ServicoId[] = ["trafego_pago", "redes_sociais", "google_meu_negocio", "site"];

function diasDesde(iso: string, agora: Date): number {
  return Math.floor((agora.getTime() - new Date(iso).getTime()) / 86_400_000);
}

export function recomendar(lead: LeadCrm, agora: Date = new Date()): Recomendacao {
  const v = valoresDoLead(lead);
  const um = (codigo: string): string | null => v.get(codigo)?.codigos[0] ?? null;
  const muitos = (codigo: string): string[] => v.get(codigo)?.codigos ?? [];
  const textos = semAcento([v.get("objetivo_6_meses")?.texto, v.get("maior_trava")?.texto, v.get("dificuldade_principal")?.texto, v.get("setor")?.texto].filter(Boolean).join(" . "));

  const motivos: string[] = [];
  const alertas: string[] = [];
  const pontos: Record<string, number> = { trafego_pago: 0, redes_sociais: 0, google_meu_negocio: 0, site: 0 };
  const soma = (id: string, valor: number) => {
    pontos[id] = (pontos[id] ?? 0) + valor;
  };

  // 1) dificuldade principal
  const dificuldade = um("dificuldade_principal");
  if (dificuldade === "sem_tempo_conteudo") {
    soma("redes_sociais", 3);
    motivos.push("Disse que não tem tempo para produzir conteúdo.");
  } else if (dificuldade === "nao_sei_o_que_postar") {
    soma("redes_sociais", 3);
    motivos.push("Não sabe o que postar: precisa de linha editorial.");
  } else if (dificuldade === "sem_vendas_nas_redes") {
    soma("trafego_pago", 3);
    soma("redes_sociais", 1);
    motivos.push("Não consegue gerar vendas pelas redes.");
  } else if (dificuldade === "pouco_encontrado_no_google") {
    soma("google_meu_negocio", 3);
    soma("site", 1);
    motivos.push("Quase ninguém o encontra no Google.");
  } else if (dificuldade === "nao_sei_medir") {
    soma("trafego_pago", um("ja_fez_trafego_pago") === "sim" ? 2 : 1);
    motivos.push("Não sabe medir resultados.");
  }

  // 2) o que já tem
  const presenca = muitos("presenca_atual");
  if (presenca.length > 0) {
    if (!presenca.includes("site") && !presenca.includes("nenhum")) {
      soma("site", 2);
      motivos.push("Ainda não tem site.");
    }
    if (!presenca.includes("google_meu_negocio") && !presenca.includes("nenhum")) {
      soma("google_meu_negocio", 1.5);
      motivos.push("Não tem Google Meu Negócio.");
    }
    if (!presenca.includes("instagram") && !presenca.includes("nenhum")) {
      soma("redes_sociais", 1.5);
      motivos.push("Não tem Instagram.");
    }
    if (presenca.includes("nenhum")) {
      soma("site", 2.5);
      soma("google_meu_negocio", 1.5);
      soma("redes_sociais", 1.5);
      motivos.push("Não tem nenhuma presença digital hoje.");
    }
  }

  // 3) tráfego pago
  const jaFez = um("ja_fez_trafego_pago");
  if (jaFez === "sim") {
    soma("trafego_pago", 1);
    motivos.push("Já fez tráfego pago: conhece o formato.");
  }

  // 4) orçamento
  const orcamentoCodigo = um("investimento_mensal");
  const orcamento = orcamentoCodigo ? (ORCAMENTOS[orcamentoCodigo] ?? null) : null;
  if (orcamento && orcamento.min >= 500) soma("trafego_pago", 1);

  // 5) palavras-chave nos textos livres
  const palavras: Array<[RegExp, string, string]> = [
    [/vend|cliente|pedido|lead|orcamento/, "trafego_pago", "vendas e clientes"],
    [/anuncio|trafego|impulsion/, "trafego_pago", "anúncios"],
    [/google|encontr|aparec|busca|maps/, "google_meu_negocio", "ser encontrado no Google"],
    [/instagram|post|conteudo|reels|rede social|redes sociais/, "redes_sociais", "conteúdo e redes"],
    [/site|pagina|landing|loja virtual/, "site", "site"],
  ];
  for (const [regra, id, rotulo] of palavras) {
    if (regra.test(textos)) {
      soma(id, 1);
      motivos.push(`Falou de ${rotulo} nas respostas escritas.`);
    }
  }

  // Serviço principal e necessidades fortes
  const ordenados = PRIORIDADE.map((id) => ({ id, p: pontos[id] ?? 0 })).sort((a, b) => b.p - a.p || PRIORIDADE.indexOf(a.id) - PRIORIDADE.indexOf(b.id));
  let servico: ServicoId = ordenados[0].p > 0 ? ordenados[0].id : "indefinido";
  const tambemPrecisa = ordenados.slice(1).filter((x) => x.p >= 2).map((x) => x.id);

  const nenhuma = presenca.includes("nenhum");
  if (nenhuma && orcamento && (orcamento.max === null || orcamento.max >= 3000)) {
    servico = "presenca_completa";
    motivos.push("Começa do zero e o orçamento comporta o pacote completo.");
  }

  // Modelo de atendimento ("cuida de tudo sozinho", "precisa de direção"...)
  let modelo: ModeloId | null = null;
  const querDelegar = /sem tempo|nao tenho tempo|falta de tempo|cuidar de tudo|delegar|terceirizar|nao entendo|tudo pra mim|tudo para mim/.test(textos);
  if (dificuldade === "sem_tempo_conteudo" || querDelegar) {
    modelo = "faz_tudo";
    if (querDelegar && dificuldade !== "sem_tempo_conteudo") motivos.push("Escreveu que quer delegar ou não tem tempo.");
  } else if (dificuldade === "nao_sei_o_que_postar" || dificuldade === "nao_sei_medir") modelo = "direcao";
  else if (dificuldade === "sem_vendas_nas_redes") modelo = "vendas";
  else if (dificuldade === "pouco_encontrado_no_google") modelo = "visibilidade";

  // Plano sugerido: o mais barato que cobre as necessidades fortes e cabe no orçamento
  const planos = catalogo();
  const necessidades: ServicoId[] = servico === "presenca_completa" ? ["trafego_pago", "google_meu_negocio", "redes_sociais"] : servico === "indefinido" ? [] : [servico, ...tambemPrecisa];
  let plano: PlanoSugerido | null = null;
  if (necessidades.length > 0) {
    let candidatos = planos.filter((p) => necessidades.every((n) => p.cobre.includes(n)));
    if (candidatos.length === 0 && servico !== "presenca_completa") candidatos = planos.filter((p) => p.cobre.includes(servico));
    candidatos.sort((a, b) => a.valor - b.valor);
    const teto = orcamento ? orcamento.max : undefined;
    const dentro = teto === undefined || teto === null ? candidatos : candidatos.filter((p) => p.valor <= teto);
    const escolhido = dentro[0] ?? candidatos[0];
    if (escolhido) {
      plano = { id: escolhido.id, nome: escolhido.nome, valor: escolhido.valor, recorrente: escolhido.recorrente };
      if (orcamento && orcamento.max !== null && escolhido.valor > orcamento.max) {
        alertas.push(`Orçamento informado (${orcamento.curto}) é menor que o ${escolhido.nome} (${formatarReais(escolhido.valor)}). Conversar sobre prioridades.`);
      }
      if (!orcamento) alertas.push("Orçamento ainda não definido: confirmar na primeira conversa.");
      if (escolhido.id.startsWith("trafego-") && orcamento && (orcamento.max === null || orcamento.max > escolhido.valor)) {
        alertas.push(`Orçamento informado (${orcamento.curto}) é maior que o plano de tráfego de ${formatarReais(escolhido.valor)}: o valor maior é combinado por mensagem.`);
      }
    }
  }
  if (lead.respostas.length === 0) alertas.push("Sem respostas do diagnóstico: a sugestão é limitada. Descubra na conversa o que a pessoa precisa.");
  if (um("decisor") === "nao") alertas.push("Não é quem decide: envolver o decisor na conversa.");
  if (um("decisor") === "participo") alertas.push("Não decide sozinho: pergunte quem mais participa da decisão.");
  if (!lead.whatsappE164 && !lead.email) alertas.push("Sem WhatsApp nem e-mail cadastrados.");

  // Temperatura (prioridade de atendimento)
  const motivosTemperatura: string[] = [];
  let p = 0;
  const marca = (valor: number, texto: string) => {
    p += valor;
    motivosTemperatura.push(`${valor > 0 ? "+" : ""}${valor} ${texto}`);
  };
  const decisor = um("decisor");
  if (decisor === "sim") marca(3, "é quem decide");
  else if (decisor === "participo") marca(1, "participa da decisão");
  if (orcamentoCodigo === "acima_3000") marca(4, "orçamento acima de R$ 3.000");
  else if (orcamentoCodigo === "de_1500_a_3000") marca(3, "orçamento de R$ 1.500 a R$ 3.000");
  else if (orcamentoCodigo === "de_500_a_1500") marca(2, "orçamento de R$ 500 a R$ 1.500");
  else if (orcamentoCodigo === "ate_500") marca(1, "orçamento até R$ 500");
  if (lead.whatsappE164) marca(1, "informou WhatsApp");
  if (v.get("objetivo_6_meses")?.texto) marca(1, "descreveu o objetivo");
  if (v.get("maior_trava")?.texto) marca(1, "descreveu o que trava");
  if (jaFez === "sim") marca(1, "já fez tráfego pago");
  const dias = diasDesde(lead.criadoEm, agora);
  if (lead.status === "novo" || lead.status === "em_contato") {
    if (dias <= 2) marca(2, "chegou há até 2 dias");
    else if (dias <= 7) marca(1, "chegou há até 7 dias");
    else if (dias > 30) marca(-1, "chegou há mais de 30 dias");
  }
  const temperatura: Temperatura = p >= 9 ? "quente" : p >= 5 ? "morno" : "frio";

  const orcamentoRotulo = orcamento ? orcamento.curto : "Orçamento a definir";
  const servicoRotulo = ROTULO_SERVICO[servico];
  const tag = [orcamentoRotulo, servicoRotulo, modelo ? ROTULO_MODELO[modelo] : null].filter(Boolean).join(" · ");

  let proximoPasso: string;
  if (lead.status === "ganho") proximoPasso = "Cliente ganho: combinar o início do serviço.";
  else if (lead.status === "perdido") proximoPasso = "Lead perdido: registrar o motivo e, se fizer sentido, retomar em alguns meses.";
  else if (lead.status === "proposta") proximoPasso = "Acompanhar a proposta e tirar dúvidas pendentes.";
  else if (lead.status === "qualificado") proximoPasso = "Enviar a proposta com o plano sugerido.";
  else {
    const canal = lead.canalPreferido === "email" ? "por e-mail" : lead.canalPreferido === "ambos" ? "pelo WhatsApp ou e-mail" : "pelo WhatsApp";
    proximoPasso =
      temperatura === "quente"
        ? `Chamar hoje ${canal} e apresentar ${plano ? plano.nome : "uma proposta"}.`
        : temperatura === "morno"
          ? `Responder ${canal} esta semana e confirmar o que ela mais precisa.`
          : `Responder ${canal} e entender melhor o momento antes de propor algo.`;
  }

  return {
    tag,
    servico,
    servicoRotulo,
    tambemPrecisa,
    modelo,
    orcamentoCodigo: orcamentoCodigo && orcamento ? orcamentoCodigo : null,
    orcamentoRotulo,
    plano,
    motivos: Array.from(new Set(motivos)),
    alertas,
    temperatura,
    pontos: p,
    motivosTemperatura,
    proximoPasso,
  };
}

/** Texto de uma resposta do diagnóstico para mostrar à equipe ("Varejo", "Instagram, Site"...). */
export function respostaLegivel(lead: LeadCrm, perguntaCodigo: string): string | null {
  const r = lead.respostas.find((x) => x.perguntaCodigo === perguntaCodigo);
  if (!r) return null;
  const rotulos = r.opcaoCodigos.map((c) => rotuloDaOpcao(perguntaCodigo, c));
  if (rotulos.length === 0) return r.texto;
  return r.texto ? `${rotulos.join(", ")} — ${r.texto}` : rotulos.join(", ");
}