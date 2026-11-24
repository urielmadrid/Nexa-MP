import type { OrigemEnvio, RespostaNormalizada } from "@/src/lib/formulario/tipos";

/**
 * Tipos do CRM interno (página /crm).
 * Seguem as tabelas de docs/banco/formulario-diagnostico.sql: lead, envio e resposta. Quando o banco existir,
 * "LeadCrm" vira uma linha de lead + o último envio, e "respostas" continua no mesmo formato.
 */

export type StatusLead = "novo" | "em_contato" | "qualificado" | "proposta" | "ganho" | "perdido";

export const STATUS_LEAD: Array<{ id: StatusLead; rotulo: string; cor: string }> = [
  { id: "novo", rotulo: "Novo", cor: "#5aa9ff" },
  { id: "em_contato", rotulo: "Em contato", cor: "#ffb020" },
  { id: "qualificado", rotulo: "Qualificado", cor: "#b18cff" },
  { id: "proposta", rotulo: "Proposta", cor: "#ff6a00" },
  { id: "ganho", rotulo: "Ganho", cor: "#3ecf8e" },
  { id: "perdido", rotulo: "Perdido", cor: "#7d7d7d" },
];

export const STATUS_ABERTOS: StatusLead[] = ["novo", "em_contato", "qualificado", "proposta"];

export function rotuloDoStatus(id: StatusLead): string {
  return STATUS_LEAD.find((s) => s.id === id)?.rotulo ?? id;
}

/** De onde veio o lead: formulário do site, cadastro manual ou dados de exemplo (fictícios, só para ver o painel). */
export type FonteLead = "formulario" | "manual" | "exemplo";

export type TipoEvento = "nota" | "status" | "pasta" | "contato" | "sistema";

export type EventoHistorico = {
  id: string;
  /** ISO 8601 */
  em: string;
  tipo: TipoEvento;
  texto: string;
  /** Só em eventos de status: o status novo, para medir tempos do funil. */
  status?: StatusLead;
};

export type LeadCrm = {
  /** Leads do formulário usam o id do envio (EnvioNormalizado.id): importar duas vezes não duplica. */
  id: string;
  fonte: FonteLead;
  criadoEm: string;
  atualizadoEm: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  whatsappE164: string | null;
  canalPreferido: string | null;
  status: StatusLead;
  pastaId: string | null;
  /** Etiquetas livres, escritas pela equipe. A etiqueta automática do sistema não fica aqui: é calculada. */
  tags: string[];
  /** Data do próximo contato, no formato AAAA-MM-DD. */
  proximoContato: string | null;
  formularioSlug: string | null;
  formularioVersao: number | null;
  respostas: RespostaNormalizada[];
  origem: OrigemEnvio | null;
  historico: EventoHistorico[];
};

export type PastaCrm = { id: string; nome: string; cor: string };

export type DadosCrm = {
  versao: 1;
  leads: LeadCrm[];
  pastas: PastaCrm[];
};

export const CORES_PASTA = ["#ff6a00", "#5aa9ff", "#3ecf8e", "#b18cff", "#ffb020", "#ff5a8a", "#2dd4bf", "#9ca3af"];