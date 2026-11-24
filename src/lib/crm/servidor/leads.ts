import { sanearDados } from "@/src/lib/crm/armazenamento";
import { leadDoEnvio } from "@/src/lib/crm/importar";
import type { DadosCrm, EventoHistorico, LeadCrm, PastaCrm } from "@/src/lib/crm/tipos";
import type { EnvioNormalizado, RespostaNormalizada } from "@/src/lib/formulario/tipos";
import { NOMES_TABELAS, TABELAS_CRM } from "@/src/lib/crm/servidor/esquema";
import { type Banco, type Conexao, type Executor, type Linha, deDatetime, faltaTabela, paraDatetime } from "@/src/lib/crm/servidor/banco";

/**
 * Leitura e gravação dos leads no MySQL.
 *
 * Como a tela e o banco conversam: a tela mantém todos os leads na memória e, a cada mudança, manda só o que mudou
 * (leads e pastas novos ou alterados + ids removidos). Cada lead é gravado inteiro, dentro de uma transação.
 * Se dois diretores editarem o MESMO lead ao mesmo tempo, vale a última gravação; já o histórico (notas e mudanças)
 * só cresce, então nenhuma nota se perde.
 */

export const LIMITE_LEADS_POR_PEDIDO = 300;
export const LIMITE_REMOVIDOS_POR_PEDIDO = 500;
const LIMITE_LEADS_NO_BANCO = 20_000;

/* ------------------------------------------------------------------ */
/* Instruções SQL                                                      */
/* ------------------------------------------------------------------ */

const COLUNAS_LEAD = [
  "id", "fonte", "criado_em", "atualizado_em", "nome", "empresa", "email", "whatsapp_e164", "canal_preferido", "status",
  "pasta_id", "proximo_contato", "formulario_slug", "formulario_versao", "tem_origem", "origem_pagina", "origem_referrer",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
] as const;

const marcas = (n: number) => Array.from({ length: n }, () => "?").join(", ");

/** Grava o lead inteiro; se o id já existir, atualiza (menos o id e a data de criação). */
const SQL_GRAVAR_LEAD = `INSERT INTO crm_lead (${COLUNAS_LEAD.join(", ")}) VALUES (${marcas(COLUNAS_LEAD.length)}) ON DUPLICATE KEY UPDATE ${COLUNAS_LEAD.filter((c) => c !== "id" && c !== "criado_em")
  .map((c) => `${c} = VALUES(${c})`)
  .join(", ")}`;

/** Lead novo vindo do formulário: leva também o aceite da Política de Privacidade. */
const SQL_NOVO_LEAD_DO_FORMULARIO = `INSERT INTO crm_lead (${COLUNAS_LEAD.join(", ")}, consentimento_versao, consentimento_em) VALUES (${marcas(COLUNAS_LEAD.length + 2)})`;

const TABELAS_FILHAS = ["crm_lead_tag", "crm_resposta_opcao", "crm_resposta", "crm_evento"] as const;

/* ------------------------------------------------------------------ */
/* Conversões                                                          */
/* ------------------------------------------------------------------ */

function valoresDoLead(l: LeadCrm): unknown[] {
  const o = l.origem;
  return [
    l.id, l.fonte, paraDatetime(l.criadoEm), paraDatetime(l.atualizadoEm), l.nome, l.empresa, l.email, l.whatsappE164, l.canalPreferido,
    l.status, l.pastaId, l.proximoContato, l.formularioSlug, l.formularioVersao, o ? 1 : 0,
    o?.pagina ?? null, o?.referrer ?? null, o?.utmSource ?? null, o?.utmMedium ?? null, o?.utmCampaign ?? null, o?.utmTerm ?? null, o?.utmContent ?? null,
  ];
}

const texto = (v: unknown): string | null => (v === null || v === undefined ? null : String(v));

