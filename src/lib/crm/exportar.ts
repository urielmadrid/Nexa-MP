import { recomendar, respostaLegivel } from "@/src/lib/crm/recomendar";
import type { DadosCrm, LeadCrm } from "@/src/lib/crm/tipos";
import { rotuloDoStatus } from "@/src/lib/crm/tipos";

export function backupEmJson(dados: DadosCrm): string {
  return JSON.stringify({ ...dados, exportadoEm: new Date().toISOString() }, null, 2);
}

/** Células que começam com = + - @ são tratadas como fórmula pelo Excel: o apóstrofo impede isso. */
function celula(valor: string | number | null | undefined): string {
  let t = valor === null || valor === undefined ? "" : String(valor);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
}

/** CSV para Excel em português: separador ponto e vírgula, com BOM para os acentos abrirem certo. */
export function listaEmCsv(leads: LeadCrm[], pastas: DadosCrm["pastas"], agora: Date = new Date()): string {
  const cabecalho = ["Nome", "Empresa", "E-mail", "WhatsApp", "Status", "Pasta", "Etiquetas", "Etiqueta do sistema", "Temperatura", "Plano sugerido", "Setor", "Investimento mensal", "Entrada", "Próximo contato", "Origem (utm_source)", "Campanha (utm_campaign)", "Fonte"];
  const linhas = leads.map((l) => {
    const r = recomendar(l, agora);
    return [
      l.nome,
      l.empresa,
      l.email,
      l.whatsappE164,
      rotuloDoStatus(l.status),
      pastas.find((p) => p.id === l.pastaId)?.nome ?? "",
      l.tags.join(", "),
      r.tag,
      r.temperatura,
      r.plano ? r.plano.nome : "",
      respostaLegivel(l, "setor"),
      respostaLegivel(l, "investimento_mensal"),
      l.criadoEm.slice(0, 10),
      l.proximoContato,
      l.origem?.utmSource,
      l.origem?.utmCampaign,
      l.fonte,
    ]
      .map(celula)
      .join(";");
  });
  return "﻿" + [cabecalho.map(celula).join(";"), ...linhas].join("\r\n");
}