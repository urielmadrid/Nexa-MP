import type { DadosCrm, EventoHistorico, LeadCrm, PastaCrm, StatusLead, TipoEvento } from "@/src/lib/crm/tipos";
import { rotuloDoStatus } from "@/src/lib/crm/tipos";
import type { RespostaNormalizada } from "@/src/lib/formulario/tipos";

/** Funções puras que mudam os dados do CRM. Sempre devolvem cópias novas (nada é alterado no lugar). */

export function criarId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const DADOS_VAZIOS: DadosCrm = { versao: 1, leads: [], pastas: [] };

export function novoEvento(tipo: TipoEvento, texto: string, agora: Date = new Date(), status?: StatusLead): EventoHistorico {
  return { id: criarId(), em: agora.toISOString(), tipo, texto, ...(status ? { status } : {}) };
}

export function comEvento(lead: LeadCrm, evento: EventoHistorico): LeadCrm {
  return { ...lead, atualizadoEm: evento.em, historico: [...lead.historico, evento] };
}

export function mudarStatus(lead: LeadCrm, status: StatusLead, agora: Date = new Date()): LeadCrm {
  if (lead.status === status) return lead;
  const evento = novoEvento("status", `Status: ${rotuloDoStatus(lead.status)} → ${rotuloDoStatus(status)}`, agora, status);
  return { ...comEvento(lead, evento), status };
}

export function moverParaPasta(lead: LeadCrm, pasta: PastaCrm | null, agora: Date = new Date()): LeadCrm {
  if ((lead.pastaId ?? null) === (pasta?.id ?? null)) return lead;
  const evento = novoEvento("pasta", pasta ? `Movido para a pasta "${pasta.nome}"` : "Tirado da pasta", agora);
  return { ...comEvento(lead, evento), pastaId: pasta?.id ?? null };
}

export type CamposLeadManual = {
  nome: string;
  empresa: string;
  email: string;
  whatsappE164: string | null;
  respostas: RespostaNormalizada[];
  pastaId: string | null;
};

export function leadManual(campos: CamposLeadManual, agora: Date = new Date()): LeadCrm {
  const iso = agora.toISOString();
  return {
    id: criarId(),
    fonte: "manual",
    criadoEm: iso,
    atualizadoEm: iso,
    nome: campos.nome.trim(),
    empresa: campos.empresa.trim() || null,
    email: campos.email.trim().toLowerCase() || null,
    whatsappE164: campos.whatsappE164,
    canalPreferido: null,
    status: "novo",
    pastaId: campos.pastaId,
    tags: [],
    proximoContato: null,
    formularioSlug: null,
    formularioVersao: null,
    respostas: campos.respostas,
    origem: null,
    historico: [novoEvento("sistema", "Lead cadastrado manualmente", agora)],
  };
}

/** Junta leads novos aos existentes, ignorando ids que já estão no CRM. */
export function mesclarLeads(existentes: LeadCrm[], novos: LeadCrm[]): { leads: LeadCrm[]; adicionados: number; repetidos: number } {
  const ids = new Set(existentes.map((l) => l.id));
  const aceitos: LeadCrm[] = [];
  let repetidos = 0;
  for (const lead of novos) {
    if (ids.has(lead.id)) {
      repetidos += 1;
      continue;
    }
    ids.add(lead.id);
    aceitos.push(lead);
  }
  return { leads: [...aceitos, ...existentes], adicionados: aceitos.length, repetidos };
}

/** Etiquetas livres: sem espaços sobrando, no máximo 30 caracteres, sem repetir. */
export function limparTag(texto: string): string {
  return texto.replace(/\s+/g, " ").replace(/^#/, "").trim().slice(0, 30);
}

export function hojeIso(agora: Date = new Date()): string {
  const d = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 10);
}