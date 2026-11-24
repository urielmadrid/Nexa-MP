import type { DadosCrm, LeadCrm, PastaCrm, StatusLead, TipoEvento } from "@/src/lib/crm/tipos";
import { STATUS_LEAD } from "@/src/lib/crm/tipos";
import { DADOS_VAZIOS } from "@/src/lib/crm/operacoes";

/**
 * Onde o CRM guarda os dados.
 *
 * HOJE: no próprio navegador (localStorage). Cada diretor vê só o que está no navegador dele.
 * QUANDO houver banco: escreva outra "FonteDeDadosCrm" que leia e grave pela API/banco (tabelas de
 * docs/banco/formulario-diagnostico.sql) e troque "fonteDeDados" abaixo. A tela não muda.
 */
export interface FonteDeDadosCrm {
  carregar(): Promise<DadosCrm>;
  /** Devolve false se não conseguiu gravar (por exemplo, armazenamento cheio ou bloqueado). */
  salvar(dados: DadosCrm): Promise<boolean>;
}

export const CHAVE_CRM = "nexa-crm-v1";

const STATUS_VALIDOS = new Set<string>(STATUS_LEAD.map((s) => s.id));
const TIPOS_EVENTO = new Set<string>(["nota", "status", "pasta", "contato", "sistema"]);

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.slice(0, max) : "";
}
function textoOuNulo(valor: unknown, max: number): string | null {
  const t = texto(valor, max).trim();
  return t === "" ? null : t;
}
function dataIso(valor: unknown, padrao: string): string {
  return typeof valor === "string" && !Number.isNaN(new Date(valor).getTime()) ? valor : padrao;
}

/** Aceita só o que tem o formato certo; o resto é descartado. Serve para o localStorage e para backups importados. */
export function sanearDados(bruto: unknown): DadosCrm {
  if (typeof bruto !== "object" || bruto === null) return { ...DADOS_VAZIOS };
  const o = bruto as { leads?: unknown; pastas?: unknown };
  const agora = new Date().toISOString();

  const pastas: PastaCrm[] = [];
  if (Array.isArray(o.pastas)) {
    for (const p of o.pastas.slice(0, 200)) {
      if (typeof p !== "object" || p === null) continue;
      const { id, nome, cor } = p as Record<string, unknown>;
      if (typeof id === "string" && id && typeof nome === "string" && nome.trim()) {
        pastas.push({ id: id.slice(0, 80), nome: nome.trim().slice(0, 40), cor: typeof cor === "string" && /^#[0-9a-f]{6}$/i.test(cor) ? cor : "#9ca3af" });
      }
    }
  }
  const idsPastas = new Set(pastas.map((p) => p.id));

  const leads: LeadCrm[] = [];
  if (Array.isArray(o.leads)) {
    for (const bruta of o.leads.slice(0, 20_000)) {
      if (typeof bruta !== "object" || bruta === null) continue;
      const l = bruta as Record<string, unknown>;
      if (typeof l.id !== "string" || !l.id || texto(l.nome, 120).trim() === "") continue;
      const criadoEm = dataIso(l.criadoEm, agora);
      const respostas = Array.isArray(l.respostas)
        ? l.respostas.slice(0, 60).flatMap((r) => {
            if (typeof r !== "object" || r === null) return [];
            const x = r as Record<string, unknown>;
            if (typeof x.perguntaCodigo !== "string") return [];
            const codigos = Array.isArray(x.opcaoCodigos) ? x.opcaoCodigos.filter((c): c is string => typeof c === "string").slice(0, 20).map((c) => c.slice(0, 60)) : [];
            return [{ perguntaCodigo: x.perguntaCodigo.slice(0, 60), opcaoCodigos: codigos, texto: textoOuNulo(x.texto, 700) }];
          })
        : [];
      const historico = Array.isArray(l.historico)
        ? l.historico.slice(0, 500).flatMap((e) => {
            if (typeof e !== "object" || e === null) return [];
            const x = e as Record<string, unknown>;
            if (typeof x.id !== "string" || typeof x.texto !== "string") return [];
            if (typeof x.tipo !== "string" || !TIPOS_EVENTO.has(x.tipo)) return [];
            const tipo = x.tipo as TipoEvento;
            const status = typeof x.status === "string" && STATUS_VALIDOS.has(x.status) ? (x.status as StatusLead) : undefined;
            return [{ id: x.id.slice(0, 80), em: dataIso(x.em, criadoEm), tipo, texto: x.texto.slice(0, 2000), ...(status ? { status } : {}) }];
          })
        : [];
      const origem = typeof l.origem === "object" && l.origem !== null ? (l.origem as Record<string, unknown>) : null;
      const pastaId = typeof l.pastaId === "string" && idsPastas.has(l.pastaId) ? l.pastaId : null;
      leads.push({
        id: l.id.slice(0, 80),
        fonte: l.fonte === "formulario" || l.fonte === "exemplo" ? l.fonte : "manual",
        criadoEm,
        atualizadoEm: dataIso(l.atualizadoEm, criadoEm),
        nome: texto(l.nome, 120).trim(),
        empresa: textoOuNulo(l.empresa, 120),
        email: textoOuNulo(l.email, 160),
        whatsappE164: typeof l.whatsappE164 === "string" && /^\+[0-9]{10,15}$/.test(l.whatsappE164) ? l.whatsappE164 : null,
        canalPreferido: textoOuNulo(l.canalPreferido, 20),
        status: typeof l.status === "string" && STATUS_VALIDOS.has(l.status) ? (l.status as StatusLead) : "novo",
        pastaId,
        tags: Array.isArray(l.tags) ? Array.from(new Set(l.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 30)).filter(Boolean))).slice(0, 20) : [],
        proximoContato: typeof l.proximoContato === "string" && /^\d{4}-\d{2}-\d{2}$/.test(l.proximoContato) ? l.proximoContato : null,
        formularioSlug: textoOuNulo(l.formularioSlug, 60),
        formularioVersao: typeof l.formularioVersao === "number" ? l.formularioVersao : null,
        respostas,
        origem: origem
          ? {
              pagina: textoOuNulo(origem.pagina, 200),
              referrer: textoOuNulo(origem.referrer, 300),
              utmSource: textoOuNulo(origem.utmSource, 100),
              utmMedium: textoOuNulo(origem.utmMedium, 100),
              utmCampaign: textoOuNulo(origem.utmCampaign, 100),
              utmTerm: textoOuNulo(origem.utmTerm, 100),
              utmContent: textoOuNulo(origem.utmContent, 100),
            }
          : null,
        historico,
      });
    }
  }
  return { versao: 1, leads, pastas };
}

export const fonteLocal: FonteDeDadosCrm = {
  async carregar() {
    try {
      const salvo = window.localStorage.getItem(CHAVE_CRM);
      return salvo ? sanearDados(JSON.parse(salvo)) : { ...DADOS_VAZIOS };
    } catch {
      return { ...DADOS_VAZIOS };
    }
  },
  async salvar(dados) {
    try {
      window.localStorage.setItem(CHAVE_CRM, JSON.stringify(dados));
      return true;
    } catch {
      return false;
    }
  },
};

export const fonteDeDados: FonteDeDadosCrm = fonteLocal;