function semAcento(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function linhasDe(resultado: unknown): Linha[] {
  return Array.isArray(resultado) ? (resultado as Linha[]) : [];
}

function agrupar<T>(linhas: Linha[], chave: string, montar: (l: Linha) => T): Map<string, T[]> {
  const mapa = new Map<string, T[]>();
  for (const l of linhas) {
    const k = String(l[chave]);
    const lista = mapa.get(k);
    if (lista) lista.push(montar(l));
    else mapa.set(k, [montar(l)]);
  }
  return mapa;
}

/* ------------------------------------------------------------------ */
/* Leitura                                                             */
/* ------------------------------------------------------------------ */

export async function lerTudo(banco: Executor): Promise<DadosCrm> {
  const [rp] = await banco.query("SELECT id, nome, cor FROM crm_pasta ORDER BY criado_em, id");
  const [rl] = await banco.query(`SELECT ${COLUNAS_LEAD.join(", ")} FROM crm_lead ORDER BY criado_em DESC, id LIMIT ${LIMITE_LEADS_NO_BANCO}`);
  const [rt] = await banco.query("SELECT lead_id, tag FROM crm_lead_tag ORDER BY lead_id, ordem, tag");
  const [rr] = await banco.query("SELECT lead_id, pergunta_codigo, texto FROM crm_resposta ORDER BY lead_id, ordem, pergunta_codigo");
  const [ro] = await banco.query("SELECT lead_id, pergunta_codigo, opcao_codigo FROM crm_resposta_opcao ORDER BY lead_id, pergunta_codigo, ordem, opcao_codigo");
  const [re] = await banco.query("SELECT id, lead_id, em, tipo, texto, status FROM crm_evento ORDER BY lead_id, em, ordem, id");

  const tags = agrupar(linhasDe(rt), "lead_id", (l) => String(l.tag));
  const opcoes = new Map<string, string[]>();
  for (const l of linhasDe(ro)) {
    const k = `${l.lead_id}\u0000${l.pergunta_codigo}`;
    const lista = opcoes.get(k);
    if (lista) lista.push(String(l.opcao_codigo));
    else opcoes.set(k, [String(l.opcao_codigo)]);
  }
  const respostas = agrupar<RespostaNormalizada>(linhasDe(rr), "lead_id", (l) => ({
    perguntaCodigo: String(l.pergunta_codigo),
    opcaoCodigos: opcoes.get(`${l.lead_id}\u0000${l.pergunta_codigo}`) ?? [],
    texto: texto(l.texto),
  }));
  const historico = agrupar<EventoHistorico>(linhasDe(re), "lead_id", (l) => ({
    id: String(l.id),
    em: deDatetime(l.em),
    tipo: String(l.tipo) as EventoHistorico["tipo"],
    texto: String(l.texto),
    ...(l.status ? { status: String(l.status) as EventoHistorico["status"] } : {}),
  }));

  const leads = linhasDe(rl).map((l) => {
    const id = String(l.id);
    return {
      id,
      fonte: l.fonte,
      criadoEm: deDatetime(l.criado_em),
      atualizadoEm: deDatetime(l.atualizado_em),
      nome: l.nome,
      empresa: texto(l.empresa),
      email: texto(l.email),
      whatsappE164: texto(l.whatsapp_e164),
      canalPreferido: texto(l.canal_preferido),
      status: l.status,
      pastaId: texto(l.pasta_id),
      tags: tags.get(id) ?? [],
      proximoContato: l.proximo_contato ? String(l.proximo_contato).slice(0, 10) : null,
      formularioSlug: texto(l.formulario_slug),
      formularioVersao: l.formulario_versao === null || l.formulario_versao === undefined ? null : Number(l.formulario_versao),
      respostas: respostas.get(id) ?? [],
      origem:
        Number(l.tem_origem) === 1
          ? {
              pagina: texto(l.origem_pagina),
              referrer: texto(l.origem_referrer),
              utmSource: texto(l.utm_source),
              utmMedium: texto(l.utm_medium),
              utmCampaign: texto(l.utm_campaign),
              utmTerm: texto(l.utm_term),
              utmContent: texto(l.utm_content),
            }
          : null,
      historico: historico.get(id) ?? [],
    };
  });

  // Passa pelo mesmo "filtro" da tela, para os dois lados enxergarem exatamente a mesma forma.
  return sanearDados({ leads, pastas: linhasDe(rp).map((p) => ({ id: p.id, nome: p.nome, cor: p.cor })) });
}

/* ------------------------------------------------------------------ */
/* Gravação                                                            */
/* ------------------------------------------------------------------ */

async function gravarFilhos(conn: Executor, lead: LeadCrm): Promise<void> {
  const id = lead.id;
  for (const tabela of ["crm_lead_tag", "crm_resposta_opcao", "crm_resposta"]) {
    await conn.query(`DELETE FROM ${tabela} WHERE lead_id = ?`, [id]);
  }

  // Etiquetas: o banco não diferencia maiúsculas/acentos, então repetições assim viram uma só.
  const vistas = new Set<string>();
  const tags: unknown[][] = [];
  for (const t of lead.tags) {
    const k = semAcento(t);
    if (vistas.has(k)) continue;
    vistas.add(k);
    tags.push([id, t, tags.length]);
  }
  if (tags.length > 0) await conn.query("INSERT INTO crm_lead_tag (lead_id, tag, ordem) VALUES ?", [tags]);

  // Respostas: uma linha por pergunta (a última vale) e uma por opção marcada.
  const porPergunta = new Map<string, RespostaNormalizada>();
  for (const r of lead.respostas) porPergunta.set(r.perguntaCodigo, r);
  const respostas: unknown[][] = [];
  const opcoes: unknown[][] = [];
  for (const r of porPergunta.values()) {
    respostas.push([id, r.perguntaCodigo, r.texto, respostas.length]);
    Array.from(new Set(r.opcaoCodigos)).forEach((o, i) => opcoes.push([id, r.perguntaCodigo, o, i]));
  }
  if (respostas.length > 0) await conn.query("INSERT INTO crm_resposta (lead_id, pergunta_codigo, texto, ordem) VALUES ?", [respostas]);
  if (opcoes.length > 0) await conn.query("INSERT INTO crm_resposta_opcao (lead_id, pergunta_codigo, opcao_codigo, ordem) VALUES ?", [opcoes]);

  // Histórico: só entra o que ainda não existe (ids repetidos são ignorados).
  if (lead.historico.length > 0) {
    const eventos = lead.historico.map((e, i) => [e.id, id, paraDatetime(e.em), e.tipo, e.texto, e.status ?? null, i]);
    await conn.query("INSERT INTO crm_evento (id, lead_id, em, tipo, texto, status, ordem) VALUES ? ON DUPLICATE KEY UPDATE id = id", [eventos]);
  }
}

async function emTransacao<T>(banco: Banco, trabalho: (conn: Conexao) => Promise<T>): Promise<T> {
  const conn = await banco.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await trabalho(conn);
    await conn.commit();
    return resultado;
  } catch (erro) {
    try {
      await conn.rollback();
    } catch {
      /* a conexão já caiu: nada a desfazer */
    }
    throw erro;
  } finally {
    conn.release();
  }
}

