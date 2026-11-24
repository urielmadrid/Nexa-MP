import type { Recomendacao } from "@/src/lib/crm/recomendar";
import type { LeadCrm } from "@/src/lib/crm/tipos";
import { STATUS_ABERTOS } from "@/src/lib/crm/tipos";

export type MapaRecs = Map<string, Recomendacao>;

/** Ordem de atendimento: retornos atrasados, depois quentes, depois novos sem contato, depois mais recentes. */
export function pontuacaoDeAtendimento(lead: LeadCrm, rec: Recomendacao, hoje: string): number {
  if (!STATUS_ABERTOS.includes(lead.status)) return -1;
  let p = rec.pontos;
  if (lead.proximoContato !== null && lead.proximoContato <= hoje) p += 100;
  if (rec.temperatura === "quente") p += 30;
  else if (rec.temperatura === "morno") p += 10;
  if (lead.status === "novo") p += 15;
  return p;
}

export function ordenarPorAtendimento(leads: LeadCrm[], recs: MapaRecs, hoje: string): LeadCrm[] {
  return [...leads].sort((a, b) => {
    const pa = pontuacaoDeAtendimento(a, recs.get(a.id) as Recomendacao, hoje);
    const pb = pontuacaoDeAtendimento(b, recs.get(b.id) as Recomendacao, hoje);
    return pb - pa || b.criadoEm.localeCompare(a.criadoEm);
  });
}

export function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function somarDias(hoje: string, dias: number): string {
  const [a, m, d] = hoje.split("-").map(Number);
  const dt = new Date(a, m - 1, d + dias);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Texto sem acento e em minúsculas, para a busca. */
export function normalizarBusca(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}