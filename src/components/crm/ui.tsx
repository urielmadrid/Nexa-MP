"use client";

import type { ReactNode } from "react";
import type { Temperatura } from "@/src/lib/crm/recomendar";
import { STATUS_LEAD, type StatusLead } from "@/src/lib/crm/tipos";

const CAMINHOS: Record<string, ReactNode> = {
  busca: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  mais: <path d="M12 5v14M5 12h14" />,
  subir: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
  baixar: <><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  sair: <><path d="M10 4H5v16h5" /><path d="M15 8l4 4-4 4" /><path d="M19 12H9" /></>,
  pasta: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  etiqueta: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  whats: <path d="M4 20l1.4-4.2A8 8 0 1 1 8.3 18.7z" />,
  email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  fogo: <path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.5 1 2 2 2-.5-3 .5-5 1-8z" />,
  lixeira: <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></>,
  lapis: <><path d="M4 20l1-4L16 5l3 3L8 19z" /></>,
  ok: <path d="m5 12.5 4.5 4.5L19 7" />,
  painel: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
  funil: <><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="10" rx="1.5" /><rect x="17" y="4" width="4" height="6" rx="1.5" /></>,
  lista: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  filtro: <path d="M3 5h18l-7 8v6l-4-2v-4z" />,
  alvo: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>,
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  grafico: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  moeda: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5C14 8.7 13.2 8.3 12 8.3c-1.6 0-2.5.8-2.5 1.8 0 2.7 5.2 1.3 5.2 4 0 1-1 1.8-2.7 1.8-1.3 0-2.3-.5-2.8-1.4M12 6.5v1.8M12 15.9v1.6" /></>,
};

export function Icone({ nome, tamanho = 16 }: { nome: keyof typeof CAMINHOS | string; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {CAMINHOS[nome] ?? null}
    </svg>
  );
}

export function SeloStatus({ status }: { status: StatusLead }) {
  const s = STATUS_LEAD.find((x) => x.id === status);
  return (
    <span className="crm-selo">
      <i style={{ background: s?.cor }} />
      {s?.rotulo ?? status}
    </span>
  );
}

const COR_TEMPERATURA: Record<Temperatura, string> = { quente: "#ff5a3c", morno: "#ffb020", frio: "#5aa9ff" };
const ROTULO_TEMPERATURA: Record<Temperatura, string> = { quente: "Quente", morno: "Morno", frio: "Frio" };

export function SeloTemperatura({ temperatura }: { temperatura: Temperatura }) {
  return (
    <span className="crm-selo" title="Prioridade de atendimento, calculada pelas respostas">
      <i style={{ background: COR_TEMPERATURA[temperatura] }} />
      {ROTULO_TEMPERATURA[temperatura]}
    </span>
  );
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/** "hoje", "ontem", "há 3 dias"... */
export function haQuantoTempo(iso: string, agora: Date): string {
  const dias = Math.floor((agora.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

export function formatarDataCurta(aaaammdd: string): string {
  const [a, m, d] = aaaammdd.split("-");
  return `${d}/${m}/${a.slice(2)}`;
}