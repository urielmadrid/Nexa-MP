import { MARCA_CRM } from "@/src/lib/formulario/email";
import type { EnvioNormalizado, RespostaNormalizada } from "@/src/lib/formulario/tipos";
import { sanearDados } from "@/src/lib/crm/armazenamento";
import { novoEvento } from "@/src/lib/crm/operacoes";
import type { DadosCrm, LeadCrm } from "@/src/lib/crm/tipos";

/**
 * Entrada de dados no CRM:
 *  - e-mails do diagnóstico (cada e-mail traz uma linha "DADOS_CRM_V1:{...}" com o envio completo);
 *  - backup em JSON exportado pelo próprio CRM.
 * Tudo é validado antes de entrar: o texto colado vem de fora e nunca é confiado às cegas.
 */

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

/** Confere o formato do envio e devolve uma cópia limpa, ou null se não servir. */
export function lerEnvio(bruto: unknown): EnvioNormalizado | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const e = bruto as Record<string, unknown>;
  const lead = e.lead as Record<string, unknown> | undefined;
  if (typeof e.id !== "string" || e.id.length < 8 || e.id.length > 80) return null;
  if (typeof e.criadoEm !== "string" || Number.isNaN(new Date(e.criadoEm).getTime())) return null;
  if (!lead || typeof lead !== "object" || texto(lead.nome, 120).trim() === "") return null;
  if (!Array.isArray(e.respostas)) return null;

  const respostas: RespostaNormalizada[] = [];
  for (const r of e.respostas.slice(0, 60)) {
    if (typeof r !== "object" || r === null) return null;
    const x = r as Record<string, unknown>;
    if (typeof x.perguntaCodigo !== "string" || !Array.isArray(x.opcaoCodigos)) return null;
    respostas.push({
      perguntaCodigo: x.perguntaCodigo.slice(0, 60),
      opcaoCodigos: x.opcaoCodigos.filter((c): c is string => typeof c === "string").slice(0, 20).map((c) => c.slice(0, 60)),
      texto: typeof x.texto === "string" && x.texto.trim() ? x.texto.slice(0, 700) : null,
    });
  }
  const origem = (typeof e.origem === "object" && e.origem !== null ? e.origem : {}) as Record<string, unknown>;
  const campo = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
  const whatsapp = typeof lead.whatsappE164 === "string" && /^\+[0-9]{10,15}$/.test(lead.whatsappE164) ? lead.whatsappE164 : null;

  return {
    id: e.id,
    formularioSlug: texto(e.formularioSlug, 60),
    formularioVersao: typeof e.formularioVersao === "number" ? e.formularioVersao : 1,
    criadoEm: new Date(e.criadoEm).toISOString(),
    lead: {
      nome: texto(lead.nome, 120).trim(),
      empresa: campo(lead.empresa, 120),
      email: campo(lead.email, 160),
      whatsappE164: whatsapp,
      canalPreferido: campo(lead.canalPreferido, 20),
    },
    respostas,
    consentimento: { aceito: true, versaoPolitica: texto((e.consentimento as Record<string, unknown> | undefined)?.versaoPolitica, 30) },
    origem: {
      pagina: campo(origem.pagina, 200),
      referrer: campo(origem.referrer, 300),
      utmSource: campo(origem.utmSource, 100),
      utmMedium: campo(origem.utmMedium, 100),
      utmCampaign: campo(origem.utmCampaign, 100),
      utmTerm: campo(origem.utmTerm, 100),
      utmContent: campo(origem.utmContent, 100),
    },
  };
}

export function leadDoEnvio(envio: EnvioNormalizado): LeadCrm {
  return {
    id: envio.id,
    fonte: "formulario",
    criadoEm: envio.criadoEm,
    atualizadoEm: envio.criadoEm,
    nome: envio.lead.nome,
    empresa: envio.lead.empresa,
    email: envio.lead.email,
    whatsappE164: envio.lead.whatsappE164,
    canalPreferido: envio.lead.canalPreferido,
    status: "novo",
    pastaId: null,
    tags: [],
    proximoContato: null,
    formularioSlug: envio.formularioSlug,
    formularioVersao: envio.formularioVersao,
    respostas: envio.respostas,
    origem: envio.origem,
    historico: [novoEvento("sistema", "Respondeu o diagnóstico no site", new Date(envio.criadoEm))],
  };
}

export type EnviosLidos = { envios: EnvioNormalizado[]; invalidos: number };

/** Procura, no texto colado, todas as linhas "DADOS_CRM_V1:{...}" (pode colar vários e-mails de uma vez). */
export function lerEnviosDoTexto(textoColado: string): EnviosLidos {
  const envios: EnvioNormalizado[] = [];
  let invalidos = 0;
  const vistos = new Set<string>();
  for (const linha of textoColado.slice(0, 5_000_000).split(/\r?\n/)) {
    const i = linha.indexOf(MARCA_CRM);
    if (i < 0) continue;
    try {
      const envio = lerEnvio(JSON.parse(linha.slice(i + MARCA_CRM.length).trim()));
      if (!envio) invalidos += 1;
      else if (!vistos.has(envio.id)) {
        vistos.add(envio.id);
        envios.push(envio);
      }
    } catch {
      invalidos += 1;
    }
  }
  return { envios, invalidos };
}

/** Lê um backup exportado pelo CRM (JSON com "leads" e "pastas"). Devolve null se não for um backup. */
export function lerBackup(conteudo: string): DadosCrm | null {
  try {
    const dado: unknown = JSON.parse(conteudo);
    if (typeof dado !== "object" || dado === null || !Array.isArray((dado as { leads?: unknown }).leads)) return null;
    return sanearDados(dado);
  } catch {
    return null;
  }
}