import { sanearDados } from "@/src/lib/crm/armazenamento";
import type { DadosCrm, LeadCrm, PastaCrm } from "@/src/lib/crm/tipos";

/**
 * Lado da tela (navegador) da conversa com o banco, pelas rotas /api/crm/*.
 * A tela mantém tudo na memória; esta parte descobre o que mudou desde a última vez que o servidor confirmou
 * e envia só isso.
 */

const CABECALHOS = { "Content-Type": "application/json", "x-nexa-crm": "1" };
const LEADS_POR_PEDIDO = 100;
const REMOVIDOS_POR_PEDIDO = 200;

export type ResultadoCarga =
  | { ok: true; dados: DadosCrm }
  | { ok: false; motivo: "sem_banco" | "sem_tabelas" | "sessao" | "erro"; detalhe?: string };

/** JSON com as chaves em ordem fixa, para comparar objetos sem depender da ordem em que foram montados. */
export function estavel(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(estavel).join(",")}]`;
  if (valor !== null && typeof valor === "object") {
    const o = valor as Record<string, unknown>;
    return `{${Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${estavel(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(valor) ?? "null";
}

/** Chave que não depende da ordem dos leads e das pastas: serve para saber se dois conjuntos de dados são iguais. */
export function chaveDosDados(dados: DadosCrm): string {
  const leads = [...dados.leads].sort((a, b) => a.id.localeCompare(b.id));
  const pastas = [...dados.pastas].sort((a, b) => a.id.localeCompare(b.id));
  return estavel({ leads, pastas });
}

export type Base = { leads: Map<string, string>; pastas: Map<string, string> };

export function montarBase(dados: DadosCrm): Base {
  return {
    leads: new Map(dados.leads.map((l) => [l.id, estavel(l)])),
    pastas: new Map(dados.pastas.map((p) => [p.id, estavel(p)])),
  };
}

export type Diferenca = {
  leads: LeadCrm[];
  leadsRemovidos: string[];
  pastas: PastaCrm[];
  pastasRemovidas: string[];
};

/** O que mudou entre o que o servidor já tem (base) e o que está na tela. */
export function calcularDiferenca(base: Base, dados: DadosCrm): Diferenca {
  const idsLeads = new Set(dados.leads.map((l) => l.id));
  const idsPastas = new Set(dados.pastas.map((p) => p.id));
  return {
    leads: dados.leads.filter((l) => base.leads.get(l.id) !== estavel(l)),
    leadsRemovidos: Array.from(base.leads.keys()).filter((id) => !idsLeads.has(id)),
    pastas: dados.pastas.filter((p) => base.pastas.get(p.id) !== estavel(p)),
    pastasRemovidas: Array.from(base.pastas.keys()).filter((id) => !idsPastas.has(id)),
  };
}

export function diferencaVazia(d: Diferenca): boolean {
  return d.leads.length === 0 && d.leadsRemovidos.length === 0 && d.pastas.length === 0 && d.pastasRemovidas.length === 0;
}

/** Divide a diferença em pedidos pequenos. As pastas vão no primeiro, antes dos leads que dependem delas. */
export function dividirEmPedidos(d: Diferenca): Array<Partial<Diferenca>> {
  const pedidos: Array<Partial<Diferenca>> = [];
  const total = Math.max(1, Math.ceil(d.leads.length / LEADS_POR_PEDIDO), Math.ceil(d.leadsRemovidos.length / REMOVIDOS_POR_PEDIDO));
  for (let i = 0; i < total; i += 1) {
    pedidos.push({
      leads: d.leads.slice(i * LEADS_POR_PEDIDO, (i + 1) * LEADS_POR_PEDIDO),
      leadsRemovidos: d.leadsRemovidos.slice(i * REMOVIDOS_POR_PEDIDO, (i + 1) * REMOVIDOS_POR_PEDIDO),
      ...(i === 0 ? { pastas: d.pastas, pastasRemovidas: d.pastasRemovidas } : {}),
    });
  }
  return pedidos;
}

/* ------------------------------------------------------------------ */
/* Rede                                                                */
/* ------------------------------------------------------------------ */

async function lerJson(resp: Response): Promise<Record<string, unknown>> {
  try {
    const j: unknown = await resp.json();
    return typeof j === "object" && j !== null ? (j as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function carregarDoBanco(): Promise<ResultadoCarga> {
  try {
    const resp = await fetch("/api/crm/dados", { cache: "no-store", credentials: "same-origin" });
    const corpo = await lerJson(resp);
    if (resp.ok && corpo.ok === true) return { ok: true, dados: sanearDados(corpo.dados) };
    if (resp.status === 401) return { ok: false, motivo: "sessao" };
    if (corpo.erro === "sem_banco") return { ok: false, motivo: "sem_banco" };
    if (corpo.erro === "sem_tabelas") return { ok: false, motivo: "sem_tabelas" };
    return { ok: false, motivo: "erro", detalhe: typeof corpo.detalhe === "string" ? `${corpo.codigo ?? ""} ${corpo.detalhe}`.trim() : undefined };
  } catch {
    return { ok: false, motivo: "erro", detalhe: "Sem conexão com o servidor." };
  }
}

export async function criarTabelasNoBanco(): Promise<{ ok: boolean; detalhe?: string }> {
  try {
    const resp = await fetch("/api/crm/banco", { method: "POST", headers: CABECALHOS, credentials: "same-origin" });
    const corpo = await lerJson(resp);
    if (resp.ok && corpo.ok === true) return { ok: true };
    return { ok: false, detalhe: typeof corpo.detalhe === "string" ? `${corpo.codigo ?? ""} ${corpo.detalhe}`.trim() : "Não foi possível criar as tabelas." };
  } catch {
    return { ok: false, detalhe: "Sem conexão com o servidor." };
  }
}

async function enviar(pedido: Partial<Diferenca>): Promise<boolean> {
  try {
    const resp = await fetch("/api/crm/sincronizar", { method: "POST", headers: CABECALHOS, credentials: "same-origin", body: JSON.stringify(pedido) });
    if (resp.status === 401 && typeof window !== "undefined") window.location.reload();
    return resp.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Estado da sincronização                                             */
/* ------------------------------------------------------------------ */

let base: Base = { leads: new Map(), pastas: new Map() };
let fila: Promise<unknown> = Promise.resolve();

export const fonteBanco = {
  /** Diz qual é o retrato que o servidor tem agora. Chame sempre que a tela adotar os dados que vieram do servidor. */
  definirBase(dados: DadosCrm) {
    base = montarBase(dados);
  },

  /** Envia o que mudou. Pedidos são feitos um de cada vez, na ordem. Devolve false se algo não foi gravado. */
  salvar(dados: DadosCrm): Promise<boolean> {
    const tarefa = fila.then(async () => {
      const dif = calcularDiferenca(base, dados);
      if (diferencaVazia(dif)) return true;
      for (const pedido of dividirEmPedidos(dif)) {
        if (!(await enviar(pedido))) return false;
        // O que o servidor confirmou passa a fazer parte da base.
        for (const l of pedido.leads ?? []) base.leads.set(l.id, estavel(l));
        for (const id of pedido.leadsRemovidos ?? []) base.leads.delete(id);
        for (const p of pedido.pastas ?? []) base.pastas.set(p.id, estavel(p));
        for (const id of pedido.pastasRemovidas ?? []) base.pastas.delete(id);
      }
      return true;
    });
    fila = tarefa.catch(() => false);
    return tarefa;
  },

  /** Há mudanças na tela que o servidor ainda não confirmou? */
  temPendencias(dados: DadosCrm): boolean {
    return !diferencaVazia(calcularDiferenca(base, dados));
  },

  /** Espera terminar o que já está sendo gravado (para não ler o banco no meio de uma gravação). */
  async esperarGravacoes(): Promise<void> {
    await fila;
  },
};