export type PedidoDeSincronizacao = {
  leads?: unknown;
  leadsRemovidos?: unknown;
  pastas?: unknown;
  pastasRemovidas?: unknown;
};

export type ResultadoDaSincronizacao = { leads: number; pastas: number; leadsRemovidos: number; pastasRemovidas: number; descartados: number };

function listaDeIds(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return Array.from(new Set(valor.filter((v): v is string => typeof v === "string" && v !== "").map((v) => v.slice(0, 80)))).slice(0, LIMITE_REMOVIDOS_POR_PEDIDO);
}

export async function sincronizar(banco: Banco, pedido: PedidoDeSincronizacao): Promise<ResultadoDaSincronizacao> {
  const leadsRecebidos = Array.isArray(pedido.leads) ? pedido.leads.slice(0, LIMITE_LEADS_POR_PEDIDO) : [];
  const pastasRecebidas = Array.isArray(pedido.pastas) ? pedido.pastas.slice(0, 200) : [];
  const leadsRemovidos = listaDeIds(pedido.leadsRemovidos);
  const pastasRemovidas = listaDeIds(pedido.pastasRemovidas);

  return emTransacao(banco, async (conn) => {
    // Pastas que já existem no banco (e não estão sendo removidas) continuam valendo para os leads deste pedido.
    const [existentes] = await conn.query("SELECT id FROM crm_pasta");
    const removidas = new Set(pastasRemovidas);
    const idsExistentes = linhasDe(existentes).map((p) => String(p.id)).filter((id) => !removidas.has(id));

    const saneado = sanearDados({
      leads: leadsRecebidos,
      pastas: [
        ...pastasRecebidas.filter((p) => !(typeof p === "object" && p !== null && removidas.has(String((p as { id?: unknown }).id)))),
        ...idsExistentes.map((id) => ({ id, nome: "-", cor: "#9ca3af" })),
      ],
    });

    const idsRecebidos = new Set(pastasRecebidas.map((p) => String((p as { id?: unknown } | null)?.id ?? "")));
    const pastas: PastaCrm[] = saneado.pastas.filter((p) => idsRecebidos.has(p.id) && !removidas.has(p.id));
    const agora = paraDatetime(new Date().toISOString());

    if (pastas.length > 0) {
      await conn.query("INSERT INTO crm_pasta (id, nome, cor, criado_em) VALUES ? ON DUPLICATE KEY UPDATE nome = VALUES(nome), cor = VALUES(cor)", [pastas.map((p) => [p.id, p.nome, p.cor, agora])]);
    }

    for (const lead of saneado.leads) {
      await conn.query(SQL_GRAVAR_LEAD, valoresDoLead(lead));
      await gravarFilhos(conn, lead);
    }

    if (leadsRemovidos.length > 0) {
      for (const tabela of TABELAS_FILHAS) await conn.query(`DELETE FROM ${tabela} WHERE lead_id IN (?)`, [leadsRemovidos]);
      await conn.query("DELETE FROM crm_lead WHERE id IN (?)", [leadsRemovidos]);
    }
    if (pastasRemovidas.length > 0) {
      await conn.query("UPDATE crm_lead SET pasta_id = NULL WHERE pasta_id IN (?)", [pastasRemovidas]);
      await conn.query("DELETE FROM crm_pasta WHERE id IN (?)", [pastasRemovidas]);
    }

    return {
      leads: saneado.leads.length,
      pastas: pastas.length,
      leadsRemovidos: leadsRemovidos.length,
      pastasRemovidas: pastasRemovidas.length,
      descartados: leadsRecebidos.length - saneado.leads.length,
    };
  });
}

