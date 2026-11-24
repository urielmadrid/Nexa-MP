import type {
  ErrosPorCampo,
  Formulario,
  LeadNormalizado,
  OrigemEnvio,
  Pergunta,
  RespostaNormalizada,
  RespostasBrutas,
} from "@/src/lib/formulario/tipos";

/**
 * Validação e normalização do formulário. É a MESMA função no navegador (para avisar a pessoa na hora)
 * e no servidor (que não confia no navegador). Não depende de React nem de banco de dados.
 */

export const RESPOSTAS_BRUTAS_VAZIAS: RespostasBrutas = { valores: {}, outros: {} };

const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}$/;

function limpar(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.replace(/\0/g, "").trim().slice(0, max) : "";
}

/** Normaliza um WhatsApp brasileiro para +55DDDNÚMERO. Devolve null se não parecer um número válido. */
export function whatsappParaE164(texto: string): string | null {
  let digitos = texto.replace(/\D/g, "");
  if (digitos.startsWith("0055")) digitos = digitos.slice(2);
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) digitos = digitos.slice(2);
  if (digitos.length < 10 || digitos.length > 11) return null;
  const ddd = Number(digitos.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  return `+55${digitos}`;
}

/** Valores de uma pergunta como lista (escolha única vira lista de um item). */
function listaDe(valor: string | string[] | undefined): string[] {
  if (Array.isArray(valor)) return valor;
  return valor ? [valor] : [];
}

/** A pergunta aparece (e é exigida) só quando a condição "visivelQuando" for atendida. */
export function perguntaVisivel(pergunta: Pergunta, brutas: RespostasBrutas): boolean {
  if (!pergunta.visivelQuando) return true;
  const { pergunta: outra, em } = pergunta.visivelQuando;
  return listaDe(brutas.valores[outra]).some((codigo) => em.includes(codigo));
}

/** Confere uma pergunta. Devolve a mensagem de erro, ou "" se estiver tudo certo. */
function erroDaPergunta(p: Pergunta, brutas: RespostasBrutas): string {
  const valor = brutas.valores[p.codigo];

  if (p.tipo === "texto_curto" || p.tipo === "texto_longo") {
    const texto = limpar(valor, p.maxCaracteres ?? 600);
    if (texto === "") return p.obrigatoria ? "Preencha este campo." : "";
    if (p.campoLead === "email" && !EMAIL.test(texto)) return "Informe um e-mail válido, por exemplo seu@email.com.";
    if (p.campoLead === "whatsapp" && whatsappParaE164(texto) === null) {
      return "Informe o WhatsApp com DDD, por exemplo (53) 99999-9999.";
    }
    return "";
  }

  const escolhidas = listaDe(valor);
  if (escolhidas.length === 0) return p.obrigatoria ? "Escolha uma opção." : "";
  const opcoes = p.opcoes ?? [];
  if (new Set(escolhidas).size !== escolhidas.length) return "Escolha inválida.";
  for (const codigo of escolhidas) {
    if (!opcoes.some((o) => o.codigo === codigo)) return "Escolha inválida.";
  }
  if (p.tipo === "escolha_unica" && escolhidas.length > 1) return "Escolha apenas uma opção.";
  const exclusiva = opcoes.find((o) => o.exclusiva && escolhidas.includes(o.codigo));
  if (exclusiva && escolhidas.length > 1) return "Escolha inválida.";
  const comTexto = opcoes.find((o) => o.pedeTexto && escolhidas.includes(o.codigo));
  if (comTexto && limpar(brutas.outros[p.codigo], p.maxCaracteres ?? 120) === "") return "Conte em poucas palavras.";
  return "";
}

/** Erros das perguntas dadas (por exemplo, só as de uma etapa). Chave = código da pergunta. */
export function validarPerguntas(perguntas: Pergunta[], brutas: RespostasBrutas): ErrosPorCampo {
  const erros: ErrosPorCampo = {};
  for (const p of perguntas) {
    if (!perguntaVisivel(p, brutas)) continue;
    const erro = erroDaPergunta(p, brutas);
    if (erro) erros[p.codigo] = erro;
  }
  return erros;
}

