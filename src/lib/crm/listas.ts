import type { Recomendacao } from "@/src/lib/crm/recomendar";
import type { LeadCrm } from "@/src/lib/crm/tipos";
import { STATUS_ABERTOS } from "@/src/lib/crm/tipos";
import { campanhaDoLead, origemDoLead } from "@/src/lib/crm/origem";

/** Listas inteligentes: filtros prontos que se atualizam sozinhos conforme os leads mudam. */

export type ContextoLista = { hoje: string; agora: Date };
export type ListaInteligente = {
  id: string;
  rotulo: string;
  dica: string;
  filtro: (lead: LeadCrm, rec: Recomendacao, ctx: ContextoLista) => boolean;
};

const aberto = (l: LeadCrm) => STATUS_ABERTOS.includes(l.status);
const dias = (iso: string, agora: Date) => Math.floor((agora.getTime() - new Date(iso).getTime()) / 86_400_000);

export const LISTAS_INTELIGENTES: ListaInteligente[] = [
  { id: "todos", rotulo: "Todos os leads", dica: "Tudo o que está no CRM.", filtro: () => true },
  { id: "novos", rotulo: "Novos (sem contato)", dica: "Ainda ninguém falou com eles.", filtro: (l) => l.status === "novo" },
  { id: "quentes", rotulo: "Quentes", dica: "Maior chance de fechar, pelas respostas. Só leads em aberto.", filtro: (l, r) => aberto(l) && r.temperatura === "quente" },
  { id: "retornar", rotulo: "Retornar hoje", dica: "Próximo contato marcado para hoje ou atrasado.", filtro: (l, _r, c) => aberto(l) && l.proximoContato !== null && l.proximoContato <= c.hoje },
  { id: "parados", rotulo: "Parados há 7+ dias", dica: "Em aberto e sem nenhuma atividade há 7 dias ou mais.", filtro: (l, _r, c) => aberto(l) && dias(l.atualizadoEm, c.agora) >= 7 },
  { id: "trafego", rotulo: "Precisam de tráfego pago", dica: "O sistema indicou tráfego pago como necessidade principal.", filtro: (l, r) => aberto(l) && (r.servico === "trafego_pago" || r.tambemPrecisa.includes("trafego_pago")) },
  { id: "redes", rotulo: "Precisam de redes sociais", dica: "Conteúdo e redes como necessidade principal.", filtro: (l, r) => aberto(l) && (r.servico === "redes_sociais" || r.tambemPrecisa.includes("redes_sociais")) },
  { id: "google", rotulo: "Sem Google Meu Negócio", dica: "Disseram que não têm perfil no Google.", filtro: (l, r) => aberto(l) && (r.servico === "google_meu_negocio" || r.tambemPrecisa.includes("google_meu_negocio")) },
  { id: "site", rotulo: "Sem site", dica: "Precisam de site ou landing page.", filtro: (l, r) => aberto(l) && (r.servico === "site" || r.tambemPrecisa.includes("site")) },
  { id: "alto", rotulo: "Orçamento de R$ 1.500+", dica: "Informaram investir R$ 1.500 ou mais por mês.", filtro: (l, r) => aberto(l) && (r.orcamentoCodigo === "de_1500_a_3000" || r.orcamentoCodigo === "acima_3000") },
  { id: "sem-orcamento", rotulo: "Orçamento indefinido", dica: "Responderam 'ainda não sei' ou não informaram.", filtro: (l, r) => aberto(l) && r.orcamentoCodigo === null },
  { id: "sem-pasta", rotulo: "Sem pasta", dica: "Ainda não foram organizados em nenhuma pasta.", filtro: (l) => l.pastaId === null },
  { id: "encerrados", rotulo: "Encerrados", dica: "Ganhos e perdidos.", filtro: (l) => !aberto(l) },
];

/**
 * Filtros usados pelos cartões do painel (clicar em "Leads em aberto" mostra exatamente esses leads).
 * Seguem as mesmas regras dos números de src/lib/crm/metricas.ts, por isso o total bate com o cartão.
 * Não aparecem na barra lateral.
 */
export const LISTAS_DOS_INDICADORES: ListaInteligente[] = [
  { id: "ind-abertos", rotulo: "Leads em aberto", dica: "Ainda em negociação: novos, em contato, qualificados e com proposta.", filtro: (l) => aberto(l) },
  { id: "ind-7dias", rotulo: "Chegaram nos últimos 7 dias", dica: "Leads que entraram no CRM na última semana.", filtro: (l, _r, c) => dias(l.criadoEm, c.agora) < 7 },
  { id: "ind-sem-resposta", rotulo: "Sem resposta há 2+ dias", dica: "Chegaram há 2 dias ou mais e ninguém falou com eles ainda.", filtro: (l, _r, c) => l.status === "novo" && dias(l.criadoEm, c.agora) >= 2 },
  { id: "ind-com-orcamento", rotulo: "Com investimento informado", dica: "Leads em aberto que disseram quanto querem investir por mês.", filtro: (l, r) => aberto(l) && r.orcamentoCodigo !== null },
];

/**
 * Filtros criados na hora pelos gráficos do painel: "origem:email" e "campanha:desconto-trafego-design".
 * Mostram os leads que formam aquela barra do gráfico.
 */
function listaDoGrafico(id: string): ListaInteligente | undefined {
  if (id.startsWith("origem:")) {
    const valor = id.slice("origem:".length);
    return { id, rotulo: `Origem: ${valor}`, dica: "Leads que chegaram por esta origem.", filtro: (l) => origemDoLead(l) === valor };
  }
  if (id.startsWith("campanha:")) {
    const valor = id.slice("campanha:".length);
    return { id, rotulo: `Campanha: ${valor}`, dica: "Leads que chegaram por esta campanha.", filtro: (l) => campanhaDoLead(l) === valor };
  }
  return undefined;
}

export function listaPorId(id: string): ListaInteligente | undefined {
  return listaDoGrafico(id) ?? LISTAS_INTELIGENTES.find((l) => l.id === id) ?? LISTAS_DOS_INDICADORES.find((l) => l.id === id);
}