/**
 * Guarda no CRM a pessoa que respondeu o diagnóstico em /formulario (chamado por src/lib/formulario/repositorio.ts).
 * Repetir o mesmo envio não duplica nada: se o id já existe, não faz nada.
 */
export async function gravarEnvio(banco: Banco, envio: EnvioNormalizado): Promise<void> {
  const [lead] = sanearDados({ leads: [leadDoEnvio(envio)], pastas: [] }).leads;
  if (!lead) throw new Error("Envio inválido para o CRM.");

  await emTransacao(banco, async (conn) => {
    const [ja] = await conn.query("SELECT id FROM crm_lead WHERE id = ?", [lead.id]);
    if (linhasDe(ja).length > 0) return;
    await conn.query(SQL_NOVO_LEAD_DO_FORMULARIO, [...valoresDoLead(lead), envio.consentimento.versaoPolitica.slice(0, 20), paraDatetime(envio.criadoEm)]);
    await gravarFilhos(conn, lead);
  });
}

/* ------------------------------------------------------------------ */
/* Tabelas                                                             */
/* ------------------------------------------------------------------ */

export async function criarTabelas(banco: Executor): Promise<void> {
  for (const instrucao of TABELAS_CRM) await banco.query(instrucao);
}

export async function tabelasProntas(banco: Executor): Promise<boolean> {
  for (const nome of NOMES_TABELAS) {
    try {
      await banco.query(`SELECT 1 FROM ${nome} LIMIT 1`);
    } catch (erro) {
      if (faltaTabela(erro)) return false;
      throw erro;
    }
  }
  return true;
}