export type DadosValidados = { lead: LeadNormalizado; respostas: RespostaNormalizada[] };
export type ResultadoValidacao = { ok: true; dados: DadosValidados } | { ok: false; erros: ErrosPorCampo };

/** Valida o formulário inteiro e devolve os dados já no formato das tabelas (lead + respostas). */
export function validarFormulario(formulario: Formulario, brutas: RespostasBrutas): ResultadoValidacao {
  const perguntas = formulario.etapas.flatMap((etapa) => etapa.perguntas);
  const erros = validarPerguntas(perguntas, brutas);
  if (Object.keys(erros).length > 0) return { ok: false, erros };

  const lead: LeadNormalizado = { nome: "", empresa: null, email: null, whatsappE164: null, canalPreferido: null };
  const respostas: RespostaNormalizada[] = [];

  for (const p of perguntas) {
    if (!perguntaVisivel(p, brutas)) continue;
    const valor = brutas.valores[p.codigo];
    const ehTexto = p.tipo === "texto_curto" || p.tipo === "texto_longo";
    const texto = ehTexto ? limpar(valor, p.maxCaracteres ?? 600) : "";

    if (p.campoLead) {
      if (p.campoLead === "nome") lead.nome = texto;
      else if (p.campoLead === "empresa") lead.empresa = texto || null;
      else if (p.campoLead === "email") lead.email = texto ? texto.toLowerCase() : null;
      else if (p.campoLead === "whatsapp") lead.whatsappE164 = texto ? whatsappParaE164(texto) : null;
      else if (p.campoLead === "canal_preferido") lead.canalPreferido = listaDe(valor)[0] ?? null;
      continue;
    }

    if (ehTexto) {
      if (texto !== "") respostas.push({ perguntaCodigo: p.codigo, opcaoCodigos: [], texto });
      continue;
    }

    const escolhidas = listaDe(valor);
    if (escolhidas.length === 0) continue;
    const pedeTexto = (p.opcoes ?? []).some((o) => o.pedeTexto && escolhidas.includes(o.codigo));
    respostas.push({
      perguntaCodigo: p.codigo,
      opcaoCodigos: escolhidas,
      texto: pedeTexto ? limpar(brutas.outros[p.codigo], p.maxCaracteres ?? 120) : null,
    });
  }

  return { ok: true, dados: { lead, respostas } };
}

/** Lê o corpo recebido (desconhecido) e aproveita só o que tem o formato esperado. */
export function lerRespostasBrutas(corpo: unknown): RespostasBrutas {
  const brutas: RespostasBrutas = { valores: {}, outros: {} };
  if (typeof corpo !== "object" || corpo === null) return brutas;
  const { valores, outros } = corpo as { valores?: unknown; outros?: unknown };

  if (typeof valores === "object" && valores !== null && !Array.isArray(valores)) {
    for (const [codigo, v] of Object.entries(valores).slice(0, 40)) {
      if (typeof v === "string") brutas.valores[codigo] = limpar(v, 700);
      else if (Array.isArray(v)) brutas.valores[codigo] = v.filter((x): x is string => typeof x === "string").slice(0, 20).map((x) => limpar(x, 60));
    }
  }
  if (typeof outros === "object" && outros !== null && !Array.isArray(outros)) {
    for (const [codigo, v] of Object.entries(outros).slice(0, 40)) {
      if (typeof v === "string") brutas.outros[codigo] = limpar(v, 200);
    }
  }
  return brutas;
}

/** Origem do envio (de onde a pessoa veio). Só texto curto; nada de endereço IP. */
export function lerOrigem(corpo: unknown): OrigemEnvio {
  const vazio: OrigemEnvio = { pagina: null, referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null };
  if (typeof corpo !== "object" || corpo === null) return vazio;
  const o = corpo as Record<string, unknown>;
  const campo = (valor: unknown, max: number) => limpar(valor, max) || null;
  return {
    pagina: campo(o.pagina, 200),
    referrer: campo(o.referrer, 300),
    utmSource: campo(o.utmSource, 100),
    utmMedium: campo(o.utmMedium, 100),
    utmCampaign: campo(o.utmCampaign, 100),
    utmTerm: campo(o.utmTerm, 100),
    utmContent: campo(o.utmContent, 100),
  };
}