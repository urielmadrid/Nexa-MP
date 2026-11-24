import type { LeadCrm } from "@/src/lib/crm/tipos";

/**
 * De onde cada lead veio, lido das marcações do link (utm) que o formulário guarda.
 * Fica num arquivo só para o painel, os filtros e a exportação usarem exatamente a mesma regra.
 * As marcações são comparadas sem diferenciar maiúsculas de minúsculas ("Email" e "email" contam juntas).
 */

const limpar = (v: string | null | undefined): string => (v ?? "").trim().toLowerCase();

/** Origem do lead: utm_source, senão o site de onde veio, senão "Direto / sem origem" (ou "Cadastro manual"). */
export function origemDoLead(lead: LeadCrm): string {
  const o = lead.origem;
  if (!o) return "Cadastro manual";
  const utm = limpar(o.utmSource);
  if (utm) return utm;
  if (o.referrer) {
    try {
      return new URL(o.referrer).hostname.replace(/^www\./, "");
    } catch {
      /* endereço de origem inválido: cai para "direto" */
    }
  }
  return "Direto / sem origem";
}

/** Campanha do lead (utm_campaign), ou null se ele não chegou por um link com campanha. */
export function campanhaDoLead(lead: LeadCrm): string | null {
  return limpar(lead.origem?.utmCampaign) || null;
}