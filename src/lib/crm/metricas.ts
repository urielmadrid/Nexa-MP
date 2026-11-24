import { ORCAMENTOS, ROTULO_SERVICO, type Recomendacao } from "@/src/lib/crm/recomendar";
import { hojeIso } from "@/src/lib/crm/operacoes";
import { STATUS_ABERTOS, STATUS_LEAD, type LeadCrm, type PastaCrm, type StatusLead } from "@/src/lib/crm/tipos";
import { PERGUNTAS_DIAGNOSTICO } from "@/src/lib/formulario/diagnostico";

/** Números do painel. Tudo é calculado só com o que existe no CRM: sem estimativas inventadas. */

export type ItemGrafico = { rotulo: string; total: number; cor?: string };

export type Metricas = {
  total: number;
  abertos: number;
  novos7d: number;
  novos30d: number;
  quentes: number;
  retornosHoje: number;
  semResposta: number;
  ganhos: number;
  perdidos: number;
  /** Ganhos ÷ (ganhos + perdidos). Null enquanto nenhum lead foi encerrado. */
  taxaConversao: number | null;
  /** Soma dos valores mínimos das faixas de investimento dos leads em aberto, por mês. */
  potencialMinimo: number;
  /** Quantos leads em aberto têm faixa de investimento informada. */
  comOrcamento: number;
  /** Horas, em média, entre a chegada e o primeiro contato (leads com histórico de status). Null se não há dados. */
  horasAtePrimeiroContato: number | null;
  porStatus: Array<{ id: StatusLead; rotulo: string; cor: string; total: number }>;
  serie30d: Array<{ dia: string; total: number }>;
  porServico: ItemGrafico[];
  porOrcamento: ItemGrafico[];
  porSetor: ItemGrafico[];
  porOrigem: ItemGrafico[];
  porTemperatura: ItemGrafico[];
  porPasta: ItemGrafico[];
};

function contar(itens: string[]): ItemGrafico[] {
  const mapa = new Map<string, number>();
  for (const i of itens) mapa.set(i, (mapa.get(i) ?? 0) + 1);
  return Array.from(mapa, ([rotulo, total]) => ({ rotulo, total })).sort((a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}

function rotuloOpcao(pergunta: string, codigo: string): string {
  return PERGUNTAS_DIAGNOSTICO.find((p) => p.codigo === pergunta)?.opcoes?.find((o) => o.codigo === codigo)?.rotulo ?? codigo;
}

function dataLocal(iso: string): string {
  return hojeIso(new Date(iso));
}

export function calcularMetricas(leads: LeadCrm[], recs: Map<string, Recomendacao>, pastas: PastaCrm[], agora: Date = new Date()): Metricas {
  const hoje = hojeIso(agora);
  const dias = (iso: string) => Math.floor((agora.getTime() - new Date(iso).getTime()) / 86_400_000);
  const abertos = leads.filter((l) => STATUS_ABERTOS.includes(l.status));
  const ganhos = leads.filter((l) => l.status === "ganho").length;
  const perdidos = leads.filter((l) => l.status === "perdido").length;

  let potencialMinimo = 0;
  let comOrcamento = 0;
  for (const l of abertos) {
    const cod = recs.get(l.id)?.orcamentoCodigo;
    if (cod && ORCAMENTOS[cod]) {
      potencialMinimo += ORCAMENTOS[cod].min;
      comOrcamento += 1;
    }
  }

  const tempos: number[] = [];
  for (const l of leads) {
    const primeiro = l.historico.find((e) => e.tipo === "status" && e.status && e.status !== "novo");
    if (primeiro) tempos.push((new Date(primeiro.em).getTime() - new Date(l.criadoEm).getTime()) / 3_600_000);
  }
  const horas = tempos.length > 0 ? Math.max(0, tempos.reduce((a, b) => a + b, 0) / tempos.length) : null;

  // últimos 30 dias, um ponto por dia (dia de hoje por último)
  const serieMapa = new Map<string, number>();
  for (let i = 29; i >= 0; i -= 1) serieMapa.set(hojeIso(new Date(agora.getTime() - i * 86_400_000)), 0);
  for (const l of leads) {
    const d = dataLocal(l.criadoEm);
    if (serieMapa.has(d)) serieMapa.set(d, (serieMapa.get(d) ?? 0) + 1);
  }

  const setorDe = (l: LeadCrm): string => {
    const r = l.respostas.find((x) => x.perguntaCodigo === "setor");
    if (!r || r.opcaoCodigos.length === 0) return "Não informado";
    return r.opcaoCodigos[0] === "outro" && r.texto ? `Outro: ${r.texto}` : rotuloOpcao("setor", r.opcaoCodigos[0]);
  };
  const origemDe = (l: LeadCrm): string => l.origem?.utmSource || (l.origem?.referrer ? new URL(l.origem.referrer, "http://x").hostname.replace(/^www\./, "") : l.origem !== null ? "Direto / sem origem" : "Cadastro manual");

  const cor = { quente: "#ff5a3c", morno: "#ffb020", frio: "#5aa9ff" };
  const pastaNome = (id: string | null) => pastas.find((p) => p.id === id)?.nome ?? "Sem pasta";

  return {
    total: leads.length,
    abertos: abertos.length,
    novos7d: leads.filter((l) => dias(l.criadoEm) < 7).length,
    novos30d: leads.filter((l) => dias(l.criadoEm) < 30).length,
    quentes: abertos.filter((l) => recs.get(l.id)?.temperatura === "quente").length,
    retornosHoje: abertos.filter((l) => l.proximoContato !== null && l.proximoContato <= hoje).length,
    semResposta: leads.filter((l) => l.status === "novo" && dias(l.criadoEm) >= 2).length,
    ganhos,
    perdidos,
    taxaConversao: ganhos + perdidos > 0 ? ganhos / (ganhos + perdidos) : null,
    potencialMinimo,
    comOrcamento,
    horasAtePrimeiroContato: horas,
    porStatus: STATUS_LEAD.map((s) => ({ ...s, total: leads.filter((l) => l.status === s.id).length })),
    serie30d: Array.from(serieMapa, ([dia, total]) => ({ dia, total })),
    porServico: contar(abertos.map((l) => ROTULO_SERVICO[recs.get(l.id)?.servico ?? "indefinido"])),
    porOrcamento: contar(abertos.map((l) => recs.get(l.id)?.orcamentoRotulo ?? "Orçamento a definir")),
    porSetor: contar(leads.map(setorDe)),
    porOrigem: contar(leads.map(origemDe)),
    porTemperatura: (["quente", "morno", "frio"] as const)
      .map((t) => ({ rotulo: t === "quente" ? "Quentes" : t === "morno" ? "Mornos" : "Frios", total: abertos.filter((l) => recs.get(l.id)?.temperatura === t).length, cor: cor[t] })),
    porPasta: contar(leads.map((l) => pastaNome(l.pastaId))),
  };
}

export function formatarReais(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

export function formatarHoras(horas: number): string {
  if (horas < 1) return `${Math.max(1, Math.round(horas * 60))} min`;
  if (horas < 48) return `${Math.round(horas)} h`;
  return `${Math.round(horas / 24)} dias`;
}